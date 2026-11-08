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

# 12 Image Generations across 4 core breakfast foods
TASKS = [
    # 1. POHA (covers kanda-poha & jain-poha)
    (
        'kanda-poha', 'serving',
        """A mouthwatering commercial food photograph of authentic Maharashtrian Poha served on a traditional brass plate.
Fluffy, fragrant flattened rice grains tinted vibrant golden-yellow with turmeric, tempered with crackling black mustard seeds, cumin, green chillies, aromatic curry leaves, and crunchy roasted pink peanuts.
Garnished with freshly grated snow-white coconut, fresh green coriander leaves, and a juicy fresh yellow lemon wedge.
CRITICAL RULES: NO RAW ONION RINGS, NO GARLIC CLOVES, NO VISIBLE ROOT VEGETABLES.
Warm rustic wooden table, antique brass spoon, gentle rising steam, soft directional window lighting."""
    ),
    (
        'kanda-poha', 'hero',
        """A commercial culinary food photograph of a morning breakfast table.
On the LEFT side and center-left, a steaming traditional brass plate of vibrant golden-yellow Indian Poha (flattened rice with crunchy roasted peanuts, green chillies, curry leaves, fresh coriander, and a lemon wedge) beside a steaming glass of hot cutting chai in a glass holder.
The entire LOWER-RIGHT side of the rustic wooden table MUST be completely clean, flat, and empty with soft warm morning sunlight, leaving clear open space for product pouch compositing.
CRITICAL RULES: NO ONION RINGS, NO GARLIC."""
    ),
    (
        'kanda-poha', 'abroad',
        """A high-end lifestyle travel editorial photograph of a morning breakfast on a cozy wooden window-side dining table in a charming European apartment overlooking classic street architecture in soft morning daylight.
On the RIGHT side of the table, a delicious bowl of warm Indian Poha (golden flattened rice with roasted peanuts, curry leaves, and lemon) with a cup of hot tea.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: NO ONIONS, NO GARLIC."""
    ),

    # 2. UPMA (covers upma & jain-upma)
    (
        'upma', 'serving',
        """A mouthwatering commercial culinary food photograph of authentic South Indian Rava Upma served on a traditional banana leaf or brass plate.
Fluffy, aromatic roasted semolina grains glistening with pure desi ghee, tempered with mustard seeds, curry leaves, golden roasted cashews, ginger juliennes, green chillies, and sweet green peas.
Garnished with freshly grated coconut, fresh green coriander, and a yellow lime wedge, with a small brass bowl of creamy white coconut chutney beside it.
CRITICAL RULES: NO ONIONS, NO GARLIC, NO ROOT VEGETABLES.
Warm wooden table, soft morning window lighting, gentle rising steam."""
    ),
    (
        'upma', 'hero',
        """A commercial culinary food photograph on a warm wooden breakfast table.
On the LEFT side and center-left, a steaming brass plate of South Indian Rava Upma (fluffy semolina with roasted cashews, curry leaves, and green peas) with a small bowl of coconut chutney and a South Indian filter coffee in a brass dabarah tumbler.
The entire LOWER-RIGHT side of the table MUST be completely clean, flat, and empty with soft warm morning light, leaving open space for product pouch compositing.
CRITICAL RULES: NO ONIONS, NO GARLIC."""
    ),
    (
        'upma', 'abroad',
        """A high-end lifestyle travel editorial photograph on a sunlit wooden balcony terrace table overlooking scenic snow-capped mountains and alpine pine trees in bright morning sunlight.
On the RIGHT side of the table, a steaming ceramic bowl of South Indian Rava Upma (semolina with cashews and curry leaves) with a warm mug of coffee.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with natural morning light, leaving open space for product pouch compositing.
CRITICAL RULES: NO ONIONS, NO GARLIC."""
    ),

    # 3. IDLI SAMBAR (idli-sambar)
    (
        'idli-sambar', 'serving',
        """A mouthwatering commercial food photograph of authentic South Indian Idli Sambar on a fresh green banana leaf.
Three pillowy-soft, ultra-fluffy, steaming snow-white steamed idlis served with a traditional brass bowl of rich, aromatic vegetable lentil sambar (with drumsticks and curry leaves) and a side of fresh white coconut chutney.
Garnished with a sprinkle of gunpowder podi and a drizzle of golden ghee.
CRITICAL RULES: NO RAW ONION RINGS, NO GARLIC CLOVES.
Rustic dark wooden table, traditional South Indian setting, rising steam, soft directional lighting."""
    ),
    (
        'idli-sambar', 'hero',
        """A commercial culinary food photograph on a dark wooden morning breakfast table.
On the LEFT side and center-left, a plate of steaming pillowy-soft white idlis with a bowl of aromatic vegetable sambar, coconut chutney, and a brass tumbler of filter coffee.
The entire LOWER-RIGHT side of the table MUST be completely clean, flat, and empty with warm directional morning window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: NO ONION RINGS, NO GARLIC."""
    ),
    (
        'idli-sambar', 'abroad',
        """A high-end lifestyle travel editorial photograph on a cozy wooden window-side dining table in a charming historic European city apartment overlooking classic cobblestone streets.
On the RIGHT side of the table, a plate of fluffy white steamed idlis with a bowl of warm sambar and a spoon.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with soft natural window lighting, leaving open space for product pouch compositing.
CRITICAL RULES: NO ONIONS, NO GARLIC."""
    ),

    # 4. MUMBAI MISAL (mumbai-misal)
    (
        'mumbai-misal', 'serving',
        """A mouthwatering commercial food photograph of authentic fiery Mumbai Kolhapuri Misal served in a shallow artisanal ceramic bowl.
Tender spiced sprouted moth beans (matki) in a rich, zesty, aromatic red rassa curry topped with a golden heap of crunchy farsan / sev, fresh green coriander, and a juicy yellow lemon wedge, served with soft buttered pav bread buns on the side.
CRITICAL RULES: NO RAW ONION RINGS OR ONION SLICES ON DISPLAY, NO GARLIC CLOVES.
Rustic tabletop, glistening spicy tari, gentle rising steam, warm restaurant lighting."""
    ),
    (
        'mumbai-misal', 'hero',
        """A commercial culinary food photograph on a rustic dark wooden dining table.
On the LEFT side and center-left, a shallow bowl of authentic fiery Mumbai Misal topped with crunchy farsan and coriander, served with soft butter-toasted pav bread and a fresh lemon wedge.
The entire LOWER-RIGHT side of the rustic table MUST be completely clean, flat, and empty with warm directional lighting, leaving open space for product pouch compositing.
CRITICAL RULES: NO ONION RINGS ON THE TABLE, NO GARLIC."""
    ),
    (
        'mumbai-misal', 'abroad',
        """A high-end lifestyle travel editorial photograph on an outdoor sunlit wooden terrace table overlooking a picturesque European harbor and blue sea at golden morning hour.
On the RIGHT side of the table, a delicious bowl of Mumbai Misal with crunchy farsan and two soft buttered pav buns.
The LOWER-LEFT area of the wooden tabletop MUST be completely clean, flat, and empty with warm natural daylight, leaving open space for product pouch compositing.
CRITICAL RULES: NO ONIONS, NO GARLIC."""
    )
]

def main():
    print(f"Starting execution of {len(TASKS)} image generations for Breakfast Category...")
    for idx, (slug, plate_name, prompt) in enumerate(TASKS, 1):
        dst = ROOT / 'pdp' / slug / 'plates' / f"{plate_name}.png"
        print(f"\n[{idx}/{len(TASKS)}] Generating {slug} -> {plate_name}.png ...")
        raw = generate_image(prompt)
        save_plate(raw, dst)
        time.sleep(2)

    print("\n--- Syncing Jain plates for Breakfast ---")
    # jain-poha <- kanda-poha
    for p in ['serving.png', 'hero.png', 'abroad.png']:
        src = ROOT / 'pdp' / 'kanda-poha' / 'plates' / p
        dst = ROOT / 'pdp' / 'jain-poha' / 'plates' / p
        shutil.copy2(src, dst)
        print(f"Copied kanda-poha/{p} -> jain-poha/{p}")

    # jain-upma <- upma
    for p in ['serving.png', 'hero.png', 'abroad.png']:
        src = ROOT / 'pdp' / 'upma' / 'plates' / p
        dst = ROOT / 'pdp' / 'jain-upma' / 'plates' / p
        shutil.copy2(src, dst)
        print(f"Copied upma/{p} -> jain-upma/{p}")

    print("\n--- Compositing WebP Galleries for All 6 Breakfast Products ---")
    breakfast_all = ['kanda-poha', 'jain-poha', 'upma', 'jain-upma', 'idli-sambar', 'mumbai-misal']
    for slug in breakfast_all:
        compose(slug)

    print("\nALL BREAKFAST DISHES GENERATED & COMPOSED SUCCESSFULLY!")

if __name__ == '__main__':
    main()

