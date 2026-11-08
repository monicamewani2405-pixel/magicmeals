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
    full_prompt = f"{prompt}\n\nTechnical framing requirement: Vertical portrait orientation, 4:5 aspect ratio, professional editorial culinary and travel photography, photorealistic, natural lighting and textures."
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

def fix_tawa_abroad():
    slug = 'tawa-pulao'
    pdir = ROOT / 'pdp' / slug / 'plates'
    bdir = ROOT / '_old-images' / slug
    bdir.mkdir(parents=True, exist_ok=True)
    if (pdir / 'abroad.png').exists():
        shutil.copy2(pdir / 'abroad.png', bdir / 'abroad-marine-drive-old.png')
    
    print("Generating new realistic travel abroad plate for Tawa Pulao...")
    # Beautiful daytime/golden hour travel setting with elegant natural architecture/view
    prompt = """A high-end editorial travel lifestyle photograph of a steaming bowl of vibrant Mumbai Tawa Pulao with a spoon resting inside.
Setting: Placed on a sunlit rustic wooden outdoor table on a scenic balcony overlooking Sydney Harbour with the iconic Sydney Opera House and sparkling blue harbour water under crisp golden afternoon sunlight in soft bokeh.
Positioning: The bowl of Tawa Pulao is placed on the RIGHT side of the table (around 65% to 85% width).
The entire LOWER-LEFT area of the tabletop (10% to 40% width, bottom 40% height) MUST be completely clean, flat, and empty with warm natural daylight, leaving open space for product pouch compositing.
High resolution, authentic food textures, clean elegant travel ambiance, no artificial night glare."""
    
    raw = generate_image(prompt)
    save_plate(raw, pdir / 'abroad.png')
    
    res = subprocess.run(['python', 'tools/compose-lively.py', slug], cwd=ROOT, capture_output=True, text=True)
    print("Composed tawa-pulao:", res.returncode)

if __name__ == '__main__':
    fix_tawa_abroad()

