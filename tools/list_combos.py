import re, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
main_js = (ROOT / 'main.js').read_text(encoding='utf-8')

combos = re.findall(r"id:\s*'([a-z0-9-]+)',\s*title:\s*'((?:[^'\\]|\\.)*)',\s*category:\s*'Combos'", main_js)

print(f"Total combos: {len(combos)}")
by_type = {}
for cid, title in combos:
    clean_title = title.replace("\\'", "'")
    m = re.search(r'\(([^)]+)\)', clean_title)
    items = m.group(1).split('+') if m else [clean_title]
    items = [i.strip() for i in items]
    is_jain = cid.startswith('jain-')
    base_cid = cid[5:] if is_jain else cid
    print(f"[{cid}] (Jain={is_jain}): {items}")

