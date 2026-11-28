"""Scenario test for the sold-out rules (stock-status.js), with Shopify's stock answer MOCKED so every case can be tried. Run: python tools/soldout-scenarios.py
Target product: rajma-masala (a normal in-stock dish). Rules under test:
  stock above zero -> never blurred / always addable;  Single out (unavailable OR zero stock with "sell when out of stock" on) -> whole product sold out, all packs;
  only a bigger pack out -> only that pack disabled;  Shopify unreachable -> nothing blurred;  stock back -> blur removed without a reload."""
import functools, json, os, re, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
cat = open('shopify-catalog.js', encoding='utf-8').read(); cat = json.loads(cat[cat.index('{', cat.index('window.SHOPIFY_CATALOG')):cat.rindex('}') + 1])['products']
T = 'rajma-masala'
class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', 8130), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8130/index.html'

def answer(state):
    """state: dict pack -> (availableForSale, currentlyNotInStock) for the target; 'product_off' for product-level unavailable; everything else in stock."""
    nodes = []
    for h, p in cat.items():
        vs = []
        for pack, v in p['variants'].items():
            a, n = (True, False)
            if h == T and pack in state: a, n = state[pack]
            vs.append({'id': v['gid'], 'availableForSale': a, 'currentlyNotInStock': n})
        avail = any(v['availableForSale'] for v in vs)
        nodes.append({'handle': h, 'availableForSale': avail, 'variants': {'nodes': vs}})
    return {'data': {'products': {'pageInfo': {'hasNextPage': False, 'endCursor': None}, 'nodes': nodes}}}

current = {'mode': 'ok', 'state': {}}
def handler(route):
    body = route.request.post_data or ''
    if 'pageInfo' not in body: return route.continue_()
    if current['mode'] == 'fail': return route.fulfill(status=500, body='{}')
    route.fulfill(status=200, content_type='application/json', body=json.dumps(answer(current['state'])))

OUT, IN = (False, False), (True, False)         # unavailable / available with stock
ZERO_SELLING = (True, True)                     # zero stock but "sell when out of stock" is on
res = []
def check(name, ok, extra=''):
    res.append(ok); print(('PASS ' if ok else 'FAIL ') + name + (' | ' + extra if extra else ''))

def look(pg):
    pg.goto(f'{BASE}#shop'); pg.wait_for_selector('.product-card', timeout=20000); pg.wait_for_timeout(1500)
    card = pg.locator(f'.product-card[data-p="{T}"]')
    shop = {'blurred': card.evaluate("e => e.classList.contains('is-soldout') && getComputedStyle(e.querySelector('.card-thumb img')).filter.includes('blur')"),
            'canAdd': card.locator('button.btn-add[data-add]').count() == 1, 'soldCards': pg.locator('.product-card.is-soldout').count()}
    pg.goto(f'{BASE}#p-{T}'); pg.wait_for_selector('.pdp-view', timeout=15000); pg.wait_for_timeout(1500)
    packs = {b.get_attribute('data-pdp-pack'): b.is_disabled() for b in pg.locator('.pack-opt').all()}
    pdp = {'soldClass': pg.locator('.pdp-view.is-soldout').count() == 1, 'addDisabled': pg.locator('#pdpAddToCartBtn').is_disabled(), 'packsDisabled': packs}
    return shop, pdp

with sync_playwright() as pw:
    br = pw.chromium.launch(channel='chrome', headless=True)
    def fresh():
        ctx = br.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce'); ctx.route('**/api/*/graphql.json', handler)
        pg = ctx.new_page(); pg.on('dialog', lambda d: d.dismiss()); return ctx, pg

    # 1. everything in stock: nothing is blurred, everything can be added
    current.update(mode='ok', state={}); ctx, pg = fresh(); shop, pdp = look(pg)
    check('stock above zero: card not blurred and can be added', not shop['blurred'] and shop['canAdd'] and shop['soldCards'] == 0, str(shop))
    check('stock above zero: product page normal, add enabled, all packs enabled', not pdp['soldClass'] and not pdp['addDisabled'] and not any(pdp['packsDisabled'].values()), str(pdp)); ctx.close()

    # 2. Single unavailable -> all packs
    current.update(mode='ok', state={'1': OUT}); ctx, pg = fresh(); shop, pdp = look(pg)
    check('Single out: card blurred, no add button', shop['blurred'] and not shop['canAdd'], str(shop))
    check('Single out: product sold out and Pack of 3, 5 and 7 sold out too', pdp['soldClass'] and pdp['addDisabled'] and all(pdp['packsDisabled'].values()) and len(pdp['packsDisabled']) >= 4, str(pdp))
    n = pg.evaluate("Object.keys(State.cart).length"); pg.evaluate(f"modifyCart('{T}|3', 1); modifyCart('{T}|1', 1)")
    check('Single out: cannot be added to the cart (Pack of 3 or Single)', pg.evaluate("Object.keys(State.cart).length") == n); ctx.close()

    # 3. zero stock but "sell when out of stock" on: still sold out
    current.update(mode='ok', state={'1': ZERO_SELLING, '3': ZERO_SELLING, '5': ZERO_SELLING, '7': ZERO_SELLING}); ctx, pg = fresh(); shop, pdp = look(pg)
    check('zero stock with "sell when out of stock" ON: still blurred and sold out', shop['blurred'] and not shop['canAdd'] and pdp['soldClass'] and all(pdp['packsDisabled'].values()), str(pdp)); ctx.close()
    current.update(mode='ok', state={'1': ZERO_SELLING}); ctx, pg = fresh(); shop, pdp = look(pg)
    check('only Single at zero (packs still have stock): every pack is sold out', shop['blurred'] and all(pdp['packsDisabled'].values()), str(pdp['packsDisabled'])); ctx.close()

    # 4. a bigger pack out, Single in stock: only that pack
    for pack in ('3', '5', '7'):
        current.update(mode='ok', state={pack: OUT}); ctx, pg = fresh(); shop, pdp = look(pg)
        only = [p for p, d in pdp['packsDisabled'].items() if d]
        check(f'Pack of {pack} out, Single in stock: product NOT sold out, only Pack of {pack} disabled', not shop['blurred'] and shop['canAdd'] and not pdp['soldClass'] and not pdp['addDisabled'] and only == [pack], str(pdp['packsDisabled']))
        if pack == '3':
            n = pg.evaluate("Object.keys(State.cart).length"); pg.evaluate(f"modifyCart('{T}|3', 1)")
            ok3 = pg.evaluate("Object.keys(State.cart).length") == n; pg.evaluate(f"modifyCart('{T}|1', 1)")
            check('Pack of 3 out: Pack of 3 cannot be added, Single still can', ok3 and pg.evaluate("Object.keys(State.cart).length") == n + 1)
        ctx.close()

    # 5. Shopify unreachable: nothing is blurred
    current.update(mode='fail', state={}); ctx, pg = fresh(); shop, pdp = look(pg)
    check('Shopify unreachable: nothing blurred, everything can be added', not shop['blurred'] and shop['canAdd'] and shop['soldCards'] == 0 and not pdp['soldClass'], str(shop)); ctx.close()

    # 6. stock comes back while the page is open: blur disappears without a reload
    current.update(mode='ok', state={'1': OUT}); ctx, pg = fresh(); pg.goto(f'{BASE}#shop'); pg.wait_for_selector('.product-card', timeout=20000)
    pg.wait_for_function(f"document.querySelector('.product-card[data-p=\"{T}\"]').classList.contains('is-soldout')", timeout=15000)
    current.update(state={}); pg.evaluate('MMStock.refresh()')
    try: pg.wait_for_function(f"!document.querySelector('.product-card[data-p=\"{T}\"]').classList.contains('is-soldout')", timeout=15000); back = True
    except Exception: back = False
    check('stock comes back: blur removed without reloading the page, add button returns', back and pg.locator(f'.product-card[data-p="{T}"] button.btn-add[data-add]').count() == 1)
    # ...and the other way: a dish sells out while the page is open
    current.update(state={'1': OUT}); pg.evaluate('MMStock.refresh()')
    try: pg.wait_for_function(f"document.querySelector('.product-card[data-p=\"{T}\"]').classList.contains('is-soldout')", timeout=15000); went = True
    except Exception: went = False
    check('dish sells out while the page is open: blurred automatically', went); ctx.close()
    br.close()
srv.shutdown()
print('ALL PASS' if all(res) else f'{res.count(False)} FAILED of {len(res)}')
