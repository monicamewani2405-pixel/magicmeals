"""Checks the sold-out behaviour against the LIVE Shopify stock (a product with zero stock and "Sell when out of stock" off, e.g. jain-pav-bhaji).
Run from the project root: python tools/soldout-check.py [product-id]   Screenshots go to audit/soldout/."""
import functools, os, sys, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
OUT = os.path.join('audit', 'soldout'); os.makedirs(OUT, exist_ok=True)
PID = sys.argv[1] if len(sys.argv) > 1 else 'jain-pav-bhaji'
class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', 8128), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8128/index.html'
res = []
def check(name, ok, extra=''):
    res.append(ok); print(('PASS ' if ok else 'FAIL ') + name + (' | ' + extra if extra else ''))
def cart_count(pg): return pg.evaluate("Object.values(State.cart).reduce((a, b) => a + b, 0)")
with sync_playwright() as pw:
    br = pw.chromium.launch(channel='chrome', headless=True)
    for vp, (w, h, mob) in {'desktop': (1440, 900, False), 'mobile': (390, 844, True)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mob, has_touch=mob, reduced_motion='reduce')
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:120])); pg.on('dialog', lambda d: d.dismiss())
        print('===', vp)
        pg.goto(f'{BASE}#shop'); pg.wait_for_selector('.product-card', timeout=20000)
        pg.wait_for_function(f"window.MMStock && window.MMStock.soldOut('{PID}')", timeout=20000); pg.wait_for_timeout(800)
        card = pg.locator(f'.product-card[data-p="{PID}"]')
        check(f'{vp}: card has the sold-out look', card.count() == 1 and 'is-soldout' in (card.get_attribute('class') or '') and card.locator('.soldout-badge').count() == 1)
        check(f'{vp}: card has no add button, only a disabled "Sold out"', card.locator('[data-add]').count() == 0 and card.locator('button.btn-soldout[disabled]').count() == 1)
        check(f'{vp}: card image is blurred', 'blur' in card.locator('.card-thumb img').evaluate('e => getComputedStyle(e).filter'))
        others = pg.locator('.product-card:not(.is-soldout)').count()
        sold_cards = pg.locator('.product-card.is-soldout').count()
        check(f'{vp}: only {PID} is sold out, every other dish normal', others >= 40 and sold_cards == 1, f'{others} normal cards, {sold_cards} sold out')
        card.scroll_into_view_if_needed(); card.screenshot(path=f'{OUT}/{vp}-card.png')
        # a normal dish still adds
        n0 = cart_count(pg); pg.locator('.product-card:not(.is-soldout) button.btn-add').first.click(); pg.wait_for_timeout(500)
        check(f'{vp}: a normal dish can still be added', cart_count(pg) == n0 + 1)
        # every other way in: a forged add click and modifyCart
        pg.evaluate(f"(() => {{ const b = document.createElement('button'); b.setAttribute('data-add', '{PID}'); document.body.appendChild(b); b.click(); b.remove(); }})()")
        pg.evaluate(f"modifyCart('{PID}|1', 1); modifyCart('{PID}|3', 2)")
        check(f'{vp}: sold-out dish cannot be added by any path', cart_count(pg) == n0 + 1, str(cart_count(pg)))
        # product page
        pg.goto(f'{BASE}#p-{PID}'); pg.wait_for_selector('.pdp-view', timeout=15000); pg.wait_for_timeout(1200)
        check(f'{vp}: product page marked sold out', pg.locator('.pdp-view.is-soldout').count() == 1)
        btn = pg.locator('#pdpAddToCartBtn')
        check(f'{vp}: add button disabled and says Sold out', btn.is_disabled() and 'Sold out' in btn.inner_text(), btn.inner_text().strip())
        n1 = cart_count(pg); btn.click(force=True); pg.evaluate("document.getElementById('pdpAddToCartBtn').dispatchEvent(new MouseEvent('click', {bubbles: true}))"); pg.wait_for_timeout(300)
        check(f'{vp}: clicking it adds nothing', cart_count(pg) == n1)
        packs = pg.locator('.pack-opt'); check(f'{vp}: every pack button is disabled', packs.count() >= 1 and all(packs.nth(i).is_disabled() for i in range(packs.count())), f'{packs.count()} packs')
        check(f'{vp}: product pictures blurred (3D pouch and image cards)', all('blur' in pg.locator(sel).first.evaluate('e => getComputedStyle(e).filter') for sel in ('.pdp-3d-canvas-container canvas, .pdp-gallery img', '.pdp-card img') if pg.locator(sel).count()))
        pg.screenshot(path=f'{OUT}/{vp}-product.png')
        # build your own box
        pg.goto(f'{BASE}#byob'); pg.wait_for_selector('.byob-meal-card', timeout=15000); pg.wait_for_timeout(800)
        bc = pg.locator(f'.byob-meal-card[data-p="{PID}"]')
        if bc.count():
            check(f'{vp}: Build Your Own Box: dish disabled', 'is-soldout' in (bc.get_attribute('class') or '') and bc.locator('[data-byob-add]').count() == 0)
        # a combo that contains it
        pg.goto(f'{BASE}#p-jain-street-style-combo-pav-bhaji-rawa-sheera'); pg.wait_for_selector('.pdp-view', timeout=15000); pg.wait_for_timeout(1000)
        check(f'{vp}: the combo containing it follows its OWN stock (not sold out)', pg.locator('.pdp-view.is-soldout').count() == 0 and not pg.locator('#pdpAddToCartBtn').is_disabled())
        # an unaffected product page
        pg.goto(f'{BASE}#p-rajma-masala'); pg.wait_for_selector('.pdp-view', timeout=15000); pg.wait_for_timeout(800)
        check(f'{vp}: a normal product page is unchanged', pg.locator('.pdp-view.is-soldout').count() == 0 and not pg.locator('#pdpAddToCartBtn').is_disabled())
        check(f'{vp}: no page errors', not errs, ' ; '.join(errs[:2]))
        ctx.close()
    br.close()
srv.shutdown()
print('ALL PASS' if all(res) else f'{res.count(False)} FAILED of {len(res)}')
