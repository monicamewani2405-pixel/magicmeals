import io
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import numpy as np

ROOT = Path(__file__).resolve().parent.parent

# The 15 combos that were generated as true unified AI photography and are already perfect:
AI_GENERATED = {
    'north-indian-combo-paneer-butter-masala-jeera-rice-rawa-sheera',
    'jain-north-indian-combo-paneer-butter-masala-jeera-rice-rawa-sheera',
    'south-indian-breakfast-combo',
    'maharashtrian-nashta-combo',
    'fiesta-bowl-combo',
    'dinner-dessert-combo',
    'indo-chinese-feast-combo',
    'north-indian-combo-paneer-butter-masala-tawa-pulao-rawa-sheera',
    'north-indian-combo-paneer-butter-masala-veg-biryani-rawa-sheera',
    'street-style-combo-pav-bhaji-rawa-sheera',
    'jain-street-style-combo-pav-bhaji-rawa-sheera',
    'street-style-combo-pav-bhaji-tawa-pulao',
    'classic-dinner-combo-tomato-soup-dal-makhani-jeera-rice',
    'comfort-combo-rajma-masala-jeera-rice-gajar-halwa',
    'comfort-combo-rajma-masala-tawa-pulao-gajar-halwa',
}

def load_dish_image(slug):
    p = ROOT / 'pdp' / slug / 'plates' / 'serving.png'
    if not p.exists() and slug.startswith('jain-'):
        p = ROOT / 'pdp' / slug[5:] / 'plates' / 'serving.png'
    if not p.exists():
        raise FileNotFoundError(f"Missing plate for {slug}: {p}")
    return Image.open(p).convert('RGB')

def crop_center(im, target_w, target_h, y_bias=0.52):
    w, h = im.size
    scale = max(target_w / w, target_h / h)
    nw, nh = int(round(w * scale)), int(round(h * scale))
    scaled = im.resize((nw, nh), Image.LANCZOS)
    x0 = (nw - target_w) // 2
    # Bias y slightly towards center/bowl
    y0 = int(round((nh - target_h) * y_bias))
    y0 = max(0, min(y0, nh - target_h))
    return scaled.crop((x0, y0, x0 + target_w, y0 + target_h))

def enhance_food(im):
    # Gentle vibrance and clarity boost
    enh = ImageEnhance.Color(im)
    im = enh.enhance(1.06)
    enh = ImageEnhance.Contrast(im)
    im = enh.enhance(1.04)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.8, percent=35, threshold=2))
    return im

def compose_editorial_2dish(dish1, dish2):
    im1 = load_dish_image(dish1)
    im2 = load_dish_image(dish2)
    
    # 1200 x 1500 canvas with luxury dark charcoal border (8px gap)
    canvas = Image.new('RGB', (1200, 1500), (20, 16, 14))
    gap = 8
    h_panel = (1500 - gap) // 2 # 746
    
    p1 = crop_center(im1, 1200, h_panel, y_bias=0.52)
    p2 = crop_center(im2, 1200, h_panel, y_bias=0.52)
    
    canvas.paste(p1, (0, 0))
    canvas.paste(p2, (0, h_panel + gap))
    
    return enhance_food(canvas)

def compose_editorial_3dish(dish1, dish2, dish3):
    im_curry = load_dish_image(dish1)
    im_rice = load_dish_image(dish2)
    im_dessert = load_dish_image(dish3)
    
    canvas = Image.new('RGB', (1200, 1500), (20, 16, 14))
    gap = 8
    w_top = (1200 - gap) // 2 # 596
    h_top = 680
    h_bot = 1500 - h_top - gap # 812
    
    # Top-Left: Main Curry / Dal
    p_curry = crop_center(im_curry, w_top, h_top, y_bias=0.52)
    # Top-Right: Dessert / Side
    p_dessert = crop_center(im_dessert, w_top, h_top, y_bias=0.52)
    # Bottom Wide: Fluffy Rice / Main Plate
    p_rice = crop_center(im_rice, 1200, h_bot, y_bias=0.52)
    
    canvas.paste(p_curry, (0, 0))
    canvas.paste(p_dessert, (w_top + gap, 0))
    canvas.paste(p_rice, (0, h_top + gap))
    
    return enhance_food(canvas)

def save_webp(im, path, limit):
    path.parent.mkdir(parents=True, exist_ok=True)
    for q in (82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42):
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=q, method=4)
        if buf.tell() <= limit:
            break
    path.write_bytes(buf.getvalue())
    return buf.tell(), q

def build_clean_combo(cid, dishes):
    if len(dishes) == 2:
        im = compose_editorial_2dish(dishes[0], dishes[1])
    else:
        im = compose_editorial_3dish(dishes[0], dishes[1], dishes[2])
    
    im_1200 = im.resize((1200, 1500), Image.LANCZOS)
    im_800 = im.resize((800, 1000), Image.LANCZOS)
    
    gal_dir = ROOT / 'pdp' / 'combos' / cid / 'gallery'
    s1200, q1200 = save_webp(im_1200, gal_dir / 'hero-1200.webp', 180 * 1024)
    s800, q800 = save_webp(im_800, gal_dir / 'hero-800.webp', 90 * 1024)
    save_webp(im_1200, gal_dir / 'serving-1200.webp', 180 * 1024)
    save_webp(im_800, gal_dir / 'serving-800.webp', 90 * 1024)
    print(f"[{cid}] Built clean editorial serving: 1200w={s1200//1024}KB (q={q1200}), 800w={s800//1024}KB (q={q800})")

if __name__ == '__main__':
    import sys
    sys.path.insert(0, str(ROOT))
    from tools.inspect_combo_plates import combo_dishes
    
    cutouts = [c for c in combo_dishes if c not in AI_GENERATED]
    print(f"Fixing all {len(cutouts)} cutout combos with clean editorial photography...")
    for cid in cutouts:
        build_clean_combo(cid, combo_dishes[cid])
    print("ALL COMBOS FIXED!")
