"""Check the product data against the client's sheet (data/kcal-source.csv).

    python tools/check-data.py

Matches each sheet row to a product in main.js (by the CURRENT or NEW name, normalised; Jain rows to jain-* products), then exits 1 if a
matched product's display name or kcal differs. Also prints unmatched rows, unmatched products and the name collision, and checks the
other phase-1 facts (ingredients, Jain flags, Masala Khichdi water, one shelf life).
Rows that would give two products the same name (Fried Rice twice) are NOT renamed: their names are skipped, their kcal is still checked.
"""
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SYN = {'sambhar': 'sambar', 'rava': 'rawa', 'makhani': 'makhni', 'chinses': 'chinese', 'chhole': 'chole', 'khichadi': 'khichdi',
       'fragnant': 'fragrant', 'zeaty': 'zesty'}


def norm(s):
    s = s.lower().replace('&', ' and ').replace('.', ' ')
    return ' '.join(SYN.get(w, w) for w in re.sub(r'[^a-z0-9 ]', ' ', s).split())


def title_case(s):
    s = s.replace('.', ' ')
    return ' '.join(w if w == '&' else w.capitalize() for w in s.split())


def node(js):
    r = subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=ROOT, encoding='utf-8')
    if r.returncode:
        sys.exit('node failed: ' + r.stderr)
    return json.loads(r.stdout)


LOAD_PRODUCTS = r"""
const fs=require('fs');const src=fs.readFileSync('main.js','utf8').split('\n');
const a=src.findIndex(l=>/const PRODUCTS = \[/.test(l));
const b=src.findIndex((l,i)=>i>a&&/^    \];/.test(l));
const P=eval(src.slice(a,b+1).join('\n').replace(/^\s*const PRODUCTS =/,'var PRODUCTS =')+';PRODUCTS');
console.log(JSON.stringify(P.map(p=>({id:p.id,title:p.title,category:p.category,jain:p.jain,calories:p.calories,kcal:p.kcal}))));
"""


def load_window(path, name):
    return node("global.window={};eval(require('fs').readFileSync(%s,'utf8'));console.log(JSON.stringify(window.%s))" % (json.dumps(path), name))


def main():
    prods = node(LOAD_PRODUCTS)
    rows = list(csv.DictReader(open(ROOT / 'data' / 'kcal-source.csv', encoding='utf-8')))
    singles = [p for p in prods if p['category'] != 'Combos']
    fails, used, unmatched_rows = [], {}, []

    def tok(s):
        return set(norm(s).split()) - {'and'}

    for n, r in enumerate(rows, 1):
        want_jain = r['current_name'].upper().startswith('JAIN ')
        pool = [p for p in singles if p['id'].startswith('jain-') == want_jain and p['id'] not in used]
        cn, nn = norm(r['current_name']), norm(r['new_name'])
        hit = [p for p in pool if norm(p['title']) == cn] or [p for p in pool if norm(p['title']) == nn] \
            or [p for p in pool if tok(r['current_name']) <= tok(p['title'])]
        if len(hit) == 1:
            used[hit[0]['id']] = (n, r)
        else:
            unmatched_rows.append((n, r['current_name'], 'ambiguous' if hit else 'no match'))

    # name collision: two rows that would give the same display name
    names = {}
    for pid, (n, r) in used.items():
        names.setdefault(norm(title_case(r['new_name'])), []).append(pid)
    collisions = {k: v for k, v in names.items() if len(v) > 1}
    skip_name = {pid for v in collisions.values() for pid in v}

    print('MAPPING (row | product id | display name now | new name from sheet | kcal in main.js | kcal in sheet)')
    for pid, (n, r) in sorted(used.items(), key=lambda kv: kv[1][0]):
        p = next(x for x in prods if x['id'] == pid)
        want = title_case(r['new_name'])
        print('  %2d | %-26s | %-34s | %-26s | %-9s | %s' % (n, pid, p['title'], want + ('  (COLLISION, not applied)' if pid in skip_name else ''), p['calories'], r['kcal']))
        if pid not in skip_name and norm(p['title']) != norm(want):
            fails.append('name   %s: "%s" should be "%s"' % (pid, p['title'], want))
        if pid not in skip_name and p['title'] != want and norm(p['title']) == norm(want):
            pass  # spelling-only difference accepted (Makhni / Makhani), see report
        if p['calories'] != '%s kcal' % r['kcal'] or p.get('kcal') != int(r['kcal']):
            fails.append('kcal   %s: main.js has %s / kcal=%s, sheet says %s' % (pid, p['calories'], p.get('kcal'), r['kcal']))

    print('\nUNMATCHED ROWS:', unmatched_rows or 'none')
    print('PRODUCTS WITH NO ROW (left unchanged):', [p['id'] for p in singles if p['id'] not in used])
    print('COMBOS (not in the sheet, unchanged):', sum(1 for p in prods if p['category'] == 'Combos'))
    print('NAME COLLISIONS (left on their current names, client to decide):', collisions or 'none')

    # kcal printed on the packs (tools/sync-nutrition.py NUTRITION) against the sheet: the artwork is not changed, the client must decide
    import importlib.util
    sp = importlib.util.spec_from_file_location('sn', ROOT / 'tools' / 'sync-nutrition.py')
    sn = importlib.util.module_from_spec(sp)
    sp.loader.exec_module(sn)
    gaps = ['%s: pack %s, sheet %s' % (pid, sn.NUTRITION[pid][0], r['kcal']) for pid, (n, r) in sorted(used.items(), key=lambda kv: kv[1][0])
            if pid in sn.NUTRITION and sn.NUTRITION[pid][0] != int(r['kcal'])]
    print('\nPACK ARTWORK vs SHEET (%d differ; artwork not edited):' % len(gaps))
    for g in gaps:
        print('  ' + g)

    # ---- other phase-1 facts
    by = {p['id']: p for p in prods}
    ing = load_window('product-ingredients.js', 'PRODUCT_INGREDIENTS')
    desc = load_window('product-descriptions.js', 'PRODUCT_DESCRIPTIONS')
    low = lambda i: str(ing.get(i, '')).lower()
    water_in = lambda i: bool(re.search(r'(^|, )water\s*$', low(i)) or re.search(r'(^|, )water,', low(i)))
    if water_in('dal-khichdi'):
        fails.append('ingredients: dal-khichdi still lists Water')
    if re.search(r'(^|, )butter(,|$)', low('rajma-masala')) or 'clarified butter' not in low('rajma-masala'):
        fails.append('ingredients: rajma-masala should list Clarified Butter but not plain Butter')
    for i in ('idli-sambar', 'gujarati-dal'):
        if by[i]['jain']:
            fails.append('jain: %s is still flagged Jain' % i)
    html = lambda i: re.sub(r'<[^>]+>', ' ', desc.get(i, {}).get('html', ''))
    if not re.search(r'195\s?ml', html('masala-khichdi-kadhi')) or '167' in html('masala-khichdi-kadhi'):
        fails.append('water: masala-khichdi-kadhi should say 195 ml and not 167')
    shelf = {v for d in desc.values() for k, v in d.get('specs', []) if k == 'Shelf Life'}
    if shelf - {'12 Months'}:
        fails.append('shelf life: descriptions still have %s' % sorted(shelf))
    main_js = (ROOT / 'main.js').read_text(encoding='utf-8')
    if "'9 Months'" in main_js or 'SHELF_LIFE' not in main_js:
        fails.append('shelf life: main.js should use one SHELF_LIFE constant')
    if '9 months' in (ROOT / 'index.html').read_text(encoding='utf-8').lower():
        fails.append('shelf life: index.html still says 9 months')

    print('\nJAIN FILTER SHOWS (single dishes flagged Jain):', sorted(p['id'] for p in singles if p['jain']))
    print('Jain Dal Khichdi lists Water:', water_in('jain-dal-khichdi'),
          '| Jain Masala Khichdi Kadhi water text:', re.findall(r'\d+\s?ml', html('jain-masala-khichdi-kadhi')))

    print()
    if fails:
        print('FAIL (%d)' % len(fails))
        for f in fails:
            print('  ' + f)
        sys.exit(1)
    print('ALL CHECKS PASS')


if __name__ == '__main__':
    main()
