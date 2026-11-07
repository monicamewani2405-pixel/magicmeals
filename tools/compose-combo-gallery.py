"""Vertical (4:5) gallery images for the combo products: the REAL front pouches of every dish in the combo, together, on the same
lifestyle photos the single products use. Same lighting and shadows as tools/compose-lifestyle.py (its compose() is reused).

    python tools/compose-combo-gallery.py                 every combo in main.js
    python tools/compose-combo-gallery.py --only <id>     one combo
    options: --jobs 4

Per combo it writes pdp/combos/<id>/gallery/{hero,ingredients,prep,onthego}-{1200,800}.webp and pdp/combos/<id>/stage.webp
    hero          the pouches on the FIRST dish's own hero photo (food on a table), lower-left, like the single products ("Serving suggestion")
    stage         the pouches together on a transparent background: shown in the big left panel in place of the 3D pouch
    prep          the shared kitchen plate (kettle, bowl, spoon)      pdp/shared/plates/prep.jpg
    ingredients   the shared spices plate                             pdp/shared/plates/ingredients.jpg
    onthego       the shared travel plate (flask, bag, passport)      pdp/shared/plates/onthego.jpg
and pdp/combos/combo-gallery.js: the combos and their dishes (read by pdp/pdp-data.js, which builds the same 3-column page as the singles).
The pouch artwork is never edited; only resized, rotated slightly and given a shadow.
"""
import argparse, importlib.util, json, re, sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

REPO = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('compose_lifestyle', REPO / 'tools' / 'compose-lifestyle.py')
CL = importlib.util.module_from_spec(spec)
spec.loader.exec_module(CL)

OUT = REPO / 'pdp' / 'combos'
PLATES = REPO / 'pdp' / 'shared' / 'plates'
W, H = 1200, 1500

# the free area of each shared plate, as fractions: centre x, centre y, width, height (the single products put one pouch in the same area)
REGION = {
    'hero':        (0.26, 0.745, 0.46, 0.42),      # default; the real centre comes from the dish's own hero placement
    'prep':        (0.71, 0.33, 0.52, 0.50),
    'ingredients': (0.50, 0.50, 0.54, 0.50),
    'onthego':     (0.50, 0.71, 0.86, 0.52),
}
BASE_ROT = {'hero': 10, 'prep': 8, 'ingredients': 0, 'onthego': -8}      # whole cluster turned a little, like the single-pouch plates
FAN = {2: [-4, 4], 3: [-6, 5, -1], 4: [-5, 4, 4, -4]}                      # per-pouch tilt, degrees (clockwise positive)

# dish name as written in a combo title -> pouch-art id
DISH = {'paneer butter masala': 'paneer-butter-masala', 'jeera rice': 'jeera-rice', 'rawa sheera': 'rawa-sheera', 'tawa pulao': 'tawa-pulao',
        'veg biryani': 'veg-biryani', 'rajma masala': 'rajma-masala', 'fried rice with manchurian gravy': 'fried-rice-manchurian',
        'gajar halwa': 'gajar-halwa', 'veg makhanwala': 'veg-makhanwala', 'pav bhaji': 'pav-bhaji', 'paneer bhurji': 'paneer-bhurji',
        'aam ras': 'aam-ras', 'pind ke chole': 'pind-ke-chhole', 'tomato soup': 'tomato-soup', 'dal makhani': 'dal-makhani',
        'dal fry': 'dal-fry', 'idli sambar': 'idli-sambar', 'upma': 'upma', 'kanda poha': 'kanda-poha', 'mumbai misal': 'mumbai-misal',
        'sweet corn soup': 'sweet-corn-soup', 'mexican rice': 'mexican-rice', 'dal khichdi': 'dal-khichdi',
        'hot & sour soup': 'hot-and-sour-soup', 'manchurian fried rice': 'fried-rice-manchurian', 'schezwan rice': 'schezwan-rice', 'poha': 'kanda-poha', 'moong masala': 'moong-masala'}
# Jain combos use the Jain pouch (pouch-art/jain-<id>-front-processed.png, from the client's Jain mockups) for these dishes; Jeera Rice, Rawa Sheera and
# Aam Ras are the same pack in both versions, Dal Fry and Moong Masala only exist as Jain.
JAIN_POUCH = {'pav-bhaji', 'paneer-bhurji', 'veg-biryani', 'schezwan-rice', 'dal-makhani', 'upma', 'paneer-butter-masala', 'kanda-poha', 'pind-ke-chhole', 'veg-makhanwala', 'dal-khichdi', 'rajma-masala'}
JAIN_COMBOS = set()      # (the north-indian PBM + Jeera + Rawa combo was listed here by mistake: it is the regular Paneer Butter Masala)


def jain(d):
    return 'jain-poha' if d == 'kanda-poha' else 'jain-' + d if d in JAIN_POUCH else d
# titles that do not spell out their dishes
OVERRIDE = {}


def combos():
    src = (REPO / 'main.js').read_text(encoding='utf-8')
    out = {}
    for m in re.finditer(r"id: '([a-z0-9-]+)',\s*title: '((?:[^'\\]|\\.)*)',\s*category: 'Combos'", src):
        cid, title = m.group(1), m.group(2).replace("\\'", "'")
        if cid in OVERRIDE:
            out[cid] = OVERRIDE[cid]
            continue
        inside = re.search(r'\(([^)]*)\)', title).group(1)
        dishes = [DISH[d.strip().lower()] for d in inside.split('+')]
        out[cid] = [jain(d) for d in dishes] if cid.startswith('jain-') or cid in JAIN_COMBOS else dishes
    return out


def arrange(n, region, asp, W=W, H=H):
    """Centres (fractions of the plate) and pouch width for n pouches in one row (n <= 3) or two rows of two, slightly overlapping."""
    cx, cy, rw, rh = region
    rows = [n] if n <= 3 else [2, 2]
    k, r, o, vo = max(rows), len(rows), 0.12, 0.10
    wp = min(rw * W / (k - o * (k - 1)), rh * H / (asp * (r - vo * (r - 1)))) * 0.94
    hp = wp * asp
    sx, sy = wp * (1 - o), hp * (1 - vo)
    tot_h = hp + sy * (r - 1)
    pts = []
    for ri, rn in enumerate(rows):
        y = cy * H - tot_h / 2 + hp / 2 + ri * sy
        tot_w = wp + sx * (rn - 1)
        for ci in range(rn):
            pts.append((cx * W - tot_w / 2 + wp / 2 + ci * sx, y))
    return [(x / W, y / H) for x, y in pts], wp / W


def hero_plate(dish):
    """The first dish's own top-down hero photo (shared plate, or the product's own one) and where its single pouch sits."""
    if dish.startswith('jain-') and not (PLATES / f'hero-{dish}.jpg').exists():
        dish = dish[5:]                                  # a Jain pouch on the regular dish's photo
    own = REPO / 'pdp' / dish / 'plates' / 'hero.jpg'
    p = own if own.exists() else PLATES / f'hero-{dish}.jpg'
    pl = CL.load_json(PLATES.parent / 'placements.json').get(f'hero-{dish}') or CL.load_json(REPO / 'pdp' / dish / 'placements.json').get('hero')
    return Image.open(p).convert('RGB'), (pl[0], pl[1]) if pl else (0.2542, 0.7333)


def stage_image(dishes, pouches):
    """All the pouches together on a transparent square, with a soft shadow baked in (no CSS filter needed)."""
    S = 1200
    asp = pouches[0].height / pouches[0].width
    pts, wf = arrange(len(dishes), (0.5, 0.47, 0.92, 0.80), asp, S, S)
    order = {2: [0, 1], 3: [0, 2, 1], 4: [0, 1, 2, 3]}[len(dishes)]
    fan = FAN[len(dishes)]
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    for i in order:
        cx, cy = pts[i]
        if len(dishes) == 3 and i == 1:
            cy -= 0.02
        p = CL.rotated_pouch(pouches[i], round(wf * S), fan[i])
        layer.alpha_composite(p, (round(cx * S - p.width / 2), round(cy * S - p.height / 2)))
    alpha = layer.getchannel('A')
    sh = Image.new('L', (S, S), 0)
    sh.paste(alpha, (10, 22))
    sh = sh.filter(ImageFilter.GaussianBlur(20)).point(lambda v: int(v * 0.34))
    out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    out.paste(Image.new('RGBA', (S, S), (0, 0, 0, 255)), (0, 0), sh)
    out.alpha_composite(layer)
    return out


def job(args):
    cid, dishes, name = args
    pouches = [CL.load_pouch(d) for d in dishes]
    d = OUT / cid
    (d / 'gallery').mkdir(parents=True, exist_ok=True)
    if name == 'stage':
        im = stage_image(dishes, pouches)
        im.save(d / 'stage.webp', 'WEBP', quality=90, method=6)
        return cid, name, (d / 'stage.webp').stat().st_size // 1024, 0
    asp = pouches[0].height / pouches[0].width
    region = REGION[name]
    if name == 'hero':
        plate, (px, py) = hero_plate(dishes[0])
        region = (max(px, 0.27), py + 0.025, 0.50, 0.40)
    else:
        plate = Image.open(PLATES / f'{name}.jpg').convert('RGB')
    pts, wf = arrange(len(dishes), region, asp)
    order = {2: [0, 1], 3: [0, 2, 1], 4: [0, 1, 2, 3]}[len(dishes)]            # the middle pouch of three goes on top
    fan = FAN[len(dishes)]
    for i in order:
        cx, cy = pts[i]
        if len(dishes) == 3 and i == 1:
            cy -= 0.02
        plate, _ = CL.compose(plate, pouches[i], cx, cy, wf, fan[i] + BASE_ROT[name])
    s1 = CL.save_webp(plate, d / 'gallery' / f'{name}-1200.webp', 180_000)
    s2 = CL.save_webp(plate.resize((800, 1000), Image.LANCZOS), d / 'gallery' / f'{name}-800.webp', 90_000)
    return cid, name, s1[0] // 1024, s2[0] // 1024


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only')
    ap.add_argument('--jobs', type=int, default=4)
    a = ap.parse_args()
    allc = combos()
    todo = {k: v for k, v in allc.items() if not a.only or k == a.only}
    jobs = [(cid, dishes, name) for cid, dishes in todo.items() for name in list(REGION) + ['stage']]
    with ProcessPoolExecutor(a.jobs) as ex:
        for cid, name, k1, k2 in ex.map(job, jobs):
            print(f'{cid[:58]:58s} {name:12s} {k1:4d} KB / {k2:3d} KB', flush=True)
    done = {p.parent.parent.name: {'dishes': allc[p.parent.parent.name]} for p in sorted(OUT.glob('*/gallery/hero-1200.webp')) if p.parent.parent.name in allc}
    (OUT / 'combo-gallery.js').write_text(
        '/* GENERATED by tools/compose-combo-gallery.py. The combos that have images in pdp/combos/<id>/, and their dishes (pouch-art ids). */\n'
        'window.COMBO_PDP = ' + json.dumps(done) + ';\n', encoding='utf-8')
    print(len(done), 'combos have gallery images')


if __name__ == '__main__':
    sys.exit(main())
