"""Composite the REAL front pouch onto top-down lifestyle plates so it looks like it lies on the surface.

    python tools/compose-lifestyle.py [--pouch PATH] [--only hero,prep] [--place name=cx,cy,width,rot ...] [--check]

Reads   pdp/rajma-masala/plates/{hero,ingredients,prep,onthego}.(jpg|jpeg|png|webp)   (plates WITHOUT any pouch)
Writes  pdp/rajma-masala/gallery/<name>-1200.webp (<= 180 KB) and -800.webp (<= 90 KB)
and rewrites the GENERATED PLACEMENTS block of pdp/pdp-data.js (image size + where the pouch sits).

Placement: by default the largest EMPTY region is found automatically (low edge/texture density), pouch width 34-42 % of the
plate width, rotation between -20 and +20 degrees (a different value per plate), >= 3 % clear of every edge. View each plate
once and override with --place name=cx,cy,width,rot (fractions of the plate; rot in degrees) when the automatic spot is wrong.

Lighting: soft daylight from the UPPER LEFT, so shadows fall to the LOWER RIGHT: a tight contact shadow (6 px, blur 8, 35 %),
a wider ambient shadow (22 px, blur 30, 22 %), both multiplied onto the plate, a 2 px dark rim along the lower/right edge drawn
OUTSIDE the print, and a diagonal highlight of at most 6 % white. The pouch pixels are only resampled once (2x supersampled
rotation, no blur); the printed artwork is never edited.
"""
import argparse, io, json, math, os, re, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = Path(os.environ.get('PDP_ROOT') or Path(__file__).resolve().parent.parent)   # PDP_ROOT: test against a scratch copy
DIR = ROOT / 'pdp' / 'rajma-masala'
PLATES = DIR / 'plates'
OUT = DIR / 'gallery'
DATA = ROOT / 'pdp' / 'pdp-data.js'
DEFAULT_POUCH = Path(__file__).resolve().parent.parent / 'pouch-art' / 'rajma-masala-front-processed.png'

NAMES = ['hero', 'ingredients', 'prep', 'onthego']
ROT = {'hero': 12, 'ingredients': -9, 'prep': 17, 'onthego': -15}   # degrees, different per plate, within +-20
W_OUT, W_SMALL = 1200, 800
MAX_BIG, MAX_SMALL = 180 * 1024, 90 * 1024
MARGIN = 0.03


def find_plate(name):
    for ext in ('webp', 'png', 'jpg', 'jpeg'):
        p = PLATES / f'{name}.{ext}'
        if p.exists():
            return p
    return None


def load_pouch(path):
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
    mag = np.hypot(gx, gy)
    mag = ndi.uniform_filter(mag, size=max(9, plate.width // 60))
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
        bw, bh = pw * math.cos(th) + ph * math.sin(th), pw * math.sin(th) + ph * math.cos(th)    # rotated bounding box (px)
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
    if best is None:
        return 0.5, 0.5, 0.34
    return best[1], best[2], best[3]


def edge_rim(alpha_img, dx, dy):
    """Rim = the silhouette shifted to the lower right, minus the silhouette: a thin dark line outside the print."""
    a = np.asarray(alpha_img, dtype=np.float32) / 255
    shifted = np.roll(np.roll(a, dy, axis=0), dx, axis=1)
    return np.clip(shifted - a, 0, 1)


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
    # multiply shadows onto the plate (light from the upper left: shadow to the lower right)
    for dx, dy, blur, op in ((22, 22, 30, 0.22), (6, 6, 8, 0.35)):
        base *= (1 - op * shadow_layer(alpha, dx, dy, blur))[..., None]
    rim = edge_rim(alpha, 2, 2)
    base *= (1 - 0.45 * np.asarray(Image.fromarray((rim * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.5)), dtype=np.float32) / 255)[..., None]
    out = Image.fromarray((np.clip(base, 0, 1) * 255).astype('uint8')).convert('RGBA')

    # very subtle diagonal highlight, masked to the pouch (at most 6 % white), upper-left to lower-right
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    t = ((xx - x) + (yy - y)) / float(p.width + p.height)
    band = np.clip(1 - np.abs(t - 0.28) / 0.22, 0, 1) * 0.06
    hl = np.zeros((H, W, 4), np.uint8)
    hl[..., :3] = 255
    hl[..., 3] = (band * (np.asarray(alpha, dtype=np.float32) / 255) * 255).astype('uint8')
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pouch', default=str(DEFAULT_POUCH))
    ap.add_argument('--only', default='')
    ap.add_argument('--place', action='append', default=[], help='name=cx,cy,width,rot override (fractions, degrees)')
    ap.add_argument('--check', action='store_true', help='report placements only, write nothing')
    a = ap.parse_args()

    manual = {}
    for s in a.place:
        k, v = s.split('=')
        cx, cy, w, r = [float(t) for t in v.split(',')]
        manual[k] = (cx, cy, w, r)
    only = [s for s in a.only.split(',') if s] or NAMES
    pouch = load_pouch(a.pouch)

    placements, missing = {}, []
    if DATA.exists():                                                    # keep placements of plates not processed this run
        m = re.search(r'var PDP_PLACEMENTS = (\{.*?\});', DATA.read_text(encoding='utf-8'), re.S)
        if m:
            try:
                placements = json.loads(m.group(1))
            except ValueError:
                placements = {}
    for name in only:
        src = find_plate(name)
        if not src:
            missing.append(name)
            continue
        plate = Image.open(src).convert('RGB')
        if plate.width < W_OUT:
            print(f'  WARNING {name}: plate is only {plate.width}px wide, upscaled to {W_OUT}')
        plate = plate.resize((W_OUT, round(plate.height * W_OUT / plate.width)), Image.LANCZOS)
        if name in manual:
            cx, cy, wf, rot = manual[name]
        else:
            cx, cy, wf = auto_place(plate, name, pouch)
            rot = ROT.get(name, 10)
        assert 0.34 <= wf <= 0.42 and -20 <= rot <= 20, 'width must be 34-42 % and rotation within +-20'
        out, pl = compose(plate, pouch, cx, cy, wf, rot)
        w, h = out.size
        print(f'  {name}: plate {src.name} -> {w}x{h}, pouch centre ({pl["cx"]}, {pl["cy"]}), width {pl["w"]}, rot {rot}')
        if a.check:
            continue
        OUT.mkdir(parents=True, exist_ok=True)
        b1, q1 = save_webp(out, OUT / f'{name}-1200.webp', MAX_BIG)
        b2, q2 = save_webp(out.resize((W_SMALL, round(h * W_SMALL / w)), Image.LANCZOS), OUT / f'{name}-800.webp', MAX_SMALL)
        print(f'     {name}-1200.webp {b1 / 1024:.0f} KB (q{q1}), {name}-800.webp {b2 / 1024:.0f} KB (q{q2})')
        placements[name] = dict(w=w, h=h, pouch=pl)
    for name in missing:
        print(f'  MISSING INPUT: pdp/rajma-masala/plates/{name}.(jpg|jpeg|png|webp); the page shows a labelled placeholder for it')
    if a.check:
        return 0

    new, k = re.subn(r'(// BEGIN GENERATED PLACEMENTS[^\n]*\n)(.*?)(\n\s*// END GENERATED PLACEMENTS)',
                     lambda m: m.group(1) + '  var PDP_PLACEMENTS = ' + json.dumps(placements) + ';' + m.group(3),
                     DATA.read_text(encoding='utf-8'), flags=re.S)
    if k != 1:
        print('Could not find the GENERATED PLACEMENTS block in pdp-data.js')
        return 1
    DATA.write_text(new, encoding='utf-8')
    print('pdp-data.js updated')
    return 0


if __name__ == '__main__':
    sys.exit(main())
