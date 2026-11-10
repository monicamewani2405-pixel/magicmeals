import io
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

def save_webp(im, path, limit):
    path.parent.mkdir(parents=True, exist_ok=True)
    for q in (82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42, 38, 34):
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=q, method=6)
        if buf.tell() <= limit:
            break
    path.write_bytes(buf.getvalue())
    return buf.tell(), q

def process_combo_image(src_path, combo_ids):
    im = Image.open(src_path).convert('RGB')
    w, h = im.size
    want = 4 / 5
    if abs(w / h - want) > 0.005:
        if w / h > want:
            nw = round(h * want); x0 = (w - nw) // 2; im = im.crop((x0, 0, x0 + nw, h))
        else:
            nh = round(w / want); y0 = (h - nh) // 2; im = im.crop((0, y0, w, y0 + nh))
    
    im_1200 = im.resize((1200, 1500), Image.LANCZOS)
    im_800 = im.resize((800, 1000), Image.LANCZOS)
    
    results = []
    for cid in combo_ids:
        gal_dir = ROOT / 'pdp' / 'combos' / cid / 'gallery'
        # Save hero webps (current card displayed on PDP with 'Serving suggestion' badge)
        s1200, q1200 = save_webp(im_1200, gal_dir / 'hero-1200.webp', 180 * 1024)
        s800, q800 = save_webp(im_800, gal_dir / 'hero-800.webp', 90 * 1024)
        # Also save serving webps for future-proofing
        save_webp(im_1200, gal_dir / 'serving-1200.webp', 180 * 1024)
        save_webp(im_800, gal_dir / 'serving-800.webp', 90 * 1024)
        results.append((cid, s1200, s800))
        print(f"[{cid}] Updated serving/hero WebP: 1200w={s1200//1024}KB (q={q1200}), 800w={s800//1024}KB (q={q800})")
    return results

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 2:
        src = sys.argv[1]
        cids = sys.argv[2].split(',')
        process_combo_image(src, cids)
