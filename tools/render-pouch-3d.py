"""Render a product's pouch from the site's own 3D viewer on a transparent background (standing, slightly turned), for the lively gallery.

    python tools/render-pouch-3d.py <slug> [<slug> ...]      (needs the site served on http://localhost:8765 and Playwright)

Writes pdp/<slug>/plates/pouch3d-hero.png. The viewer is not changed: the page is opened in a very large headless window so the canvas has
enough pixels (the pouch comes out about 720 x 1130 px), the page background is made transparent, and the soft floor shadow under the pack
is cut away. The printed artwork is exactly the texture the viewer shows.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
URL = 'http://localhost:8765/index.html#p-'


def cut(png, out):
    im = Image.open(png).convert('RGBA')
    a = np.asarray(im).copy()
    lab, n = ndi.label(a[..., 3] >= 240)
    body = lab == (int(np.argmax(ndi.sum(a[..., 3] >= 240, lab, range(1, n + 1)))) + 1)
    keep = ndi.binary_dilation(body, iterations=3)
    a[..., 3] = np.where(keep, a[..., 3], 0)
    res = Image.fromarray(a)
    res = res.crop(res.getbbox())
    res.save(out)
    return res.size


def main():
    slugs = sys.argv[1:]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for slug in slugs:
            ctx = b.new_context(viewport={'width': 3600, 'height': 2400}, device_scale_factor=2)
            pg = ctx.new_page()
            pg.goto(URL + slug)
            pg.wait_for_timeout(9000)
            pg.add_style_tag(content='html,body,*{background:transparent!important} [class*=chip],[class*=ctrl],[class*=hint],[class*=loading]{display:none!important}')
            pg.evaluate('window.pouchViewer && window.pouchViewer.setAzimuth(8, 0)')
            pg.wait_for_timeout(900)
            tmp = ROOT / 'pdp' / slug / 'plates' / '_pouch3d-raw.png'
            pg.query_selector('canvas').screenshot(path=str(tmp), omit_background=True)
            size = cut(tmp, ROOT / 'pdp' / slug / 'plates' / 'pouch3d-hero.png')
            tmp.unlink()
            print(slug, 'pouch cut-out', size)
            ctx.close()
        b.close()


if __name__ == '__main__':
    main()
