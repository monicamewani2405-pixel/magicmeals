"""
replace-backs.py: replaces product back images with the new designer mockups in incoming-backs/.

  python tools/replace-backs.py check    # map files to products and compare each pouch silhouette to its front (no writes)
  python tools/replace-backs.py apply    # move old backs to _old-backs/, write new ones, regenerate derived files

Per product the back lives in pouch-art/<slug>-back-processed.png (1024x1600, used by main.js), pouch-art/<slug>-back.webp
(quality 88, method 6, used for the 3D textures in pouch-art/pouch-textures.js), pouch-art/<slug>-back.png (raw copy) and
assets/products/<file>_back.png (full-size copy referenced by shopify_products.csv).
The new back is placed on the 1024x1600 canvas exactly like pouch-art/batch_process_all_pouches.py does (trim to the pouch, fit inside
6% padding, centre). It is only used if its pouch shape matches the front's within SHAPE_TOL; no sharpening or colour change is applied.
"""
import os, re, sys, shutil
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
INCOMING = os.path.join(ROOT, 'incoming-backs')
ART = os.path.join(ROOT, 'pouch-art')
OLD = os.path.join(ROOT, '_old-backs')
CW, CH, PAD = 1024, 1600, 0.06
SHAPE_TOL = 0.02

SLUGS = ["rajma-masala", "paneer-butter-masala", "paneer-bhurji", "pind-ke-chhole", "pav-bhaji", "bhindi-masala", "veg-kadhai",
         "veg-makhanwala", "moong-masala", "dal-makhani", "dal-tadka", "dal-fry", "gujarati-dal", "dal-khichdi",
         "masala-khichdi-kadhi", "veg-biryani", "jeera-rice", "tawa-pulao", "fried-rice-manchurian", "fried-rice",
         "schezwan-rice", "mexican-rice", "kanda-poha", "idli-sambar", "upma", "mumbai-misal", "tomato-soup",
         "sweet-corn-soup", "hot-and-sour-soup", "gajar-halwa", "aam-ras", "rawa-sheera"]
# alias spellings -> normalised slug key (only clear spelling variants)
ALIAS = {'aamras': 'aamras', 'pindikechole': 'pindkechhole', 'pindkechole': 'pindkechhole', 'gujaratidal': 'gujaratidal',
         'gujratidal': 'gujaratidal', 'friedricewithmanchuriangravy': 'friedricemanchurian', 'hotsoursoup': 'hotandsoursoup'}
DROP = ['backside', 'back', 'mockup', 'copy', 'final', 'v1', 'v2']

def norm(name):
    s = os.path.splitext(name)[0].lower().replace('&', 'and').replace('panner', 'paneer')
    s = re.sub(r'\s+2$', '', s)               # uniform "2" revision suffix on every incoming file
    s = re.sub(r'[\s_\-]+', '', s)
    for w in DROP: s = s.replace(w, '')
    return ALIAS.get(s, s)

def slug_key(slug): return slug.replace('-', '')

def cutout_bbox(im, thr=15):
    a = np.array(im.convert('RGBA'))[:, :, 3]
    ys, xs = np.where(a >= thr)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

def place_on_canvas(im):
    """Same placement as batch_process_all_pouches.place_on_canvas (trim, fit in padding, centre), transparent canvas."""
    im = im.convert('RGBA'); im = im.crop(cutout_bbox(im))
    aw, ah = int(CW * (1 - 2 * PAD)), int(CH * (1 - 2 * PAD))
    s = min(aw / im.width, ah / im.height)
    nw, nh = int(im.width * s), int(im.height * s)
    sc = im.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); canvas.paste(sc, ((CW - nw) // 2, (CH - nh) // 2), sc)
    return canvas

def find_new():
    out = {}
    for dp, _, fs in os.walk(INCOMING):
        for f in fs:
            if f.startswith('._') or f in ('.DS_Store', 'Thumbs.db') or not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
            out.setdefault(norm(f), []).append(os.path.join(dp, f))
    return out

def mapping():
    new = find_new(); m = {}; used = set()
    for slug in SLUGS:
        c = new.get(slug_key(slug))
        if c:
            c.sort(key=os.path.getmtime, reverse=True); m[slug] = c[0]; used.add(slug_key(slug))
    unmatched = [p for k, v in new.items() if k not in used for p in v]
    return m, unmatched

def shape_check(slug, path):
    new = Image.open(path).convert('RGBA'); front = Image.open(os.path.join(ART, f'{slug}-front-processed.png')).convert('RGBA')
    nb, fb = cutout_bbox(new), cutout_bbox(front)
    nw, nh, fw, fh = nb[2]-nb[0], nb[3]-nb[1], fb[2]-fb[0], fb[3]-fb[1]
    ar_n, ar_f = nw / nh, fw / fh
    ar_err = abs(ar_n - ar_f) / ar_f
    # silhouette overlap after fitting both to the same box
    mn = np.array(new.crop(nb))[:, :, 3] >= 128; mf = np.array(front.crop(fb))[:, :, 3] >= 128
    mn = np.array(Image.fromarray((mn * 255).astype('uint8')).resize((fw, fh))) >= 128
    iou = (mn & mf).sum() / max(1, (mn | mf).sum())
    return ar_n, ar_f, ar_err, iou

def check():
    m, unmatched = mapping()
    print(f'{len(m)} mapped, {len(unmatched)} unmatched new files')
    for p in unmatched: print('  UNMATCHED:', p)
    print('products with no new back:', [s for s in SLUGS if s not in m])
    ok = {}
    for slug, p in m.items():
        ar_n, ar_f, err, iou = shape_check(slug, p)
        good = err <= SHAPE_TOL and iou >= 1 - SHAPE_TOL * 5
        print(f'{slug:24s} new AR {ar_n:.3f} front AR {ar_f:.3f} err {err*100:5.1f}%  IoU {iou:.3f}  {"OK" if err <= SHAPE_TOL else "SHAPE MISMATCH"}  <- {os.path.basename(p)}')
        ok[slug] = err <= SHAPE_TOL
    return m, ok

def move_old(path):
    rel = os.path.relpath(path, ROOT); dst = os.path.join(OLD, rel)
    if os.path.exists(path) and not os.path.exists(dst):
        os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy2(path, dst)

def apply():
    m, ok = check()
    for slug, p in m.items():
        if not ok[slug]: continue
        canvas = place_on_canvas(Image.open(p))
        for f in (f'{slug}-back-processed.png', f'{slug}-back.webp'):
            move_old(os.path.join(ART, f))
        canvas.save(os.path.join(ART, f'{slug}-back-processed.png'), 'PNG', optimize=True)
        canvas.save(os.path.join(ART, f'{slug}-back.webp'), 'WEBP', quality=88, method=6)
        print('replaced', slug)

if __name__ == '__main__':
    {'check': check, 'apply': apply}[sys.argv[1] if len(sys.argv) > 1 else 'check']()
