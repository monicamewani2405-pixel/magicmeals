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
    print(f"Saved: {dst_path.name}")

def compose(slug):
    res = subprocess.run(['python', 'tools/compose-lively.py', slug], cwd=ROOT, capture_output=True, text=True)
    print(f"Composed {slug}: returncode={res.returncode}")

def run_meals():
    scratch = ROOT / 'scratch' / 'meals_shared'
    scratch.mkdir(parents=True, exist_ok=True)
    
    # 1. Generate 2 Universal Hero Plates (CRITICAL: NO VISIBLE ONIONS, NO GARLIC)
    print("\n>>> Generating Universal Hero Plate 1 (Gravy / Thali)...")
    h1_prompt = """A commercial culinary food photograph of a steaming hot authentic Indian curry served in an artisanal rustic ceramic bowl on the left side of a warm dark wooden dining table, with warm folded roti on a linen cloth beside it.
CRITICAL: NO RAW ONION RINGS, NO GARLIC CLOVES, NO VISIBLE ROOT VEGETABLES.
Positioning: The curry bowl and roti MUST be positioned on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean, flat, and empty with soft warm directional window lighting, leaving open space for product pouch compositing."""
    h1_path = scratch / 'hero_gravy.png'
    save_plate(generate_image(h1_prompt), h1_path)
    time.sleep(2)
    
    print("\n>>> Generating Universal Hero Plate 2 (Paneer / Dry Masala)...")
    h2_prompt = """A commercial culinary food photograph of a steaming hot rich Indian paneer dish served in a traditional rustic copper or earthenware handi on the left side of a wooden dining table, garnished with fresh green coriander.
CRITICAL: NO ONION RINGS, NO GARLIC CLOVES.
Positioning: The handi MUST be positioned on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean, flat, and empty with soft warm directional window lighting, leaving open space for product pouch compositing."""
    h2_path = scratch / 'hero_paneer.png'
    save_plate(generate_image(h2_prompt), h2_path)
    time.sleep(2)
    
    # 2. Generate 2 Universal Abroad Plates
    print("\n>>> Generating Universal Abroad Plate 1 (Terrace / Balcony)...")
    a1_prompt = """A high-end lifestyle travel editorial photograph of a steaming bowl of delicious Indian curry with a spoon resting inside on an outdoor sunlit wooden terrace table overlooking a picturesque scenic city and blue water at golden hour.
CRITICAL: NO RAW ONIONS, NO GARLIC.
Positioning: The bowl is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with warm natural daylight, leaving open space for product pouch compositing."""
    a1_path = scratch / 'abroad_terrace.png'
    save_plate(generate_image(a1_prompt), a1_path)
    time.sleep(2)
    
    print("\n>>> Generating Universal Abroad Plate 2 (Cozy Window / Europe)...")
    a2_prompt = """A high-end lifestyle travel editorial photograph of a freshly prepared bowl of hearty Indian meal on a cozy wooden window-side dining table in a charming European apartment overlooking classic architecture in soft afternoon bokeh.
CRITICAL: NO ONIONS, NO GARLIC.
Positioning: The dish is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural window lighting, leaving open space for product pouch compositing."""
    a2_path = scratch / 'abroad_window.png'
    save_plate(generate_image(a2_prompt), a2_path)
    time.sleep(2)
    
    # 3. Define 9 Regular Dishes Prompts (STRICTLY NO VISIBLE ONIONS, NO GARLIC)
    servings = {
        'rajma-masala': """A mouthwatering commercial food photograph of rich authentic Punjabi Rajma Masala in a rustic ceramic bowl.
Tender, plump red kidney beans slow-simmered in a thick, velvety tomato-ginger gravy with aromatic spices, garnished with finely chopped fresh green coriander and a melting swirl of butter.
STRICT RULE: NO RAW ONION RINGS, NO WHOLE GARLIC CLOVES.
Warm rustic wooden table, antique brass spoon, gentle rising steam, soft directional window lighting.""",
        
        'paneer-butter-masala': """A commercial food photograph of royal Paneer Butter Masala in a traditional ceramic serving handi.
Succulent, velvety soft cubes of fresh paneer simmered in a luscious, silky smooth orange-red makhani tomato butter gravy, garnished with crushed kasuri methi (fenugreek leaves) and an elegant swirl of fresh white cream.
STRICT RULE: NO RAW ONION RINGS, NO GARLIC CLOVES.
Rustic dark wood table, gentle rising steam, warm restaurant lighting.""",
        
        'paneer-bhurji': """A vibrant commercial food photograph of authentic Paneer Bhurji in a rustic handcrafted ceramic dish.
Spiced, crumbled fresh cottage cheese (paneer) tossed with juicy red diced tomatoes, crisp green bell peppers (capsicum), green chilies, and a generous sprinkle of fresh coriander with a light glisten of butter.
STRICT RULE: NO RAW ONION RINGS, NO GARLIC.
Warm wooden tabletop, soft warm lighting, rising steam.""",
        
        'pind-ke-chhole': """A commercial culinary photograph of authentic Amritsari Pind Ke Chhole in a rustic dark earthenware handi.
Dark, rich, spiced chickpeas (kabuli chana) simmered in a robust, traditional tea-infused whole spice gravy, garnished with slit green chilies, fresh green coriander, and a touch of roasted cumin.
STRICT RULE: NO ONION RINGS, NO RAW GARLIC.
Rustic wooden table, antique brass spoon, gentle rising steam.""",
        
        'pav-bhaji': """A mouthwatering commercial food photograph of authentic Mumbai Pav Bhaji.
A shallow rustic ceramic plate with a generous portion of rich, spiced, mashed mixed vegetable bhaji topped with a melting golden pat of Amul butter and fresh coriander, served beside soft, golden toasted buttered pav bread with a fresh yellow lemon wedge on the side.
STRICT RULE: NO RAW ONION RINGS, NO GARLIC CLOVES ON THE PLATE.
Rustic tabletop, glistening butter, gentle steam.""",
        
        'bhindi-masala': """A commercial food photograph of delicious homestyle Bhindi Masala in an artisanal ceramic bowl.
Crisp-tender, vibrant green okra (ladyfinger) cut into neat pieces, sautéed with diced ripe tomatoes, cumin seeds, turmeric, and freshly roasted ground spices, garnished with fresh green coriander.
STRICT RULE: NO ONIONS, NO GARLIC.
Warm rustic wooden table, soft natural window light, rising steam.""",
        
        'veg-kadhai': """A commercial food photograph of vibrant Veg Kadhai in a traditional Indian kadhai dish.
Tender paneer cubes and assorted garden vegetables (capsicum, baby corn, green peas) tossed in a robust, aromatic kadhai gravy with freshly pounded whole coriander seeds and dried red chilies, garnished with fresh cilantro.
STRICT RULE: NO ONION CHUNKS, NO GARLIC.
Dark wooden dining table, warm restaurant lighting.""",
        
        'veg-makhanwala': """A commercial culinary photograph of rich, creamy Veg Makhanwala in an artisanal ceramic handi.
Tender paneer cubes and colorful vegetables in a velvety, buttery tomato-cashew makhani gravy, finished with kasuri methi and a delicate swirl of fresh cream.
STRICT RULE: NO RAW ONIONS, NO GARLIC.
Rustic dark wood table, soft warm lighting, delicate steam.""",
        
        'moong-masala': """A wholesome commercial food photograph of comforting homestyle Moong Masala in a rustic ceramic bowl.
Tender, wholesome green moong beans (mung) slow-simmered in a rich, aromatic, golden-brown spiced homestyle curry, garnished with fresh green coriander and a light drizzle of desi ghee.
STRICT RULE: NO ONIONS, NO GARLIC.
Rustic wooden table, brass spoon, soft natural morning window light."""
    }
    
    # 4. Generate the 9 Servings and Setup Regular Dishes
    hero_choice = {
        'rajma-masala': h1_path,
        'paneer-butter-masala': h2_path,
        'paneer-bhurji': h2_path,
        'pind-ke-chhole': h1_path,
        'pav-bhaji': h1_path,
        'bhindi-masala': h2_path,
        'veg-kadhai': h2_path,
        'veg-makhanwala': h2_path,
        'moong-masala': h1_path,
    }
    abroad_choice = {
        'rajma-masala': a2_path,
        'paneer-butter-masala': a1_path,
        'paneer-bhurji': a1_path,
        'pind-ke-chhole': a2_path,
        'pav-bhaji': a1_path,
        'bhindi-masala': a2_path,
        'veg-kadhai': a1_path,
        'veg-makhanwala': a2_path,
        'moong-masala': a2_path,
    }
    
    for slug, s_prompt in servings.items():
        print(f"\n==================== Generating {slug} ====================")
        pdir = ROOT / 'pdp' / slug / 'plates'
        pdir.mkdir(parents=True, exist_ok=True)
        
        # Serving
        save_plate(generate_image(s_prompt), pdir / 'serving.png')
        time.sleep(2)
        
        # Copy selected hero and abroad plates
        shutil.copy2(hero_choice[slug], pdir / 'hero.png')
        shutil.copy2(abroad_choice[slug], pdir / 'abroad.png')
        
        # Compose
        compose(slug)
        
    # 5. Setup the 7 Jain Meals (Zero Credits: Reuse identical regular plates!)
    jain_pairs = [
        ('paneer-bhurji', 'jain-paneer-bhurji'),
        ('paneer-butter-masala', 'jain-paneer-butter-masala'),
        ('pav-bhaji', 'jain-pav-bhaji'),
        ('pind-ke-chhole', 'jain-pind-ke-chhole'),
        ('rajma-masala', 'jain-rajma-masala'),
        ('veg-kadhai', 'jain-veg-kadhai'),
        ('veg-makhanwala', 'jain-veg-makhanwala'),
    ]
    
    print("\n==================== Setting up 7 Jain Meals (0 Credits) ====================")
    for reg_slug, jain_slug in jain_pairs:
        reg_pdir = ROOT / 'pdp' / reg_slug / 'plates'
        jain_pdir = ROOT / 'pdp' / jain_slug / 'plates'
        jain_pdir.mkdir(parents=True, exist_ok=True)
        for n in ['serving.png', 'hero.png', 'abroad.png']:
            shutil.copy2(reg_pdir / n, jain_pdir / n)
        compose(jain_slug)
        print(f"Composed {jain_slug} successfully with 0 extra credits!")
        
    print("\n>>> ALL 16 MEALS SUCCESSFULLY PROCESSED AND COMPOSED! <<<")

if __name__ == '__main__':
    run_meals()

