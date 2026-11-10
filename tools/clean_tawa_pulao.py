import shutil
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
TAWA_PATH = ROOT / 'pdp' / 'tawa-pulao' / 'plates' / 'serving.png'
BACKUP_PATH = ROOT / 'pdp' / 'tawa-pulao' / 'plates' / 'serving-with-paneer.png'

def clean_tawa_pulao():
    if not BACKUP_PATH.exists():
        shutil.copy2(TAWA_PATH, BACKUP_PATH)
    
    im = Image.open(BACKUP_PATH).convert('RGBA')
    canvas = im.copy()
    
    def patch(canvas, dst_cx, dst_cy, src_cx, src_cy, rx, ry, feather=28, rot=0):
        src_box = (src_cx - rx, src_cy - ry, src_cx + rx, src_cy + ry)
        p = canvas.crop(src_box)
        if rot != 0:
            p = p.rotate(rot, resample=Image.BICUBIC)
        
        pw, ph = p.size
        mask = Image.new('L', (pw, ph), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((feather, feather, pw - feather, ph - feather), fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(feather // 2))
        p.putalpha(mask)
        
        canvas.paste(p, (dst_cx - rx, dst_cy - ry), p)

    # 1. paneer_top_mid at (1050, 1500)
    # Source from clean seasoned rice at (880, 1580)
    patch(canvas, 1050, 1500, 880, 1580, 125, 115, feather=32, rot=15)
    
    # 2. paneer_left at (660, 1680)
    # Source from clean rice at (820, 1680)
    patch(canvas, 660, 1680, 820, 1680, 115, 105, feather=28, rot=-10)
    
    # 3. paneer_bottom_mid at (860, 1750)
    # Source from clean rice at (720, 1580)
    patch(canvas, 860, 1750, 720, 1580, 115, 105, feather=28, rot=25)
    
    # 4. paneer_right at (1200, 1720)
    # Source from clean rice at (1020, 1650)
    patch(canvas, 1200, 1720, 1020, 1650, 120, 110, feather=30, rot=-15)
    
    # 5. onion_rings at (1280, 1480)
    # Source from clean rice at (1120, 1400)
    patch(canvas, 1280, 1480, 1120, 1400, 110, 100, feather=25, rot=20)
    
    # Second gentle pass on any residual edge
    patch(canvas, 1060, 1490, 920, 1540, 70, 70, feather=20)
    patch(canvas, 670, 1670, 780, 1620, 70, 70, feather=20)
    patch(canvas, 1270, 1470, 1150, 1440, 75, 75, feather=20)

    # Save cleaned plate
    clean_rgb = canvas.convert('RGB')
    clean_rgb.save(TAWA_PATH)
    print(f"Cleaned Tawa Pulao saved to {TAWA_PATH}!")
    
    # Save a verification preview
    preview = clean_rgb.crop((400, 1200, 1600, 2100))
    preview_path = ROOT / 'scratch' / 'tawa_pulao_cleaned_preview.jpg'
    preview_path.parent.mkdir(parents=True, exist_ok=True)
    preview.save(preview_path, quality=90)
    print(f"Preview saved to {preview_path}!")

if __name__ == '__main__':
    clean_tawa_pulao()

