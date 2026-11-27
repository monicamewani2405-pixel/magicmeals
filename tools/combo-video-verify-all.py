"""Stage 2 check: EVERY combo page, desktop 1440x900 and mobile 390x844. Prints a table (combo, tabs, components without video, PASS/FAIL) and the failures.
Run from the project root: python tools/combo-video-verify-all.py [desktop|mobile]   (no argument: both, one after the other, to keep memory low)
Own static server on 127.0.0.1:8126. Checks per combo: card sits in the Preparation Guide; tabs = components with a video (1 video = plain card, none = no card);
tab names match the pouches; zero Shopify cooking-video requests before a tap; one file after a tap (selected tab only); switching tabs adds none;
no console errors; no horizontal overflow."""
import csv, difflib, functools, json, os, re, sys, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
def js_obj(path, var):
    s = open(path, encoding='utf-8').read(); i = s.index('{', s.index(var)); d = 0
    for j in range(i, len(s)):
        d += (s[j] == '{') - (s[j] == '}')
        if d == 0: return json.loads(s[i:j + 1])
vids = js_obj('videos/product-videos.js', 'window.PRODUCT_VIDEOS')
combos = js_obj('pdp/combos/combo-gallery.js', 'window.COMBO_PDP')
main = open('main.js', encoding='utf-8').read()
titles = {a: b for a, b in re.findall(r"id: '([^']+)',\s*title: '([^']+)',\s*category: 'Combos'", main)}
order = list(titles)

class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', 8126), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8126/index.html'
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())

def name_ok(name, dish):
    a, b = norm(name), norm(dish)
    if a in b or b in a or difflib.SequenceMatcher(None, a, b).ratio() >= 0.72: return True
    ta = sorted(norm(w) for w in re.split(r'[\s-]+', name) if len(w) > 2); tb = sorted(norm(w) for w in re.split(r'[\s-]+', dish) if len(w) > 2)   # same words in another order ("Manchurian Fried Rice")
    return bool(ta) and all(any(x == y or difflib.SequenceMatcher(None, x, y).ratio() >= 0.8 for y in tb) for x in ta)

fails = []
def run(vp, w, h, dpr, mobile, br):
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1 if not mobile else 2, is_mobile=mobile, has_touch=mobile, reduced_motion='reduce')
    pg = ctx.new_page(); cdn, errs = [], []
    cdp = ctx.new_cdp_session(pg); cdp.send('Network.enable'); cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})   # a video played on an earlier page must still show up as a request
    pg.on('request', lambda r: cdn.append(r.url) if 'cdn.shopify.com/videos' in r.url else None)
    pg.on('console', lambda m: errs.append(m.text[:120]) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:120]))
    print(f'\n=== {vp}\n{"combo":78} {"tabs":>4}  no-video components  result')
    for cid in order:
        dishes = list(dict.fromkeys((combos.get(cid) or {}).get('dishes') or []))
        have = [d for d in dishes if d in vids]; miss = [d for d in dishes if d not in vids]
        why = []
        cdn.clear(); errs.clear()
        pg.goto(f'{BASE}#p-{cid}'); pg.wait_for_selector('.pdp-view', timeout=20000); pg.wait_for_timeout(600)
        card = pg.locator('[data-vid-combo]'); tabs = pg.locator('[role=tab][data-vid-tab]')
        n_tabs = tabs.count(); has_card = card.count() == 1
        want_tabs = len(have) if len(have) >= 2 else 0
        if not have:
            if has_card: why.append('card shown but no video exists')
        else:
            if not has_card: why.append('card missing')
            else:
                if n_tabs != want_tabs: why.append(f'tabs {n_tabs} != {want_tabs}')
                if pg.locator('.pdp-hiw-section [data-vid-combo]').count() != 1 or pg.locator('.pdp-hiw-video-card').count(): why.append('not in the Preparation Guide / generic card still there')
                for i in range(n_tabs):
                    t = tabs.nth(i); nm = t.get_attribute('data-vid-name'); dd = t.get_attribute('data-vid-dish')
                    if dd != have[i] or not name_ok(nm, dd): why.append(f'tab {i + 1} "{nm}" vs {dd}')
                if cdn: why.append(f'{len(cdn)} video request(s) before a tap')
                card.scroll_into_view_if_needed()
                pg.locator('.vid-play').click(); pg.wait_for_timeout(1800)
                if len(set(cdn)) != 1: why.append(f'{len(set(cdn))} files after the tap')
                if n_tabs >= 2:
                    before = len(cdn); tabs.nth(1).click(); pg.wait_for_timeout(700)
                    if len(cdn) != before or pg.locator('.vid-stage video').count(): why.append('tab switch loaded/kept a video')
        if not pg.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'): why.append('horizontal overflow')
        if errs: why.append('console: ' + errs[0])
        res = 'PASS' if not why else 'FAIL: ' + '; '.join(why)
        if why: fails.append((vp, cid, res))
        print(f'{cid[:78]:78} {n_tabs if has_card else "-":>4}  {",".join(miss) or "-":20} {res}'); sys.stdout.flush()
    ctx.close()

which = sys.argv[1] if len(sys.argv) > 1 else 'both'
with sync_playwright() as pw:
    br = pw.chromium.launch(channel='chrome', headless=True)
    if which in ('desktop', 'both'): run('desktop', 1440, 900, 1, False, br)
    if which in ('mobile', 'both'): run('mobile', 390, 844, 2, True, br)
    br.close()
srv.shutdown()
print('\nFAILURES:', len(fails)); [print(' ', *f) for f in fails]
