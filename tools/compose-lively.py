"""Lively gallery for one product (v2): serving picture improved + three composited pictures with the REAL front pouch.

    python tools/compose-lively.py kanda-poha

Inputs (pdp/<slug>/plates/): hero.png (eye-level dish photo, empty tabletop patch), colourblock.png and story.png (top-down flat-lays with an
empty zone); the existing serving picture is read from pdp/<slug>/plates/_old/hero.jpg (a copy of the original is in _old-images/<slug>/).
Outputs (pdp/<slug>/gallery/): serving / hero / colourblock / story  -1200.webp (<= 180 KB) and -800.webp (<= 90 KB).
The pouch artwork is never edited: it is only resized, rotated, shaded like a real pack (pillow shading, edge, shadows) and placed.
Placements are stored in PLACE below so the picture can be rebuilt.  Needs numpy, scipy and Pillow.
"""
import io
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
POUCH_DIR = ROOT / 'pouch-art'

# placement per product and picture. flat: cx, cy = centre of the pouch (fraction of the plate), w = pouch width (fraction of plate width), rot degrees.
# hero: cx = centre of the pouch, base = y of its bottom edge (fraction of plate height), h = pouch height (fraction of plate height).
PLACE = {
    # real3d: the pouch is rendered from the site's own 3D viewer (tools/render-pouch-3d.py); 'abroad' = the pack used anywhere in the world
    'kanda-poha': {
        'hero': dict(kind='hero', cx=0.815, base=0.79, h=0.4, rot=-1.0, real3d=True),
        'abroad': dict(kind='hero', cx=0.19, base=0.85, h=0.4, rot=1.0, real3d=True),
    },
    'jain-poha': {'hero': dict(kind='hero', cx=0.17, base=0.83, h=0.4, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.87, h=0.4, rot=0.0, real3d=True)},
    'idli-sambar': {'hero': dict(kind='hero', cx=0.82, base=0.82, h=0.4, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.9, h=0.4, rot=0.0, real3d=True)},
    'upma': {'hero': dict(kind='hero', cx=0.815, base=0.83, h=0.4, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.19, base=0.9, h=0.4, rot=0.0, real3d=True)},
    'mumbai-misal': {'hero': dict(kind='hero', cx=0.82, base=0.83, h=0.4, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.19, base=0.93, h=0.4, rot=0.0, real3d=True)},
    'jain-upma': {'hero': dict(kind='hero', cx=0.155, base=0.88, h=0.36, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.88, h=0.4, rot=0.0, real3d=True)},
    'tomato-soup': {'hero': dict(kind='hero', cx=0.83, base=0.86, h=0.38, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.19, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'sweet-corn-soup': {'hero': dict(kind='hero', cx=0.855, base=0.86, h=0.36, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.19, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'hot-and-sour-soup': {'hero': dict(kind='hero', cx=0.86, base=0.87, h=0.34, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.18, base=0.95, h=0.40, rot=0.0, real3d=True)},
    'dal-makhani': {'hero': dict(kind='hero', cx=0.85, base=0.87, h=0.36, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'dal-tadka': {'hero': dict(kind='hero', cx=0.86, base=0.9, h=0.33, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'dal-fry': {'hero': dict(kind='hero', cx=0.86, base=0.9, h=0.33, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'gujarati-dal': {'hero': dict(kind='hero', cx=0.86, base=0.9, h=0.33, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'jain-dal-makhani': {'hero': dict(kind='hero', cx=0.86, base=0.9, h=0.33, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'fried-rice-manchurian': {'hero': dict(kind='hero', cx=0.87, base=0.93, h=0.3, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'fried-rice': {'hero': dict(kind='hero', cx=0.855, base=0.9, h=0.33, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'schezwan-rice': {'hero': dict(kind='hero', cx=0.855, base=0.9, h=0.33, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'mexican-rice': {'hero': dict(kind='hero', cx=0.87, base=0.93, h=0.31, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'dal-khichdi': {'hero': dict(kind='hero', cx=0.87, base=0.9, h=0.32, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'masala-khichdi-kadhi': {'hero': dict(kind='hero', cx=0.87, base=0.93, h=0.31, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'veg-biryani': {'hero': dict(kind='hero', cx=0.855, base=0.9, h=0.33, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'jeera-rice': {'hero': dict(kind='hero', cx=0.855, base=0.9, h=0.33, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
    'tawa-pulao': {'hero': dict(kind='hero', cx=0.87, base=0.93, h=0.32, rot=0.0, real3d=True), 'abroad': dict(kind='hero', cx=0.17, base=0.93, h=0.40, rot=0.0, real3d=True)},
}
OUT_BIG, OUT_SMALL = 1200, 800
MAX_BIG, MAX_SMALL = 180 * 1024, 90 * 1024


def load_pouch(slug, src=None):
    im = Image.open(src or (POUCH_DIR / f'{slug}-front-processed.png')).convert('RGBA')
    a = np.asarray(im)[..., 3]
    ys, xs = np.where(a > 8)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def save_webp(im, path, limit):
    for q in (82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42, 38, 34):
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=q, method=6)
        if buf.tell() <= limit:
            break
    path.write_bytes(buf.getvalue())
    return buf.tell(), q


# ---------- serving picture: safe improvement, no change to the content ----------
def improve_serving(src):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255.0
    # auto-level: clip 0.4 % of each tail on luminance, apply the same stretch to all channels (keeps colours)
    lum = a @ np.array([0.299, 0.587, 0.114], np.float32)
    lo, hi = np.percentile(lum, 0.4), np.percentile(lum, 99.6)
    a = np.clip((a - lo) / max(hi - lo, 1e-3), 0, 1)
    # gentle S-curve
    a = a + 0.18 * (a - 0.5) * (1 - np.abs(2 * a - 1)) * 2 * 0.5
    a = np.clip(a, 0, 1)
    # vibrance +10 %: boost low-saturation colours more than saturated ones
    mx, mn = a.max(2), a.min(2)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    gain = 1 + 0.10 * (1 - sat)
    g = a.mean(2, keepdims=True)
    a = np.clip(g + (a - g) * gain[..., None], 0, 1)
    out = Image.fromarray((a * 255).astype('uint8'))
    out = out.filter(ImageFilter.MedianFilter(3)) if False else out.filter(ImageFilter.GaussianBlur(0.55))           # light denoise
    out = out.filter(ImageFilter.UnsharpMask(radius=22, percent=28, threshold=2))                                     # local contrast
    out = out.filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=3))                                    # sharpen
    w, h = out.size                                                                                                   # 4:5 crop that keeps the whole dish
    want = 4 / 5
    if abs(w / h - want) > 0.005:
        if w / h > want:
            nw = round(h * want); x0 = (w - nw) // 2; out = out.crop((x0, 0, x0 + nw, h))
        else:
            nh = round(w / want); y0 = (h - nh) // 2; out = out.crop((0, y0, w, y0 + nh))
    return out


# ---------- pouch shading so it has thickness ----------
def shade(p, strength=0.10, side_light=False):
    rgba = np.asarray(p).astype(np.float32)
    h, w = rgba.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx, ny = (xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2)
    r = np.clip(np.sqrt(nx ** 2 * 0.9 + ny ** 2 * 0.6), 0, 1.2)
    mult = 1.0 - strength * (r ** 2)                       # pillow: 1.0 in the middle, about 0.9 at the edges
    if side_light:                                         # window on the left: left edge lit, right edge a little darker
        mult = mult * (1.02 - 0.07 * (nx * 0.5 + 0.5))
    rgba[..., :3] *= mult[..., None]
    # faint diagonal highlight (at most 6 %)
    d = (nx * 0.8 + ny * 0.6)
    band = np.exp(-((d + 0.25) ** 2) / 0.05) * 0.055
    rgba[..., :3] = rgba[..., :3] + (255 - rgba[..., :3]) * band[..., None]
    # 1.5 to 2 px darker edge along the lower and right edges, drawn inside the print
    a = rgba[..., 3] / 255.0
    shifted = np.zeros_like(a)
    k = max(2, round(w / 420))
    shifted[:-k, :-k] = a[k:, k:]
    edge = np.clip(a - shifted, 0, 1)
    rgba[..., :3] *= (1 - 0.40 * edge)[..., None]
    return Image.fromarray(np.clip(rgba, 0, 255).astype('uint8'), 'RGBA')


def grain(arr, mask, sigma=3.0, seed=7):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, sigma, arr.shape[:2]).astype(np.float32)
    arr += n[..., None] * mask[..., None]
    return arr


def blur_alpha(a, px):
    return ndi.gaussian_filter(a, px)


def shadow(plate_arr, alpha, dx, dy, blur, opacity):
    """multiply a soft shadow of the pouch (alpha 0..1 on plate size) onto the plate"""
    sh = np.roll(np.roll(alpha, int(dy), axis=0), int(dx), axis=1)
    sh = blur_alpha(sh, blur) * opacity
    plate_arr *= (1 - sh)[..., None]
    return plate_arr


def lab_dist(rgb1, rgb2):
    def to_lab(c):
        c = np.array(c, np.float32) / 255.0
        c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
        m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]], np.float32)
        x, y, z = (m @ c) / np.array([0.95047, 1.0, 1.08883], np.float32)
        f = lambda t: np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
        fx, fy, fz = f(x), f(y), f(z)
        return np.array([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)])
    return float(np.linalg.norm(to_lab(rgb1) - to_lab(rgb2)))


def pouch_dominant(p):
    a = np.asarray(p).astype(np.float32)
    m = a[..., 3] > 200
    return tuple(np.median(a[..., :3][m], axis=0))


def place_flat(plate, pouch, cfg):
    W, H = plate.size
    pw = round(W * cfg['w'])
    ph = round(pouch.height * pw / pouch.width)
    p = pouch.resize((pw, ph), Image.LANCZOS)
    p = shade(p, 0.10)
    big = p.resize((pw * 2, ph * 2), Image.LANCZOS).rotate(-cfg['rot'], resample=Image.BICUBIC, expand=True)   # 2x supersampled rotation
    p = big.resize((big.width // 2, big.height // 2), Image.LANCZOS)
    x0 = round(cfg['cx'] * W - p.width / 2)
    y0 = round(cfg['cy'] * H - p.height / 2)
    assert x0 >= 0 and y0 >= 0 and x0 + p.width <= W and y0 + p.height <= H, ('pouch leaves the frame', x0, y0, p.size, plate.size)
    zone = np.asarray(plate.crop((x0, y0, x0 + p.width, y0 + p.height))).reshape(-1, 3)
    de = lab_dist(np.median(zone, axis=0), pouch_dominant(p))
    arr = np.asarray(plate).astype(np.float32)
    alpha = np.zeros((H, W), np.float32)
    alpha[y0:y0 + p.height, x0:x0 + p.width] = np.asarray(p)[..., 3] / 255.0
    s = W / 1200.0
    arr = shadow(arr, alpha, 0.75 * 36 * s, 0.66 * 36 * s, 14 * s, 0.30)      # longer directional shadow toward the lower right
    arr = shadow(arr, alpha, 0.75 * 6 * s, 0.66 * 6 * s, 8 * s, 0.40)         # tight contact shadow
    pa = np.asarray(p).astype(np.float32)
    sl = (slice(y0, y0 + p.height), slice(x0, x0 + p.width))
    m = (pa[..., 3] / 255.0)[..., None]
    arr[sl] = arr[sl] * (1 - m) + pa[..., :3] * m
    arr = grain(arr, alpha * 0 + (alpha > 0.5), 3.0)
    return Image.fromarray(np.clip(arr, 0, 255).astype('uint8')), dict(x0=x0, y0=y0, pw=p.width, ph=p.height, dE=round(de, 1))


def keystone(p, top_shrink=0.025):
    w, h = p.size
    d = w * top_shrink
    coeffs = _persp([(0, 0), (w, 0), (w, h), (0, h)], [(d, 0), (w - d, 0), (w, h), (0, h)])
    return p.transform((w, h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)


def _persp(dst, src):
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        B += [u, v]
    return np.linalg.solve(np.array(A, np.float64), np.array(B, np.float64)).tolist()


def place_hero(plate, pouch, cfg):
    W, H = plate.size
    ph = round(H * cfg['h'])
    pw = round(pouch.width * ph / pouch.height)
    p = pouch.resize((pw, ph), Image.LANCZOS)
    if not cfg.get('real3d'):                              # a flat front image needs shading and perspective; the 3D render already has them
        p = shade(p, 0.07, side_light=True)
        p = keystone(p, 0.025)
    big = p.resize((pw * 2, ph * 2), Image.LANCZOS).rotate(-cfg['rot'], resample=Image.BICUBIC, expand=True)
    p = big.resize((big.width // 2, big.height // 2), Image.LANCZOS)
    # sit in the shallow depth of field: tiny blur, 3 % less contrast (the product name stays readable)
    rgb = Image.merge('RGB', p.split()[:3]).filter(ImageFilter.GaussianBlur(0.8))
    rgb = ImageEnhance.Contrast(rgb).enhance(0.97)
    p = Image.merge('RGBA', (*rgb.split(), p.split()[3]))
    x0 = round(cfg['cx'] * W - p.width / 2)
    y0 = round(cfg['base'] * H - p.height)
    assert x0 >= 0 and y0 >= 0 and x0 + p.width <= W, ('pouch leaves the frame', x0, y0, p.size)
    zone = np.asarray(plate.crop((x0, y0 + p.height // 2, x0 + p.width, y0 + p.height))).reshape(-1, 3)
    de = lab_dist(np.median(zone, axis=0), pouch_dominant(p))
    arr = np.asarray(plate).astype(np.float32)
    alpha = np.zeros((H, W), np.float32)
    alpha[y0:y0 + p.height, x0:x0 + p.width] = np.asarray(p)[..., 3] / 255.0
    base_y = y0 + p.height
    # soft elliptical contact shadow under the base
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx = x0 + p.width / 2
    ell = np.exp(-(((xx - cx) / (p.width * 0.52)) ** 2 + ((yy - (base_y - p.width * 0.01)) / (p.width * 0.055)) ** 2) * 2.2)
    arr *= (1 - 0.46 * ell)[..., None]
    # shadow cast away from the window light (window on the left, so toward the right), squashed onto the table
    sq, shear = 0.17, 0.62
    cast = np.zeros_like(alpha)
    sub = alpha[y0:base_y, x0:x0 + p.width]
    hh = sub.shape[0]
    cast_h = max(2, round(hh * sq))
    sub_s = np.asarray(Image.fromarray((sub * 255).astype('uint8')).resize((sub.shape[1], cast_h), Image.BILINEAR)).astype(np.float32) / 255.0
    for r in range(cast_h):                                # shear: the higher the row, the further it is thrown to the right
        shift = round((cast_h - 1 - r) / max(cast_h - 1, 1) * hh * shear * sq * 2.2)
        xs = x0 + shift
        if xs + sub_s.shape[1] <= W:
            cast[base_y - cast_h + r, xs:xs + sub_s.shape[1]] = np.maximum(cast[base_y - cast_h + r, xs:xs + sub_s.shape[1]], sub_s[r])
    arr *= (1 - blur_alpha(cast, W / 150) * 0.30)[..., None]
    pa = np.asarray(p).astype(np.float32)
    sl = (slice(y0, y0 + p.height), slice(x0, x0 + p.width))
    m = (pa[..., 3] / 255.0)[..., None]
    arr[sl] = arr[sl] * (1 - m) + pa[..., :3] * m
    arr = grain(arr, (alpha > 0.5).astype(np.float32), 3.0)
    return Image.fromarray(np.clip(arr, 0, 255).astype('uint8')), dict(x0=x0, y0=y0, pw=p.width, ph=p.height, dE=round(de, 1))


def title_height_px(pouch, out_scale):
    """height in the output of the pack's product name (dark capitals near the top of the front)"""
    a = np.asarray(pouch.convert('RGB')).astype(np.float32)
    h, w = a.shape[:2]
    band = a[int(h * 0.20):int(h * 0.42), int(w * 0.12):int(w * 0.88)]
    dark = (band.sum(2) < 220).astype(np.uint8)
    rows = np.where(dark.sum(1) > 6)[0]
    if len(rows) == 0:
        return None
    # the biggest contiguous run of dark rows is the name
    runs, start = [], rows[0]
    for a_, b_ in zip(rows, rows[1:]):
        if b_ - a_ > 3:
            runs.append((start, a_)); start = b_
    runs.append((start, rows[-1]))
    r0, r1 = max(runs, key=lambda t: t[1] - t[0])
    return (r1 - r0 + 1) * out_scale


def main():
    slug = sys.argv[1] if len(sys.argv) > 1 else 'kanda-poha'
    pdir = ROOT / 'pdp' / slug
    plates, gal = pdir / 'plates', pdir / 'gallery'
    pouch = load_pouch(slug)
    report = {}
    # serving
    own = plates / 'serving.png'                                  # a freshly generated serving picture wins over the old photo
    srv = improve_serving(own if own.exists() else plates / '_old' / 'hero.jpg')
    outs = {'serving': srv}
    p3d = plates / 'pouch3d-hero.png'
    for name, cfg in PLACE[slug].items():
        plate = Image.open(plates / f'{name}.png').convert('RGB')
        fn = place_hero if cfg['kind'] == 'hero' else place_flat
        use = load_pouch(slug, p3d) if (cfg.get('real3d') and p3d.exists()) else pouch
        img, info = fn(plate, use, cfg)
        W, H = plate.size
        scale = (cfg['h'] * H / use.height if cfg['kind'] == 'hero' else cfg['w'] * W / use.width) * (OUT_BIG / W)
        info['name_px_at_1200'] = round(title_height_px(use, scale), 1)
        outs[name] = img
        report[name] = info
    gal.mkdir(parents=True, exist_ok=True)
    for name, img in outs.items():
        w, h = img.size
        big = img.resize((OUT_BIG, round(h * OUT_BIG / w)), Image.LANCZOS)
        small = img.resize((OUT_SMALL, round(h * OUT_SMALL / w)), Image.LANCZOS)
        b1, q1 = save_webp(big, gal / f'{name}-1200.webp', MAX_BIG)
        b2, q2 = save_webp(small, gal / f'{name}-800.webp', MAX_SMALL)
        report.setdefault(name, {}).update(size_kb=f'{b1 / 1024:.0f}/{b2 / 1024:.0f}', w=big.width, h=big.height)
    print(json.dumps(report, indent=1))
    (pdir / 'lively-report.json').write_text(json.dumps(report, indent=1), encoding='utf-8')


if __name__ == '__main__':
    main()
