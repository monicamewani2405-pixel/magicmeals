"""Headless check of the combo cooking-video card (pilot). Run from the project root: python tools/combo-video-check.py [combo-slug]
Writes screenshots to audit/combo-video-pilot/ and prints PASS/FAIL lines. Uses its own static server on 127.0.0.1:8124 (no files are changed)."""
import functools, os, sys, threading, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
OUT = os.path.join('audit', 'combo-video-pilot'); os.makedirs(OUT, exist_ok=True)
PILOT = sys.argv[1] if len(sys.argv) > 1 else 'comfort-combo-rajma-masala-jeera-rice-gajar-halwa'
OTHER_COMBO = 'north-indian-combo-paneer-butter-masala-jeera-rice-rawa-sheera'
SINGLE = 'rajma-masala'
PORT = 8124; BASE = f'http://127.0.0.1:{PORT}/index.html'

class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()

results = []
def check(name, ok, extra=''):
    results.append(ok); print(('PASS ' if ok else 'FAIL ') + name + (' | ' + extra if extra else ''))

def is_video(u): return 'cdn.shopify.com/videos' in u   # the Shopify-hosted cooking videos (the old generic WhatsApp clip on the page is not counted)
with sync_playwright() as pw:
    br = pw.chromium.launch(channel='chrome', headless=True)
    for vp, (w, h, dpr, mob) in {'desktop': (1440, 900, 2, False), 'mobile': (390, 844, 3, True)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr, is_mobile=mob, has_touch=mob, reduced_motion='reduce')
        pg = ctx.new_page()
        vids, errs, imgs = [], [], []
        pg.on('request', lambda r: vids.append(r.url) if is_video(r.url) else None)
        pg.on('requestfinished', lambda r: imgs.append(r.url) if r.url.endswith('.webp') and 'posters' in r.url else None)
        pg.on('console', lambda m: errs.append(m.text[:140]) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:140]))
        print(f'=== {vp}')
        pg.goto(f'{BASE}#p-{PILOT}'); pg.wait_for_selector('[data-vid-combo]', timeout=15000); pg.wait_for_timeout(800)
        card = pg.locator('[data-vid-combo]')
        card.scroll_into_view_if_needed(); pg.wait_for_timeout(600)
        tabs = pg.locator('[role=tab][data-vid-tab]')
        check(f'{vp}: card is inside the Preparation Guide and only there', pg.locator('.pdp-hiw-section [data-vid-combo]').count() == 1 and pg.locator('[data-vid-combo]').count() == 1 and pg.locator('.pdp-hiw-video-card').count() == 0)
        check(f'{vp}: tabs shown', tabs.count() == 3, ' | '.join(tabs.all_inner_texts()))
        check(f'{vp}: tab height >= 44px', all((t.bounding_box() or {'height': 0})['height'] >= 44 for t in tabs.all()))
        check(f'{vp}: zero video requests before tap', len(vids) == 0, str(len(vids)))
        posters_first = [u for u in imgs if 'posters' in u]
        check(f'{vp}: only tab-1 poster loaded', len(posters_first) == 1, str([u.split('/')[-1] for u in posters_first]))
        card.screenshot(path=f'{OUT}/{vp}-1-initial.png')
        # tab 2 (click)
        tabs.nth(1).click(); pg.wait_for_timeout(500)
        check(f'{vp}: tab 2 selected, still no video request', tabs.nth(1).get_attribute('aria-selected') == 'true' and len(vids) == 0)
        card.screenshot(path=f'{OUT}/{vp}-2-tab2.png')
        # keyboard: ArrowRight -> tab 3, Home -> tab 1, End -> tab 3
        tabs.nth(1).focus(); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(200)
        k1 = tabs.nth(2).get_attribute('aria-selected') == 'true'
        pg.keyboard.press('Home'); pg.wait_for_timeout(200); k2 = tabs.nth(0).get_attribute('aria-selected') == 'true'
        pg.keyboard.press('End'); pg.wait_for_timeout(200); k3 = tabs.nth(2).get_attribute('aria-selected') == 'true'
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(200); k4 = tabs.nth(0).get_attribute('aria-selected') == 'true'
        check(f'{vp}: keyboard (arrows, Home, End, wrap)', k1 and k2 and k3 and k4, f'{k1} {k2} {k3} {k4}')
        check(f'{vp}: tabpanel labelled by the selected tab', pg.locator('[role=tabpanel]').get_attribute('aria-labelledby') == tabs.nth(0).get_attribute('id'))
        # play tab 1
        pg.locator('.vid-play').click(); pg.wait_for_timeout(4000)
        n_after_tap = len(set(vids))
        check(f'{vp}: exactly one video file after the tap', n_after_tap == 1, str([u.split('/')[-1][:60] for u in set(vids)]))
        check(f'{vp}: a <video> exists', pg.locator('.vid-stage video').count() == 1)
        card.screenshot(path=f'{OUT}/{vp}-3-playing.png')
        # switch to tab 2 while playing: player removed, no new request
        before = len(vids)
        tabs.nth(1).click(); pg.wait_for_timeout(1500)
        check(f'{vp}: switching tab removes the player', pg.locator('.vid-stage video').count() == 0)
        check(f'{vp}: no new video request after the switch', len(vids) == before, f'{before} -> {len(vids)}')
        # play tab 2, jump to the end -> "Watch next"
        pg.locator('.vid-play').click(); pg.wait_for_timeout(3000)
        check(f'{vp}: second video requested only after its tap', len(set(vids)) == 2)
        pg.wait_for_function("(() => { const v = document.querySelector('.vid-stage video'); return v && isFinite(v.duration) && v.duration > 0; })()", timeout=25000)
        pg.evaluate("(() => { const v = document.querySelector('.vid-stage video'); v.muted = true; v.currentTime = Math.max(0, v.duration - 0.8); v.play(); })()")
        try: pg.wait_for_selector('.vid-next', timeout=25000)
        except Exception: pass
        nxt = pg.locator('.vid-next')
        check(f'{vp}: "Watch next" appears', nxt.count() == 1, nxt.inner_text() if nxt.count() else '')
        card.screenshot(path=f'{OUT}/{vp}-4-watch-next.png')
        before = len(vids)
        if nxt.count(): nxt.click(); pg.wait_for_timeout(800)
        check(f'{vp}: "Watch next" selects tab 3, no autoplay', tabs.nth(2).get_attribute('aria-selected') == 'true' and pg.locator('.vid-stage video').count() == 0 and len(vids) == before)
        # last video: no extra button
        pg.locator('.vid-play').click(); pg.wait_for_timeout(2500)
        pg.wait_for_function("(() => { const v = document.querySelector('.vid-stage video'); return v && isFinite(v.duration) && v.duration > 0; })()", timeout=25000)
        pg.evaluate("(() => { const v = document.querySelector('.vid-stage video'); v.muted = true; v.currentTime = Math.max(0, v.duration - 0.8); v.play(); })()")
        pg.wait_for_timeout(4000)
        check(f'{vp}: nothing extra after the last video', pg.locator('.vid-next').count() == 0)
        check(f'{vp}: no horizontal overflow', pg.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'))
        check(f'{vp}: no console errors', not errs, ' ; '.join(errs[:3]))
        # unchanged pages
        pg.goto(f'{BASE}#p-{OTHER_COMBO}'); pg.wait_for_selector('.pdp-view', timeout=10000); pg.wait_for_timeout(600)
        check(f'{vp}: other combo has no card (pilot only)', pg.locator('[data-vid-combo]').count() == 0)
        pg.goto(f'{BASE}#p-{SINGLE}'); pg.wait_for_selector('.pdp-view', timeout=10000); pg.wait_for_timeout(800)
        check(f'{vp}: single product page has no combo card, still has its video card', pg.locator('[data-vid-combo]').count() == 0 and pg.locator('.mmv-play, video.mmv-video').count() >= 1)
        ctx.close()
    br.close()
srv.shutdown()
print('ALL PASS' if all(results) else f'{results.count(False)} FAILED of {len(results)}')
