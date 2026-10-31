"""Desktop baseline / regression capture (Chromium via Playwright).

  python tools/desktop-baseline.py baseline    -> tools/baseline/*.png + baseline.json
  python tools/desktop-baseline.py after       -> tools/after/*.png + after.json, then diffs against baseline

Static states are captured with prefers-reduced-motion: reduce. The frame-time
measurement runs with animations ON at 1440x900.
Serve the site first:  python -m http.server 8123
"""
import json, os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
BASE = 'http://localhost:8123/index.html'
SIZES = [(768, 1024), (1024, 768), (1280, 800), (1440, 900), (1920, 1080)]
ROUTES = [('shop', '#shop'), ('product', '#p-rajma-masala'), ('byob', '#byob')]


def settle(pg, ms=1500):
    pg.wait_for_timeout(ms)


def shot(pg, path):
    pg.screenshot(path=path, full_page=True)


def capture(out):
    os.makedirs(out, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w, h in SIZES:
            ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce')
            # slow rotating timers (promo bar, hero auto-advance, galleries) make screenshots time-dependent: stop them
            ctx.add_init_script("(function(){var o=window.setInterval;window.setInterval=function(f,t){return (t>=3000)?0:o.apply(window,arguments)}})()")
            pg = ctx.new_page()
            tag = '%dx%d' % (w, h)
            pg.goto(BASE); settle(pg, 3500)
            shot(pg, '%s/%s_home-top.png' % (out, tag))
            pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); settle(pg, 1200)
            shot(pg, '%s/%s_home-end.png' % (out, tag))
            for name, hsh in ROUTES:
                pg.evaluate("h => { location.hash = h }", hsh); settle(pg, 4500)
                pg.evaluate('window.scrollTo(0,0)'); settle(pg, 500)
                shot(pg, '%s/%s_%s.png' % (out, tag, name))
            pg.evaluate("location.hash = '#home'"); settle(pg, 2000)
            pg.evaluate('window.scrollTo(0,0)'); settle(pg, 500)
            pg.click('#cartOpenBtn'); settle(pg, 1200)
            shot(pg, '%s/%s_cart-drawer.png' % (out, tag))
            pg.click('#closeDrawerBtn'); settle(pg, 800)
            pg.click('#authOpenBtn'); settle(pg, 1200)
            shot(pg, '%s/%s_auth-modal.png' % (out, tag))
            ctx.close()
        b.close()


JS_PERF = """
async () => {
  const st = ScrollTrigger.getAll().filter(t => t.pin)[0];
  if (!st) return null;
  const start = st.start, end = st.end;
  window.scrollTo(0, Math.max(0, start - 500));
  await new Promise(r => setTimeout(r, 800));
  const step = 14, t = [];
  let y = window.scrollY, last = performance.now();
  await new Promise(res => {
    function f(now) { t.push(now - last); last = now; y += step; window.scrollTo(0, y); if (y < end + 200) requestAnimationFrame(f); else res(); }
    requestAnimationFrame(f);
  });
  t.shift();
  const avg = t.reduce((a, b) => a + b, 0) / t.length;
  return { frames: t.length, avg: +avg.toFixed(2), over20: +(100 * t.filter(x => x > 20).length / t.length).toFixed(1), max: +Math.max(...t).toFixed(1) };
}
"""


def measure():
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1440, 'height': 900})
        pg.goto(BASE); pg.wait_for_timeout(4200)
        for _ in range(6):   # land on a dish that has a scene
            if pg.evaluate("document.querySelectorAll('.v-scene:not(.v-scene--static)').length"): break
            pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(1800)
        pg.wait_for_timeout(1200)
        res['scrollTriggers'] = pg.evaluate('ScrollTrigger.getAll().length')
        runs = [pg.evaluate(JS_PERF) for _ in range(3)]
        res['runs'] = runs
        res['avgFrameMs'] = round(sum(r['avg'] for r in runs) / len(runs), 2) if all(runs) else None
        b.close()
    return res


def diff(a_dir, b_dir):
    from PIL import Image, ImageChops
    out = {}
    for f in sorted(os.listdir(a_dir)):
        if not f.endswith('.png'): continue
        pb = os.path.join(b_dir, f)
        if not os.path.exists(pb): out[f] = 'missing'; continue
        a = Image.open(os.path.join(a_dir, f)).convert('RGB'); c = Image.open(pb).convert('RGB')
        if a.size != c.size: out[f] = 'size %s vs %s' % (a.size, c.size); continue
        d = ImageChops.difference(a, c).convert('L').point(lambda v: 255 if v > 8 else 0)
        n = sum(1 for v in d.getdata() if v)
        out[f] = round(100.0 * n / (a.width * a.height), 4)
    return out


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'baseline'
    out = os.path.join(ROOT, 'baseline' if mode == 'baseline' else 'after')
    capture(out)
    m = measure()
    json.dump(m, open(out + '.json', 'w'), indent=1)
    print(mode, 'measure:', json.dumps(m))
    if mode != 'baseline':
        d = diff(os.path.join(ROOT, 'baseline'), out)
        json.dump(d, open(out + '-diff.json', 'w'), indent=1)
        bad = {k: v for k, v in d.items() if v != 'missing' and (not isinstance(v, float) or v > 0.05)}
        print('screenshots:', len(d), 'over 0.05%:', json.dumps(bad))
