"""
prep-scene.py: prepares the Design 2 "How It Works" scene images for one dish.

Usage (from the project root):
    python tools/prep-scene.py <slug>          e.g.  python tools/prep-scene.py rajma-masala

       python tools/prep-scene.py kettle          the kettle cutout (scenes/kettle.*), once
       python tools/prep-scene.py mobile          (re)writes every web variant: scenes/processed/**/*-640.webp (scene images and
                                                  bowls, 640px wide max), kettle-480.webp (480px max), and for the hero pouches
                                                  assets/hero/<slug>-front-800.webp (LOSSLESS, pixel-identical to the PNG, desktop) and
                                                  assets/hero/<slug>-front-m.webp (phones, 800px tall, quality 96), and for the product cards
                                                  pouch-art/cards/<slug>-front-640.webp (640x1000, LOSSLESS; cards, BYOB and cart thumbnails).
                                                  The PNGs are never touched.
                                                  Also runs after every dish or kettle run.

Inputs (any of .jpg .jpeg .png .webp, never modified or moved):
    scenes/bowl-empty.* (or empty-bowl.*)
    scenes/<slug>/dry.*   scenes/<slug>/wet.*   scenes/<slug>/ready.*

Outputs:
    scenes/processed/bowl-empty.webp               (the first dish only; later dishes get their own scenes/processed/<slug>/bowl.webp,
                                                    because the crop depends on the dish's images)
    scenes/processed/<slug>/{dry,wet,ready}.webp   (same size, bowl aligned, transparent background)
    scenes/processed/<slug>.json                   (paths, bowl bbox, inner opening in %, alignment numbers)
    scenes/scene-colors.css                        (:root --scene-<slug>-c1..c3 + water tokens; other dishes kept)
    scenes/processed/qa-<slug>.png                 (the four images over mid-blue, opening ellipse drawn in yellow)

Then add one entry for <slug> to scenes/scene-data.js.
"""
import json
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCENES = os.path.join(ROOT, 'scenes')
OUT = os.path.join(SCENES, 'processed')
EXTS = ('.jpg', '.jpeg', '.png', '.webp')

BG_LUM = 172          # lighter than this and connected to the border = background
BODY_LUM_LIT = 160    # same, on the lit left half
BODY_LUM = 100        # darker than this below the rim = bowl body (lit areas of the body stay under it)
SHADOW_FROM = 0.45    # fraction of the bowl height below which neutral grey is treated as shadow
MAX_SIDE = 1000
PAD = 0.06
CSS_PATH = os.path.join(SCENES, 'scene-colors.css')


def find(base, *alts):
    d, name = os.path.split(base)
    names = [name.lower()] + [a.lower() for a in alts]
    for f in os.listdir(d):
        stem, ext = os.path.splitext(f)
        if stem.lower() in names and ext.lower() in EXTS:
            return os.path.join(d, f)
    sys.exit('missing input: %s.(jpg|jpeg|png|webp)' % base)


def load(path):
    im = ImageOps.exif_transpose(Image.open(path))
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        flat = Image.new('RGB', im.size, (255, 255, 255))
        flat.paste(im, mask=im.split()[3])
        im = flat
    return im.convert('RGB').convert('RGBA')   # sources are sRGB


def cutout(im):
    rgb = np.asarray(im.convert('RGB')).astype(np.int32)
    lum = rgb.mean(2)
    dark_rows = np.where((lum < 100).any(1))[0]
    top = dark_rows.min()
    foot = np.where((lum < 70).sum(1) > 20)[0].max()           # bottom of the bowl foot
    low = top + SHADOW_FROM * (foot - top)                     # rim highlights sit above this row
    rows = np.arange(rgb.shape[0])[:, None]
    cols = np.arange(rgb.shape[1])[None, :]
    thr = np.where(cols < rgb.shape[1] / 2.0, BODY_LUM_LIT, BODY_LUM)   # light falls from the left: the floor shadow is on the right
    dist = ndimage.distance_transform_edt(~(lum < thr))        # distance (px) from the dark bowl body
    # allowed fringe around the body: wide up by the rim (rim highlights), shrinking to 3px low down where the grey floor shadow
    # sits next to the foot; it shrinks gradually so no step shows in the outline
    limit = np.clip(3 + (low - rows) / 60.0 * 37, 3, 40)
    bg_like = (lum > BG_LUM) | (dist > limit) | (rows > foot)
    lab, _ = ndimage.label(bg_like)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fg = ~np.isin(lab, border[border > 0])                     # only regions connected to the border are background
    lab, n = ndimage.label(fg)                                 # keep the biggest object (drops specks and the watermark)
    if n > 1:
        sizes = ndimage.sum(fg, lab, range(1, n + 1))
        fg = lab == (1 + int(np.argmax(sizes)))
    fg = ndimage.binary_fill_holes(fg)
    yy, xx = np.ogrid[-3:4, -3:4]
    disk = (xx * xx + yy * yy) <= 9
    fg = ndimage.binary_closing(fg, structure=disk, border_value=0)   # fills small notches on the rim
    fg = ndimage.binary_opening(fg, structure=disk)                   # drops spurs and ragged specks
    fg = ndimage.binary_erosion(fg, iterations=2)              # 2px erode: no light fringe
    soft = ndimage.gaussian_filter(fg.astype(np.float32), 1.6)   # smooth the outline, then re-sharpen to a ~1px anti-aliased edge
    a = Image.fromarray((np.clip((soft - 0.5) * 2.4 + 0.5, 0, 1) * 255).astype(np.uint8))
    out = im.copy()
    out.putalpha(a)
    return out


def bbox(mask):
    ys, xs = np.where(mask)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def align(img, ref):
    """Match left/right/bottom of the bowl to the reference (a heap may rise above the rim, so the top is ignored)."""
    l, t, r, b = bbox(np.asarray(img.split()[3]) > 127)
    rl, rt, rr, rb = ref
    s = (rr - rl) / float(r - l)
    dx = ((rl + rr) - (l + r)) / 2.0
    dy = rb - b
    big = abs(dx) > 3 or abs(dy) > 3 or abs(s - 1) > 0.02
    info = {'dx': round(dx, 2), 'dy': round(dy, 2), 'scale': round(s, 4), 'needs_regen': bool(big)}
    if big or abs(s - 1) > 0.002:       # translation + uniform scale about the bowl's bottom centre
        cx, cy = (l + r) / 2.0, float(b)
        tx = (rl + rr) / 2.0 - cx * s
        ty = rb - cy * s
        img = img.transform(img.size, Image.AFFINE, (1 / s, 0, -tx / s, 0, 1 / s, -ty / s), Image.BICUBIC)
    else:                                # translation only
        img = img.transform(img.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy), Image.BICUBIC)
    return img, info


def measure_opening(amask, gray):
    """Inner rim ellipse of the empty bowl: outer rim from the silhouette, inner edge from the rim highlight."""
    l, t, r, b = bbox(amask)
    widest = int(amask.sum(1).argmax())                        # widest row of the silhouette = rim ellipse centre row
    ocx, orx, ory = (l + r) / 2.0, (r - l) / 2.0, widest - t
    row = gray[widest]
    xl = next(x for x in range(l, int(ocx)) if row[x:x + 6].max() < 60)
    xr = next(x for x in range(r - 1, int(ocx), -1) if row[x - 5:x + 1].max() < 60)
    rx, cx = (xr - xl) / 2.0, (xr + xl) / 2.0
    ry = rx * (ory / orx)                                      # same aspect as the outer rim ellipse
    col = gray[:, int(round(cx))]
    y0, y1 = int(widest + 0.8 * ory), int(widest + 1.25 * ory)
    lip = y0 + int(np.argmax(col[y0:y1]))                      # front lip highlight
    return cx, lip - 3 - ry, rx, ry


def kmeans(px, k=3, iters=20):
    rng = np.random.default_rng(1)
    c = px[rng.choice(len(px), k, replace=False)].astype(float)
    for _ in range(iters):
        lab = ((px[:, None, :] - c[None]) ** 2).sum(2).argmin(1)
        for i in range(k):
            if (lab == i).any():
                c[i] = px[lab == i].mean(0)
    return [c[i] for i in np.argsort(-np.bincount(lab, minlength=k))]


def update_css(slug, cols):
    lines = {}
    if os.path.exists(CSS_PATH):
        for m in re.finditer(r'(--scene-[a-z0-9-]+-c[123]):\s*([^;]+);', open(CSS_PATH, encoding='utf-8').read()):
            lines[m.group(1)] = m.group(2).strip()
    for i, c in enumerate(cols, 1):
        lines['--scene-%s-c%d' % (slug, i)] = '#%02X%02X%02X' % tuple(int(round(v)) for v in c)
    out = ["/* generated by tools/prep-scene.py: food colours sampled from each dish's dry image */",
           ':root {',
           '  --brand-secondary-rgb: 1 115 194;']
    out += ['  %s: %s;' % (k, v) for k, v in sorted(lines.items())]
    out += ['  --scene-water-1: color-mix(in srgb, var(--brand-secondary) 40%, transparent);',
            '  --scene-water-2: color-mix(in srgb, color-mix(in srgb, var(--brand-accent) 45%, var(--white)) 55%, transparent);',
            '  --scene-water-ring: color-mix(in srgb, var(--brand-accent) 40%, var(--white));',
            '}', '']
    with open(CSS_PATH, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(out))


def shrink(src, max_w=None, max_h=None, suffix='-640'):
    """Writes <name><suffix>.webp next to src, scaled down to the given max width or height (never up)."""
    im = Image.open(src)
    k = min(1.0, (max_w / float(im.width)) if max_w else 1.0, (max_h / float(im.height)) if max_h else 1.0)
    out = im.convert('RGBA').resize((max(1, int(round(im.width * k))), max(1, int(round(im.height * k)))), Image.LANCZOS)
    dst = os.path.splitext(src)[0] + suffix + '.webp'
    out.save(dst, 'WEBP', quality=92, method=6, alpha_quality=100)
    return dst, out.size, os.path.getsize(dst)


def mobile_variants(only=None):
    """Mobile variants of the processed scene images (640px wide), the kettle (480px) and the hero pouches (480px tall)."""
    done = []
    for dp, _, files in os.walk(OUT):
        for f in files:
            if not f.endswith('.webp') or f.endswith('-640.webp') or f.endswith('-480.webp'):
                continue
            p = os.path.join(dp, f)
            if only and only not in p.replace('\\', '/'):
                continue
            if f == 'kettle.webp':
                done.append(shrink(p, max_w=480, suffix='-480'))
            else:
                done.append(shrink(p, max_w=640, suffix='-640'))
    hero = os.path.join(ROOT, 'assets', 'hero')
    if not only and os.path.isdir(hero):
        for f in sorted(os.listdir(hero)):
            if f.endswith('-front-800.png'):
                src = os.path.join(hero, f)
                im = Image.open(src).convert('RGBA')
                dst = os.path.join(hero, f.replace('-front-800.png', '-front-800.webp'))      # desktop: lossless, same pixels as the PNG
                im.save(dst, 'WEBP', lossless=True, method=6)
                done.append((dst, im.size, os.path.getsize(dst)))
                dst = os.path.join(hero, f.replace('-front-800.png', '-front-m.webp'))        # phones: full 800px height, near-transparent loss
                im.save(dst, 'WEBP', quality=96, method=6, alpha_quality=100)
                done.append((dst, im.size, os.path.getsize(dst)))
    cards = os.path.join(ROOT, 'pouch-art')
    if not only and os.path.isdir(cards):
        os.makedirs(os.path.join(cards, 'cards'), exist_ok=True)
        for f in sorted(os.listdir(cards)):
            if f.endswith('-front-processed.png') and not f.startswith('._'):
                im = Image.open(os.path.join(cards, f)).convert('RGBA')
                k = min(1.0, 1000 / float(im.height))
                im = im.resize((int(round(im.width * k)), int(round(im.height * k))), Image.LANCZOS)
                dst = os.path.join(cards, 'cards', f.replace('-front-processed.png', '-front-640.webp'))
                im.save(dst, 'WEBP', lossless=True, method=6)
                done.append((dst, im.size, os.path.getsize(dst)))
    for d in done:
        print('%s  %dx%d  %d KB' % (os.path.relpath(d[0], ROOT).replace('\\', '/'), d[1][0], d[1][1], d[2] // 1024))


def kettle():
    """Kettle cutout: dark body on white. Colour of the edge pixels is copied from the nearest solid pixel (no white fringe)."""
    im = load(find(os.path.join(SCENES, 'kettle')))
    rgb = np.asarray(im.convert('RGB')).astype(np.uint8)
    lum = rgb.astype(np.int32).mean(2)
    fg = lum < 175
    lab, n = ndimage.label(fg)
    fg = lab == (1 + int(np.argmax(ndimage.sum(fg, lab, range(1, n + 1)))))
    yy, xx = np.ogrid[-2:3, -2:3]
    fg = ndimage.binary_closing(fg, structure=(xx * xx + yy * yy) <= 4)
    fg = ndimage.binary_fill_holes(fg)
    core = ndimage.binary_erosion(fg, iterations=2)
    idx = ndimage.distance_transform_edt(~core, return_distances=False, return_indices=True)
    solid = rgb[idx[0], idx[1]]                                # nearest solid colour everywhere
    soft = ndimage.gaussian_filter(ndimage.binary_erosion(fg, iterations=1).astype(np.float32), 1.0)
    a = (np.clip((soft - 0.5) * 2.4 + 0.5, 0, 1) * 255).astype(np.uint8)
    out = Image.fromarray(np.dstack([solid, a]), 'RGBA')
    l, t, r, b = bbox(a > 10)
    pw, ph = (r - l) * 0.03, (b - t) * 0.03
    out = out.crop((int(max(0, l - pw)), int(max(0, t - ph)), int(min(out.width, r + pw)), int(min(out.height, b + ph))))
    k = min(1.0, 700 / float(out.width))
    out = out.resize((int(round(out.width * k)), int(round(out.height * k))), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    out.save(os.path.join(OUT, 'kettle.webp'), 'WEBP', quality=90, method=6)
    am = np.asarray(out.split()[3]) > 127
    w, h = out.size
    xs = np.where(am.any(0))[0]
    tip_x = xs.max()
    tip_y = np.where(am[:, max(0, tip_x - 3):tip_x + 1].any(1))[0].mean()      # spout tip (rightmost point)
    data = {'src': 'scenes/processed/kettle.webp', 'size': [w, h], 'tip': {'x': round(tip_x / w * 100, 2), 'y': round(tip_y / h * 100, 2)}}
    print(json.dumps(data))
    qa = Image.new('RGB', (w, h), (60, 120, 200))
    qa.paste(out, (0, 0), out)
    ImageDraw.Draw(qa).ellipse([tip_x - 4, tip_y - 4, tip_x + 4, tip_y + 4], outline=(255, 255, 0), width=2)
    qa.save(os.path.join(OUT, 'qa-kettle.png'))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    slug = sys.argv[1]
    if slug == 'mobile':
        return mobile_variants()
    if slug == 'kettle':
        kettle()
        return mobile_variants('kettle')
    names = ['bowl-empty', 'dry', 'wet', 'ready']
    paths = [find(os.path.join(SCENES, 'bowl-empty'), 'empty-bowl')] + [find(os.path.join(SCENES, slug, n)) for n in names[1:]]
    cut = [cutout(load(p)) for p in paths]

    ref = bbox(np.asarray(cut[0].split()[3]) > 127)
    report = {'bowl-empty': {'bbox': list(ref)}}
    for i in range(1, 4):
        cut[i], report[names[i]] = align(cut[i], ref)

    boxes = [bbox(np.asarray(c.split()[3]) > 127) for c in cut]
    L, T = min(b[0] for b in boxes), min(b[1] for b in boxes)
    R, B = max(b[2] for b in boxes), max(b[3] for b in boxes)
    pw, ph = (R - L) * PAD, (B - T) * PAD
    W, H = cut[0].size
    box = (int(max(0, L - pw)), int(max(0, T - ph)), int(min(W, R + pw)), int(min(H, B + ph)))
    cut = [c.crop(box) for c in cut]
    cw, ch = cut[0].size
    k = min(1.0, MAX_SIDE / float(max(cw, ch)))
    sw, sh = int(round(cw * k)), int(round(ch * k))
    cut = [c.resize((sw, sh), Image.LANCZOS) for c in cut]

    os.makedirs(os.path.join(OUT, slug), exist_ok=True)
    bowl_rel = 'scenes/processed/%s/bowl.webp' % slug
    if not os.path.exists(os.path.join(OUT, 'bowl-empty.webp')):   # the first dish keeps the shared bowl file
        bowl_rel = 'scenes/processed/bowl-empty.webp'
    cut[0].save(os.path.join(ROOT, bowl_rel), 'WEBP', quality=88, method=6)
    for i in range(1, 4):
        cut[i].save(os.path.join(OUT, slug, names[i] + '.webp'), 'WEBP', quality=88, method=6)

    amask = np.asarray(cut[0].split()[3]) > 127
    flat = Image.new('RGB', (sw, sh), (255, 255, 255))
    flat.paste(cut[0], mask=cut[0].split()[3])
    cx, cy, rx, ry = measure_opening(amask, np.asarray(flat.convert('L')).astype(int))
    bb = bbox(amask)
    data = {
        'slug': slug,
        'size': [sw, sh],
        'bowl': bowl_rel,
        'dry': 'scenes/processed/%s/dry.webp' % slug,
        'wet': 'scenes/processed/%s/wet.webp' % slug,
        'ready': 'scenes/processed/%s/ready.webp' % slug,
        'bowlBox': {'x': round(bb[0] / sw * 100, 2), 'y': round(bb[1] / sh * 100, 2),
                    'w': round((bb[2] - bb[0]) / sw * 100, 2), 'h': round((bb[3] - bb[1]) / sh * 100, 2)},
        'opening': {'cx': round(cx / sw * 100, 2), 'cy': round(cy / sh * 100, 2),
                    'rx': round(rx / sw * 100, 2), 'ry': round(ry / sh * 100, 2)},
        'alignment': report,
    }
    with open(os.path.join(OUT, slug + '.json'), 'w') as f:
        json.dump(data, f, indent=2)

    dry = np.asarray(cut[1])
    yy, xx = np.mgrid[0:sh, 0:sw]
    inside = (((xx - cx) / (rx * 0.85)) ** 2 + ((yy - cy) / (ry * 0.85)) ** 2) < 1
    update_css(slug, kmeans(dry[inside & (dry[..., 3] > 200)][:, :3].astype(float)))

    qa = Image.new('RGB', (sw * 4, sh), (60, 120, 200))
    for i, c in enumerate(cut):
        qa.paste(c, (i * sw, 0), c)
    ImageDraw.Draw(qa).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=(255, 255, 0), width=2)
    qa.save(os.path.join(OUT, 'qa-%s.png' % slug))
    print(json.dumps(data, indent=2))
    mobile_variants('/' + slug + '/')
    mobile_variants('bowl-empty')


if __name__ == '__main__':
    main()
