"""
batch_process_all_pouches.py
Processes all product front and back pouch images:
1. Loads from mm-media (fronts) and BACKSIDE PNG (backs)
2. Auto-trims transparent margins
3. Places on identical canvas (1024×1600 portrait)
4. Saves as <product-id>-front-processed.png and <product-id>-back-processed.png
5. Also creates WebP versions for the live site
"""

import os
import sys
import numpy as np
from PIL import Image, ImageFilter

# ── SOURCE DIRECTORIES ──────────────────────────────────────────────────────
REGULAR_FRONTS = r"C:\Users\Monica\Downloads\mm-media (1)\mm-media\mock ups\MAGIC MEAL REGULAR MOCKUPS"
JAIN_FRONTS    = r"C:\Users\Monica\Downloads\mm-media (1)\mm-media\mock ups\MAGIC MEAL JAIN MOCKUPS"
REGULAR_BACKS  = r"C:\Users\Monica\Downloads\BACKSIDE PNG\BACKSIDE PNG\PNG"
JAIN_BACKS     = r"C:\Users\Monica\Downloads\BACKSIDE PNG\BACKSIDE PNG\JAIN\PNG"

# ── OUTPUT DIRECTORY ─────────────────────────────────────────────────────────
OUT_DIR = r"c:\Users\Monica\Desktop\magicmeals\pouch-art"

# ── CANVAS SETTINGS ──────────────────────────────────────────────────────────
CANVAS_W  = 1024
CANVAS_H  = 1600  # Portrait 4:6.25 ratio
PADDING   = 0.06  # 6% padding on all sides

# ── PRODUCT → FILE MAPPING ───────────────────────────────────────────────────
# Format: product_id -> (front_filename_in_dir, front_dir, back_filename_in_dir, back_dir)
# None means "use other dir".  Jain products use JAIN front folders.
PRODUCTS = [
    # id,                          front_file,                              front_dir,      back_file,                    back_dir
    ("rajma-masala",               "Rajma Masala.png",                      REGULAR_FRONTS, "RAJMA MASALA.png",           REGULAR_BACKS),
    ("paneer-butter-masala",       "Paneer Butter Masala.png",              REGULAR_FRONTS, "PANNER BUTTER MASALA.png",   REGULAR_BACKS),
    ("paneer-bhurji",              "Paneer Bhurji.png",                     REGULAR_FRONTS, "PANNER BHURJI.png",          REGULAR_BACKS),
    ("pind-ke-chhole",             "Pind Ke Chole.png",                     REGULAR_FRONTS, "PIND KE CHOLE.png",          REGULAR_BACKS),
    ("pav-bhaji",                  "Pav Bhaji.png",                         REGULAR_FRONTS, "PAV BHAJI.png",              REGULAR_BACKS),
    ("bhindi-masala",              "Bhindi Masala.png",                     REGULAR_FRONTS, "BHINDI MASALA.png",          REGULAR_BACKS),
    ("veg-kadhai",                 "Veg Kadhai.png",                        REGULAR_FRONTS, "VEG KADHAI.png",             REGULAR_BACKS),
    ("veg-makhanwala",             "Veg Makhanwala.png",                    REGULAR_FRONTS, "VEG MAKHANWALA.png",         REGULAR_BACKS),
    ("moong-masala",               "Moong masala.png",                      JAIN_FRONTS,    "moong masala.png",           JAIN_BACKS),
    ("dal-makhani",                "Dal Makhani.png",                       REGULAR_FRONTS, "DAL MAKHANI.png",            REGULAR_BACKS),
    ("dal-tadka",                  "Dal Tadka.png",                         REGULAR_FRONTS, "DAL TADKA.png",              REGULAR_BACKS),
    ("dal-fry",                    "Dal Fry.png",                           JAIN_FRONTS,    "DAL FRY.png",                JAIN_BACKS),
    ("gujarati-dal",               "Gujarati Dal.png",                      REGULAR_FRONTS, "GUJRATI DAL.png",            REGULAR_BACKS),
    ("dal-khichdi",                "Dal Khichdi.png",                       REGULAR_FRONTS, "DAL KHICHDI.png",            REGULAR_BACKS),
    ("masala-khichdi-kadhi",       "Masala Khichdi Kadhi.png",              REGULAR_FRONTS, "MASALA KHICHDI KADHI.png",   REGULAR_BACKS),
    ("veg-biryani",                "Veg Biryani.png",                       REGULAR_FRONTS, "VEG BIRYANI.png",            REGULAR_BACKS),
    ("jeera-rice",                 "Jeera Rice.png",                        REGULAR_FRONTS, "JEERA RICE.png",             REGULAR_BACKS),
    ("tawa-pulao",                 "Tawa Pulao.png",                        REGULAR_FRONTS, "TAWA PULAO.png",             REGULAR_BACKS),
    ("fried-rice",                 "Fried Rice.png",                        REGULAR_FRONTS, "FRIED RICE.png",             REGULAR_BACKS),
    ("schezwan-rice",              "Schezwan Rice.png",                     REGULAR_FRONTS, "SCHEZWAN RICE.png",          REGULAR_BACKS),
    ("mexican-rice",               "Mexican Rice.png",                      REGULAR_FRONTS, "MEXICAN RICE.png",           REGULAR_BACKS),
    ("fried-rice-manchurian",      "Fried Rice with Manchurian Gravy.png",  REGULAR_FRONTS, "FRIED RICE WITH MANCHURIAN GRAVY.png", REGULAR_BACKS),
    ("kanda-poha",                 "Kanda Poha.png",                        REGULAR_FRONTS, "KANDA POHA.png",             REGULAR_BACKS),
    ("idli-sambar",                "IDLI SAMBAR.2.png",                     REGULAR_FRONTS, "IDLI SAMBAR.png",            REGULAR_BACKS),
    ("upma",                       "Upma.png",                              REGULAR_FRONTS, "UPMA.png",                   REGULAR_BACKS),
    ("mumbai-misal",               "Mumbai Misal.png",                      REGULAR_FRONTS, "MUMBAI MISAL.png",           REGULAR_BACKS),
    ("tomato-soup",                "Tomato Soup.png",                       REGULAR_FRONTS, "TOMATO SOUP.png",            REGULAR_BACKS),
    ("sweet-corn-soup",            "Sweet Corn Soup.png",                   REGULAR_FRONTS, "sweet corn soup.png",        REGULAR_BACKS),
    ("hot-and-sour-soup",          "Hot & Sour Soup.png",                   REGULAR_FRONTS, "hot and sour soup.png",      REGULAR_BACKS),
    ("gajar-halwa",                "Gajar Halwa.png",                       REGULAR_FRONTS, "GAJAR HALWA.png",            REGULAR_BACKS),
    ("aam-ras",                    "Aam Ras.png",                           REGULAR_FRONTS, "AAMRAS.png",                 REGULAR_BACKS),
    ("rawa-sheera",                "Rawa Sheera.png",                       REGULAR_FRONTS, "RAWA SHEERA.png",            REGULAR_BACKS),
]

def get_pouch_bbox(im, alpha_thresh=10):
    """Find bounding box of non-transparent pouch content."""
    arr = np.array(im.convert('RGBA'))
    a = arr[:, :, 3]
    valid = a >= alpha_thresh
    rows = np.any(valid, axis=1)
    cols = np.any(valid, axis=0)
    if not rows.any():
        return (0, 0, im.width, im.height)
    r0, r1 = np.where(rows)[0][[0, -1]]
    c0, c1 = np.where(cols)[0][[0, -1]]
    return (int(c0), int(r0), int(c1 + 1), int(r1 + 1))

def place_on_canvas(im, canvas_w=CANVAS_W, canvas_h=CANVAS_H, padding=PADDING):
    """
    Auto-trim pouch, then place it centred on a fixed canvas with padding.
    Same call for front and back so they are pixel-aligned.
    """
    im = im.convert('RGBA')
    bbox = get_pouch_bbox(im)
    cropped = im.crop(bbox)
    
    # Available area inside padding
    avail_w = int(canvas_w * (1.0 - 2 * padding))
    avail_h = int(canvas_h * (1.0 - 2 * padding))
    
    # Scale to fit inside the available area keeping aspect ratio
    cw, ch = cropped.size
    scale = min(avail_w / cw, avail_h / ch)
    new_w = int(cw * scale)
    new_h = int(ch * scale)
    
    scaled = cropped.resize((new_w, new_h), Image.LANCZOS)
    
    # Centre on canvas
    canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    paste_x = (canvas_w - new_w) // 2
    paste_y = (canvas_h - new_h) // 2
    canvas.paste(scaled, (paste_x, paste_y), scaled)
    
    return canvas

def process_product(pid, front_file, front_dir, back_file, back_dir, out_dir):
    """Process one product: create front and back processed PNGs + WebP."""
    front_path = os.path.join(front_dir, front_file)
    back_path  = os.path.join(back_dir, back_file)
    
    flags = []
    
    # ── FRONT ────────────────────────────────────────────────────────────────
    if not os.path.exists(front_path):
        flags.append(f"MISSING front: {front_path}")
        print(f"  [SKIP] Front missing for {pid}")
        return flags
    
    print(f"  Loading front: {front_file}")
    im_front = Image.open(front_path)
    canvas_front = place_on_canvas(im_front)
    
    # ── BACK ─────────────────────────────────────────────────────────────────
    if os.path.exists(back_path):
        print(f"  Loading back:  {back_file}")
        im_back = Image.open(back_path)
        canvas_back = place_on_canvas(im_back)
    else:
        flags.append(f"MISSING back: {back_path}")
        print(f"  [WARN] Back missing for {pid}, using neutral fallback")
        canvas_back = Image.open(os.path.join(OUT_DIR, "missing-back-neutral.png")).convert('RGBA').resize(
            (CANVAS_W, CANVAS_H), Image.LANCZOS)
    
    # ── SAVE ─────────────────────────────────────────────────────────────────
    out_f_png  = os.path.join(out_dir, f"{pid}-front-processed.png")
    out_b_png  = os.path.join(out_dir, f"{pid}-back-processed.png")
    out_f_webp = os.path.join(out_dir, f"{pid}-front.webp")
    out_b_webp = os.path.join(out_dir, f"{pid}-back.webp")
    
    canvas_front.save(out_f_png,  "PNG",  optimize=True)
    canvas_back.save(out_b_png,   "PNG",  optimize=True)
    canvas_front.save(out_f_webp, "WEBP", quality=88, method=6)
    canvas_back.save(out_b_webp,  "WEBP", quality=88, method=6)
    
    print(f"  Saved: {out_f_png} ({os.path.getsize(out_f_png)//1024}KB)")
    print(f"  Saved: {out_b_png} ({os.path.getsize(out_b_png)//1024}KB)")
    print(f"  Saved: {out_f_webp} ({os.path.getsize(out_f_webp)//1024}KB)")
    print(f"  Saved: {out_b_webp} ({os.path.getsize(out_b_webp)//1024}KB)")
    
    return flags

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    all_flags = {}
    
    for entry in PRODUCTS:
        pid, front_file, front_dir, back_file, back_dir = entry
        print(f"\n=== Processing: {pid} ===")
        flags = process_product(pid, front_file, front_dir, back_file, back_dir, OUT_DIR)
        if flags:
            all_flags[pid] = flags
    
    print("\n\n" + "="*60)
    print("BATCH COMPLETE")
    print("="*60)
    
    if all_flags:
        print("\n⚠ FLAGGED ITEMS (require review):")
        for pid, fs in all_flags.items():
            for f in fs:
                print(f"  {pid}: {f}")
    else:
        print("\n✓ All products processed successfully with no missing files.")
    
    print(f"\nOutput directory: {OUT_DIR}")
    print(f"Files written: {len(PRODUCTS) * 4} (2 PNG + 2 WebP per product)")

if __name__ == "__main__":
    main()
