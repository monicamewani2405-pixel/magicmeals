"""Split a sheet of separate ingredients on a pure white background into transparent WebP cutouts.

    python tools/cutout-sheet.py [--sheet PATH] [--names bean,tomato,ginger,...] [--check]

Reads  pdp/shared/cutout-sheet.(jpg|jpeg|png|webp)  (first one found).
Writes pdp/shared/ingredients/ingredient-1..8.webp  (400px long side, <= 40 KB each, 4% padding)
and rewrites the GENERATED INGREDIENTS block of pdp/pdp-data.js.

Steps: flood-fill the near-white background from the border (so white INSIDE an item stays), erode the mask 1px and
feather 1px (JPEG-safe, no halo), label connected components, keep the 8 largest, crop each with 4% padding.
An item is REJECTED and reported when it touches the sheet edge (clipped) or is unusually large (merged items).
--names gives a short name per item in reading order (left to right, top to bottom); view the sheet once to decide them.
"""
import argparse, io, json, os, re, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = Path(os.environ.get('PDP_ROOT') or Path(__file__).resolve().parent.parent)   # PDP_ROOT: test against a scratch copy
DIR = ROOT / 'pdp' / 'shared'                 # the cutouts are the same for every product
OUT = DIR / 'ingredients'
DATA = ROOT / 'pdp' / 'pdp-data.js'
WHITE_TOL = 22          # a pixel is "near white" when every channel >= 255 - WHITE_TOL
MAX_SIDE = 400
MAX_BYTES = 40 * 1024
PAD = 0.04
KEEP = 8


def find_sheet(arg):
    if arg:
        return Path(arg)
    for stem in ('cutout-sheet-transparent', 'cutout-sheet'):      # a sheet whose background is already removed wins
        for ext in ('png', 'webp', 'jpg', 'jpeg'):
            p = DIR / f'{stem}.{ext}'
            if p.exists():
                return p
    return None


def background_mask(rgb):
    """True = background: near-white pixels connected to the image border."""
    near_white = (rgb >= 255 - WHITE_TOL).all(axis=2)
    lab, _ = ndi.label(near_white)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    border = border[border != 0]
    return np.isin(lab, border)


def encode(im):
    """WebP under MAX_BYTES: lower quality, then the size, until it fits."""
    for scale in (1.0, 0.85, 0.7, 0.55):
        w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
        t = im if scale == 1.0 else im.resize((w, h), Image.LANCZOS)
        for q in (88, 80, 72, 64, 56, 48):
            buf = io.BytesIO()
            t.save(buf, 'WEBP', quality=q, method=6, alpha_quality=90)
            if buf.tell() <= MAX_BYTES:
                return buf.getvalue(), t.size, q
    return buf.getvalue(), t.size, q


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sheet')
    ap.add_argument('--names', default='')
    ap.add_argument('--check', action='store_true', help='report only, write nothing')
    a = ap.parse_args()

    sheet = find_sheet(a.sheet)
    if not sheet or not sheet.exists():
        print('MISSING INPUT: pdp/shared/cutout-sheet.* not found. Nothing written.')
        return 2
    src = Image.open(sheet).convert('RGBA')
    im = src.convert('RGB')
    rgb = np.asarray(im)
    H, W = rgb.shape[:2]
    src_alpha = np.asarray(src)[..., 3]
    has_alpha = (src_alpha < 250).mean() > 0.10                       # background already removed (e.g. by Canva): trust its alpha
    if has_alpha:
        print('sheet has transparency: splitting by alpha (no white-background removal)')
        fg = src_alpha > 32
    else:
        fg = ~background_mask(rgb)
    fg = ndi.binary_opening(fg, iterations=1)                       # drop speckle
    # group pieces that belong together (e.g. cinnamon + cardamom + bay leaf): label a dilated copy, keep the real pixels
    grow = max(2, int(W * 0.012))
    lab, n = ndi.label(ndi.binary_dilation(fg, iterations=grow))
    lab = np.where(fg, lab, 0)
    if n == 0:
        print('No foreground found on the sheet.')
        return 1
    sizes = ndi.sum(fg, lab, index=range(1, n + 1))
    order = np.argsort(sizes)[::-1][:KEEP]                           # the 8 largest
    comps = []
    for idx in order:
        ys, xs = np.where(lab == idx + 1)
        comps.append(dict(id=int(idx + 1), area=int(sizes[idx]), x0=int(xs.min()), x1=int(xs.max()) + 1, y0=int(ys.min()), y1=int(ys.max()) + 1))
    median = float(np.median([c['area'] for c in comps]))
    # reading order: rows (by y centre, tolerance = median item height) then left to right
    mh = float(np.median([c['y1'] - c['y0'] for c in comps]))
    comps.sort(key=lambda c: (round(((c['y0'] + c['y1']) / 2) / (mh * 0.8)), c['x0']))

    names = [s.strip() for s in a.names.split(',') if s.strip()]
    rejected, kept = [], []
    for i, c in enumerate(comps):
        label = names[i] if i < len(names) else f'item {i + 1}'
        clipped = c['x0'] <= 1 or c['y0'] <= 1 or c['x1'] >= W - 1 or c['y1'] >= H - 1
        merged = c['area'] > 2.2 * median
        if clipped or merged:
            rejected.append((label, 'clipped at the sheet edge' if clipped else 'much larger than the others: probably merged items'))
            continue
        m = (lab == c['id'])
        if has_alpha:
            # keep the supplied alpha, limited to this item (dilated a little so soft edges survive)
            keep = ndi.binary_dilation(m, iterations=3)
            alpha = Image.fromarray(np.where(keep, src_alpha, 0).astype('uint8'))
            rgba = im.copy()
            rgba.putalpha(alpha)
        else:
            # alpha: this component only, eroded 1px then feathered 1px
            m = ndi.binary_fill_holes(ndi.binary_closing(m, iterations=grow))
            m = ndi.binary_erosion(m, iterations=1)
            alpha = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))
            # defringe: edge pixels keep white from the background; take their colour from the nearest solid interior pixel
            core = ndi.binary_erosion(m, iterations=3)
            if core.sum() > 50:
                _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
                rgba = Image.fromarray(np.where(core[..., None], rgb, rgb[iy, ix]).astype('uint8'))
            else:
                rgba = im.copy()
            rgba.putalpha(alpha)
        pw, ph = int((c['x1'] - c['x0']) * PAD) + 1, int((c['y1'] - c['y0']) * PAD) + 1
        box = (max(0, c['x0'] - pw), max(0, c['y0'] - ph), min(W, c['x1'] + pw), min(H, c['y1'] + ph))
        crop = rgba.crop(box)
        s = MAX_SIDE / max(crop.size)
        if s < 1:
            crop = crop.resize((round(crop.width * s), round(crop.height * s)), Image.LANCZOS)
        kept.append((label, crop))

    print(f'sheet {sheet.name} {W}x{H}: {n} components, kept {len(kept)}, rejected {len(rejected)}')
    for label, why in rejected:
        print(f'  REJECTED {label}: {why}')
    if a.check:
        return 0

    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob('ingredient-*.webp'):
        old.unlink()
    files, total = [], 0
    for i, (label, crop) in enumerate(kept, 1):
        data, size, q = encode(crop)
        (OUT / f'ingredient-{i}.webp').write_bytes(data)
        total += len(data)
        files.append({'file': f'ingredient-{i}.webp', 'name': label, 'w': size[0], 'h': size[1]})
        print(f'  ingredient-{i}.webp  {label:10s} {size[0]}x{size[1]}  {len(data) / 1024:.1f} KB (q{q})')
    print(f'total {total / 1024:.1f} KB')

    block = 'var PDP_INGREDIENT_FILES = ' + json.dumps(files) + ';'
    src = DATA.read_text(encoding='utf-8')
    new, k = re.subn(r'(// BEGIN GENERATED INGREDIENTS[^\n]*\n)(.*?)(\n\s*// END GENERATED INGREDIENTS)',
                     lambda m: m.group(1) + '  ' + block + m.group(3), src, flags=re.S)
    if k != 1:
        print('Could not find the GENERATED INGREDIENTS block in pdp-data.js')
        return 1
    DATA.write_text(new, encoding='utf-8')
    print('pdp-data.js updated')
    return 0


if __name__ == '__main__':
    sys.exit(main())
