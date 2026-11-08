import os
import urllib.request
import json
import base64
import shutil
import subprocess
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
    print(f"Saved: {dst_path}")

def compose(slug):
    res = subprocess.run(['python', 'tools/compose-lively.py', slug], cwd=ROOT, capture_output=True, text=True)
    print(f"Composed {slug}: returncode={res.returncode}")

def run_all():
    # 1. Fried Rice
    print("\n--- Processing Fried Rice ---")
    fr_dir = ROOT / 'pdp' / 'fried-rice' / 'plates'
    fr_bak = ROOT / '_old-images' / 'fried-rice'
    fr_bak.mkdir(parents=True, exist_ok=True)
    for n in ['serving', 'hero', 'abroad']:
        if (fr_dir / f'{n}.png').exists(): shutil.copy2(fr_dir / f'{n}.png', fr_bak / f'{n}-old-ai.png')
    
    save_plate(generate_image("""Commercial food photography of steaming wok-tossed Veg Fried Rice in an artisanal ceramic bowl.
Fluffy separated grains of rice with finely diced crisp carrots, green beans, cabbage, sweet corn, and fresh green spring onions, seasoned in light savory soy sauce and toasted sesame.
Antique brass spoon and dark wooden table, gentle rising steam, soft directional window lighting."""), fr_dir / 'serving.png')
    
    save_plate(generate_image("""Commercial food photography of steaming Veg Fried Rice in an artisanal bowl on a rustic dining table.
Positioning: The bowl of Fried Rice MUST be placed on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean, flat, and empty with soft warm directional window lighting, leaving open space for product pouch compositing."""), fr_dir / 'hero.png')
    
    save_plate(generate_image("""High-end lifestyle travel editorial photograph of a steaming bowl of Veg Fried Rice on a modern wooden balcony table overlooking a scenic cityscape with sparkling harbor lights at twilight.
Positioning: The bowl is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with subtle ambient city glow, leaving open space for product pouch compositing."""), fr_dir / 'abroad.png')
    compose('fried-rice')

    # 2. Schezwan Rice
    print("\n--- Processing Schezwan Rice ---")
    sr_dir = ROOT / 'pdp' / 'schezwan-rice' / 'plates'
    sr_bak = ROOT / '_old-images' / 'schezwan-rice'
    sr_bak.mkdir(parents=True, exist_ok=True)
    for n in ['serving', 'hero', 'abroad']:
        if (sr_dir / f'{n}.png').exists(): shutil.copy2(sr_dir / f'{n}.png', sr_bak / f'{n}-old-ai.png')
        
    save_plate(generate_image("""Commercial food photography of fiery, vibrant red Indo-Chinese Schezwan Fried Rice in a stylish rustic dark bowl.
Glistening long-grain rice tossed in authentic spicy Schezwan chili-garlic sauce, with stir-fried crisp bell peppers, carrots, and abundant chopped fresh scallion greens.
Plated with modern cutlery on a dark wood table with gentle rising steam, warm dramatic lighting."""), sr_dir / 'serving.png')
    
    save_plate(generate_image("""Commercial food photography of steaming hot Schezwan Fried Rice in a rustic bowl on a dining table.
Positioning: The bowl of Schezwan Rice MUST be placed on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean, flat, and empty with soft warm directional lighting, leaving open space for product pouch compositing."""), sr_dir / 'hero.png')
    
    save_plate(generate_image("""High-end lifestyle travel editorial photograph of a bowl of spicy Schezwan Rice on an outdoor high-floor terrace table at dusk overlooking a glowing urban skyline.
Positioning: The bowl is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with ambient evening glow, leaving open space for product pouch compositing."""), sr_dir / 'abroad.png')
    compose('schezwan-rice')

    # 3. Fried Rice Manchurian
    print("\n--- Processing Fried Rice Manchurian ---")
    frm_dir = ROOT / 'pdp' / 'fried-rice-manchurian' / 'plates'
    frm_bak = ROOT / '_old-images' / 'fried-rice-manchurian'
    frm_bak.mkdir(parents=True, exist_ok=True)
    for n in ['serving', 'hero', 'abroad']:
        if (frm_dir / f'{n}.png').exists(): shutil.copy2(frm_dir / f'{n}.png', frm_bak / f'{n}-old-ai.png')
        
    save_plate(generate_image("""Mouthwatering commercial culinary photography of Vegetable Fried Rice served with Vegetable Manchurian.
A rustic ceramic plate with a portion of golden fluffy veg fried rice beside crisp-tender vegetable Manchurian balls simmered in a glossy, rich dark brown savory soy-garlic gravy, garnished with chopped spring onions.
Warm rustic wooden table, antique brass spoon, gentle rising steam, soft directional lighting."""), frm_dir / 'serving.png')
    
    save_plate(generate_image("""Commercial food photography of Fried Rice with Veg Manchurian on a rustic dining table.
Positioning: The platter of Fried Rice and Manchurian MUST be placed on the LEFT side and center-left of the frame.
The entire lower-right side of the dark wooden table MUST be completely clean, flat, and empty with soft warm directional lighting, leaving open space for product pouch compositing."""), frm_dir / 'hero.png')
    
    save_plate(generate_image("""High-end lifestyle travel editorial photograph of a platter of Fried Rice Manchurian on a modern wooden dining table by a window overlooking a bustling international cityscape at twilight.
Positioning: The dish is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with natural light, leaving open space for product pouch compositing."""), frm_dir / 'abroad.png')
    compose('fried-rice-manchurian')

    # 4. Jain Schezwan Rice (Zero Credits: Reuse Schezwan Rice plates)
    print("\n--- Processing Jain Schezwan Rice (Zero Credits) ---")
    jsr_dir = ROOT / 'pdp' / 'jain-schezwan-rice' / 'plates'
    jsr_dir.mkdir(parents=True, exist_ok=True)
    for n in ['serving.png', 'hero.png', 'abroad.png']:
        shutil.copy2(sr_dir / n, jsr_dir / n)
    compose('jain-schezwan-rice')
    print("ALL INDO-CHINESE & JAIN DISHES COMPLETED SUCCESSFULLY!")

if __name__ == '__main__':
    run_all()

