"""
fit-backs.py: builds the 3D viewer textures for the pouch: sharp FRONT textures from the full-resolution front sources and FITTED BACK
textures from the designers' new back mockups. Geometry and resampling only; the printed artwork is never edited.

  python tools/fit-backs.py <slug>      e.g. rajma-masala
  python tools/fit-backs.py all         every product (32), also prints the mapping table and the stretch table
  python tools/fit-backs.py map         only print the file -> product mapping

Output: pouch-art/tex/<slug>-front-1280.webp, -front-800.webp, <slug>-back-1280.webp, -back-800.webp
        (canvas 1280x2000 desktop / 800x1250 phones, same 0.64 ratio as the old 1024x1600 so the viewer's UVs are unchanged).
Old back files that get replaced are copied to _old-backs/pouch-art/ (never deleted by this script).

Front: assets/products/<name>_front.png (pouch ~1934x3007) -> crop to the pouch -> ONE Lanczos resample straight to the final size.
Back (new mockup in incoming-backs/**): crop to its alpha bbox -> scale NON-uniformly to the front's pouch box (stretch vs a uniform
  fit above 9% on either axis = FAIL, product left unchanged) -> multiply its alpha by the front's alpha mirrored left/right (the viewer
  maps the back with u = 1 - u), feathered 1px -> pixels the outline exposes that the back does not have (flat top, tapered bottom
  corners) are filled with the nearest edge colour, blurred only inside that area; the print area is never touched.
Products with no new back (e.g. Jain moong-masala, dal-fry) get their old back rebuilt from the full-resolution old back
  (assets/products/<name>_back.png) with the same plain fit as the old batch script (content unchanged, only sharper).
Colour is dilated 6px (scaled) beyond the outline and saved with exact alpha, so mipmaps / filtering give no dark fringe.
WebP: method 6, alpha_quality 95, exact; quality starts at 88 and steps down only as far as needed for the KB budget
  (300 KB desktop, 150 KB mobile). Pillow cannot set sharp_yuv, so it is not used. Light unsharp mask (0.6 px, 40%) on RGB only: see UNSHARP.
"""
import os, re, sys, glob, io, shutil, importlib.util
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ART = os.path.join(ROOT, 'pouch-art'); TEX = os.path.join(ART, 'tex'); OLD = os.path.join(ROOT, '_old-backs', 'pouch-art')
SIZES = {'1280': (1280, 2000, 300), '800': (800, 1250, 150)}      # name: (canvas w, canvas h, budget KB)
PAD = 0.06
MAX_STRETCH = 0.09
SLUGS = ["rajma-masala", "paneer-butter-masala", "paneer-bhurji", "pind-ke-chhole", "pav-bhaji", "bhindi-masala", "veg-kadhai",
         "veg-makhanwala", "moong-masala", "dal-makhani", "dal-tadka", "dal-fry", "gujarati-dal", "dal-khichdi",
         "masala-khichdi-kadhi", "veg-biryani", "jeera-rice", "tawa-pulao", "fried-rice-manchurian", "fried-rice",
         "schezwan-rice", "mexican-rice", "kanda-poha", "jain-poha", "idli-sambar", "upma", "mumbai-misal", "tomato-soup",
         "sweet-corn-soup", "hot-and-sour-soup", "gajar-halwa", "aam-ras", "rawa-sheera"]
# Products whose FRONT texture in the viewer is the Jain pouch (printed "Jain" mark). Every other product shows the regular pouch front.
# A file that exists in both incoming folders is taken from the folder that matches the front the viewer shows, so back and front are the
# same pouch (the Jain backs have a Jain mark, different ingredients and nutrition values). The main.js `jain` flag only drives the
# "Jain Friendly" badge and filter, it does not say which pouch the viewer shows, so it is not used for this.
JAIN_FRONT = {'moong-masala', 'dal-fry', 'jain-poha'}
FILE_KEY = {'jain-poha': 'poha'}        # normalised incoming file name ('POHA 2.png', JAIN folder) -> product slug
ASSET_NAME = {'jain-poha': 'poha_jain', 'pind-ke-chhole': 'pind_ke_chole', 'fried-rice-manchurian': 'fried_rice_with_manchurian_gravy'}

_spec = importlib.util.spec_from_file_location('replace_backs', os.path.join(os.path.dirname(__file__), 'replace-backs.py'))
_rb = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_rb)

def norm(name):
    s = os.path.splitext(name)[0].lower().replace('jain', '')
    return _rb.norm(s + '.png')

def mapping():
    """slug -> (file, folder) for products with a new back; plus unmatched files and ambiguous products."""
    by_key = {}
    for dp, _, fs in os.walk(os.path.join(ROOT, 'incoming-backs')):
        for f in fs:
            if f.startswith('._') or f in ('.DS_Store', 'Thumbs.db') or not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
            by_key.setdefault(norm(f), []).append((os.path.join(dp, f), os.path.basename(dp).upper()))
    m, ambiguous, used = {}, {}, set()
    for slug in SLUGS:
        c = by_key.get(FILE_KEY.get(slug, slug.replace('-', '')))
        if not c: continue
        used.add(FILE_KEY.get(slug, slug.replace('-', '')))
        if len({fo for _, fo in c}) > 1:                                   # a file in both folders: take the one matching the front shown
            want = 'JAIN' if slug in JAIN_FRONT else 'REGULAR'
            ambiguous[slug] = [x for x in c if x[1] != want]               # the twin that is NOT used (for the report)
            c = [x for x in c if x[1] == want]
        c.sort(key=lambda t: os.path.getmtime(t[0]), reverse=True); m[slug] = c[0]
    unmatched = [p for k, v in by_key.items() if k not in used for p, _ in v]
    return m, unmatched, ambiguous

def bbox(a, thr=15):
    ys, xs = np.where(a >= thr); return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

def asset(slug, kind):
    base = ASSET_NAME.get(slug, slug.replace('-', '_'))
    for p in (f'{base}_{kind}.png', f'{base}.png' if kind == 'front' else None):
        if p and os.path.exists(os.path.join(ROOT, 'assets', 'products', p)): return os.path.join(ROOT, 'assets', 'products', p)
    raise FileNotFoundError(f'{slug}: no {kind} source in assets/products')

def pouch_box(cw, ch, W, H):
    s = min(W * (1 - 2 * PAD) / cw, H * (1 - 2 * PAD) / ch)
    return int(cw * s), int(ch * s)

def place_front(src, W, H):
    im = Image.open(src).convert('RGBA'); im = im.crop(bbox(np.array(im)[:, :, 3]))
    nw, nh = pouch_box(im.width, im.height, W, H)
    sc = im.resize((nw, nh), Image.LANCZOS)                         # the only resample
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); canvas.paste(sc, ((W - nw) // 2, (H - nh) // 2), sc)
    return np.array(canvas)

def dilate_colour(arr, ring):
    """copy the nearest outline colour into the transparent ring around the pouch (alpha stays 0), so filtering never pulls in black."""
    a = arr[:, :, 3]; solid = a >= 250
    dist, idx = ndimage.distance_transform_edt(~solid, return_indices=True)
    near = (dist > 0) & (dist <= ring) & (a < 250)
    out = arr.copy(); out[near, :3] = arr[idx[0][near], idx[1][near], :3]
    return out

def fit_back(src, front, W, H):
    """returns (RGBA array, stretch_x, stretch_y, exposed_share)"""
    fa = front[:, :, 3].astype(float) / 255
    fx0, fy0, fx1, fy1 = bbox(front[:, :, 3]); fw, fh = fx1 - fx0, fy1 - fy0
    new = Image.open(src).convert('RGBA'); new = new.crop(bbox(np.array(new)[:, :, 3]))
    sx, sy = fw / new.width, fh / new.height; base = min(sx, sy)
    stx, sty = sx / base - 1, sy / base - 1
    if max(stx, sty) > MAX_STRETCH: return None, stx, sty, 0
    rs = np.array(new.resize((fw, fh), Image.LANCZOS))              # the only resample
    canvas = np.zeros((H, W, 4), np.uint8); canvas[fy0:fy1, fx0:fx1] = rs
    rgb = canvas[:, :, :3].astype(float); ba = canvas[:, :, 3].astype(float) / 255
    mask = np.clip(ndimage.gaussian_filter(fa[:, ::-1], 1.0), 0, 1)
    valid = ndimage.binary_erosion(ba >= 0.98, iterations=1)
    exposed = (mask > 0.001) & ~valid
    idx = ndimage.distance_transform_edt(~valid, return_distances=False, return_indices=True)
    padded = rgb[idx[0], idx[1]]
    blurred = np.stack([ndimage.gaussian_filter(padded[:, :, c], 10 * W / 1024) for c in range(3)], -1)
    w = ndimage.gaussian_filter(exposed.astype(float), 1.5)[:, :, None]
    w = np.where(exposed[:, :, None], np.maximum(w, 1.0), w * exposed[:, :, None])
    out_rgb = np.where(valid[:, :, None], rgb, blurred * w + padded * (1 - w))
    out = np.dstack([np.clip(out_rgb, 0, 255), mask * 255]).round().astype(np.uint8)
    return out, stx, sty, exposed.sum() / max(1, (mask > .001).sum())

def plain_back(src, front, W, H):
    """old back (full resolution) placed exactly like the old batch script: trim, fit inside the padding, centre; same outline mask."""
    return place_front(src, W, H)

UNSHARP = (0.6, 40)      # radius, percent: the light mask allowed after the final downscale (measured: needed, see report)

def encode(arr, budget_kb, qstart=88):
    arr = dilate_colour(arr, max(3, round(6 * arr.shape[1] / 1024)))
    if UNSHARP:                                                     # RGB only, after the colour dilation so the outline gets no dark halo
        rgb = Image.fromarray(arr[:, :, :3]).filter(ImageFilter.UnsharpMask(radius=UNSHARP[0], percent=UNSHARP[1], threshold=0))
        arr = arr.copy(); arr[:, :, :3] = np.array(rgb)
    img = Image.fromarray(arr); q = qstart
    while True:
        b = io.BytesIO(); img.save(b, 'WEBP', quality=q, method=6, alpha_quality=95, exact=True)
        if len(b.getvalue()) <= budget_kb * 1024 or q <= 60: return b.getvalue(), q
        q -= 2

def keep_old(slug):
    os.makedirs(OLD, exist_ok=True)
    for f in (f'{slug}-back-processed.png', f'{slug}-back.webp'):
        p = os.path.join(ART, f)
        if os.path.exists(p) and not os.path.exists(os.path.join(OLD, f)): shutil.copy2(p, os.path.join(OLD, f))

def card_assets(slug):
    """For a NEW product: pouch-art/<slug>-front-processed.png (1024x1600, main.js `img`) and pouch-art/cards/<slug>-front-640.webp
    (640x1000 lossless, same as tools/prep-scene.py makes for cards, BYOB and cart)."""
    arr = place_front(asset(slug, 'front'), 1024, 1600)
    out = os.path.join(ART, f'{slug}-front-processed.png'); Image.fromarray(arr).save(out, 'PNG', optimize=True)
    im = Image.open(out).convert('RGBA'); k = min(1.0, 1000 / float(im.height))
    im = im.resize((int(round(im.width * k)), int(round(im.height * k))), Image.LANCZOS)
    os.makedirs(os.path.join(ART, 'cards'), exist_ok=True)
    im.save(os.path.join(ART, 'cards', f'{slug}-front-640.webp'), 'WEBP', lossless=True, method=6)
    print('card assets:', out, im.size)

def build(slug, new_back=None):
    os.makedirs(TEX, exist_ok=True); row = {'slug': slug, 'folder': new_back[1] if new_back else 'unchanged', 'status': 'ok'}
    for name, (W, H, budget) in SIZES.items():
        front = place_front(asset(slug, 'front'), W, H)
        if new_back:
            back, stx, sty, exp = fit_back(new_back[0], front, W, H)
            row.update(stx=stx, sty=sty, exposed=exp)
            if back is None:
                row['status'] = 'FAIL stretch: left unchanged'; return row
        else:
            back = plain_back(asset(slug, 'back'), front, W, H); row.update(stx=0, sty=0, exposed=0)
        for kind, arr in (('front', front), ('back', back)):
            data, q = encode(arr, budget)
            with open(os.path.join(TEX, f'{slug}-{kind}-{name}.webp'), 'wb') as f: f.write(data)
            row[f'{kind}{name}'] = (len(data) / 1024, q)
    keep_old(slug)
    return row

def print_table(rows):
    print(f'{"slug":24s}{"folder":10s}{"stretch x":>10s}{"y":>8s}  front1280 back1280 front800 back800 (KB, q)   status')
    for r in rows:
        k = lambda n: f'{r[n][0]:5.0f}/{r[n][1]}' if n in r else '    -   '
        print(f'{r["slug"]:24s}{r["folder"]:10s}{r.get("stx", 0)*100:9.1f}%{r.get("sty", 0)*100:7.1f}%  {k("front1280")} {k("back1280")} {k("front800")} {k("back800")}   {r["status"]}')

if __name__ == '__main__':
    a = sys.argv[1] if len(sys.argv) > 1 else 'rajma-masala'
    m, unmatched, ambiguous = mapping()
    if a in ('map', 'all'):
        print(f'{len(m)} products mapped:')
        for s in SLUGS:
            print(f'  {s:24s} {os.path.relpath(m[s][0], ROOT)}  [{m[s][1]}]' + (f'   (twin in {ambiguous[s][0][1]} not used: regular/Jain pouch must match the front)' if s in ambiguous and ambiguous[s] else '') if s in m else f'  {s:24s} (no new back)')
        print('unmatched new files:', unmatched or 'none')
    if a == 'map': sys.exit()
    if a == 'card': card_assets(sys.argv[2]); sys.exit()
    todo = SLUGS if a == 'all' else [a]
    rows = [build(s, m.get(s)) for s in todo]
    print_table(rows)
