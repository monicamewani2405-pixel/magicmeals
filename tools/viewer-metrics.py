"""Viewer sharpness / size diagnostics (headless Chromium). Serve the site first: python -m http.server 8123
   python tools/viewer-metrics.py diag            Step 1 table (canvas, textures, renderer settings)
   python tools/viewer-metrics.py shots <tag>     front/back screenshots of Rajma + Laplacian variance of a fixed central crop -> tools/blur-baseline/
"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(ROOT, 'blur-baseline')
BASE = 'http://localhost:8123/index.html'
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
SIZES = [(1440, 900, 2), (390, 844, 3)]
INFO_JS = """() => {
  const r = pdp3dRenderer, c = r.domElement, g = pdp3dPouchGroup, out = {};
  out.canvas = {attrW: c.width, attrH: c.height, cssW: c.getBoundingClientRect().width, cssH: c.getBoundingClientRect().height, pixelRatio: r.getPixelRatio(), dpr: devicePixelRatio, outputEncoding: r.outputEncoding};
  out.maxAniso = r.capabilities.getMaxAnisotropy(); out.maxTex = r.capabilities.maxTextureSize;
  out.mats = g.children.map(m => { const t = m.material.map, im = t.image; return {src: String(im && im.currentSrc || im && im.src || '').slice(0, 60), w: im.width, h: im.height,
     anisotropy: t.anisotropy, minFilter: t.minFilter, magFilter: t.magFilter, mipmaps: t.generateMipmaps, encoding: t.encoding, premultiplyAlpha: t.premultiplyAlpha, flipY: t.flipY,
     transparent: m.material.transparent, alphaTest: m.material.alphaTest}; });
  // on-screen pouch box in CSS px: project the 8 corners of the group's box
  const THREE_ = window.THREE; const box = new THREE_.Box3().setFromObject(g); const cam = pdp3dCamera; cam.updateMatrixWorld();
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const v = new THREE_.Vector3(x, y, z).project(cam); const px = (v.x + 1) / 2 * c.getBoundingClientRect().width, py = (1 - v.y) / 2 * c.getBoundingClientRect().height;
    x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
  out.pouchCss = {w: x1 - x0, h: y1 - y0};
  return out; }"""

def open_viewer(p, w, h, dpr, slug='rajma-masala', query=''):
    b = p.chromium.launch(args=ARGS)
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    pg = ctx.new_page(); log = {'err': [], 'bad': [], 'bytes': 0, 'files': []}
    pg.on('console', lambda m: log['err'].append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: log['err'].append(str(e)))
    pg.on('response', lambda r: log['bad'].append((r.status, r.url)) if r.status >= 400 else None)
    pg.goto(f'{BASE}{query}#p-{slug}', wait_until='load')
    pg.wait_for_selector('#pdp3dCanvasContainer canvas', timeout=90000)
    pg.wait_for_function("() => { const l = document.getElementById('pdp3dLoading'); return !l || l.style.display === 'none'; }", timeout=90000)
    pg.wait_for_timeout(1500); pg.evaluate("window._pdpUserInteracted = true")
    return b, pg, log

def lap_var(path, frac=(0.30, 0.35, 0.70, 0.65)):
    im = Image.open(path).convert('L'); W, H = im.size
    c = np.asarray(im.crop((int(W*frac[0]), int(H*frac[1]), int(W*frac[2]), int(H*frac[3]))), float)
    return float(ndimage.laplace(c).var())

def shots(tag, slug='rajma-masala', query='', sizes=((1440, 900, 2),)):
    os.makedirs(OUT, exist_ok=True); res = {}
    with sync_playwright() as p:
        for w, h, dpr in sizes:
            b, pg, log = open_viewer(p, w, h, dpr, slug, query)
            for view in ('front', 'back'):
                pg.evaluate(f"window.snapPdp3d('{view}')"); pg.wait_for_timeout(2500)
                el = pg.query_selector('#pdp3dCanvasContainer'); el.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
                f = os.path.join(OUT, f'{slug}_{w}_{view}_{tag}.png'); el.screenshot(path=f); res[f'{slug}_{w}_{view}'] = round(lap_var(f), 1)
            b.close()
    print(json.dumps(res, indent=1)); return res

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'diag'
    if cmd == 'shots': shots(sys.argv[2] if len(sys.argv) > 2 else 'before')
    else:
        with sync_playwright() as p:
            for w, h, dpr in SIZES:
                b, pg, log = open_viewer(p, w, h, dpr)
                print(f'--- {w}x{h} DPR {dpr}'); print(json.dumps(pg.evaluate(INFO_JS), indent=1)); print('console errors:', log['err'][:3], 'bad:', log['bad'][:3]); b.close()

def verify(tag='after', slugs=('moong-masala', 'fried-rice-manchurian', 'gajar-halwa'), sizes=SIZES):
    """Step 5.3: product page + viewer front/back/side, sharpness, bytes for opening the viewer, console/404 status."""
    os.makedirs(OUT, exist_ok=True); rows = []
    with sync_playwright() as p:
        for slug in slugs:
            for w, h, dpr in sizes:
                b = p.chromium.launch(args=ARGS)
                ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr); pg = ctx.new_page()
                got = {'err': [], 'bad': [], 'viewer': 0, 'total': 0, 'tex': []}
                def on_resp(r):
                    try: n = len(r.body())
                    except Exception: n = 0
                    got['total'] += n
                    if r.status >= 400: got['bad'].append((r.status, r.url))
                    if '/vendor/three' in r.url or 'OrbitControls' in r.url or '/pouch-art/tex/' in r.url:
                        got['viewer'] += n
                        if '/tex/' in r.url: got['tex'].append(r.url.rsplit('/', 1)[1])
                pg.on('response', on_resp)
                pg.on('console', lambda m: got['err'].append(m.text) if m.type == 'error' else None)
                pg.on('pageerror', lambda e: got['err'].append(str(e)))
                pg.goto(f'{BASE}#p-{slug}', wait_until='load')
                pg.wait_for_selector('#pdp3dCanvasContainer canvas', timeout=90000)
                pg.wait_for_function("() => { const l = document.getElementById('pdp3dLoading'); return !l || l.style.display === 'none'; }", timeout=90000)
                pg.wait_for_timeout(1500); pg.evaluate("window._pdpUserInteracted = true")
                info = pg.evaluate(INFO_JS); m0 = info['mats'][0]
                el = pg.query_selector('#pdp3dCanvasContainer'); el.scroll_into_view_if_needed()
                lv = {}
                for view in ('front', 'back'):
                    pg.evaluate(f"window.snapPdp3d('{view}')"); pg.wait_for_timeout(2500)
                    f = os.path.join(OUT, f'{slug}_{w}_{view}_{tag}.png'); el.screenshot(path=f); lv[view] = round(lap_var(f), 1)
                bb = el.bounding_box(); cx, cy = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
                pg.mouse.move(cx, cy); pg.mouse.down(); pg.mouse.move(cx + bb['width'] * .18, cy, steps=8); pg.mouse.up(); pg.wait_for_timeout(1200)
                el.screenshot(path=os.path.join(OUT, f'{slug}_{w}_side_{tag}.png'))
                rows.append(dict(slug=slug, w=w, tex=f"{m0['w']}x{m0['h']}", lap=lv, viewerKB=round(got['viewer'] / 1024), pageKB=round(got['total'] / 1024),
                                 files=sorted(set(got['tex'])), canvas=(info['canvas']['attrW'], info['canvas']['cssW']), mip=(m0['mipmaps'], m0['minFilter']), err=got['err'][:2], bad=got['bad'][:2]))
                print(json.dumps(rows[-1])); b.close()
    return rows
