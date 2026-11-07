"""Make every product's calories / protein in main.js match the Nutrition panel printed on its pack.

    python tools/sync-nutrition.py            show what would change
    python tools/sync-nutrition.py --write    change main.js

NUTRITION = values per serving read from the back mockups in the client's Drive folder "Magic Meals back mockup"
(REGULAR/ and JAIN/, one PNG per product; the "Nutrition Information" table, "Average Quantity Per Serving": kcal and protein).
The Jain Dal Tadka mockup belongs to the site's Dal Fry (same pack). A combo has no label of its own: its calories and protein are the
sum of its pouches (pdp/combos/combo-gallery.js lists them), as before.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# id: (kcal per serving, protein per serving as printed)
NUTRITION = {
    'aam-ras': (70, '0.22g'), 'bhindi-masala': (461, '8.4g'), 'dal-fry': (262, '10.6g'), 'dal-khichdi': (304, '8.13g'),
    'dal-makhani': (463, '7.31g'), 'dal-tadka': (284, '11.7g'), 'fried-rice': (232, '4.7g'), 'fried-rice-manchurian': (275, '7.4g'),
    'gajar-halwa': (427, '4.79g'), 'gujarati-dal': (208, '5.89g'), 'hot-and-sour-soup': (106, '1.04g'), 'idli-sambar': (233, '4.0g'),
    'jain-dal-khichdi': (290, '6.9g'), 'jain-dal-makhani': (338, '11.7g'), 'jain-masala-khichdi-kadhi': (90, '1.68g'),
    'jain-paneer-bhurji': (170, '8.34g'), 'jain-paneer-butter-masala': (197, '5.58g'), 'jain-pav-bhaji': (96, '2.14g'),
    'jain-pind-ke-chhole': (323, '12.6g'), 'jain-poha': (175, '2.6g'), 'jain-rajma-masala': (97, '3.42g'),
    'jain-schezwan-rice': (241, '4.57g'), 'jain-upma': (152, '2.19g'), 'jain-veg-biryani': (159, '2.62g'),
    'jain-veg-kadhai': (426, '5.88g'), 'jain-veg-makhanwala': (133, '2.30g'), 'jeera-rice': (290, '2.11g'), 'kanda-poha': (220, '5.0g'),
    'masala-khichdi-kadhi': (203, '6.1g'), 'mexican-rice': (299, '4.2g'), 'moong-masala': (150, '7.5g'), 'mumbai-misal': (250, '5g'),
    'paneer-bhurji': (514, '22.59g'), 'paneer-butter-masala': (484, '15.58g'), 'pav-bhaji': (435, '6.88g'), 'pind-ke-chhole': (117, '5.35g'),
    'rajma-masala': (444, '12.90g'), 'rawa-sheera': (284, '5.19g'), 'schezwan-rice': (315, '6.0g'), 'sweet-corn-soup': (104, '0.89g'),
    'tawa-pulao': (359, '7.64g'), 'tomato-soup': (100, '2.09g'), 'upma': (152, '2.19g'), 'veg-biryani': (450, '7.52g'),
    'veg-kadhai': (426, '5.88g'), 'veg-makhanwala': (391, '7.83g'),
}


def combos():
    t = (ROOT / 'pdp' / 'combos' / 'combo-gallery.js').read_text(encoding='utf-8')
    return json.loads(re.search(r'window\.COMBO_PDP = (\{.*\});', t, re.S).group(1))


def want():
    out = {k: (f'{c} kcal', p) for k, (c, p) in NUTRITION.items()}
    for cid, v in combos().items():
        kc = sum(NUTRITION[d][0] for d in v['dishes'])
        pr = sum(float(NUTRITION[d][1].rstrip('g')) for d in v['dishes'])
        out[cid] = (f'{kc} kcal', f'{pr:.1f}g')
    return out


def main():
    write = '--write' in sys.argv
    src = (ROOT / 'main.js').read_text(encoding='utf-8')
    nl = '\r\n' if '\r\n' in src else '\n'
    lines = src.split(nl)
    W = want()
    cur, changed, seen = None, [], set()
    for i, l in enumerate(lines):
        m = re.match(r"(\s+)id: '([^']+)',\s*$", l)
        if m:
            cur = m.group(2)
            continue
        if cur in W:
            m = re.match(r"(\s+)(calories|protein): '([^']*)',\s*$", l)
            if m:
                kind = m.group(2)
                new = W[cur][0 if kind == 'calories' else 1]
                seen.add((cur, kind))
                if new != m.group(3):
                    changed.append((cur, kind, m.group(3), new))
                    lines[i] = f"{m.group(1)}{kind}: '{new}',"
    missing = [k for k in W if (k, 'calories') not in seen]
    print(f'{len(W)} products have a value; {len(changed)} fields differ from main.js; not found in main.js: {missing}')
    for c in changed:
        print('  %-62s %-8s %-10s -> %s' % c)
    if write:
        out = nl.join(lines)
        out = out.replace("// calories / protein of the Jain packs = the regular dish's values (ASSUMPTION, not printed on the old store); no reviews yet.",
                          "// calories / protein per serving = the Nutrition panel printed on each pack (tools/sync-nutrition.py); no reviews yet.")
        out = out.replace("// calories / protein = sum of the single packs (derived, not printed on a combo label); no reviews yet.",
                          "// calories / protein = sum of its pouches' per-serving values (tools/sync-nutrition.py; a combo has no label of its own); no reviews yet.")
        (ROOT / 'main.js').write_text(out, encoding='utf-8', newline='')
        print('main.js written')


if __name__ == '__main__':
    main()
