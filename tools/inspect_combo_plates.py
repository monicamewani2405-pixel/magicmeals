import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
main_js = (ROOT / 'main.js').read_text(encoding='utf-8')
combos = re.findall(r"id:\s*'([a-z0-9-]+)',\s*title:\s*'((?:[^'\\]|\\.)*)',\s*category:\s*'Combos'", main_js)

DISH = {
    'paneer butter masala': 'paneer-butter-masala', 'jeera rice': 'jeera-rice', 'rawa sheera': 'rawa-sheera', 'tawa pulao': 'tawa-pulao',
    'veg biryani': 'veg-biryani', 'rajma masala': 'rajma-masala', 'fried rice with manchurian gravy': 'fried-rice-manchurian',
    'gajar halwa': 'gajar-halwa', 'veg makhanwala': 'veg-makhanwala', 'pav bhaji': 'pav-bhaji', 'paneer bhurji': 'paneer-bhurji',
    'aam ras': 'aam-ras', 'pind ke chole': 'pind-ke-chhole', 'tomato soup': 'tomato-soup', 'dal makhani': 'dal-makhani',
    'dal fry': 'dal-fry', 'idli sambar': 'idli-sambar', 'upma': 'upma', 'kanda poha': 'kanda-poha', 'mumbai misal': 'mumbai-misal',
    'sweet corn soup': 'sweet-corn-soup', 'mexican rice': 'mexican-rice', 'dal khichdi': 'dal-khichdi',
    'hot & sour soup': 'hot-and-sour-soup', 'manchurian fried rice': 'fried-rice-manchurian', 'schezwan rice': 'schezwan-rice', 'poha': 'kanda-poha', 'moong masala': 'moong-masala'
}
JAIN_POUCH = {'pav-bhaji', 'paneer-bhurji', 'veg-biryani', 'schezwan-rice', 'dal-makhani', 'upma', 'paneer-butter-masala', 'kanda-poha', 'pind-ke-chhole', 'veg-makhanwala', 'dal-khichdi', 'rajma-masala'}

def jain(d):
    return 'jain-poha' if d == 'kanda-poha' else 'jain-' + d if d in JAIN_POUCH else d

combo_dishes = {}
missing = []
for cid, title in combos:
    clean_title = title.replace("\\'", "'")
    m = re.search(r'\(([^)]+)\)', clean_title)
    raw_items = m.group(1).split('+') if m else [clean_title]
    dishes = [DISH[i.strip().lower()] for i in raw_items]
    if cid.startswith('jain-'):
        dishes = [jain(d) for d in dishes]
    combo_dishes[cid] = dishes
    for d in dishes:
        p = ROOT / 'pdp' / d / 'plates' / 'serving.png'
        if not p.exists():
            missing.append((d, str(p)))

print(f"Total combos: {len(combo_dishes)}")
print(f"Missing serving plates: {len(missing)}")
if missing:
    print("Missing details:", set(missing))
else:
    print("ALL individual product serving plates exist!")
