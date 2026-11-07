"""Make each product's Body (HTML) match the website (old-store description) and append the Ingredients block to each product's Body (HTML) in shopify_products.csv, then rebuild the pack CSV.

    python tools/add-ingredients-to-csv.py && python tools/make-pack-variants-csv.py

Body = intro paragraph + long description (product-descriptions.js) + Ingredients. Same text and order as the website (pdp/ingredients.js): a dish shows its list, a combo shows one list per pouch.
Safe to run again: an existing "Ingredients" block at the end of the body is replaced.
"""
import csv, io, json, re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def js_json(path, marker):
    t = path.read_text(encoding='utf-8')
    return json.loads(t[t.index('{', t.index(marker)):t.rindex('}') + 1])


def main():
    ING = js_json(ROOT / 'product-ingredients.js', 'PRODUCT_INGREDIENTS')
    DESC = js_json(ROOT / 'product-descriptions.js', 'PRODUCT_DESCRIPTIONS')
    COMBO = js_json(ROOT / 'pdp' / 'combos' / 'combo-gallery.js', 'COMBO_PDP')
    titles, cur = {}, None
    for l in (ROOT / 'main.js').read_text(encoding='utf-8').split('\n'):
        m = re.match(r"\s+id: '([^']+)',\s*$", l)
        if m:
            cur = m.group(1)
            continue
        m = re.match(r"\s+title: '(.*)',\s*$", l)
        if m and cur and cur not in titles:
            titles[cur] = m.group(1).replace("\'", "'")

    def lines(e):
        return ['<strong>%s:</strong> %s' % (escape(a, quote=False), escape(b, quote=False)) for a, b in e] if isinstance(e, list) else [escape(e, quote=False)]

    def block(pid, is_combo):
        out = ''
        if is_combo:
            for d in COMBO.get(pid, {}).get('dishes', []):
                if d in ING:
                    out += '<p><strong>%s</strong><br>%s</p>' % (escape(titles.get(d, d), quote=False), '<br>'.join(lines(ING[d])))
        elif pid in ING:
            out = '<p>%s</p>' % '<br>'.join(lines(ING[pid]))
        return '<h3>Ingredients</h3>' + out if out else ''

    src = ROOT / 'shopify_products.csv'
    raw = src.read_bytes().decode('utf-8')
    bom = '﻿' if raw.startswith('﻿') else ''
    nl = '\r\n' if '\r\n' in raw else '\n'
    rows = list(csv.reader(io.StringIO(raw.lstrip('﻿'), newline='')))
    h = rows[0]
    ib, ip = h.index('Body (HTML)'), h.index('Variant Price')
    n = 0
    for r in rows[1:]:
        if not (r[0] and r[ip]):
            continue
        body = re.sub(r'<h3>Ingredients</h3>.*$', '', r[ib], flags=re.S)
        d = DESC.get(r[0])
        if d:                                            # the same text the product page shows
            body = '<p>%s</p>%s' % (escape(d['intro'], quote=False), d['html'])
        add = block(r[0], r[0] in COMBO)
        r[ib] = ' '.join((body + add).split())      # one line, no line breaks inside the cell (the Shopify importer handles single-line cells best)
        n += bool(add)
    o = io.StringIO()
    csv.writer(o, lineterminator=nl).writerows(rows)
    src.write_bytes((bom + o.getvalue()).encode('utf-8'))
    print('ingredients added to', n, 'of', sum(1 for r in rows[1:] if r[0] and r[ip]), 'products')


if __name__ == '__main__':
    main()
