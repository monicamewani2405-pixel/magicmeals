import os
import urllib.request
import json
import base64
import shutil
import subprocess
import time
from pathlib import Path
from PIL import Image

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-3.1-flash-image"
ROOT = Path(__file__).resolve().parent.parent

def generate_image(prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
    full_prompt = f"{prompt}\n\nTechnical framing requirement: Vertical portrait orientation, 4:5 aspect ratio, professional editorial culinary photography, photorealistic, natural lighting and textures."
    payload = {"contents": [{"parts": [{"text": full_prompt}]}]}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        parts = data['candidates'][0]['content']['parts']
        for p in parts:
            if 'inlineData' in p:
                return base64.b64decode(p['inlineData']['data'])
        raise RuntimeError("No image returned")

def save_plate(raw_bytes, dst_path):
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    temp = dst_path.with_suffix('.temp.jpg')
    temp.write_bytes(raw_bytes)
    im = Image.open(temp).convert('RGB')
    w, h = im.size
    want = 4 / 5
    if abs(w / h - want) > 0.005:
        if w / h > want:
            nw = round(h * want); x0 = (w - nw) // 2; im = im.crop((x0, 0, x0 + nw, h))
        else:
            nh = round(w / want); y0 = (h - nh) // 2; im = im.crop((0, y0, w, y0 + nh))
    im = im.resize((2000, 2500), Image.LANCZOS)
    im.save(dst_path)
    if temp.exists(): temp.unlink()
    print(f"Saved: {dst_path.name} ({dst_path.stat().st_size} bytes)")

def compose(slug):
    res = subprocess.run(['python', 'tools/compose-lively.py', slug], cwd=ROOT, capture_output=True, text=True)
    print(f"Composed {slug}: returncode={res.returncode}")
    if res.returncode != 0:
        print("  Error output:", res.stderr)

# Tasks to execute: list of (slug, plate_name, prompt)
TASKS = [
    # 1. Veg Makhanwala - ALL PICTURES
    (
        'veg-makhanwala', 'serving',
        """A mouthwatering commercial culinary photograph of Shahi Veg Makhanwala served in a traditional artisanal ceramic handi.
Tender garden-fresh vegetables: crisp cauliflower florets, bright sweet corn kernels, tender green peas, and french beans slow-cooked in a silky smooth, velvety orange-red tomato-cashew makhani gravy.
Garnished with crushed fragrant kasuri methi (fenugreek leaves), a melting swirl of fresh golden butter, and fresh green coriander.
CRITICAL RULES: STRICTLY NO PANEER, NO COTTAGE CHEESE, NO TOFU. STRICT JAIN COMPLIANCE: NO RAW ONIONS, NO GARLIC, NO ROOT VEGETABLES (NO CARROTS, NO POTATOES).
Warm rustic wooden table, antique brass spoon, gentle rising steam, soft directional window lighting."""
    ),
    (
        'veg-makhanwala', 'hero',
        """A commercial culinary food photograph on a warm dark wooden dining table.
On the LEFT side and center-left, a steaming ceramic handi of rich Veg Makhanwala (colorful cauliflower, sweet corn, green peas, and french beans in a velvety makhani sauce, absolutely NO paneer) with warm folded roti on a linen napkin.
The entire LOWER-RIGHT side of the rustic table MUST be completely clean, flat, and empty with soft directional window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: STRICTLY NO PANEER, NO COTTAGE CHEESE, NO ONIONS, NO GARLIC."""
    ),
    (
        'veg-makhanwala', 'abroad',
        """A high-end lifestyle travel editorial photograph on a cozy wooden window-side dining table in a charming European apartment overlooking classic architecture in soft afternoon bokeh.
On the RIGHT side of the table, a steaming artisanal bowl of delicious Veg Makhanwala (garden vegetables in velvety tomato-cashew makhani sauce, absolutely NO paneer) with a brass spoon and napkin.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: STRICTLY NO PANEER, NO ONIONS, NO GARLIC."""
    ),

    # 2. Pav Bhaji - HERO & ABROAD
    (
        'pav-bhaji', 'hero',
        """A mouthwatering commercial culinary food photograph of authentic Mumbai Pav Bhaji on a rustic dark wooden dining table.
On the LEFT side and center-left, a shallow artisanal ceramic plate with a generous portion of rich, spiced, mashed mixed vegetable bhaji topped with a melting golden pat of Amul butter and fresh green coriander, served right beside two soft, golden butter-toasted pav buns (bread rolls) and a fresh yellow lemon wedge.
The entire LOWER-RIGHT side of the rustic table MUST be completely clean, flat, and empty with soft warm directional lighting, leaving clear open space for product pouch compositing.
STRICT RULE: NO RAW ONION RINGS, NO ONION SLICES ON THE TABLE, NO GARLIC CLOVES."""
    ),
    (
        'pav-bhaji', 'abroad',
        """A high-end lifestyle travel editorial photograph of authentic Mumbai Pav Bhaji on an outdoor sunlit wooden terrace table overlooking a picturesque European harbor and blue sea at golden hour.
On the RIGHT side of the table, a delicious plate of spiced mashed vegetable bhaji with melting golden butter and two golden butter-toasted pav buns (bread rolls) and a lemon wedge.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with warm natural daylight, leaving open space for product pouch compositing.
STRICT RULE: NO ONIONS, NO GARLIC."""
    ),

    # 3. Paneer Bhurji - HERO & ABROAD
    (
        'paneer-bhurji', 'hero',
        """A commercial culinary food photograph of authentic Amritsari Paneer Bhurji on a rustic dark wooden dining table.
On the LEFT side and center-left, an artisanal handcrafted ceramic dish filled with vibrant, spiced scrambled fresh cottage cheese (crumbled paneer bhurji) sautéed with finely diced ripe red tomatoes, crisp green bell peppers (capsicum), green chilies, and fresh green coriander with a glistening touch of desi ghee, served with warm folded roti on a linen cloth.
The entire LOWER-RIGHT side of the rustic table MUST be completely clean, flat, and empty with warm directional window lighting, leaving open space for product pouch compositing.
CRITICAL RULE: NO PANEER CUBES (MUST BE CRUMBLED SCRAMBLED BHURJI), NO RAW ONION RINGS, NO GARLIC CLOVES."""
    ),
    (
        'paneer-bhurji', 'abroad',
        """A high-end lifestyle travel editorial photograph on a cozy wooden window-side dining table in an alpine chalet overlooking snowy mountain pines in soft morning sunlight.
On the RIGHT side of the table, a ceramic plate of warm, spiced scrambled paneer bhurji (crumbled cottage cheese with diced tomatoes and bell peppers) with a warm cup of tea.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural morning light, leaving open space for product pouch compositing.
CRITICAL RULE: NO PANEER CUBES, NO ONIONS, NO GARLIC."""
    ),

    # 4. Veg Kadhai - ALL PICTURES (serving + hero + abroad)
    (
        'veg-kadhai', 'serving',
        """A commercial food photograph of vibrant North Indian Veg Kadhai in a traditional Indian kadhai dish.
Crisp green and red bell peppers (capsicum), baby corn, tender green peas, and cauliflower florets tossed in a robust, aromatic kadhai gravy with freshly pounded whole coriander seeds, dried red chilies, and roasted spices, garnished with fresh cilantro and ginger juliennes.
CRITICAL RULES: STRICTLY NO PANEER, NO COTTAGE CHEESE, NO TOFU. STRICT JAIN COMPLIANCE: NO ONIONS, NO GARLIC, NO ROOT VEGETABLES (NO POTATOES, NO CARROTS).
Dark wooden dining table, warm restaurant lighting, rising steam."""
    ),
    (
        'veg-kadhai', 'hero',
        """A commercial culinary food photograph on a dark wooden dining table.
On the LEFT side and center-left, a traditional rustic Indian kadhai filled with steaming Veg Kadhai (colorful crisp bell peppers, baby corn, green peas, and cauliflower in spicy kadhai masala, absolutely NO paneer) with warm roti.
The entire LOWER-RIGHT side of the table MUST be completely clean, flat, and empty with soft warm restaurant lighting, leaving open space for product pouch compositing.
CRITICAL RULES: STRICTLY NO PANEER, NO ONIONS, NO GARLIC."""
    ),
    (
        'veg-kadhai', 'abroad',
        """A lifestyle travel photography on a sunlit terrace dining table overlooking picturesque European architecture and sunny skies.
On the RIGHT side of the table, a traditional kadhai dish of spiced Veg Kadhai (bell peppers, baby corn, green peas, absolutely NO paneer) with a spoon and napkin.
The LOWER-LEFT area of the table MUST be completely clean, flat, and empty with natural sunlight, leaving open space for product pouch compositing.
CRITICAL RULES: STRICTLY NO PANEER, NO ONIONS, NO GARLIC."""
    ),

    # 5. Bhindi Masala - HERO & ABROAD
    (
        'bhindi-masala', 'hero',
        """A commercial culinary food photograph on a rustic dark wooden dining table.
On the LEFT side and center-left, an artisanal ceramic bowl of delicious homestyle Bhindi Masala (crisp-tender, vibrant green sliced okra sautéed with diced tomatoes, roasted cumin, amchur dry mango, and fragrant ground spices) with warm folded roti on a linen cloth.
The entire LOWER-RIGHT side of the rustic table MUST be completely clean, flat, and empty with soft warm directional window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: OKRA ONLY, NO PANEER, NO COTTAGE CHEESE, NO ONIONS, NO GARLIC."""
    ),
    (
        'bhindi-masala', 'abroad',
        """A high-end lifestyle travel editorial photograph on a cozy wooden window-side dining table in a charming European apartment overlooking classic street architecture.
On the RIGHT side of the table, an artisanal bowl of homestyle Bhindi Masala (crisp sautéed green okra with spices) with a brass spoon.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: OKRA ONLY, NO PANEER, NO ONIONS, NO GARLIC."""
    ),

    # 6. Pind Ke Chhole - HERO & ABROAD
    (
        'pind-ke-chhole', 'hero',
        """A commercial culinary food photograph on a rustic dark wooden dining table.
On the LEFT side and center-left, a traditional rustic dark earthenware handi of authentic Amritsari Pind Ke Chhole (rich, dark, spiced chickpeas / kabuli chana simmered in tea-infused whole spices, garnished with slit green chilies and fresh coriander) beside warm bhatura bread.
The entire LOWER-RIGHT side of the table MUST be completely clean, flat, and empty with soft warm directional lighting, leaving open space for product pouch compositing.
CRITICAL RULES: CHICKPEAS ONLY (STRICTLY NO RED KIDNEY BEANS / NO RAJMA), NO RAW ONION RINGS, NO GARLIC CLOVES."""
    ),
    (
        'pind-ke-chhole', 'abroad',
        """A high-end lifestyle travel editorial photograph on an outdoor sunlit wooden terrace table overlooking a picturesque European city at golden hour.
On the RIGHT side of the table, a steaming ceramic bowl of dark, rich Amritsari Pind Ke Chhole (spiced chickpeas) with a spoon.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with warm natural daylight, leaving open space for product pouch compositing.
CRITICAL RULES: CHICKPEAS ONLY, NO RED KIDNEY BEANS, NO ONIONS, NO GARLIC."""
    ),

    # 7. Moong Masala - HERO & ABROAD
    (
        'moong-masala', 'hero',
        """A commercial culinary food photograph on a rustic dark wooden dining table.
On the LEFT side and center-left, an artisanal ceramic bowl of wholesome, comforting homestyle Moong Masala (tender green whole moong beans simmered in a golden-brown spiced curry, garnished with fresh green coriander and a touch of ghee) beside warm folded roti.
The entire LOWER-RIGHT side of the rustic table MUST be completely clean, flat, and empty with soft warm morning window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: GREEN WHOLE MOONG BEANS ONLY (STRICTLY NO RED KIDNEY BEANS / NO RAJMA), NO ONIONS, NO GARLIC."""
    ),
    (
        'moong-masala', 'abroad',
        """A high-end lifestyle travel editorial photograph on a cozy wooden window-side dining table overlooking classic city rooftops in soft afternoon light.
On the RIGHT side of the table, an artisanal bowl of wholesome green Moong Masala (tender green whole moong curry) with a spoon.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: GREEN MOONG ONLY, NO RAJMA, NO ONIONS, NO GARLIC."""
    ),

    # 8. Rajma Masala - ABROAD
    (
        'rajma-masala', 'abroad',
        """A high-end lifestyle travel editorial photograph on a sunlit wooden terrace table overlooking a picturesque European alpine lake and mountains at golden hour.
On the RIGHT side of the table, a steaming artisanal ceramic bowl of authentic Punjabi Rajma Masala (plump red kidney beans in rich velvety tomato-ginger gravy with fresh coriander and melting butter) with a spoon.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with warm natural daylight, leaving open space for product pouch compositing.
CRITICAL RULES: RED KIDNEY BEANS, NO ONIONS, NO GARLIC."""
    )
]

def main():
    print(f"Starting execution of {len(TASKS)} image generations to fix all Meals gallery scenes...")
    for idx, (slug, plate_name, prompt) in enumerate(TASKS, 1):
        dst = ROOT / 'pdp' / slug / 'plates' / f"{plate_name}.png"
        print(f"\n[{idx}/{len(TASKS)}] Generating {slug} -> {plate_name}.png ...")
        raw = generate_image(prompt)
        save_plate(raw, dst)
        time.sleep(2)
        
    print("\n--- Syncing Jain plates and compositing WebP galleries ---")
    # Pairs of (regular_slug, jain_slug, plates_to_copy)
    jain_syncs = [
        ('veg-makhanwala', 'jain-veg-makhanwala', ['serving.png', 'hero.png', 'abroad.png']),
        ('pav-bhaji', 'jain-pav-bhaji', ['hero.png', 'abroad.png']),
        ('paneer-bhurji', 'jain-paneer-bhurji', ['hero.png', 'abroad.png']),
        ('veg-kadhai', 'jain-veg-kadhai', ['serving.png', 'hero.png', 'abroad.png']),
        ('pind-ke-chhole', 'jain-pind-ke-chhole', ['hero.png', 'abroad.png']),
        ('rajma-masala', 'jain-rajma-masala', ['abroad.png'])
    ]
    for reg, jain, plates in jain_syncs:
        for p in plates:
            src = ROOT / 'pdp' / reg / 'plates' / p
            dst = ROOT / 'pdp' / jain / 'plates' / p
            if src.exists():
                shutil.copy2(src, dst)
                print(f"Copied {reg}/{p} -> {jain}/{p}")

    # Re-compose all modified meals
    all_affected = [
        'veg-makhanwala', 'jain-veg-makhanwala',
        'pav-bhaji', 'jain-pav-bhaji',
        'paneer-bhurji', 'jain-paneer-bhurji',
        'veg-kadhai', 'jain-veg-kadhai',
        'bhindi-masala',
        'pind-ke-chhole', 'jain-pind-ke-chhole',
        'moong-masala',
        'rajma-masala', 'jain-rajma-masala'
    ]
    for slug in all_affected:
        compose(slug)

    print("\nALL MEAL FIXES AND GALLERY COMPOSITIONS COMPLETED SUCCESSFULLY!")

if __name__ == '__main__':
    main()

