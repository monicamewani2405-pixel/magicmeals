import os
import urllib.request
import json
import base64
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

TASKS = [
    # 1. Gajar Ka Halwa
    (
        'gajar-halwa', 'serving',
        """A mouthwatering commercial culinary food photograph of authentic rich Gajar Ka Halwa in a traditional handcrafted brass bowl.
Glistening, vibrant reddish-amber grated winter carrots slow-cooked in pure cow desi ghee and rich whole milk mawa (khoya), delicately scented with green cardamom.
Generously garnished with golden roasted cashew nut halves, slivered almonds, vibrant emerald-green pistachio slivers, and a touch of edible silver leaf (chandi vark).
Warm dark wooden tabletop, antique brass dessert spoon, gentle warm rising steam, soft directional window lighting."""
    ),
    (
        'gajar-halwa', 'hero',
        """A commercial culinary food photograph on a warm dark wooden dining table.
On the LEFT side and center-left, a steaming traditional brass bowl of rich Gajar Ka Halwa garnished with golden cashews and slivered pistachios, with an antique brass dessert spoon.
The entire LOWER-RIGHT side of the rustic table MUST be completely clean, flat, and empty with warm directional window lighting, leaving open space for product pouch compositing."""
    ),
    (
        'gajar-halwa', 'abroad',
        """A high-end lifestyle travel editorial photograph on a cozy wooden window-side dining table in a scenic Himalayan winter resort in Manali overlooking snow-clad pine forests and misty Himalayan peaks in soft golden afternoon light.
On the RIGHT side of the table, an artisanal brass bowl of warm, rich Gajar Ka Halwa garnished with golden cashews and pistachios, with a brass spoon.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural window lighting, leaving open space for product pouch compositing."""
    ),

    # 2. Pure Alphonso Aam Ras
    (
        'aam-ras', 'serving',
        """A mouthwatering commercial culinary food photograph of pure authentic Alphonso Aam Ras in an elegant traditional glass dessert bowl or brass katori.
Ultra-thick, velvety smooth, luscious golden-saffron Alphonso mango pulp crafted from ripe Ratnagiri mangoes, lightly flecked with fine cardamom powder and a few delicate saffron strands, garnished with two tiny fresh green mint leaves.
Rustic wooden table, antique silver spoon, glistening mango texture, warm soft natural morning lighting."""
    ),
    (
        'aam-ras', 'hero',
        """A commercial culinary food photograph on a sunlit wooden breakfast or dessert table.
On the LEFT side and center-left, an elegant bowl of thick, golden Alphonso Aam Ras garnished with saffron strands, with a silver spoon and a linen napkin.
The entire LOWER-RIGHT side of the table MUST be completely clean, flat, and empty with soft warm sunlight, leaving open space for product pouch compositing."""
    ),
    (
        'aam-ras', 'abroad',
        """A high-end lifestyle travel editorial photograph on a sunlit wooden balcony terrace table in coastal Ratnagiri Goa overlooking the serene Arabian Sea and swaying coconut palms at golden morning hour.
On the RIGHT side of the table, a refreshing bowl of thick golden Alphonso Aam Ras with a silver spoon.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with natural warm coastal sunlight, leaving open space for product pouch compositing."""
    ),

    # 3. Desi Ghee Rawa Sheera
    (
        'rawa-sheera', 'serving',
        """A mouthwatering commercial culinary food photograph of authentic Desi Ghee Rawa Sheera (Sooji Halwa) served in a traditional handcrafted brass bowl.
Glistening golden roasted semolina grains slow-cooked in pure golden cow ghee, whole milk, and saffron, studded with plump golden raisins, roasted cashew nuts, and slivered almonds, perfumed with fragrant cardamom.
Rustic dark wooden table, antique brass spoon, gentle rising steam, warm directional lighting."""
    ),
    (
        'rawa-sheera', 'hero',
        """A commercial culinary food photograph on a warm dark wooden dining table.
On the LEFT side and center-left, a steaming brass bowl of rich golden Desi Ghee Rawa Sheera garnished with roasted cashews, saffron, and raisins, with an antique spoon.
The entire LOWER-RIGHT side of the table MUST be completely clean, flat, and empty with warm directional lighting, leaving open space for product pouch compositing."""
    ),
    (
        'rawa-sheera', 'abroad',
        """A high-end lifestyle travel editorial photograph on a serene stone carved jharokha balcony table overlooking the sacred Ganges river in Rishikesh with misty green Himalayan foothills at peaceful sunrise.
On the RIGHT side of the table, a warm brass bowl of golden Desi Ghee Rawa Sheera with roasted nuts and a warm beverage.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft morning sunrise light, leaving open space for product pouch compositing."""
    )
]

def update_pdp_data():
    pdp_path = ROOT / 'pdp' / 'pdp-data.js'
    txt = pdp_path.read_text(encoding='utf-8')
    
    desserts_block = """    'gajar-halwa': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A traditional brass bowl of rich Gajar Ka Halwa with grated winter carrots, ghee, mawa, cashews, and pistachios' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden dining table beside a steaming bowl of Gajar Ka Halwa' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a European window table beside a bowl of warm Gajar Ka Halwa' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }
      }
    },
    'aam-ras': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A glass bowl of pure Ratnagiri Alphonso Aam Ras with saffron strands and cardamom' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a sunny table beside a bowl of golden Alphonso Aam Ras' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a Mediterranean balcony terrace beside a bowl of refreshing Aam Ras' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }
      }
    },
    'rawa-sheera': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A brass bowl of Desi Ghee Rawa Sheera with roasted cashews, saffron, and golden raisins' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden dining table beside a steaming bowl of Rawa Sheera' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an alpine chalet window table beside a warm bowl of Rawa Sheera' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }
      }
    },\n"""

    # Insert right before 'jain-veg-makhanwala': ... };
    target = "    'jain-veg-makhanwala': {"
    if target in txt and "'gajar-halwa':" not in txt:
        idx = txt.find(target)
        txt = txt[:idx] + desserts_block + txt[idx:]
        pdp_path.write_text(txt, encoding='utf-8')
        print("Updated pdp-data.js with Desserts LIVELY entries!")

def main():
    print(f"Starting execution of {len(TASKS)} image generations for Desserts Category...")
    for idx, (slug, plate_name, prompt) in enumerate(TASKS, 1):
        dst = ROOT / 'pdp' / slug / 'plates' / f"{plate_name}.png"
        print(f"\n[{idx}/{len(TASKS)}] Generating {slug} -> {plate_name}.png ...")
        raw = generate_image(prompt)
        save_plate(raw, dst)
        time.sleep(2)

    print("\n--- Compositing WebP Galleries for Desserts ---")
    for slug in ['gajar-halwa', 'aam-ras', 'rawa-sheera']:
        compose(slug)

    print("\n--- Updating pdp-data.js ---")
    update_pdp_data()

    print("\nALL DESSERTS GENERATED, COMPOSED & CONFIGURED SUCCESSFULLY!")

if __name__ == '__main__':
    main()

