import re, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

with open('pdp/pdp-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

lively_block_match = re.search(r'var LIVELY\s*=\s*\{([\s\S]*?)\n  \};\s*\n\s*// Helper', text)
if not lively_block_match:
    lively_block_match = re.search(r'var LIVELY\s*=\s*\{([\s\S]*?)\n  \};', text)

lively_text = lively_block_match.group(1) if lively_block_match else ""
lively_slugs = set(re.findall(r"^\s*'([a-z0-9-]+)':\s*\{", lively_text, re.MULTILINE))

with open('main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

items = re.findall(r"id:\s*['\"]([a-z0-9-]+)['\"],\s*title:\s*['\"][^'\"]+['\"],\s*category:\s*['\"]([^'\"]+)['\"]", main_js)

by_cat = {}
for pid, cat in items:
    by_cat.setdefault(cat, []).append(pid)

combos_dir = ROOT / 'pdp' / 'combos'
combos_done = set()
for c in by_cat.get('Combos', []):
    if (combos_dir / c / 'stage.webp').exists() and (combos_dir / c / 'gallery' / 'hero-1200.webp').exists():
        combos_done.add(c)

print("\n================== FULL MAGICMEALS STORE STATUS ==================")
total_prods = sum(len(s) for s in by_cat.values())
configured_single = sum(1 for cat, pids in by_cat.items() if cat != 'Combos' for p in pids if p in lively_slugs)
configured_combos = len(combos_done)
total_configured = configured_single + configured_combos
print(f"Total Products in Catalog: {total_prods} | Total Completed & Configured: {total_configured}/{total_prods} ({int(100*total_configured/total_prods)}%)")

for cat, pids in by_cat.items():
    if cat == 'Combos':
        done = [p for p in pids if p in combos_done]
        missing = [p for p in pids if p not in combos_done]
    else:
        done = [p for p in pids if p in lively_slugs]
        missing = [p for p in pids if p not in lively_slugs]
    pct = int(100 * len(done) / len(pids)) if pids else 0
    print(f"\n--- {cat.upper()} ({len(done)}/{len(pids)} - {pct}%) ---")
    if done:
        print(f"  [DONE] ({len(done)} items)")
    if missing:
        print(f"  [PENDING] ({len(missing)}): {', '.join(missing)}")
