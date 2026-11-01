"""Checks pouch-art/tex/: four files per product exist, answer HTTP 200 from the local server (python -m http.server 8123),
have the expected pixel size and stay within the KB budget; optional contact sheet (front + fitted back per product).
   python tools/verify-textures.py [sheet]"""
import os, sys, urllib.request
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))
import importlib.util
spec = importlib.util.spec_from_file_location('fb', os.path.join(ROOT, 'tools', 'fit-backs.py')); fb = importlib.util.module_from_spec(spec); spec.loader.exec_module(fb)
SZ = {'1280': (1280, 2000, 300), '800': (800, 1250, 150)}
bad = 0; m, _, _ = fb.mapping()
print(f'{"slug":24s}{"folder":10s}  front1280 back1280 front800 back800 (KB)  status')
for s in fb.SLUGS:
    kb = {}; status = 'ok'
    for size, (w, h, budget) in SZ.items():
        for kind in ('front', 'back'):
            rel = f'pouch-art/tex/{s}-{kind}-{size}.webp'; p = os.path.join(ROOT, rel)
            if not os.path.exists(p): status = f'MISSING {rel}'; continue
            try: code = urllib.request.urlopen('http://localhost:8123/' + rel).status
            except Exception as e: code = str(e)
            im = Image.open(p); k = os.path.getsize(p) / 1024; kb[f'{kind}{size}'] = k
            if code != 200: status = f'HTTP {code}'
            if im.size != (w, h): status = f'size {im.size}'
            if k > budget: status = f'over budget {k:.0f}KB'
    bad += status != 'ok'
    print(f'{s:24s}{(m[s][1] if s in m else "unchanged"):10s}  ' + ' '.join(f'{kb.get(n, 0):8.0f}' for n in ('front1280', 'back1280', 'front800', 'back800')) + f'   {status}')
print('FAILED:', bad)
if len(sys.argv) > 1 and sys.argv[1] == 'sheet':
    tw, th = 110, 172; cols = 4; rows = (len(fb.SLUGS) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * 2 * tw, rows * th), (200, 200, 200))
    for i, s in enumerate(fb.SLUGS):
        x, y = (i % cols) * 2 * tw, (i // cols) * th
        for j, kind in enumerate(('front', 'back')):
            im = Image.open(os.path.join(ROOT, f'pouch-art/tex/{s}-{kind}-800.webp')).convert('RGBA'); im.thumbnail((tw, th))
            bg = Image.new('RGBA', im.size, (200, 200, 200, 255)); bg.alpha_composite(im); sheet.paste(bg.convert('RGB'), (x + j * tw, y))
    out = os.path.join(ROOT, 'tools', 'textures-sheet.png'); sheet.save(out); print('sheet', out, sheet.size)
