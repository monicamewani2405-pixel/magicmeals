"""Cleanup task: headless-Chromium crawl of the site (the runtime truth about which files are used).
Run from the project root:   python tools/crawl-site.py [out-prefix]      (default out-prefix: runtime)
Writes audit/cleanup/<prefix>-requests.csv  (every same-origin request: url, status, type, bytes, pages seen on)
       audit/cleanup/<prefix>-broken.csv    (4xx/5xx same-origin requests, and <img> that did not load)
Starts its own static server on 127.0.0.1:8123. No payment, no checkout: only browsing, scrolling and opening dialogs."""
import csv, functools, os, sys, threading, time, urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
OUT = os.path.join('audit', 'cleanup'); os.makedirs(OUT, exist_ok=True)
PREFIX = sys.argv[1] if len(sys.argv) > 1 else 'runtime'
PORT = 8123
BASE = f'http://127.0.0.1:{PORT}'

class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()

srv = ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()

reqs = {}          # path -> {status, type, bytes, pages:set}
broken_imgs = []   # (viewport, page, src)
console_errors = []
cur = {'page': ''}

def on_response(r):
    u = urllib.parse.urlparse(r.url)
    if u.netloc != f'127.0.0.1:{PORT}': return
    path = urllib.parse.unquote(u.path).lstrip('/') or 'index.html'
    try: size = int(r.headers.get('content-length') or 0)
    except ValueError: size = 0
    d = reqs.setdefault(path, {'status': r.status, 'type': r.request.resource_type, 'bytes': size, 'pages': set()})
    d['status'] = min(d['status'], r.status) if d['status'] < 400 and r.status < 400 else max(d['status'], r.status)
    d['bytes'] = max(d['bytes'], size); d['pages'].add(cur['page'])

def scroll_all(pg, step=700, pause=120):
    h = pg.evaluate('document.documentElement.scrollHeight')
    y = 0
    while y < h:
        pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(pause)
        y += step; h = max(h, pg.evaluate('document.documentElement.scrollHeight'))
    pg.evaluate('window.scrollTo(0,0)')

def check_imgs(pg, vp, name):
    bad = pg.evaluate('''() => [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc)''')
    for s in bad:
        if s.startswith(BASE): broken_imgs.append((vp, name, s))

def visit(pg, vp, name, hash_, after=None, settle=900):
    cur['page'] = f'{vp}:{name}'
    pg.goto(f'{BASE}/index.html{hash_}'); pg.wait_for_timeout(settle)
    try: pg.reload() if False else None
    except Exception: pass
    scroll_all(pg)
    if after:
        try: after(pg)
        except Exception as e: print('  step error', name, str(e)[:80])
    pg.wait_for_timeout(500); scroll_all(pg, 900, 60)
    check_imgs(pg, vp, name)

def home_steps(pg):
    # click each hero dot / neighbour pouch, then scroll the pinned scene to the end
    for sel in ['.v-switcher-dot', '[data-hero-dot]', '.v-switcher-dots button']:
        n = pg.locator(sel).count()
        for i in range(n):
            try: pg.locator(sel).nth(i).click(timeout=1500); pg.wait_for_timeout(450)
            except Exception: pass
        if n: break
    scroll_all(pg, 500, 140)

def shop_steps(pg):
    # search + every category chip
    chips = pg.locator('.cat-chip, [data-cat], .filter-chip, .shop-tabs button')
    for i in range(min(chips.count(), 14)):
        try: chips.nth(i).click(timeout=1500); pg.wait_for_timeout(500); scroll_all(pg, 900, 60)
        except Exception: pass
    s = pg.locator('input[type=search], #shopSearch, input[placeholder*=earch]')
    if s.count():
        try: s.first.fill('dal'); pg.wait_for_timeout(500)
        except Exception: pass

def product_steps(pg):
    # open every gallery picture / thumbnail
    th = pg.locator('.pdp-thumb, .pdp-gallery img, .pdp-thumbs button')
    for i in range(min(th.count(), 8)):
        try: th.nth(i).click(timeout=1000); pg.wait_for_timeout(200)
        except Exception: pass
    # rotate the 360 pouch viewer if present
    box = pg.locator('#pdpGallery3D, .pdp-gallery-3d')
    if box.count():
        try:
            b = box.first.bounding_box()
            if b:
                x, y = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
                pg.mouse.move(x, y); pg.mouse.down(); pg.mouse.move(x + 160, y, steps=8); pg.mouse.up(); pg.wait_for_timeout(300)
        except Exception: pass

with sync_playwright() as pw:
    br = pw.chromium.launch(channel='chrome', headless=True)
    for vp, (w, h, dpr, mobile) in {'desktop': (1440, 900, 2, False), 'mobile': (390, 844, 3, True)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr, is_mobile=mobile, has_touch=mobile)
        pg = ctx.new_page()
        pg.on('response', on_response)
        pg.on('console', lambda m: console_errors.append((cur['page'], m.text[:160])) if m.type == 'error' and '127.0.0.1' not in m.text and 'Failed to load resource' not in m.text else None)
        pg.on('pageerror', lambda e: console_errors.append((cur['page'], 'PAGEERROR ' + str(e)[:160])))
        pg.on('dialog', lambda d: d.dismiss())
        visit(pg, vp, 'home', '#home', home_steps, settle=2500)
        visit(pg, vp, 'shop', '#shop', shop_steps)
        visit(pg, vp, 'byob', '#byob')
        slugs = pg.evaluate('PRODUCTS.map(p => p.id)')
        print(vp, 'products', len(slugs)); sys.stdout.flush()
        for i, s in enumerate(slugs):
            visit(pg, vp, 'p-' + s, '#p-' + s, product_steps, settle=700)
        for key in ('terms-conditions', 'privacy-policy', 'return-refund-policy', 'delivery-policy'):
            visit(pg, vp, key, '#' + key)
        # cart drawer with an item, sign-in modal, brochure modal, mobile menu
        cur['page'] = f'{vp}:dialogs'
        pg.goto(f'{BASE}/index.html#shop'); pg.wait_for_timeout(1200)
        try: pg.locator('button.btn-add').first.click(); pg.wait_for_timeout(500)
        except Exception: pass
        for sel in ('#cartOpenBtn', '#mobileMenuOpenBtn', '.bro-tab', '#authOpenBtn, [data-open-auth], .auth-btn'):
            try:
                el = pg.locator(sel).first
                if el.is_visible(): el.click(timeout=1500); pg.wait_for_timeout(700); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
            except Exception: pass
        check_imgs(pg, vp, 'dialogs')
        ctx.close()
    br.close()
srv.shutdown()

with open(os.path.join(OUT, f'{PREFIX}-requests.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['path', 'status', 'type', 'bytes', 'pages'])
    for p, d in sorted(reqs.items()): w.writerow([p, d['status'], d['type'], d['bytes'], ' | '.join(sorted(d['pages']))[:300]])
with open(os.path.join(OUT, f'{PREFIX}-broken.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['kind', 'where', 'what'])
    for p, d in sorted(reqs.items()):
        if d['status'] >= 400: w.writerow(['http-' + str(d['status']), ' | '.join(sorted(d['pages']))[:200], p])
    for vp, n, s in broken_imgs: w.writerow(['img-not-loaded', f'{vp}:{n}', s])
    seen = set()
    for pgn, t in console_errors:
        if t not in seen: seen.add(t); w.writerow(['console', pgn, t])
bad = [p for p, d in reqs.items() if d['status'] >= 400]
print('requests', len(reqs), '| 4xx/5xx', len(bad), '| img-not-loaded', len(broken_imgs), '| console errors', len(set(t for _, t in console_errors)))
print('image/font/media requested:', sum(1 for p in reqs if p.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.woff2', '.mp4', '.pdf'))))
