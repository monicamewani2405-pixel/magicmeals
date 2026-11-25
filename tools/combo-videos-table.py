"""Builds audit/combo-videos-table.csv: each combo, its component dishes (pouch-art ids from pdp/combos/combo-gallery.js) and which have a cooking video."""
import csv, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
def js_obj(path, var):
    s = open(path, encoding='utf-8').read()
    i = s.index('{', s.index(var)); depth = 0
    for j in range(i, len(s)):
        depth += (s[j] == '{') - (s[j] == '}')
        if depth == 0: return json.loads(s[i:j + 1])
vids = js_obj('videos/product-videos.js', 'window.PRODUCT_VIDEOS')
combo = js_obj('pdp/combos/combo-gallery.js', 'window.COMBO_PDP')
main = open('main.js', encoding='utf-8').read()
combos = re.findall(r"id: '([^']+)',\s*title: '([^']+)',\s*category: 'Combos'", main)
prods = dict(re.findall(r"id: '([^']+)',\s*title: '([^']+)'", main))
rows = []
for cid, title in combos:
    dishes = (combo.get(cid) or {}).get('dishes') or []
    uniq = list(dict.fromkeys(dishes))
    have = [d for d in uniq if d in vids]
    jain_combo = cid.startswith('jain-')
    rows.append([cid, title, ' | '.join(uniq) or '(no gallery entry)', ' | '.join(have), len(uniq), len(have), 'jain' if jain_combo else 'regular',
                 ' | '.join(d for d in uniq if d not in prods)])
os.makedirs('audit', exist_ok=True)
with open('audit/combo-videos-table.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['combo', 'title', 'components', 'with_video', 'n_components', 'n_with_video', 'type', 'unmatched_components']); w.writerows(rows)
import collections
print('combos', len(rows), '| by n_with_video', dict(collections.Counter(r[5] for r in rows)), '| jain', sum(r[6] == 'jain' for r in rows))
print('no gallery entry:', [r[0] for r in rows if r[4] == 0])
print('unmatched:', [(r[0], r[7]) for r in rows if r[7]])
print('--- regular combos with 3 components all with video:')
for r in rows:
    if r[6] == 'regular' and r[4] == 3 and r[5] == 3: print(' ', r[0], '|', r[2])
print('--- jain combos and their components with video:')
for r in rows:
    if r[6] == 'jain': print(' ', r[0], '|', r[2], '| videos:', r[3] or '-')
print('--- videos available for:', sorted(vids))
