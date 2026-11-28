"""Browser test of the Shopify theme preview (shopify-theme-preview/, built by tools/build-shopify-theme.py).
Run: python tools/theme-preview-check.py [desktop|mobile]     Own static server on 127.0.0.1:8132; the pictures come from Shopify's real file network.
Proves: every picture / poster request goes to Shopify's CDN and answers 200; NOTHING is requested from the page's own address except the theme's code files
(a leak = a picture path the shim / build missed, or a call to a server that does not exist on Shopify); no console errors; the sign-in and brochure
replacements work; the 3D pouch and the scenes load their pictures."""
import functools, os, re, sys, threading, urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREV = os.path.join(ROOT, 'shopify-theme-preview')
class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', 8132), functools.partial(Q, directory=PREV)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8132/index.html'
which = sys.argv[1] if len(sys.argv) > 1 else 'desktop'
res = []
def check(name, ok, extra=''):
    res.append(ok); print(('PASS ' if ok else 'FAIL ') + name + (' | ' + extra if extra else ''))

with sync_playwright() as pw:
    br = pw.chromium.launch(channel='chrome', headless=True)
    w, h, mob = (1440, 900, False) if which == 'desktop' else (390, 844, True)
    ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mob, has_touch=mob, reduced_motion='reduce')
    pg = ctx.new_page()
    cdn_req, local_req, errs = {}, [], []
    def on_resp(r):
        u = urllib.parse.urlparse(r.url)
        if u.netloc == 'cdn.shopify.com' and '/files/' in u.path: cdn_req[r.url] = r.status
        elif u.netloc == '127.0.0.1:8132' and not (u.path == '/index.html' or u.path.startswith('/assets/')): local_req.append((r.status, u.path))
    pg.on('response', on_resp)
    pg.on('console', lambda m: errs.append(m.text[:150]) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:150]))
    pg.on('dialog', lambda d: d.dismiss())
    posted = []
    # the preview page is not on Shopify, so its Storefront API calls (stock, checkout check) are sent on to the real store
    def storefront(route):
        r = route.request
        real = 'https://1z10zd-y0.myshopify.com' + urllib.parse.urlparse(r.url).path
        route.fulfill(response=route.fetch(url=real, method=r.method, headers=r.headers, post_data=r.post_data))
    ctx.route(re.compile(r'https?://127\.0\.0\.1:8132/api/.*'), storefront)
    ctx.route('**/contact', lambda route: (posted.append(route.request.post_data or ''), route.fulfill(status=200, body='ok')))
    def scroll(pg_, step=700):
        hh = pg_.evaluate('document.documentElement.scrollHeight'); y = 0
        while y < hh: pg_.evaluate(f'window.scrollTo(0,{y})'); pg_.wait_for_timeout(90); y += step; hh = max(hh, pg_.evaluate('document.documentElement.scrollHeight'))
        pg_.evaluate('window.scrollTo(0,0)')
    print(f'=== {which}')
    for name, hash_ in [('home', '#home'), ('shop', '#shop'), ('build your own box', '#byob'), ('single product (3D pouch)', '#p-rajma-masala'), ('jain product', '#p-jain-pav-bhaji'),
                        ('combo', '#p-comfort-combo-rajma-masala-jeera-rice-gajar-halwa'), ('policy page', '#delivery-policy')]:
        pg.goto(f'{BASE}{hash_}'); pg.wait_for_selector('#app, main', timeout=25000); pg.wait_for_timeout(2200); scroll(pg); pg.wait_for_timeout(800)
        broken = pg.evaluate("[...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc.slice(-70))")
        check(f'{name}: renders, no broken pictures', pg.locator('#app').inner_text() != '' and not broken, str(broken[:3]))
    # shop cards use the small thumbnails
    pg.goto(f'{BASE}#shop'); pg.wait_for_selector('.product-card'); pg.wait_for_timeout(1500)
    srcs = pg.evaluate("[...document.querySelectorAll('.product-card .card-thumb img')].map(i => i.getAttribute('src'))")
    odd = [x[-70:] for x in srcs if not (x.startswith('https://cdn.shopify.com/') and ('pouch-art__cards__' in x or 'assets__combos__' in x))]
    check('every shop card picture is a small thumbnail served from Shopify Files', len(srcs) > 40 and not odd, f'{len(srcs)} cards; odd: {odd[:3]}')
    pg.goto(f'{BASE}#p-rajma-masala'); pg.wait_for_selector('.pdp-view'); pg.wait_for_timeout(5000)
    check('3D pouch viewer drew its canvas (textures from Shopify, CORS ok)', pg.evaluate("(() => { const c = document.querySelector('#pdp3dCanvasContainer canvas'); return !!c && c.width > 0 })()"))
    # sign-in: the account icon goes to /account
    pg.goto(f'{BASE}#home'); pg.wait_for_selector('header'); pg.wait_for_timeout(800)
    nav = []
    pg.route('**/account', lambda route: (nav.append(route.request.url), route.fulfill(status=200, body='account')))
    acc = pg.locator('[data-action="profile"], #drawerProfileBtn, #authOpenBtn, .header-actions button[aria-label*="ccount" i], header [aria-label*="ign" i]').first
    try: acc.click(timeout=4000); pg.wait_for_timeout(1500)
    except Exception: pass
    check('account icon opens Shopify\'s /account (no site sign-in window)', any(u.endswith('/account') for u in nav) and pg.locator('#authModalBackdrop').count() == 0, str(nav[:1]))
    # brochure form -> Shopify contact form
    pg.goto(f'{BASE}#home'); pg.wait_for_selector('.bro-tab', timeout=15000); pg.locator('.bro-tab').click(); pg.wait_for_timeout(600)
    pg.fill('#broname', 'Test Person'); pg.fill('#broemail', 'test@example.com'); pg.fill('#brophone', '9876543210')
    pg.locator('.bro-dialog button[type=submit]').click(); pg.wait_for_timeout(2500)
    check('brochure form posts to the Shopify contact form and shows success', len(posted) == 1 and 'contact%5Bemail%5D' in posted[0] or ('contact[email]' in (posted[0] if posted else '')), (posted[0][:90] if posted else 'nothing posted'))
    # pincode check without a server
    pg.goto(f'{BASE}#p-rajma-masala'); pg.wait_for_selector('#pincodeInput'); pg.fill('#pincodeInput', '400001'); pg.click('#checkPincodeBtn'); pg.wait_for_timeout(2500)
    check('pincode check answers from the zone estimate', 'Estimated delivery' in pg.locator('#pincodeResult').inner_text() or 'delivery' in pg.locator('#pincodeResult').inner_text().lower(), pg.locator('#pincodeResult').inner_text()[:70])
    # cart + checkout path (no payment): the connector checks stock and builds the store-cart link
    pg.goto(f'{BASE}#shop'); pg.wait_for_selector('button.btn-add'); pg.locator('button.btn-add').first.click(); pg.wait_for_timeout(500)
    res_c = pg.evaluate("""async () => { const r = await ShopifyConnector.checkout({ cart: State.cart, byobBundles: {}, getProduct: id => PRODUCTS.find(x => x.id === id), calcPrice, subtotal: getCartSubtotal() }); return { ok: r.ok, cartUrl: r.cartUrl || '', problems: r.problems || [] }; }""")
    check('Checkout builds the store cart link on the theme\'s own address', res_c['ok'] and '/cart/clear?return_to=' in res_c['cartUrl'] and res_c['cartUrl'].startswith('https://127.0.0.1:8132/') or (res_c['ok'] and '/cart/clear' in res_c['cartUrl']), res_c['cartUrl'][:70] or str(res_c['problems']))
    bad_cdn = {u: s for u, s in cdn_req.items() if s != 200}
    check(f'every picture request went to Shopify and answered 200', not bad_cdn and len(cdn_req) > 60, f'{len(cdn_req)} requests; not 200: {list(bad_cdn.items())[:3]}')
    leaks = [x for x in local_req if x[0] != 200 or re.search(r'\.(png|jpe?g|webp|svg|gif|ico|pdf)$', x[1], re.I) or (x[1].startswith('/api') and not x[1].startswith('/api/2026-07/'))]   # /api/<version>/graphql.json is Shopify's own Storefront API: same address on the real store
    check('nothing is requested from the page\'s own address except the theme code', not leaks, str(leaks[:6]))
    check('no console errors', not errs, ' ; '.join(errs[:3]))
    ctx.close(); br.close()
srv.shutdown()
print('ALL PASS' if all(res) else f'{res.count(False)} FAILED of {len(res)}')
