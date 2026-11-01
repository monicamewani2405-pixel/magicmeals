"""
fit-backs.py: PROTOTYPE geometric fit of a new back mockup to its front pouch silhouette (geometry only, the print is never edited).

  python tools/fit-backs.py <slug>      e.g. rajma-masala   (later: "all")

a. crop the new back (incoming-backs/**/<NAME> 2.png) to its alpha bounding box
b. scale it NON-uniformly to exactly the front's pouch bounding box (stretch beyond MAX_STRETCH on either axis = FAIL)
c. paste on a 1024x1600 transparent canvas, multiply its alpha by the front's alpha (mirrored horizontally, because the 3D viewer maps
   the back with u -> 1-u, so the back outline has to be the front outline mirrored; no-op when the pouch is symmetric), feather 1px
d. pixels the mask exposes that the back does not have (flat top, tapered corners) are filled with the back's nearest edge colour, then
   blurred (only those pixels, never the print area)
e. writes pouch-art/preview/<slug>-back-fitted.png and .webp only
"""
import os, re, sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ART = os.path.join(ROOT, 'pouch-art'); OUT = os.path.join(ART, 'preview')
CW, CH = 1024, 1600
MAX_STRETCH = 0.09

def bbox(a, thr=15):
    ys, xs = np.where(a >= thr); return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

def find_new(slug):
    key = slug.replace('-', '')
    alias = {'pindkechhole': 'pindikechole', 'aamras': 'aamras', 'friedricemanchurian': 'friedricewithmanchuriangravy'}
    key = alias.get(key, key)
    for f in glob.glob(os.path.join(ROOT, 'incoming-backs', '**', '*.png'), recursive=True):
        n = os.path.basename(f)
        if n.startswith('._'): continue
        s = os.path.splitext(n)[0].lower().replace('&', 'and')
        s = re.sub(r'\s+2$', '', s); s = re.sub(r'[\s_\-]+', '', s).replace('and', 'and')
        if s == key or s.replace('hotsour', 'hotandsour') == key: return f
    raise SystemExit(f'no new back found for {slug}')

def fit(slug):
    front = np.array(Image.open(os.path.join(ART, f'{slug}-front.webp')).convert('RGBA'))   # the texture the 3D viewer uses
    fa = front[:, :, 3].astype(float) / 255
    fx0, fy0, fx1, fy1 = bbox(front[:, :, 3]); fw, fh = fx1 - fx0, fy1 - fy0
    src = find_new(slug); new = Image.open(src).convert('RGBA')
    nb = bbox(np.array(new)[:, :, 3]); new = new.crop(nb)
    sx, sy = fw / new.width, fh / new.height; base = min(sx, sy)
    stretch_x, stretch_y = sx / base - 1, sy / base - 1
    print(f'{slug}: new {os.path.basename(src)} crop {new.width}x{new.height} -> front box {fw}x{fh} at ({fx0},{fy0})')
    print(f'  scale x {sx:.4f} y {sy:.4f}; stretch vs uniform: x {stretch_x*100:+.1f}%  y {stretch_y*100:+.1f}%  ->', 'FAIL' if max(stretch_x, stretch_y) > MAX_STRETCH else 'ok')
    if max(stretch_x, stretch_y) > MAX_STRETCH: raise SystemExit('stretch too large: needs a re-export')
    sym = ((fa > .5) & (fa[:, ::-1] > .5)).sum() / max(1, ((fa > .5) | (fa[:, ::-1] > .5)).sum())
    print(f'  front mask left/right symmetry IoU {sym:.4f} (mirrored for the back mapping)')

    # place (premultiplied-safe Lanczos via Pillow RGBA resize)
    rs = np.array(new.resize((fw, fh), Image.LANCZOS))
    canvas = np.zeros((CH, CW, 4), np.uint8); canvas[fy0:fy1, fx0:fx1] = rs
    rgb = canvas[:, :, :3].astype(float); ba = canvas[:, :, 3].astype(float) / 255

    # mask: front outline mirrored, feathered 1px
    mask = ndimage.gaussian_filter(fa[:, ::-1], 1.0) if True else fa
    mask = np.clip(mask, 0, 1)

    # valid print pixels = opaque back pixels, eroded 1px to drop the anti-aliased rim
    valid = ndimage.binary_erosion(ba >= 0.98, iterations=1)
    exposed = (mask > 0.001) & ~valid
    idx = ndimage.distance_transform_edt(~valid, return_distances=False, return_indices=True)
    padded = rgb[idx[0], idx[1]]                                   # nearest edge colour everywhere
    blurred = np.stack([ndimage.gaussian_filter(padded[:, :, c], 10) for c in range(3)], -1)
    # blur only exposed pixels (soft 2px blend so the join is invisible); the print area keeps its exact pixels
    w = ndimage.gaussian_filter(exposed.astype(float), 1.5)[:, :, None]; w = np.where(exposed[:, :, None], np.maximum(w, 1.0), w * exposed[:, :, None])
    out_rgb = np.where(valid[:, :, None], rgb, blurred * w + padded * (1 - w))
    print(f'  exposed (filled) pixels: {int(exposed.sum())} = {exposed.sum() / max(1, (mask > .001).sum()) * 100:.2f}% of the outline')
    out = np.dstack([np.clip(out_rgb, 0, 255), mask * 255]).round().astype(np.uint8)
    os.makedirs(OUT, exist_ok=True)
    img = Image.fromarray(out, 'RGBA')
    img.save(os.path.join(OUT, f'{slug}-back-fitted.png'), 'PNG', optimize=True)
    img.save(os.path.join(OUT, f'{slug}-back-fitted.webp'), 'WEBP', quality=88, method=6)
    print('  wrote pouch-art/preview/%s-back-fitted.{png,webp}' % slug)
    return img

if __name__ == '__main__':
    a = sys.argv[1] if len(sys.argv) > 1 else 'rajma-masala'
    if a == 'all': raise SystemExit('"all" not enabled in the prototype')
    fit(a)
