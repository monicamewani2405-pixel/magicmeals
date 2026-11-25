"""Stage 2 check: every combo page, 1440x900 and 390x844. Run from the project root: python tools/combo-video-all.py
Own static server on 127.0.0.1:8125. Prints one line per combo/viewport and a summary. Writes audit/combo-videos-results.csv. Changes no project file except that CSV."""
import csv, functools, os, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
PORT = 8125; BASE = f'http://127.0.0.1:{PORT}/index.html'
class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()

rows = list(csv.DictReader(open('audit/combo-videos-table.csv', encoding='utf-8')))
is_video = lambda u: 'cdn.shopify.com/videos' in u
out, fails = [], 0
with sync_playwright() as pw:
    br = pw.chromium.launch(channel='chrome', headless=True)
    for vp, (w, h, dpr, mob) in {'desktop': (1440, 900, 1, False), 'mobile': (390, 844, 2, True)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr, is_mobile=mob, has_touch=mob, reduced_motion='reduce')
        for r in rows:
            cid = r['combo']; exp = int(r['n_with_video'])
            pg = ctx.new_page(); vids, errs = [], []
            pg.on('request', lambda q: vids.append(q.url) if is_video(q.url) else None)
            pg.on('console', lambda m: errs.append(m.text[:100]) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:100]))
            why = []
            try:
                pg.goto(f'{BASE}#p-{cid}'); pg.wait_for_selector('.pdp-hiw-section', timeout=15000); pg.wait_for_timeout(900)
                card = pg.locator('[data-vid-combo]'); tabs = pg.locator('[role=tab][data-vid-tab]')
                n_card, n_tabs = card.count(), tabs.count()
                want_card = 1 if exp >= 1 else 0
                want_tabs = exp if exp >= 2 else 0
                if n_card != want_card: why.append(f'card {n_card}!={want_card}')
                if n_tabs != want_tabs: why.append(f'tabs {n_tabs}!={want_tabs}')
                if n_card and pg.locator('.pdp-hiw-section [data-vid-combo]').count() != 1: why.append('card not in prep guide')
                if n_card and pg.locator('.pdp-hiw-video-card').count(): why.append('generic clip also shown')
                if len(vids): why.append(f'{len(vids)} video req before tap')
                if pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1'): why.append('horizontal overflow')
                if n_card:
                    card.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
                    if n_tabs >= 2:
                        pg.locator('[role=tab][data-vid-tab]').nth(1).click(); pg.wait_for_timeout(300)
                        if len(vids): why.append('video req on tab switch')
                        pg.locator('[role=tab][data-vid-tab]').nth(0).click(); pg.wait_for_timeout(200)
                    pg.locator('.vid-play').first.click(); pg.wait_for_timeout(1800)
                    if len(set(vids)) != 1: why.append(f'{len(set(vids))} files after tap')
                if errs: why.append('console: ' + errs[0])
            except Exception as ex:
                why.append('EXC ' + str(ex)[:80])
            ok = not why; fails += (not ok)
            out.append([vp, cid, exp, n_tabs if 'n_tabs' in dir() else '', 'PASS' if ok else 'FAIL', '; '.join(why)])
            print(f"{'PASS' if ok else 'FAIL'} {vp:7s} {cid[:62]:62s} video={exp} tabs={n_tabs} {'; '.join(why)}", flush=True)
            pg.close()
        ctx.close()
    br.close()
with open('audit/combo-videos-results.csv', 'w', newline='', encoding='utf-8') as f:
    csv.writer(f).writerows([['viewport', 'combo', 'components_with_video', 'tabs_shown', 'result', 'notes']] + out)
print(f'DONE: {len(out) - fails}/{len(out)} PASS, {fails} FAIL')
