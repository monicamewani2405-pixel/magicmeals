"""Mobile checks for the home hero, the pinned scene and the header (headless Chromium, touch + mobile UA + DPR 3).

Serve the site first:   python -m http.server 8123
Usage (project root):
    python tools/mobile-check.py layout     first-screen fit, horizontal scroll, landscape, tablet, hero image weight, LCP/CLS
    python tools/mobile-check.py badge      cart badge vs icon at counts 0, 1, 9, 10, 99, 100 (360 and 390 wide)
    python tools/mobile-check.py perf       scripted smooth scroll through the pin, CPU throttle 1x/4x/6x: frame times
    python tools/mobile-check.py sheet      contact sheet -> tools/mobile-sheet.png
    python tools/mobile-check.py all        layout + badge + perf
"""
import json, os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
URL = 'http://localhost:8123/index.html'
UA = ('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/120.0.0.0 Mobile Safari/537.36')
PORTRAIT = [(360, 640), (375, 667), (390, 844), (412, 915), (430, 932)]
ALL = PORTRAIT + [(844, 390), (768, 1024)]


def ctx_for(p, w, h, throttle=1):
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=3, is_mobile=True, has_touch=True, user_agent=UA)
    pg = ctx.new_page()
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    if throttle > 1:
        cdp = ctx.new_cdp_session(pg)
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': throttle})
    return b, pg, errs


def load_home(pg, wait=4500):
    pg.goto(URL); pg.wait_for_timeout(wait)


def goto_dish(pg, name=None, scene=None):
    for _ in range(7):
        n = pg.evaluate("document.querySelector('.v-switcher-name')?.textContent || ''")
        has = pg.evaluate("document.querySelectorAll('.v-scene:not(.v-scene--static)').length") > 0
        if (name and name.lower() in n.lower()) or (scene is True and has) or (scene is False and not has):
            return n
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(1800)
    return pg.evaluate("document.querySelector('.v-switcher-name')?.textContent || ''")


JS_FIRST = """() => {
  const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return {t: b.top, b: b.bottom, l: b.left, r: b.right} };
  const act = document.querySelector('.v-switcher-pouch.is-active img');
  const ab = act && act.getBoundingClientRect();
  const desc = document.querySelector('.v-switcher-desc');
  const lines = desc ? Math.round(desc.getBoundingClientRect().height / parseFloat(getComputedStyle(desc).lineHeight)) : 0;
  return {
    vw: innerWidth, vh: innerHeight, header: r('#siteHeader'), wa: r('.whatsapp-float-btn'),
    head: r('.v-switcher-headline'), pouch: ab && {t: ab.top, b: ab.bottom, l: ab.left, r: ab.right},
    name: r('.v-switcher-name'), desc: r('.v-switcher-desc'), descLines: lines, add: r('.v-switcher-add'), shop: r('.v-switcher-shop'),
    dots: r('.v-switcher-dots'), dotSize: (() => { const d = document.querySelector('.v-switcher-dot'); return d ? [d.offsetWidth, d.offsetHeight] : null })(),
    btnFont: parseFloat(getComputedStyle(document.querySelector('.v-switcher-btn')).fontSize),
    descFont: desc ? parseFloat(getComputedStyle(desc).fontSize) : 0,
    arrows: [...document.querySelectorAll('.v-switcher-arrow')].map(a => getComputedStyle(a).display),
    hs: document.documentElement.scrollWidth > innerWidth,
    sw: document.querySelectorAll('.v-scene:not(.v-scene--static)').length, st: document.querySelectorAll('.v-hiw-card, .v-scene--static .v-scene-card').length
  };
}"""


def first_screen_issues(r):
    bad = []
    hb = r['header']['b'] if r['header'] else 0
    wa = r['wa']
    for k in ('head', 'pouch', 'name', 'desc', 'add', 'shop', 'dots'):
        e = r[k]
        if not e: bad.append(k + ' missing'); continue
        if e['t'] < hb - 1: bad.append(k + ' under header')
        if e['b'] > r['vh'] + 0.5: bad.append(k + ' below the fold')
        if e['l'] < -0.5 or e['r'] > r['vw'] + 0.5: bad.append(k + ' off screen sideways')
        if wa and not (e['r'] <= wa['l'] or e['l'] >= wa['r'] or e['b'] <= wa['t'] or e['t'] >= wa['b']): bad.append(k + ' under WhatsApp')
    if r['add'] and r['add']['b'] > r['vh'] - 72: bad.append('buttons not 72px clear of the bottom')
    if r['descLines'] > 2: bad.append('description %d lines' % r['descLines'])
    if r['btnFont'] < 16: bad.append('button font %s' % r['btnFont'])
    if r['descFont'] < 13.5: bad.append('desc font %s' % r['descFont'])
    if any(a != 'none' for a in r['arrows']): bad.append('arrows visible on touch')
    if r['dotSize'] and (r['dotSize'][0] < 44 or r['dotSize'][1] < 44): bad.append('dot tap area %s' % r['dotSize'])
    if r['hs']: bad.append('horizontal scroll')
    return bad


def layout():
    out = {}
    with sync_playwright() as p:
        for w, h in ALL:
            b, pg, errs = ctx_for(p, w, h)
            load_home(pg)
            tag = '%dx%d' % (w, h)
            res = {}
            if (w, h) in PORTRAIT:
                bad = []
                for nm in ('', 'Paneer Butter Masala'):
                    if nm: goto_dish(pg, nm); pg.wait_for_timeout(900)
                    r = pg.evaluate(JS_FIRST)
                    iss = first_screen_issues(r)
                    res[nm or 'first dish'] = iss or 'ok'
            else:
                r = pg.evaluate(JS_FIRST)
                res['scene mounted (should be 0 in landscape)'] = r['sw']
                res['static cards'] = r['st']
                res['hscroll'] = r['hs']
            for name, hsh in (('shop', '#shop'), ('product', '#p-paneer-butter-masala'), ('byob', '#byob'), ('home', '#home')):
                pg.evaluate("h => { location.hash = h }", hsh); pg.wait_for_timeout(2200)
                res['hscroll ' + name] = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
            res['errors'] = errs[:3]
            out[tag] = res
            b.close()
    # hero image weight and LCP / CLS on a phone
    with sync_playwright() as p:
        b, pg, errs = ctx_for(p, 390, 844)
        sizes = {}
        def on_resp(r):
            try:
                if r.request.resource_type == 'image': sizes[r.url.split('/')[-1][:40]] = len(r.body())
            except Exception: pass
        pg.on('response', on_resp)
        pg.add_init_script("""window.__cls = 0; window.__lcp = 0; window.__tasks = [];
          new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({type: 'layout-shift', buffered: true});
          new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime }).observe({type: 'largest-contentful-paint', buffered: true});
          new PerformanceObserver(l => { for (const e of l.getEntries()) window.__tasks.push(e.duration) }).observe({type: 'longtask', buffered: true});""")
        load_home(pg, 6000)
        m = pg.evaluate("({cls: +window.__cls.toFixed(4), lcp: Math.round(window.__lcp), tbtApprox: Math.round(window.__tasks.reduce((a, d) => a + Math.max(0, d - 50), 0))})")
        hero = {k: v for k, v in sizes.items() if 'front-' in k}
        out['hero images 390 (bytes)'] = {'files': hero, 'total KB': round(sum(hero.values()) / 1024, 1), 'all images KB': round(sum(sizes.values()) / 1024, 1)}
        out['LCP/CLS/TBT (390, no throttle, PerformanceObserver)'] = m
        b.close()
    print(json.dumps(out, indent=1))
    return out


def badge():
    res = {}
    with sync_playwright() as p:
        for w, h in ((360, 640), (390, 844)):
            b, pg, errs = ctx_for(p, w, h)
            load_home(pg, 3500)
            rows = []
            for n in (0, 1, 9, 10, 99, 100):
                pg.evaluate("n => { window.getCartTotalCount = () => n; renderCartDrawer(); }", n)
                pg.wait_for_timeout(200)
                r = pg.evaluate("""() => {
                  const bd = document.querySelector('#cartBadgeCount').getBoundingClientRect();
                  const btn = document.querySelector('#cartOpenBtn'); const bb = btn.getBoundingClientRect();
                  const ic = btn.querySelector('svg').getBoundingClientRect();
                  const t = document.querySelector('#cartBadgeCount');
                  return {text: t.textContent, bd: [bd.left, bd.top, bd.right, bd.bottom], ic: [ic.left, ic.top, ic.right, ic.bottom],
                          btn: [bb.width, bb.height], icon: [ic.width, ic.height], clipped: t.scrollWidth > t.clientWidth + 0.5, vw: innerWidth}
                }""")
                ic = r['ic']; cw, ch = (ic[2] - ic[0]) * 0.6, (ic[3] - ic[1]) * 0.6
                cx0, cy0 = (ic[0] + ic[2]) / 2 - cw / 2, (ic[1] + ic[3]) / 2 - ch / 2
                core = [cx0, cy0, cx0 + cw, cy0 + ch]
                bd = r['bd']
                overlap = not (bd[2] <= core[0] or bd[0] >= core[2] or bd[3] <= core[1] or bd[1] >= core[3])
                ok = (not overlap) and (not r['clipped']) and bd[2] <= r['vw'] and r['btn'][0] >= 44 and r['btn'][1] >= 44 and abs(r['icon'][0] - 24) < 0.6
                rows.append({'count': n, 'text': r['text'], 'covers icon centre': overlap, 'clipped': r['clipped'], 'tap': r['btn'], 'icon': r['icon'], 'pass': ok})
            res['%dpx' % w] = rows
            res['%dpx errors' % w] = errs[:3]
            b.close()
    print(json.dumps(res, indent=1))
    return res


JS_PERF = """
async () => {
  const st = ScrollTrigger.getAll().filter(t => t.pin)[0];
  if (!st) return null;
  const start = st.start, end = st.end;
  window.scrollTo(0, Math.max(0, start - 500));
  await new Promise(r => setTimeout(r, 1200));
  const step = 14, t = [];
  let y = window.scrollY, last = performance.now();
  await new Promise(res => {
    function f(now) { t.push(now - last); last = now; y += step; window.scrollTo(0, y); if (y < end + 200) requestAnimationFrame(f); else res(); }
    requestAnimationFrame(f);
  });
  t.shift();
  const pct = n => +(100 * t.filter(x => x > n).length / t.length).toFixed(1);
  return { frames: t.length, avg: +(t.reduce((a, b) => a + b, 0) / t.length).toFixed(2), over20: pct(20), over33: pct(33), over100: pct(100), max: +Math.max(...t).toFixed(1) };
}
"""


def perf(sizes=((360, 640), (390, 844), (412, 915)), rates=(1, 4, 6)):
    res = {}
    with sync_playwright() as p:
        for w, h in sizes:
            for rate in rates:
                b, pg, errs = ctx_for(p, w, h, rate)
                load_home(pg, 4500 + 1500 * rate)
                goto_dish(pg, scene=True); pg.wait_for_timeout(2500)
                res['%dx%d @%dx' % (w, h, rate)] = pg.evaluate(JS_PERF)
                b.close()
    print(json.dumps(res, indent=1))
    return res


def sheet():
    from PIL import Image, ImageDraw
    cells = []
    with sync_playwright() as p:
        for w, h in ((360, 640), (390, 844), (430, 932)):
            b, pg, errs = ctx_for(p, w, h)
            load_home(pg, 5000)
            hero = pg.screenshot()
            goto_dish(pg, scene=True); pg.wait_for_timeout(2500)
            info = pg.evaluate("() => { const s = ScrollTrigger.getAll().filter(t => t.pin)[0]; return {start: s.start, end: s.end} }")
            row = [hero]
            for pr in (0, 0.25, 0.55, 0.7, 0.8, 1.0):
                y = info['start'] + (info['end'] - info['start']) * pr
                pg.evaluate('y => window.scrollTo(0, y)', y); pg.wait_for_timeout(1700)
                row.append(pg.screenshot())
            cells.append(row)
            b.close()
        b, pg, errs = ctx_for(p, 390, 844)
        load_home(pg, 3500)
        heads = []
        for n in (0, 9, 150):
            pg.evaluate("n => { window.getCartTotalCount = () => n; renderCartDrawer(); }", n); pg.wait_for_timeout(200)
            heads.append(pg.screenshot(clip={'x': 0, 'y': 0, 'width': 390, 'height': 130}))
        b.close()
    import io
    H = 460
    rows = []
    for row in cells:
        ims = [Image.open(io.BytesIO(x)).convert('RGB') for x in row]
        ims = [i.resize((int(i.width * H / i.height), H)) for i in ims]
        rows.append(ims)
    W = max(sum(i.width for i in r) for r in rows)
    hs = [Image.open(io.BytesIO(x)).convert('RGB') for x in heads]
    sheet_img = Image.new('RGB', (W, H * len(rows) + 140), 'white')
    y = 0
    for r in rows:
        x = 0
        for i in r: sheet_img.paste(i, (x, y)); x += i.width
        y += H
    x = 0
    for i in hs:
        i = i.resize((int(i.width * 130 / i.height * 1), 130)); sheet_img.paste(i, (x, y + 4)); x += i.width + 8
    out = os.path.join(ROOT, 'mobile-sheet.png')
    sheet_img.save(out)
    print('saved', out, sheet_img.size)


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if mode in ('layout', 'all'): layout()
    if mode in ('badge', 'all'): badge()
    if mode in ('perf', 'all'): perf()
    if mode == 'sheet': sheet()
