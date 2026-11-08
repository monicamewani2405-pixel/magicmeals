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
    print(f"Saved: {dst_path.name}")

def run():
    slug = 'masala-khichdi-kadhi'
    pdir = ROOT / 'pdp' / slug / 'plates'
    bdir = ROOT / '_old-images' / slug
    bdir.mkdir(parents=True, exist_ok=True)
    for name in ['serving', 'hero', 'abroad']:
        f = pdir / f'{name}.png'
        if f.exists(): shutil.copy2(f, bdir / f'{name}-old-ai.png')
        
    print("1. Generating serving...")
    s_prompt = """A mouthwatering commercial food photograph of authentic Gujarati Masala Khichdi served alongside a small bowl of traditional creamy white Gujarati Kadhi.
The khichdi is rich golden-yellow, cooked with rice, lentils, diced carrots, green peas, peanuts, whole cloves and cinnamon, topped with fresh green coriander and a drizzle of desi ghee.
Beside it is a small terracotta or ceramic katori of smooth white Gujarati Kadhi tempered with mustard seeds and curry leaves.
Artisanal rustic ceramic tableware on a warm wooden dining table with an antique brass spoon, gentle rising steam, soft directional window lighting."""
    save_plate(generate_image(s_prompt), pdir / 'serving.png')
    
    print("2. Generating hero...")
    h_prompt = """A commercial food photograph of steaming Gujarati Masala Khichdi and a small bowl of Gujarati Kadhi on a rustic dining table.
Positioning: The bowls of Khichdi and Kadhi MUST be placed on the LEFT side and center-left of the frame.
The entire lower-right side of the rustic dark wooden table MUST be completely clean, flat, and empty with soft warm directional window lighting, leaving open space for product pouch compositing."""
    save_plate(generate_image(h_prompt), pdir / 'hero.png')
    
    print("3. Generating abroad...")
    a_prompt = """A high-end lifestyle travel editorial photograph of a steaming bowl of Gujarati Masala Khichdi with Kadhi on a cozy wooden dining table beside a window in a charming European cottage or overseas apartment on an autumn afternoon with trees and architecture in soft bokeh.
Positioning: The dishes are placed on the RIGHT side of the table.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with natural warm light, leaving open space for product pouch compositing."""
    save_plate(generate_image(a_prompt), pdir / 'abroad.png')
    
    print("Compositing...")
    res = subprocess.run(['python', 'tools/compose-lively.py', slug], cwd=ROOT, capture_output=True, text=True)
    print(res.stdout)

if __name__ == '__main__':
    run()

