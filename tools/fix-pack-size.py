"""Client rule: in every AI-generated picture that shows a pack, the pack must look larger than the plate or bowl.

    python tools/fix-pack-size.py --audit      write audit/pack-size-inventory.csv and audit/pack-size-results.csv, print the summary
    python tools/fix-pack-size.py --apply      re-compose the FAIL pictures that have room (needs numpy, scipy, Pillow); old files go to _old-images/

The gallery pictures of every single product (pdp/<slug>/gallery/) are:  serving (food only, no pack), hero and abroad (the REAL pouch composited
onto an AI plate by tools/compose-lively.py: type A), nutrition (the back of the pack, no plate: type C).  The combos (pdp/combos/<id>/gallery/) have a
food-only serving picture (hero), ingredients and prep (pouches composited on the two shared plates by tools/compose-combo-gallery.py: type A), nutrition.
No picture has a pack baked into the AI image itself (type B): every pack is composited, so the plates are clean.

MEASURED holds what was read off the contact sheets (13 Nov 2026), as fractions of the picture width:
    D   diameter of the plate or bowl (its longer axis in the picture)
    hero:   vr, vb = right edge and bottom edge of the dish (the pack stands lower right)
    abroad: vl     = left edge of the dish (the pack stands lower left)
ratio = the pack's longer side (its height) / D.   PASS >= 1.16,  UNSURE 1.10 to 1.16 (too close to call by eye: left alone),  FAIL < 1.10.
A FAIL is re-composed so that the ratio is about 1.17 (never above 70 % of the picture height or 60 % of its width), but only if the bigger pack
fits in the free area (does not cover the dish): otherwise the plate needs regenerating.
"""
import csv
import importlib.util
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIT = ROOT / 'audit'
W, H = 1200, 1500
PASS_MIN, SURE_MIN, TARGET = 1.16, 1.10, 1.17
MARGIN_X = 0.02            # a fixed pack keeps 2 % of the width clear of the frame

# (D, vr, vb) for the hero picture (pack lower right, standing): read off the contact sheets
HERO = {
    'kanda-poha': (.80, .82, .64), 'jain-poha': (.80, .82, .64), 'idli-sambar': (.52, .60, .64), 'upma': (.60, .62, .60), 'jain-upma': (.60, .62, .60),
    'mumbai-misal': (.70, .72, .58), 'tomato-soup': (.60, .63, .78), 'sweet-corn-soup': (.64, .64, .73), 'hot-and-sour-soup': (.66, .69, .72),
    'dal-makhani': (.69, .69, .73), 'dal-tadka': (.74, .74, .72), 'dal-fry': (.74, .74, .72), 'gujarati-dal': (.66, .67, .73),
    'jain-dal-makhani': (.68, .68, .73), 'dal-khichdi': (.66, .67, .72), 'masala-khichdi-kadhi': (.57, .58, .68), 'veg-biryani': (.55, .65, .72),
    'jeera-rice': (.68, .69, .74), 'tawa-pulao': (.65, .65, .60), 'fried-rice-manchurian': (.62, .70, .60), 'fried-rice': (.55, .58, .62),
    'schezwan-rice': (.57, .60, .62), 'mexican-rice': (.65, .65, .62), 'jain-dal-khichdi': (.63, .64, .68),
    'jain-masala-khichdi-kadhi': (.47, .53, .60), 'jain-schezwan-rice': (.62, .68, .67), 'jain-veg-biryani': (.58, .65, .75),
    'rajma-masala': (.48, .50, .60), 'paneer-butter-masala': (.50, .55, .72), 'paneer-bhurji': (.58, .73, .62), 'pind-ke-chhole': (.45, .50, .57),
    'pav-bhaji': (.73, .75, .62), 'bhindi-masala': (.50, .70, .60), 'veg-kadhai': (.63, .82, .65), 'veg-makhanwala': (.58, .67, .65),
    'moong-masala': (.62, .66, .65), 'jain-paneer-bhurji': (.58, .73, .62), 'jain-paneer-butter-masala': (.50, .55, .72), 'jain-pav-bhaji': (.73, .75, .62),
    'jain-pind-ke-chhole': (.45, .50, .57), 'jain-rajma-masala': (.48, .50, .60), 'jain-veg-kadhai': (.63, .82, .65),
    'jain-veg-makhanwala': (.50, .53, .58), 'gajar-halwa': (.63, .68, .62), 'aam-ras': (.47, .63, .55), 'rawa-sheera': (.60, .62, .66),
}
# (D, vl) for the abroad picture (pack lower left, standing)
ABROAD = {
    'kanda-poha': (.35, .53), 'jain-poha': (.35, .53), 'idli-sambar': (.47, .48), 'upma': (.41, .57), 'mumbai-misal': (.41, .57), 'jain-upma': (.41, .57),
    'tomato-soup': (.40, .46), 'sweet-corn-soup': (.42, .50), 'hot-and-sour-soup': (.30, .52), 'dal-makhani': (.57, .42), 'dal-tadka': (.63, .37),
    'dal-fry': (.47, .42), 'gujarati-dal': (.53, .42), 'jain-dal-makhani': (.53, .42), 'dal-khichdi': (.60, .37), 'masala-khichdi-kadhi': (.42, .48),
    'veg-biryani': (.38, .50), 'jeera-rice': (.53, .40), 'tawa-pulao': (.44, .49), 'fried-rice-manchurian': (.38, .48), 'fried-rice': (.48, .42),
    'schezwan-rice': (.32, .62), 'mexican-rice': (.52, .43), 'jain-dal-khichdi': (.42, .50), 'jain-masala-khichdi-kadhi': (.33, .50),
    'jain-schezwan-rice': (.44, .46), 'jain-veg-biryani': (.52, .45), 'rajma-masala': (.53, .45), 'paneer-butter-masala': (.38, .50),
    'paneer-bhurji': (.42, .43), 'pind-ke-chhole': (.50, .47), 'pav-bhaji': (.41, .51), 'bhindi-masala': (.33, .53), 'veg-kadhai': (.48, .47),
    'veg-makhanwala': (.28, .55), 'moong-masala': (.43, .55), 'jain-paneer-bhurji': (.42, .43), 'jain-paneer-butter-masala': (.38, .50),
    'jain-pav-bhaji': (.41, .51), 'jain-pind-ke-chhole': (.50, .47), 'jain-rajma-masala': (.53, .45), 'jain-veg-kadhai': (.48, .47),
    'jain-veg-makhanwala': (.43, .45), 'gajar-halwa': (.47, .47), 'aam-ras': (.50, .42), 'rawa-sheera': (.35, .47),
}
# the combos' prep picture: the steel pot is about 0.36 of the width; the pouch of a 2-pouch combo is about 0.39, of a 3-pouch combo about 0.29 (measured)
PREP_POT = 0.36


def load_lively():
    spec = importlib.util.spec_from_file_location('compose_lively', ROOT / 'tools' / 'compose-lively.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def verdict(r):
    return 'PASS' if r >= PASS_MIN else ('UNSURE' if r >= SURE_MIN else 'FAIL')


def current_place():
    """the placements now in tools/compose-lively.py, read without needing numpy"""
    t = (ROOT / 'tools' / 'compose-lively.py').read_text(encoding='utf-8')
    place = {}
    for m in re.finditer(r"^    '([a-z0-9-]+)': \{'hero': dict\(([^)]*)\), 'abroad': dict\(([^)]*)\)\},", t, re.M):
        def parse(s):
            return {k: (float(v) if re.fullmatch(r'-?[0-9.]+', v) else v == 'True') for k, v in (p.strip().split('=') for p in s.split(',') if '=' in p and 'kind' not in p)}
        place[m.group(1)] = {'hero': parse(m.group(2)), 'abroad': parse(m.group(3))}
    ov = re.search(r"PLACE_OVERRIDES = json\.loads\(r'''(.*?)'''\)", t, re.S)
    if ov:
        for s, o in json.loads(ov.group(1)).items():
            for k, v in o.items():
                place[s][k].update(v)
    return place


def pack_aspect(slug, real3d):
    """pouch width / height of the image used for this picture (needs Pillow + numpy)"""
    L = load_lively()
    p3d = ROOT / 'pdp' / slug / 'plates' / 'pouch3d-hero.png'
    im = L.load_pouch(slug, p3d) if (real3d and p3d.exists()) else L.load_pouch(slug)
    return im.width / im.height


def plan():
    """-> rows: one per picture of type A, with the measurement, the verdict and (for a FAIL) the new placement or 'regenerate'"""
    place = current_place()
    rows, fixes = [], {}
    for slug in HERO:
        asp = pack_aspect(slug, place[slug]['hero'].get('real3d'))
        cfg = place[slug]['hero']
        D, vr, vb = HERO[slug]
        h0 = cfg['h']
        ratio = h0 * H / (D * W)
        v = verdict(ratio)
        row = dict(slug=slug, picture='hero', vessel_d=D, pack_h_px=round(h0 * H), vessel_d_px=round(D * W), ratio=round(ratio, 2), verdict=v, action='', reason='')
        if v == 'FAIL':
            need_h = TARGET * D * W / H                       # as a fraction of the picture height
            base = 0.965
            best = 0.0
            for cand in [x / 1000 for x in range(int(h0 * 1000), 701)]:       # largest pack that does not cover the dish
                pw = cand * H * asp / W
                if pw > 0.60:
                    break
                x0 = 1 - MARGIN_X - pw
                top = base - cand
                if x0 >= vr - 0.03 or top >= vb - 0.02:
                    best = cand
            if best >= need_h:
                h = round(min(best, need_h * 1.03), 3)
                pw = h * H * asp / W
                cx = round(1 - MARGIN_X - pw / 2, 4)
                fixes[(slug, 'hero')] = dict(cx=cx, base=base, h=h)
                row.update(action='fix', reason=f'pack height {h0 * H:.0f} -> {h * H:.0f} px (ratio {h * H / (D * W):.2f}), flush right, base {base}')
            else:
                row.update(action='regenerate', reason=f'the free area allows a pack of at most {best * H:.0f} px; {need_h * H:.0f} px are needed for a ratio of {TARGET}: the dish takes the picture')
        rows.append(row)
    for slug in ABROAD:
        asp = pack_aspect(slug, place[slug]['abroad'].get('real3d'))
        cfg = place[slug]['abroad']
        D, vl = ABROAD[slug]
        h0 = cfg['h']
        ratio = h0 * H / (D * W)
        v = verdict(ratio)
        row = dict(slug=slug, picture='abroad', vessel_d=D, pack_h_px=round(h0 * H), vessel_d_px=round(D * W), ratio=round(ratio, 2), verdict=v, action='', reason='')
        if v == 'FAIL':
            need_h = TARGET * D * W / H
            h = round(need_h * 1.03, 3)
            pw = h * H * asp / W
            cx = round(MARGIN_X + pw / 2, 4)
            right = MARGIN_X + pw
            if h <= 0.70 and pw <= 0.60 and right <= vl + 0.03:
                fixes[(slug, 'abroad')] = dict(cx=cx, base=cfg['base'], h=h)
                row.update(action='fix', reason=f'pack height {h0 * H:.0f} -> {h * H:.0f} px (ratio {h * H / (D * W):.2f}), left edge of the dish at {vl:.2f}, pack ends at {right:.2f}')
            else:
                row.update(action='regenerate', reason=f'a pack of {h * H:.0f} px would reach x={right:.2f} but the dish starts at x={vl:.2f}: it would cover the dish')
        rows.append(row)
    return rows, fixes


def lively_slugs():
    return list(HERO)


def combos():
    t = (ROOT / 'pdp' / 'combos' / 'combo-gallery.js').read_text(encoding='utf-8')
    return json.loads(re.search(r'window.COMBO_PDP = (\{.*\});', t, re.S).group(1))


def write_audit(rows):
    AUDIT.mkdir(exist_ok=True)
    inv = []
    for slug in lively_slugs():
        for pos, (pic, typ, note) in enumerate([
                ('serving', 'C', 'food only, no pack (serving suggestion)'),
                ('hero', 'A', 'real pouch composited on an AI plate (compose-lively.py); the plate has no pack'),
                ('abroad', 'A', 'real pouch composited on an AI plate (compose-lively.py); the plate has no pack'),
                ('nutrition', 'C', 'back of the pack, no plate or bowl')], 1):
            inv.append(dict(product=slug, file=f'pdp/{slug}/gallery/{pic}-1200.webp', gallery_position=pos, serving_suggestion='yes' if pic == 'serving' else '', type=typ, how_made=note))
        for pic in ('ingredients', 'prep', 'onthego'):
            inv.append(dict(product=slug, file=f'pdp/{slug}/gallery/{pic}-1200.webp', gallery_position='', serving_suggestion='', type='A', how_made='old gallery picture, retired: the lively gallery replaced it, not shown on the page'))
    for cid in combos():
        for pos, (pic, typ, note) in enumerate([
                ('hero', 'C', 'multi-dish serving suggestion, food only, no pack'),
                ('ingredients', 'A', 'pouches composited on the shared spices plate (compose-combo-gallery.js); no plate or bowl of note'),
                ('prep', 'A', 'pouches composited on the shared kitchen plate with the steel pot (compose-combo-gallery.js)'),
                ('nutrition', 'C', 'nutrition tables, no plate or bowl')], 1):
            inv.append(dict(product=cid, file=f'pdp/combos/{cid}/gallery/{pic}-1200.webp', gallery_position=pos, serving_suggestion='yes' if pic == 'hero' else '', type=typ, how_made=note))
        inv.append(dict(product=cid, file=f'pdp/combos/{cid}/stage.webp', gallery_position='left panel', serving_suggestion='', type='C', how_made='pouches together on a transparent background, no plate or bowl'))
    with open(AUDIT / 'pack-size-inventory.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(inv[0]))
        w.writeheader()
        w.writerows(inv)
    res = []
    for r in rows:
        res.append(dict(product=r['slug'], file=f"pdp/{r['slug']}/gallery/{r['picture']}-1200.webp", type='A', pack_longer_side_px=r['pack_h_px'], vessel_diameter_px=r['vessel_d_px'],
                        ratio=r['ratio'], result=r['verdict'], action=r['action'], reason=r['reason'] or ('pack clearly larger than the vessel' if r['verdict'] == 'PASS' else 'pack within 10-16 % of the vessel size: too close to call by eye, left alone')))
    for cid, c in combos().items():
        n = len(c['dishes'])
        pouch_px = 0.39 * W if n == 2 else 0.29 * W              # measured: the pouch height in the 1200 px picture
        pouch_px = {2: 487, 3: 340}[n]
        ratio = pouch_px / (PREP_POT * W)
        v = verdict(ratio)
        res.append(dict(product=cid, file=f'pdp/combos/{cid}/gallery/prep-1200.webp', type='A', pack_longer_side_px=pouch_px, vessel_diameter_px=round(PREP_POT * W), ratio=round(ratio, 2), result=v,
                        action='regenerate' if v == 'FAIL' else '', reason=('3 pouches in the free area of the shared kitchen plate cannot each be larger than the pot: needs a new layout or plate' if v == 'FAIL'
                                                                         else 'the pouches are about 10 % larger than the pot: too close to call by eye, left alone')))
        res.append(dict(product=cid, file=f'pdp/combos/{cid}/gallery/ingredients-1200.webp', type='A', pack_longer_side_px=pouch_px, vessel_diameter_px=200, ratio=round(pouch_px / 200, 2), result='PASS', action='',
                        reason='only small spice bowls (about 0.17 of the width) are on the plate; each pouch is much larger'))
    with open(AUDIT / 'pack-size-results.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader()
        w.writerows(res)
    return inv, res


def apply(fixes):
    L = load_lively()
    import numpy as np
    from PIL import Image
    old_root = ROOT / '_old-images'
    place = current_place()
    overrides = {}
    report = {}
    for (slug, pic), new in sorted(fixes.items()):
        cfg = dict(place[slug][pic], kind='hero', rot=0.0)
        cfg.update(new)
        pdir = ROOT / 'pdp' / slug
        plate = Image.open(pdir / 'plates' / f'{pic}.png').convert('RGB')
        if abs(plate.width / plate.height - 0.8) > 0.005:          # a regenerated plate that is not 4:5: keep the top, cut the bottom
            plate = plate.crop((0, 0, plate.width, round(plate.width * 1.25)))
        if plate.width < 2000:                                       # a smaller regenerated plate: scale it up first so the pack art is drawn at full resolution
            plate = plate.resize((2000, 2500), Image.LANCZOS)
        p3d = pdir / 'plates' / 'pouch3d-hero.png'
        use = L.load_pouch(slug, p3d) if (cfg.get('real3d') and p3d.exists()) else L.load_pouch(slug)
        img, info = L.place_hero(plate, use, cfg)
        scale = cfg['h'] * plate.height / use.height * (L.OUT_BIG / plate.width)
        info['name_px_at_1200'] = round(L.title_height_px(use, scale), 1)
        gal = pdir / 'gallery'
        for size, limit in ((L.OUT_BIG, L.MAX_BIG), (L.OUT_SMALL, L.MAX_SMALL)):
            f = gal / f'{pic}-{size}.webp'
            old = old_root / 'pdp' / slug / 'gallery' / f.name
            if not old.exists():
                old.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(f, old)
            out = img.resize((size, round(img.height * size / img.width)), Image.LANCZOS)
            kb, q = L.save_webp(out, f, limit)
            info[f'kb_{size}'] = round(kb / 1024)
        overrides.setdefault(slug, {})[pic] = new
        report[f'{slug}/{pic}'] = info
    return overrides, report


def write_overrides(overrides):
    p = ROOT / 'tools' / 'compose-lively.py'
    t = p.read_text(encoding='utf-8')
    merged = {}
    m = re.search(r"\n# PACK-SIZE FIX.*?PLACE_OVERRIDES = json\.loads\(r'''(.*?)'''\)\n.*?\n# END PACK-SIZE FIX\n", t, re.S)
    if m:
        merged = json.loads(m.group(1))
        t = t.replace(m.group(0), '\n')
    for s, o in overrides.items():
        merged.setdefault(s, {}).update(o)
    block = ('\n# PACK-SIZE FIX (13 Nov 2026, tools/fix-pack-size.py): client rule "the pack must look larger than the plate or bowl". These placements replace the\n'
             '# ones in PLACE above for the pictures that had room for a bigger pack; every other picture keeps its PLACE entry.\n'
             "PLACE_OVERRIDES = json.loads(r'''" + json.dumps(merged, indent=1) + "''')\n"
             'for _s, _o in PLACE_OVERRIDES.items():\n    for _k, _v in _o.items():\n        PLACE[_s][_k].update(_v)\n# END PACK-SIZE FIX\n')
    anchor = "OUT_BIG, OUT_SMALL = 1200, 800"
    t = t.replace(anchor, block.lstrip('\n') + '\n' + anchor, 1)
    p.write_text(t, encoding='utf-8', newline='')


def main():
    rows, fixes = plan()
    inv, res = write_audit(rows)
    from collections import Counter
    print('inventory:', Counter(r['type'] for r in inv), len(inv), 'pictures')
    print('type A results:', Counter(r['result'] for r in res))
    print('actions:', Counter(r['action'] for r in res if r['action']))
    if '--apply' in sys.argv:
        overrides, report = apply(fixes)
        write_overrides(overrides)
        json.dump(report, open(AUDIT / 'pack-size-fix-report.json', 'w'), indent=1)
        print('re-composed', len(report), 'pictures')
        bad = {k: v for k, v in report.items() if v.get('name_px_at_1200') and v['name_px_at_1200'] < 28}
        print('product name under 28 px:', bad or 'none')


if __name__ == '__main__':
    main()
