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

def run_jain():
    # 1. Jain Dal Khichdi (STRICT NO GARLIC, NO ONION)
    print("\n================== 1. JAIN DAL KHICHDI ==================")
    jdk_dir = ROOT / 'pdp' / 'jain-dal-khichdi' / 'plates'
    
    print("Generating Jain Dal Khichdi - Serving...")
    s1 = """A commercial food photograph of authentic Sattvic Jain Dal Khichdi in an artisanal rustic ceramic bowl.
CRITICAL DIETARY RULE: STRICTLY JAIN. ABSOLUTELY NO GARLIC, NO GARLIC FLAKES, NO ONIONS, NO ROOT VEGETABLES.
Food details: Creamy, comforting yellow moong dal khichdi made of tender rice and yellow lentils, topped with sizzling desi cow ghee tadka consisting ONLY of crackled cumin seeds (jeera), a whole dried red chili, fresh curry leaves, and a pool of melted golden cow ghee in the center. Garnished with finely chopped fresh green coriander. Antique brass spoon on a warm rustic wooden table, gentle rising steam, soft natural morning window light."""
    save_plate(generate_image(s1), jdk_dir / 'serving.png')
    time.sleep(2)

    print("Generating Jain Dal Khichdi - Hero...")
    h1 = """A commercial food photograph of steaming Sattvic Jain Dal Khichdi with pure desi ghee, crackled cumin seeds, red chili, and curry leaves (NO GARLIC, NO ONIONS).
Positioning: The bowl of Khichdi MUST be placed on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean, flat, and empty with soft warm directional window lighting, leaving open space for product pouch compositing."""
    save_plate(generate_image(h1), jdk_dir / 'hero.png')
    time.sleep(2)

    print("Generating Jain Dal Khichdi - Abroad...")
    a1 = """A high-end lifestyle travel editorial photograph of a steaming bowl of comforting Jain Dal Khichdi (NO GARLIC, NO ONIONS) with a brass spoon on a cozy wooden desk by a window on a rainy evening overlooking an overseas city skyline in soft bokeh.
Positioning: The bowl is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with warm indoor lamp light, leaving open space for product pouch compositing."""
    save_plate(generate_image(a1), jdk_dir / 'abroad.png')
    compose('jain-dal-khichdi')

    # 2. Jain Veg Biryani (STRICT NO ONIONS/BIRISTA, NO GARLIC, NO POTATOES, NO CARROTS)
    print("\n================== 2. JAIN VEG BIRYANI ==================")
    jvb_dir = ROOT / 'pdp' / 'jain-veg-biryani' / 'plates'
    
    print("Generating Jain Veg Biryani - Serving...")
    s2 = """A royal commercial culinary photograph of authentic Sattvic Jain Veg Dum Biryani in a traditional clay handi.
CRITICAL DIETARY RULE: STRICTLY JAIN. ABSOLUTELY NO ONIONS, NO CARAMELIZED ONIONS (NO BIRISTA), NO GARLIC, NO POTATOES, NO CARROTS.
Food details: Fragrant, slender extra-long basmati rice in natural layered shades of saffron and white. Studded with golden-seared paneer cubes, tender green peas, chopped French beans, toasted whole cashews, golden raisins, whole green cardamom pods, and a star anise. Garnished with fresh green mint leaves and coriander. Gentle aromatic steam rising, rustic wooden tabletop, soft warm lighting."""
    save_plate(generate_image(s2), jvb_dir / 'serving.png')
    time.sleep(2)

    print("Generating Jain Veg Biryani - Hero...")
    h2 = """A commercial food photograph of royal Jain Dum Veg Biryani (with paneer, peas, French beans, cashews, saffron - STRICTLY NO ONIONS, NO BIRISTA, NO GARLIC) in a clay handi.
Positioning: The handi MUST be placed on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean, flat, and empty with soft warm directional lighting, leaving open space for product pouch compositing."""
    save_plate(generate_image(h2), jvb_dir / 'hero.png')
    time.sleep(2)

    print("Generating Jain Veg Biryani - Abroad...")
    a2 = """A high-end lifestyle travel editorial photograph of royal Jain Veg Biryani (NO ONIONS, NO GARLIC) in a modern ceramic bowl on a wooden dining table by a Parisian window overlooking European architecture at golden hour sunset.
Positioning: The bowl is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with natural light, leaving open space for product pouch compositing."""
    save_plate(generate_image(a2), jvb_dir / 'abroad.png')
    compose('jain-veg-biryani')

    # 3. Jain Masala Khichdi Kadhi (STRICT NO ONIONS, NO GARLIC, NO CARROTS)
    print("\n================== 3. JAIN MASALA KHICHDI KADHI ==================")
    jmk_dir = ROOT / 'pdp' / 'jain-masala-khichdi-kadhi' / 'plates'
    
    print("Generating Jain Masala Khichdi - Serving...")
    s3 = """A commercial food photograph of authentic Sattvic Jain Gujarati Masala Khichdi paired with traditional white Gujarati Kadhi.
CRITICAL DIETARY RULE: STRICTLY JAIN. ABSOLUTELY NO ONIONS, NO GARLIC, NO CARROTS, NO POTATOES.
Food details: Flavorful spiced yellow khichdi with green peas, roasted peanuts, diced green bell pepper, cumin, and desi ghee. Served with a small ceramic katori of smooth white Gujarati Kadhi tempered with mustard seeds and fresh curry leaves. Artisanal rustic tableware on a warm wooden dining table with gentle steam rising."""
    save_plate(generate_image(s3), jmk_dir / 'serving.png')
    time.sleep(2)

    print("Generating Jain Masala Khichdi - Hero...")
    h3 = """A commercial food photograph of Jain Masala Khichdi and white Gujarati Kadhi (NO ONION, NO GARLIC, NO ROOT VEGETABLES) on a rustic wooden dining table.
Positioning: The dishes MUST be placed on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean, flat, and empty with soft warm directional window lighting, leaving open space for product pouch compositing."""
    save_plate(generate_image(h3), jmk_dir / 'hero.png')
    time.sleep(2)

    print("Generating Jain Masala Khichdi - Abroad...")
    a3 = """A high-end lifestyle travel editorial photograph of a steaming bowl of Jain Masala Khichdi and Kadhi on a cozy wooden dining table beside a window in a European cottage at autumn twilight.
Positioning: The dishes are placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural light, leaving open space for product pouch compositing."""
    save_plate(generate_image(a3), jmk_dir / 'abroad.png')
    compose('jain-masala-khichdi-kadhi')

    # 4. Jain Schezwan Rice (STRICT NO GARLIC, NO ONIONS, NO SCALLIONS/SPRING ONIONS)
    print("\n================== 4. JAIN SCHEZWAN RICE ==================")
    jsr_dir = ROOT / 'pdp' / 'jain-schezwan-rice' / 'plates'
    
    print("Generating Jain Schezwan Rice - Serving...")
    s4 = """A commercial food photograph of vibrant Indo-Chinese Jain Schezwan Fried Rice in a stylish rustic dark ceramic bowl.
CRITICAL DIETARY RULE: STRICTLY JAIN. ABSOLUTELY NO GARLIC, NO ONIONS, NO SPRING ONIONS, NO SHALLOTS.
Food details: Fiery red-orange long-grain rice tossed in garlic-free Jain red chili Schezwan sauce, stir-fried with crisp shredded cabbage, finely diced green and red bell peppers (capsicum), baby corn, and fresh green coriander. Plated on a dark wood table with modern cutlery, rising steam, dramatic warm lighting."""
    save_plate(generate_image(s4), jsr_dir / 'serving.png')
    time.sleep(2)

    print("Generating Jain Schezwan Rice - Hero...")
    h4 = """A commercial food photograph of steaming Jain Schezwan Fried Rice (NO GARLIC, NO ONIONS, NO SPRING ONIONS) in a rustic dark bowl on a dining table.
Positioning: The bowl of Schezwan Rice MUST be placed on the LEFT side and center-left of the frame.
The entire lower-right side of the dark wooden table MUST be completely clean, flat, and empty with warm directional lighting, leaving open space for product pouch compositing."""
    save_plate(generate_image(h4), jsr_dir / 'hero.png')
    time.sleep(2)

    print("Generating Jain Schezwan Rice - Abroad...")
    a4 = """A high-end lifestyle travel editorial photograph of a bowl of spicy Jain Schezwan Rice (NO GARLIC, NO ONIONS) on an outdoor terrace table at dusk overlooking a glowing urban skyline.
Positioning: The bowl is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with ambient city glow, leaving open space for product pouch compositing."""
    save_plate(generate_image(a4), jsr_dir / 'abroad.png')
    compose('jain-schezwan-rice')

    print("\n>>> ALL 4 JAIN RICE DISHES SUCCESSFULLY GENERATED AND COMPOSED! <<<")

if __name__ == '__main__':
    run_jain()

