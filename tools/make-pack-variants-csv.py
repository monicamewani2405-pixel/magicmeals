"""Build shopify_pack_variants.csv: every product with three variants (Single, Pack of 3, Pack of 6), plus Jain Poha.

    python tools/make-pack-variants-csv.py

Reads  shopify_products.csv   (the full product data: titles, descriptions, images, tags, single-pouch price)
Writes shopify_pack_variants.csv  for Shopify Admin > Products > Import  (tick "Overwrite existing products that have the same URL handle")

Prices follow calcPrice() in main.js: Pack of 3 = price x3 -8 %, Pack of 6 = price x6 -15 %. Compare-at, weight and stock scale with the pack.
SKUs follow the convention the checkout checks: MM-<ID>, MM-<ID>-3, MM-<ID>-6.
After importing, run  python tools/shopify-sync.py  so the website's catalogue picks up the new variant ids.
"""
import csv
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'shopify_products.csv', ROOT / 'shopify_pack_variants.csv'

PACKS = [('1', 'Single', 1, None), ('3', 'Pack of 3', 3, 0.92), ('6', 'Pack of 6', 6, 0.85)]
VARIANT_COLS = ['Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
                'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping',
                'Variant Taxable', 'Variant Weight Unit']


def main():
    with SRC.open(encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        cols = reader.fieldnames
        rows = list(reader)
    by_handle = {}
    for r in rows:
        by_handle.setdefault(r['Handle'], []).append(r)

    out = []
    for handle, group in by_handle.items():
        first, rest = group[0], group[1:]
        base_price = float(first['Variant Price'])
        base_compare = float(first['Variant Compare At Price']) if first['Variant Compare At Price'] else None
        base_grams = int(float(first['Variant Grams'] or 0))
        base_qty = int(float(first['Variant Inventory Qty'] or 0))
        variants = []
        for pack, label, n, disc in PACKS:
            v = {c: '' for c in cols}
            v['Handle'] = handle
            v['Option1 Value'] = label
            for c in VARIANT_COLS:
                v[c] = first[c]
            v['Variant SKU'] = first['Variant SKU'] if n == 1 else f'{first["Variant SKU"]}-{pack}'
            v['Variant Grams'] = str(base_grams * n)
            v['Variant Inventory Qty'] = str(base_qty // n)
            v['Variant Price'] = str(math.floor(base_price * n * disc + 0.5)) if disc else str(round(base_price))
            v['Variant Compare At Price'] = str(round(base_compare * n)) if base_compare else ''
            variants.append(v)
        top = dict(first)                 # product-level fields + first variant (Single) + first image
        top.update({k: variants[0][k] for k in VARIANT_COLS})
        top['Option1 Name'], top['Option1 Value'] = 'Pack', 'Single'
        out += [top] + variants[1:] + rest  # variant rows, then the extra image rows

    with OUT.open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(out)
    print(f'{len(by_handle)} products, {len(out)} rows -> {OUT.name}')


if __name__ == '__main__':
    main()
