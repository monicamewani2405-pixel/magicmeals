"""Audit of the cooking videos behind the combo cards. Run from the project root: python tools/combo-video-audit.py
1. every product id in videos/product-videos.js: its source file (data/cooking-video-map.csv) must match the product name (fuzzy) and the Jain flag;
2. every Shopify video / poster URL must answer 200;
3. the combos that still lack a video for a pouch (the list to give the client);
4. no video file is tracked by git."""
import csv, difflib, json, os, re, subprocess, sys, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
def js_obj(path, var):
    s = open(path, encoding='utf-8').read(); i = s.index('{', s.index(var)); d = 0
    for j in range(i, len(s)):
        d += (s[j] == '{') - (s[j] == '}')
        if d == 0: return json.loads(s[i:j + 1])
vids = js_obj('videos/product-videos.js', 'window.PRODUCT_VIDEOS')
combos = js_obj('pdp/combos/combo-gallery.js', 'window.COMBO_PDP')
main = open('main.js', encoding='utf-8').read()
prods = {}
for m in re.finditer(r"id: '([^']+)',\s*title: '([^']+)',\s*category: '([^']+)'(.*?)\n      \}", main, re.S):
    prods[m.group(1)] = {'title': m.group(2), 'cat': m.group(3), 'jain': 'jain: true' in m.group(4)}
fmap = {r['slug']: r['file'] for r in csv.DictReader(open('data/cooking-video-map.csv', encoding='utf-8'))}
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())

print('--- 1. video file vs product name')
bad = 0
for slug in sorted(vids):
    f = fmap.get(slug, '(no row in cooking-video-map.csv)')
    fname = os.path.splitext(os.path.basename(f))[0]
    folder = f.split('/')[0]
    r = difflib.SequenceMatcher(None, norm(fname), norm(slug)).ratio()
    p = prods.get(slug, {})
    flags = []
    if slug not in prods: flags.append('product id not in main.js')
    if r < 0.55 and norm(slug)[:5] not in norm(fname): flags.append('name differs')
    if slug.startswith('jain-') and folder != 'JAIN': flags.append('Jain product with a REGULAR file')
    if not slug.startswith('jain-') and folder == 'JAIN': flags.append('regular product with a JAIN file')
    if p.get('jain') and not slug.startswith('jain-') and folder == 'REGULAR': flags.append('Jain-flagged product using the regular video (approved earlier)')
    print(f'{slug:28} <- {f:50} {"; ".join(flags) or "ok"}')
    bad += bool([x for x in flags if 'approved' not in x])
print('mismatches needing a look:', bad)

print('--- 2. Shopify links')
dead = 0
for slug, e in sorted(vids.items()):
    for src in e['sources']:
        try:
            req = urllib.request.Request(src['u'], method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
            code = urllib.request.urlopen(req, timeout=30).status
        except Exception as ex:
            code = getattr(ex, 'code', str(ex)[:40])
        if code != 200: dead += 1; print('  NOT 200:', slug, src['h'], code)
    if not os.path.exists(e['poster']): dead += 1; print('  poster file missing:', slug, e['poster'])
print('dead links / missing posters:', dead)

print('--- 3. combos still missing a pouch video')
need = {}
for cid, c in combos.items():
    d = list(dict.fromkeys(c['dishes']))
    miss = [x for x in d if x not in vids]
    if miss:
        for x in miss: need.setdefault(x, []).append(cid)
        print(f'{cid:70} has {len(d) - len(miss)}/{len(d)}  missing: {", ".join(miss)}')
print('--- videos the client still has to supply (dish -> number of combos it unblocks)')
for x, l in sorted(need.items(), key=lambda t: -len(t[1])): print(f'  {x:22} {len(l)} combo(s)')
zero = [cid for cid, c in combos.items() if not any(x in vids for x in c['dishes'])]
print('combos with NO cooking video at all:', zero)

print('--- 4. tracked video files')
out = subprocess.run(['git', 'ls-files'], capture_output=True, text=True, encoding='utf-8').stdout.splitlines()
print([f for f in out if f.lower().endswith(('.mp4', '.mov', '.webm', '.m4v'))] or 'none')
