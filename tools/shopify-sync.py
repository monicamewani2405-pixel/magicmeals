"""Match every product on the website to its Shopify variant, and write the contract the checkout enforces.

    python tools/shopify-sync.py            report + write shopify-catalog.js
    python tools/shopify-sync.py --check    report only, write nothing (exit 1 if anything would break checkout)

Reads   main.js              the website's products (id, title, price)
        shopify-config.js    store domain, public Storefront token, API version
Asks    the live Shopify Storefront API for every product + variant (read-only, public token)
Writes  shopify-catalog.js   window.SHOPIFY_CATALOG: website product id -> Shopify product + variant ids (per pack size)

Matching rule (exact, never fuzzy): the website product id must equal the Shopify product HANDLE.
Pack sizes: a variant whose title / option value is "Default Title", "Single" or "Single Pouch" is the single pouch (pack 1);
"Pack of 3" is pack 3; "Pack of 6" is pack 6. Packs that do not exist in Shopify are listed, and checkout blocks them.
Run this again after any change in Shopify (new product, recreated product, new variants, price change).
"""
import json, re, sys, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACK_TITLES = {
    '1': ('default title', 'single', 'single pouch'),
    '3': ('pack of 3',),
    '5': ('pack of 5',),
    '6': ('pack of 6',),
    '7': ('pack of 7',),
}


def read_config():
    s = (ROOT / 'shopify-config.js').read_text(encoding='utf-8')
    g = lambda k: (re.search(k + r"\s*:\s*'([^']*)'", s) or [None, ''])[1]
    return g('shopDomain'), g('storefrontAccessToken'), g('apiVersion')


def local_products():
    s = (ROOT / 'main.js').read_text(encoding='utf-8')
    i = s.index('const PRODUCTS')
    blk = s[i:i + 200000]
    out = {}
    for m in re.finditer(r"\n\s+id:\s*'([^']+)',", blk):
        seg = blk[m.end():m.end() + 900]
        t = re.search(r"title:\s*'(.*?)',\s*\n", seg)
        p = re.search(r"\bprice:\s*(\d+)", seg)
        if t and p:
            out[m.group(1)] = dict(title=t.group(1).replace("\\'", "'"), price=int(p.group(1)))
    return out


def pack_prices():
    """pack-prices.js: products sold as Single / Pack of 3 / 5 / 7 at the old store's prices (id -> {pack: price})."""
    t = (ROOT / 'pack-prices.js').read_text(encoding='utf-8')
    return json.loads(t[t.index('{', t.index('PACK_PRICES')):t.rindex('}') + 1])


def site_packs(pid, copied):
    return ['1', '3', '5', '7'] if pid in copied else ['1', '3', '6']


def calc_price(price, pack, pid=None, copied=None):
    """Same rule as calcPrice() in main.js. JS Math.round rounds .5 UP; Python round() rounds .5 to even, so use floor(x+0.5)."""
    import math
    if copied and pid in copied and pack in copied[pid]:
        return copied[pid][pack]
    return math.floor(price * 3 * 0.92 + 0.5) if pack == '3' else math.floor(price * 6 * 0.85 + 0.5) if pack == '6' else price


def shopify_products(domain, token, version):
    q = '''query($c:String){ products(first:50, after:$c){ pageInfo{hasNextPage endCursor}
      edges{ node{ id handle title variants(first:50){ edges{ node{ id title sku availableForSale price{amount}
      selectedOptions{name value} } } } } } } }'''
    out, cursor = [], None
    while True:
        req = urllib.request.Request(
            f'https://{domain}/api/{version}/graphql.json',
            json.dumps({'query': q, 'variables': {'c': cursor}}).encode(),
            {'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token})
        d = json.load(urllib.request.urlopen(req, timeout=30))
        if d.get('errors'):
            sys.exit('Shopify error: ' + json.dumps(d['errors'])[:400])
        p = d['data']['products']
        out += [e['node'] for e in p['edges']]
        if not p['pageInfo']['hasNextPage']:
            return out
        cursor = p['pageInfo']['endCursor']


def pack_of(variant):
    names = {variant['title'].lower()} | {o['value'].lower() for o in variant['selectedOptions']}
    for pack, titles in PACK_TITLES.items():
        if names & set(titles):
            return pack
    return None


def main():
    check = '--check' in sys.argv
    domain, token, version = read_config()
    if not token:
        sys.exit('No storefrontAccessToken in shopify-config.js')
    copied = pack_prices()
    local, shop = local_products(), {n['handle']: n for n in shopify_products(domain, token, version)}
    problems, warnings, catalog = [], [], {}

    for pid, lp in sorted(local.items()):
        n = shop.get(pid)
        if not n:
            problems.append(f'{pid}: not in Shopify (no product with handle "{pid}"), checkout is blocked for it')
            continue
        if n['title'].strip().lower() != lp['title'].strip().lower():
            problems.append(f'{pid}: title differs. site "{lp["title"]}" / Shopify "{n["title"]}" (same handle, is it the same product?)')
            continue
        variants = {}
        for e in n['variants']['edges']:
            v = e['node']
            pack = pack_of(v)
            if pack is None:
                warnings.append(f'{pid}: variant "{v["title"]}" is not a known pack size, ignored')
                continue
            if pack in variants:
                warnings.append(f'{pid}: two variants for pack {pack}, using the first')
                continue
            variants[pack] = dict(gid=v['id'], sku=v['sku'], price=float(v['price']['amount']), title=v['title'])
        if '1' not in variants:
            problems.append(f'{pid}: Shopify has no single-pouch variant')
            continue
        for pack, v in variants.items():
            if pack not in site_packs(pid, copied):
                warnings.append(f'{pid}: Shopify still has a Pack of {pack} variant, the website no longer sells it')
                continue
            want = calc_price(lp['price'], pack, pid, copied)
            if abs(v['price'] - want) > 0.5:
                problems.append(f'{pid}: pack {pack} price. site ₹{want} / Shopify ₹{v["price"]:g}')
            expect_sku = 'MM-' + pid.upper() + ('' if pack == '1' else '-' + pack)
            if (v['sku'] or '') != expect_sku:
                warnings.append(f'{pid}: pack {pack} SKU is "{v["sku"]}" (convention: {expect_sku})')
        missing = [p for p in site_packs(pid, copied)[1:] if p not in variants]
        if missing:
            warnings.append(f'{pid}: no Pack of {" / Pack of ".join(missing)} variant in Shopify, those pack sizes are blocked at checkout')
        catalog[pid] = dict(handle=n['handle'], product=n['id'], title=n['title'], variants=variants)

    for h in sorted(set(shop) - set(local)):
        warnings.append(f'Shopify-only product "{h}" (not on the website, never sold through it)')

    print(f'{domain}  API {version}  website products {len(local)}  Shopify products {len(shop)}  matched {len(catalog)}')
    for p in problems:
        print('  PROBLEM  ', p)
    packs_ok = sum(1 for k, c in catalog.items() if all(p in c['variants'] for p in site_packs(k, copied)))
    print(f'  pack variants: {packs_ok}/{len(catalog)} products have every pack size the website sells')
    for w in warnings:
        print('  note     ', w) if 'no Pack of' not in w else None
    print('  ' + ('ALL MATCH' if not problems else f'{len(problems)} problem(s)'))

    if not check:
        body = ('/* Generated by tools/shopify-sync.py. Do not edit by hand. The checkout (shopify-connector.js) only sells what is listed here and\n'
                '   re-checks every id, SKU, title, price and stock against the live store before it opens Shopify. */\n'
                'window.SHOPIFY_CATALOG = ' + json.dumps(dict(
                    generatedAt=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), shop=domain, apiVersion=version, products=catalog),
                    indent=1, ensure_ascii=False) + ';\n')
        (ROOT / 'shopify-catalog.js').write_text(body, encoding='utf-8')
        print('  wrote shopify-catalog.js')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
