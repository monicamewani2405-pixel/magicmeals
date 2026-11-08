import urllib.request
import json
import base64
import os
import shutil
import subprocess
from pathlib import Path
from PIL import Image

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-3.1-flash-image"
ROOT = Path(__file__).resolve().parent.parent

def generate_image(prompt, aspect_ratio="4:5"):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
    full_prompt = f"{prompt}\n\nTechnical framing requirement: Vertical portrait orientation, 4:5 aspect ratio, professional editorial culinary photography, photorealistic, natural lighting and textures."
    
    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        candidates = data.get('candidates', [])
        if not candidates:
            raise RuntimeError("No candidates returned from API")
        parts = candidates[0].get('content', {}).get('parts', [])
        for p in parts:
            if 'inlineData' in p:
                return base64.b64decode(p['inlineData']['data'])
        raise RuntimeError("No inlineData image found in response")

def prepare_and_save_plate(raw_bytes, dst_path):
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = dst_path.with_suffix('.temp.jpg')
    temp_path.write_bytes(raw_bytes)
    
    im = Image.open(temp_path).convert('RGB')
    w, h = im.size
    want = 4 / 5
    if abs(w / h - want) > 0.005:
        if w / h > want:
            nw = round(h * want)
            x0 = (w - nw) // 2
            im = im.crop((x0, 0, x0 + nw, h))
        else:
            nh = round(w / want)
            y0 = (h - nh) // 2
            im = im.crop((0, y0, w, y0 + nh))
    im = im.resize((2000, 2500), Image.LANCZOS)
    im.save(dst_path)
    if temp_path.exists():
        temp_path.unlink()
    print(f"Saved plate: {dst_path} ({im.size})")

def process_tawa_pulao():
    slug = 'tawa-pulao'
    plates_dir = ROOT / 'pdp' / slug / 'plates'
    backup_dir = ROOT / '_old-images' / slug
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Hero
    print("Generating Tawa Pulao Hero Plate...")
    hero_prompt = """A commercial food photograph of steaming Mumbai Street-Style Spicy Tawa Pulao with fluffy long basmati rice in reddish-orange Pav Bhaji butter sauce, green peas, diced capsicum, and golden paneer cubes in a rustic ceramic dish.
Positioning: The dish of Tawa Pulao MUST be positioned on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean and empty with soft warm directional window lighting, leaving open space for product pouch compositing."""
    raw_hero = generate_image(hero_prompt)
    if (plates_dir / 'hero.png').exists():
        shutil.copy2(plates_dir / 'hero.png', backup_dir / 'hero-old-ai.png')
    prepare_and_save_plate(raw_hero, plates_dir / 'hero.png')
    
    # 2. Abroad
    print("Generating Tawa Pulao Abroad Plate...")
    abroad_prompt = """A high-end lifestyle travel editorial photograph of a freshly prepared, steaming bowl of vibrant Mumbai Tawa Pulao with a sleek spoon resting inside, placed on an outdoor dark wooden terrace table at blue hour / twilight overlooking a stunning metropolis skyline with glowing evening city lights in soft bokeh.
Positioning: The bowl of Tawa Pulao is placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with subtle ambient city glow and no obstacles, leaving open space for product pouch compositing."""
    raw_abroad = generate_image(abroad_prompt)
    if (plates_dir / 'abroad.png').exists():
        shutil.copy2(plates_dir / 'abroad.png', backup_dir / 'abroad-old-ai.png')
    prepare_and_save_plate(raw_abroad, plates_dir / 'abroad.png')
    
    # 3. Compose
    print("Compositing Tawa Pulao lively gallery...")
    res = subprocess.run(['python', 'tools/compose-lively.py', slug], cwd=ROOT, capture_output=True, text=True)
    print(res.stdout)
    if res.returncode != 0:
        print("Error during compose:", res.stderr)
    else:
        print("Tawa Pulao composed successfully!")

if __name__ == '__main__':
    process_tawa_pulao()

