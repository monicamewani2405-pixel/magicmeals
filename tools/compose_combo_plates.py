import io
import math
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import numpy as np

ROOT = Path(__file__).resolve().parent.parent

# Base wooden table background
BG_PATH = Path(r"C:\Users\Monica\.gemini\antigravity\brain\42853d2c-5f2a-43ac-a48b-ac8c6874bad1\combo_north_indian_sample.jpg")

def get_base_table():
    if BG_PATH.exists():
        bg = Image.open(BG_PATH).convert('RGBA').resize((1200, 1500), Image.LANCZOS)
        # Soften and darken slightly so dishes pop
        arr = np.array(bg, dtype=np.float32)
        arr[..., :3] *= 0.68
        return Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(16))
    else:
        # Fallback dark wood gradient
        im = Image.new('RGBA', (1200, 1500), (35, 22, 14, 255))
        return im

def extract_dish_bowl(dish_slug, target_size, aspect_ratio=0.92):
    """Extracts the centered food bowl from pdp/<dish>/plates/serving.png with feathered edge."""
    plate_path = ROOT / 'pdp' / dish_slug / 'plates' / 'serving.png'
    if not plate_path.exists():
        if dish_slug.startswith('jain-'):
            plate_path = ROOT / 'pdp' / dish_slug[5:] / 'plates' / 'serving.png'
    
    im = Image.open(plate_path).convert('RGBA')
    W, H = im.size
    
    # Crop central area containing the bowl (usually 200..1800 x, 600..2100 y)
    cx, cy = W // 2, int(H * 0.52)
    rx, ry = int(W * 0.40), int(H * 0.32)
    crop = im.crop((cx - rx, cy - ry, cx + rx, cy + ry))
    
    cw, ch = crop.size
    feather = int(min(cw, ch) * 0.08)
    mask = Image.new('L', (cw, ch), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((feather, feather, cw - feather, ch - feather), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather // 2))
    crop.putalpha(mask)
    
    tw, th = target_size
    return crop.resize((tw, int(th * aspect_ratio)), Image.LANCZOS)

def add_shadow(canvas, cx, cy, w, h, blur=35, opacity=160):
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(sh)
    draw.ellipse((cx - w//2, cy - h//2, cx + w//2, cy + h//2), fill=(10, 6, 2, opacity))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(canvas, sh)

def compose_2dish(dish1, dish2):
    canvas = get_base_table()
    
    # Dish 2: Side / Dessert / Second dish (Upper Right/Center)
    bowl2 = extract_dish_bowl(dish2, (620, 580))
    # Dish 1: Main / Primary dish (Foreground Center-Bottom)
    bowl1 = extract_dish_bowl(dish1, (820, 760))
    
    # 1. Shadow & paste for dish 2
    canvas = add_shadow(canvas, 600, 480, 620, 320, blur=40, opacity=170)
    canvas.paste(bowl2, (600 - bowl2.width // 2, 480 - bowl2.height // 2), bowl2)
    
    # 2. Shadow & paste for dish 1 (foreground)
    canvas = add_shadow(canvas, 600, 1060, 840, 440, blur=50, opacity=200)
    canvas.paste(bowl1, (600 - bowl1.width // 2, 1060 - bowl1.height // 2), bowl1)
    
    # Enhance final image
    rgb = canvas.convert('RGB')
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2, percent=35, threshold=3))
    return rgb

def compose_3dish(dish1, dish2, dish3):
    canvas = get_base_table()
    
    # dish1: Main Curry (Top Left)
    bowl1 = extract_dish_bowl(dish1, (620, 570))
    # dish3: Dessert / Side (Top Right)
    bowl3 = extract_dish_bowl(dish3, (540, 500))
    # dish2: Rice / Bread (Foreground Center)
    bowl2 = extract_dish_bowl(dish2, (820, 760))
    
    # 1. Shadow & paste for dish 1 at (370, 530)
    canvas = add_shadow(canvas, 370, 560, 600, 340, blur=45, opacity=170)
    canvas.paste(bowl1, (370 - bowl1.width // 2, 530 - bowl1.height // 2), bowl1)
    
    # 2. Shadow & paste for dish 3 at (870, 530)
    canvas = add_shadow(canvas, 870, 560, 520, 300, blur=40, opacity=170)
    canvas.paste(bowl3, (870 - bowl3.width // 2, 530 - bowl3.height // 2), bowl3)
    
    # 3. Shadow & paste for dish 2 at (600, 1060)
    canvas = add_shadow(canvas, 600, 1110, 840, 440, blur=50, opacity=200)
    canvas.paste(bowl2, (600 - bowl2.width // 2, 1060 - bowl2.height // 2), bowl2)
    
    # Enhance final image
    rgb = canvas.convert('RGB')
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2, percent=35, threshold=3))
    return rgb

def save_webp(im, path, limit):
    path.parent.mkdir(parents=True, exist_ok=True)
    for q in (82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42, 38, 34):
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=q, method=6)
        if buf.tell() <= limit:
            break
    path.write_bytes(buf.getvalue())
    return buf.tell(), q

def build_combo_serving(cid, dishes):
    if len(dishes) == 2:
        im = compose_2dish(dishes[0], dishes[1])
    else:
        im = compose_3dish(dishes[0], dishes[1], dishes[2])
    
    im_1200 = im.resize((1200, 1500), Image.LANCZOS)
    im_800 = im.resize((800, 1000), Image.LANCZOS)
    
    gal_dir = ROOT / 'pdp' / 'combos' / cid / 'gallery'
    s1200, q1200 = save_webp(im_1200, gal_dir / 'hero-1200.webp', 180 * 1024)
    s800, q800 = save_webp(im_800, gal_dir / 'hero-800.webp', 90 * 1024)
    save_webp(im_1200, gal_dir / 'serving-1200.webp', 180 * 1024)
    save_webp(im_800, gal_dir / 'serving-800.webp', 90 * 1024)
    print(f"[{cid}] Composed serving: 1200w={s1200//1024}KB (q={q1200}), 800w={s800//1024}KB (q={q800})")

