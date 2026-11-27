"""Shows that the combo video switch changes nothing except combo pages that have videos: compares the rendered page (#app) with COMBO_VIDEOS_ENABLED on and off
for the shop grid, single products (with and without their own video) and combos that have no video. Run: python tools/combo-video-unchanged.py"""
import functools, os, re, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', 8127), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8127/index.html'
SAME = ['shop', 'p-rajma-masala', 'p-jain-poha', 'p-tomato-soup', 'p-mexican-rice', 'p-aam-ras', 'p-fiesta-bowl-combo', 'p-jain-light-dinner-combo-dal-khichdi-moong-masala', 'byob', 'home']
DIFF = ['p-comfort-combo-rajma-masala-jeera-rice-gajar-halwa', 'p-jain-street-style-combo-pav-bhaji-rawa-sheera']
def html(pg, route):
    pg.goto(f'{BASE}#{route}'); pg.wait_for_timeout(1500)
    h = pg.evaluate("document.getElementById('app').innerHTML")
    return re.sub(r'vidc\d+', 'vidc', h)
with sync_playwright() as pw:
    br = pw.chromium.launch(channel='chrome', headless=True)
    for vp, (w, hh, mob) in {'desktop': (1440, 900, False), 'mobile': (390, 844, True)}.items():
        res = {}
        for mode in ('on', 'off'):
            ctx = br.new_context(viewport={'width': w, 'height': hh}, is_mobile=mob, has_touch=mob, reduced_motion='reduce')
            if mode == 'off':
                ctx.route('**/videos/video-facade.js', lambda r: r.fulfill(response=r.fetch(), body=r.fetch().text().replace('var COMBO_VIDEOS_ENABLED = true;', 'var COMBO_VIDEOS_ENABLED = false;'), content_type='text/javascript'))
            pg = ctx.new_page()
            res[mode] = {r: html(pg, r) for r in SAME + DIFF}
            ctx.close()
        print('===', vp)
        for r in SAME: print(('PASS' if res['on'][r] == res['off'][r] else 'FAIL'), 'unchanged:', r)
        for r in DIFF:
            on, off = res['on'][r], res['off'][r]
            print(('PASS' if ('data-vid-combo' in on and 'data-vid-combo' not in off) else 'FAIL'), 'card only when on:', r)
    br.close()
srv.shutdown()
