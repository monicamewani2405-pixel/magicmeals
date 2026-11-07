"""Make every product's net weight in main.js match the "Net Wt." printed on the back of its pack.

    python tools/sync-weights.py            show what would change
    python tools/sync-weights.py --write    change main.js

NET_WT = grams printed as "Net Wt." on the back mockups in the client's Drive folder "Magic Meals back mockup" (REGULAR/ and JAIN/).
The Jain Dal Tadka mockup belongs to the site's Dal Fry (same pack), as in tools/sync-nutrition.py. The "(makes ...)" part of the text is kept.
A combo has no label of its own: its net weight is the sum of its pouches (pdp/combos/combo-gallery.js lists them).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NET_WT = {
    'aam-ras': 60, 'bhindi-masala': 97, 'dal-fry': 60, 'dal-khichdi': 67, 'dal-makhani': 85, 'dal-tadka': 70, 'fried-rice': 70,
    'fried-rice-manchurian': 70, 'gajar-halwa': 85, 'gujarati-dal': 60, 'hot-and-sour-soup': 30, 'idli-sambar': 55,
    'jain-dal-khichdi': 67, 'jain-dal-makhani': 85, 'jain-masala-khichdi-kadhi': 55, 'jain-paneer-bhurji': 90,
    'jain-paneer-butter-masala': 83, 'jain-pav-bhaji': 80, 'jain-pind-ke-chhole': 70, 'jain-poha': 100, 'jain-rajma-masala': 70,
    'jain-schezwan-rice': 65, 'jain-upma': 60, 'jain-veg-biryani': 90, 'jain-veg-kadhai': 70, 'jain-veg-makhanwala': 70,
    'jeera-rice': 73, 'kanda-poha': 100, 'masala-khichdi-kadhi': 55, 'mexican-rice': 70, 'moong-masala': 50, 'mumbai-misal': 50,
    'paneer-bhurji': 90, 'paneer-butter-masala': 83, 'pav-bhaji': 80, 'pind-ke-chhole': 70, 'rajma-masala': 95, 'rawa-sheera': 85,
    'schezwan-rice': 85, 'sweet-corn-soup': 30, 'tawa-pulao': 87, 'tomato-soup': 30, 'upma': 60, 'veg-biryani': 90,
    'veg-kadhai': 70, 'veg-makhanwala': 70,
}


def combos():
    t = (ROOT / 'pdp' / 'combos' / 'combo-gallery.js').read_text(encoding='utf-8')
    return json.loads(re.search(r'window\.COMBO_PDP = (\{.*\});', t, re.S).group(1))


def want():
    out = dict(NET_WT)
    for cid, v in combos().items():
        out[cid] = sum(NET_WT[d] for d in v['dishes'])
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
            m = re.match(r"(\s+)weight: '(\d+)g net( \(makes [^']*\))',\s*$", l)
            if m:
                seen.add(cur)
                if int(m.group(2)) != W[cur]:
                    changed.append((cur, m.group(2) + 'g', f'{W[cur]}g'))
                    lines[i] = f"{m.group(1)}weight: '{W[cur]}g net{m.group(3)}',"
    missing = [k for k in W if k not in seen]
    print(f'{len(W)} products have a value; {len(changed)} differ from main.js; not found in main.js: {missing}')
    for c in changed:
        print('  %-70s %-6s -> %s' % c)
    if write:
        (ROOT / 'main.js').write_text(nl.join(lines), encoding='utf-8', newline='')
        print('main.js written')


if __name__ == '__main__':
    main()
