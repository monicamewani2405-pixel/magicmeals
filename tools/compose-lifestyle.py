"""Composite each product's REAL front pouch onto top-down lifestyle plates so it looks like it lies on the surface.

    python tools/compose-lifestyle.py --slug rajma-masala            one product
    python tools/compose-lifestyle.py --all                          every product that has pouch-art/<slug>-front-processed.png
    options: --only hero,prep   --place name=cx,cy,width,rot   --check   --force   --jobs 4

Plates (top-down, NO pouch, an empty area reserved for it), looked up in this order (hero also tries hero-<slug> in pdp/shared/plates):
    pdp/<slug>/plates/<name>.(png|jpg|jpeg|webp)      a plate made for that product (e.g. Rajma's hero and ingredients)
    pdp/shared/plates/<name>.(png|jpg|jpeg|webp)      the shared, dish-neutral plate used by every other product
    names: hero, ingredients, prep, onthego
Writes  pdp/<slug>/gallery/<name>-1200.webp (<= 180 KB) and -800.webp (<= 90 KB), and the GENERATED PLACEMENTS block of pdp/pdp-data.js.

Placement is decided ONCE per plate and stored in placements.json next to the plate (pdp/shared/ for shared plates, pdp/<slug>/ for own
plates), so every product gets the pouch in exactly the same spot. If none is stored, the largest EMPTY region is found automatically
(low edge/texture density): pouch width 34-42 % of the plate, rotation within +-20 degrees (different per plate), >= 3 % clear of every
edge. View the plate once and override with --place name=cx,cy,width,rot (fractions; degrees), which is then stored.

Lighting: soft daylight from the UPPER LEFT, so shadows fall to the LOWER RIGHT: a tight contact shadow (6 px, blur 8, 35 %), a wider
ambient shadow (22 px, blur 30, 22 %), both multiplied onto the plate, a 2 px dark rim along the lower/right edge drawn OUTSIDE the print,
and a diagonal highlight of at most 6 % white. The pouch pixels are resampled once (2x supersampled rotation, no blur); the printed
artwork is never edited.
"""
import argparse, io, json, math, os, re, sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

REPO = Path(__file__).resolve().parent.parent
ROOT = Path(os.environ.get('PDP_ROOT') or REPO)               # PDP_ROOT: test against a scratch copy
PDP = ROOT / 'pdp'
SHARED = PDP / 'shared' / 'plates'
DATA = PDP / 'pdp-data.js'
POUCH_DIR = REPO / 'pouch-art'

NAMES = ['hero', 'ingredients', 'prep', 'onthego']
ROT = {'hero': 12, 'ingredients': -9, 'prep': 17, 'onthego': -15}   # degrees, different per plate, within +-20
W_OUT, W_SMALL = 1200, 800
MAX_BIG, MAX_SMALL = 180 * 1024, 90 * 1024
MARGIN = 0.03


# The hero plate shows THAT product's own dish: pdp/shared/plates/hero-<slug>.<ext> (one per product). Products without one fall back to hero.<ext>.
# Only the hero is per product; ingredients, prep and onthego are dish-neutral and shared.
PER_PRODUCT = {'hero'}


def find_plate(slug, name):
    """-> (path, placements.json dir, placements key). A product's own plate wins, then its shared per-product plate, then the shared plate."""
    cands = [(PDP / slug / 'plates', name)]
    if name in PER_PRODUCT:
        cands.append((SHARED, f'{name}-{slug}'))
    cands.append((SHARED, name))
    for base, stem in cands:
        for ext in ('png', 'webp', 'jpg', 'jpeg'):
            p = base / f'{stem}.{ext}'
            if p.exists():
                return p, base.parent, stem
    return None, None, None


def load_json(p):
    try:
        return json.loads(Path(p).read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return {}


def load_pouch(slug, override=None):
    path = Path(override) if override else POUCH_DIR / f'{slug}-front-processed.png'
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im)[..., 3]
    ys, xs = np.where(a > 8)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def rotated_pouch(pouch, width_px, rot):
    """Resize to width_px and rotate, supersampled 2x so the print stays crisp."""
    ss = 2
    w2 = width_px * ss
    h2 = round(pouch.height * w2 / pouch.width)
    big = pouch.resize((w2, h2), Image.LANCZOS)
    big = big.rotate(-rot, resample=Image.BICUBIC, expand=True)          # positive rot = clockwise
    return big.resize((max(1, round(big.width / ss)), max(1, round(big.height / ss))), Image.LANCZOS)


def busy_map(plate):
    """Edge/texture density, 0..1: high where the plate has detail (food, props, strong texture)."""
    g = np.asarray(plate.convert('L').filter(ImageFilter.GaussianBlur(1.5)), dtype=np.float32)
    gx, gy = ndi.sobel(g, axis=1), ndi.sobel(g, axis=0)
    mag = ndi.uniform_filter(np.hypot(gx, gy), size=max(9, plate.width // 60))
    return np.clip(mag / (np.percentile(mag, 92) + 1e-6), 0, 1)


def auto_place(plate, name, pouch):
    """Search width 42..34 %, positions on a grid; minimise detail under the (rotated) pouch box. Returns cx, cy, wfrac."""
    W, H = plate.size
    rot = ROT.get(name, 10)
    scale = 240 / W
    busy = busy_map(plate.resize((240, round(H * scale)), Image.LANCZOS))
    h, w = busy.shape
    ii = np.pad(busy, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    ar = pouch.height / pouch.width
    best = None
    for wf in (0.42, 0.40, 0.38, 0.36, 0.34):
        pw, ph = wf * W, wf * W * ar
        th = math.radians(abs(rot))
        bw, bh = pw * math.cos(th) + ph * math.sin(th), pw * math.sin(th) + ph * math.cos(th)
        bwc, bhc = bw * scale, bh * scale
        if bwc > w * (1 - 2 * MARGIN) or bhc > h * (1 - 2 * MARGIN):
            continue
        x_lo, x_hi = int(math.ceil(w * MARGIN + bwc / 2)), int(w - w * MARGIN - bwc / 2)
        y_lo, y_hi = int(math.ceil(h * MARGIN + bhc / 2)), int(h - h * MARGIN - bhc / 2)
        for cy in range(y_lo, y_hi + 1, 2):
            for cx in range(x_lo, x_hi + 1, 2):
                x0, x1, y0, y1 = int(cx - bwc / 2), int(cx + bwc / 2), int(cy - bhc / 2), int(cy + bhc / 2)
                s = ii[y1, x1] - ii[y0, x1] - ii[y1, x0] + ii[y0, x0]
                score = s / max(1, (x1 - x0) * (y1 - y0)) - 0.35 * wf            # emptier and larger is better
                if best is None or score < best[0]:
                    best = (score, cx / w, cy / h, wf)
    return (0.5, 0.5, 0.34) if best is None else best[1:]


def shadow_layer(alpha_img, dx, dy, blur):
    s = Image.new('L', alpha_img.size, 0)
    s.paste(alpha_img, (dx, dy))
    return np.asarray(s.filter(ImageFilter.GaussianBlur(blur / 2)), dtype=np.float32) / 255      # CSS blur b ~ gaussian sigma b/2


def compose(plate, pouch, cx, cy, wf, rot):
    W, H = plate.size
    p = rotated_pouch(pouch, round(wf * W), rot)
    x, y = round(cx * W - p.width / 2), round(cy * H - p.height / 2)
    x = max(round(MARGIN * W), min(x, W - p.width - round(MARGIN * W)))
    y = max(round(MARGIN * H), min(y, H - p.height - round(MARGIN * H)))
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    layer.paste(p, (x, y))
    alpha = layer.getchannel('A')

    base = np.asarray(plate.convert('RGB'), dtype=np.float32) / 255
    for dx, dy, blur, op in ((22, 22, 30, 0.22), (6, 6, 8, 0.35)):              # lower-right shadows, multiplied onto the plate
        base *= (1 - op * shadow_layer(alpha, dx, dy, blur))[..., None]
    a = np.asarray(alpha, dtype=np.float32) / 255
    rim = np.clip(np.roll(np.roll(a, 2, axis=0), 2, axis=1) - a, 0, 1)         # silhouette shifted 2 px lower-right, minus the silhouette
    rim = np.asarray(Image.fromarray((rim * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.5)), dtype=np.float32) / 255
    base *= (1 - 0.45 * rim)[..., None]
    out = Image.fromarray((np.clip(base, 0, 1) * 255).astype('uint8')).convert('RGBA')

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)                              # diagonal highlight on the pouch, at most 6 % white
    t = ((xx - x) + (yy - y)) / float(p.width + p.height)
    band = np.clip(1 - np.abs(t - 0.28) / 0.22, 0, 1) * 0.06
    hl = np.zeros((H, W, 4), np.uint8)
    hl[..., :3] = 255
    hl[..., 3] = (band * a * 255).astype('uint8')
    layer = Image.alpha_composite(layer, Image.fromarray(hl))
    out = Image.alpha_composite(out, layer).convert('RGB')
    return out, dict(cx=round((x + p.width / 2) / W, 4), cy=round((y + p.height / 2) / H, 4), w=round(wf, 4), rot=rot)


def save_webp(im, path, limit):
    for q in (82, 78, 74, 70, 66, 62, 58, 54, 50, 46):
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=q, method=6)
        if buf.tell() <= limit:
            break
    path.write_bytes(buf.getvalue())
    return buf.tell(), q


def job(args):
    """One (slug, plate) composite. Runs in a worker process. Placement comes from the stored value; it is never decided here."""
    slug, name, src, place, pouch_override, check = args
    plate = Image.open(src).convert('RGB')
    note = ''
    if plate.width < W_OUT:
        note = f'plate is only {plate.width}px wide, upscaled to {W_OUT}'
    plate = plate.resize((W_OUT, round(plate.height * W_OUT / plate.width)), Image.LANCZOS)
    pouch = load_pouch(slug, pouch_override)
    cx, cy, wf, rot = place
    out, pl = compose(plate, pouch, cx, cy, wf, rot)
    w, h = out.size
    sizes = ''
    if not check:
        odir = PDP / slug / 'gallery'
        odir.mkdir(parents=True, exist_ok=True)
        b1, q1 = save_webp(out, odir / f'{name}-1200.webp', MAX_BIG)
        b2, q2 = save_webp(out.resize((W_SMALL, round(h * W_SMALL / w)), Image.LANCZOS), odir / f'{name}-800.webp', MAX_SMALL)
        sizes = f'{b1 / 1024:.0f}/{b2 / 1024:.0f} KB'
    return slug, name, dict(w=w, h=h, pouch=pl), sizes, note


def all_slugs():
    return sorted(p.name[:-len('-front-processed.png')] for p in POUCH_DIR.glob('*-front-processed.png'))


def read_placements():
    if not DATA.exists():
        return {}
    m = re.search(r'var PDP_PLACEMENTS = (\{.*?\});', DATA.read_text(encoding='utf-8'), re.S)
    if not m:
        return {}
    d = load_json_str(m.group(1))
    if d and any(k in d for k in NAMES):          # old flat format (one product): wrap it
        d = {'rajma-masala': d}
    return d


def load_json_str(s):
    try:
        return json.loads(s)
    except ValueError:
        return {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--slug', default='')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--only', default='')
    ap.add_argument('--place', action='append', default=[], help='name=cx,cy,width,rot override (fractions, degrees); stored for every product using that plate')
    ap.add_argument('--pouch', default='', help='front pouch image override (single --slug only)')
    ap.add_argument('--check', action='store_true', help='report placements only, write nothing')
    ap.add_argument('--jobs', type=int, default=4)
    a = ap.parse_args()
    slugs = all_slugs() if a.all else [s for s in a.slug.split(',') if s]
    if not slugs:
        ap.error('give --slug <name> or --all')
    only = [s for s in a.only.split(',') if s] or NAMES
    manual = {}
    for s in a.place:
        k, v = s.split('=')
        manual[k] = tuple(float(t) for t in v.split(','))

    # 1. decide / load the placement of every plate once
    store, tasks, missing = {}, [], []
    for slug in slugs:
        for name in only:
            src, pdir, pkey = find_plate(slug, name)
            if not src:
                missing.append((slug, name))
                continue
            jf = pdir / 'placements.json'
            key = str(jf)
            if key not in store:
                store[key] = load_json(jf)
            if name in manual or pkey in manual:
                store[key][pkey] = list(manual.get(pkey, manual.get(name)))
            elif pkey not in store[key]:
                plate = Image.open(src).convert('RGB')
                plate = plate.resize((W_OUT, round(plate.height * W_OUT / plate.width)), Image.LANCZOS)
                cx, cy, wf = auto_place(plate, name, load_pouch(slug, a.pouch or None))
                store[key][pkey] = [round(cx, 4), round(cy, 4), round(wf, 4), ROT.get(name, 10)]
                print(f'  placement for {pdir.name}/{pkey}: centre ({cx:.3f}, {cy:.3f}) width {wf:.2f} rot {ROT.get(name, 10)}')
            pl = store[key][pkey]
            assert 0.34 <= pl[2] <= 0.42 and -20 <= pl[3] <= 20, 'width must be 34-42 % and rotation within +-20'
            tasks.append((slug, name, str(src), tuple(pl), a.pouch or None, a.check))
    if not a.check:
        for key, d in store.items():
            Path(key).write_text(json.dumps(d, indent=1), encoding='utf-8')

    # 2. composite, in parallel
    placements = read_placements()
    done = 0
    with ProcessPoolExecutor(max_workers=max(1, a.jobs)) as ex:
        for slug, name, info, sizes, note in ex.map(job, tasks):
            placements.setdefault(slug, {})[name] = info
            done += 1
            if note:
                print(f'  WARNING {slug}/{name}: {note}')
            if len(slugs) == 1 or done % 20 == 0:
                print(f'  [{done}/{len(tasks)}] {slug}/{name} {sizes}')
    for slug, name in missing:
        print(f'  MISSING INPUT: no plate "{name}" for {slug} (pdp/{slug}/plates or pdp/shared/plates); the page shows a labelled placeholder')
    if a.check:
        return 0

    new, k = re.subn(r'(// BEGIN GENERATED PLACEMENTS[^\n]*\n)(.*?)(\n\s*// END GENERATED PLACEMENTS)',
                     lambda m: m.group(1) + '  var PDP_PLACEMENTS = ' + json.dumps(placements, separators=(',', ':')) + ';' + m.group(3),
                     DATA.read_text(encoding='utf-8'), flags=re.S)
    if k != 1:
        print('Could not find the GENERATED PLACEMENTS block in pdp-data.js')
        return 1
    DATA.write_text(new, encoding='utf-8')
    print(f'{done} images composed; pdp-data.js updated ({len(placements)} products)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
