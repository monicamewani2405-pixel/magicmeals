"""Stage 1 of the cleanup task (read-only): classifies every file and writes the plans.
Needs: audit/cleanup/inventory.csv, static-refs.csv, runtime-before-requests.csv.   Run: python tools/cleanup-classify.py
Writes: classification.csv, archive-plan.csv, move-plan.csv, unsure.csv, duplicates.csv in audit/cleanup/ and prints the summary.
Classes: KEEP-LIVE (requested at runtime, referenced by site/api/data code, or inside a directory that JS builds paths into),
         KEEP-SOURCE (tool input / source of generated files), KEEP-INFRA (config, docs, git, instructions), ARCHIVE, UNSURE."""
import collections, csv, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
D = os.path.join('audit', 'cleanup')
inv = list(csv.DictReader(open(f'{D}/inventory.csv', encoding='utf-8')))
refs = list(csv.DictReader(open(f'{D}/static-refs.csv', encoding='utf-8')))
rt = list(csv.DictReader(open(f'{D}/runtime-before-requests.csv', encoding='utf-8')))

runtime_ok = {r['path'] for r in rt if r['status'].startswith('2') or r['status'] == '304'}
static_live = {r['resolved'] for r in refs if r['status'] in ('ok', 'CASE-MISMATCH') and r['kind'] in ('site', 'api', 'data')}
tool_in = {r['resolved'] for r in refs if r['status'] in ('ok', 'CASE-MISMATCH') and r['kind'] in ('tool',)}
script_in = {r['resolved'] for r in refs if r['status'] in ('ok', 'CASE-MISMATCH') and r['kind'] in ('script',)}

# directories that JavaScript builds paths into (every file under them counts as USED): see dynamic-patterns.csv and a read of the build sites
DYN_DIRS = ('pouch-art/tex/', 'pouch-art/cards/', 'pdp/combos/', 'assets/hero/', 'assets/combos/', 'policies/', 'scenes/', 'videos/', 'heroes/',
            'brochure/', 'api/', 'data/', 'vendor/', 'how-it-works/', 'pdp/shared/ingredients/')
PDP_LIVE = re.compile(r'^pdp/[^/]+/gallery/')
PROTECTED_TOPS = {'heroes', 'scenes', 'pdp', 'pouch-art', 'videos', 'brochure', 'policies', 'api', 'data', 'tools', 'audit', 'incoming-backs',
                  'incoming-videos', 'video-out', '_old-images', '_old-backs'}
INFRA_ROOT = {'.gitignore', '.vercelignore', 'vercel.json', 'package.json', 'package-lock.json', '.env.example', '.env.local', 'index.html', 'CLAUDE.md'}

def classify(p):
    top = p.split('/')[0] if '/' in p else ''
    name = os.path.basename(p)
    if p in runtime_ok: return 'KEEP-LIVE', 'requested at runtime'
    if p in static_live: return 'KEEP-LIVE', 'referenced by site code'
    if p.startswith(DYN_DIRS) or PDP_LIVE.match(p): return 'KEEP-LIVE', 'inside a directory JS builds paths into'
    if not top:
        if name in INFRA_ROOT or name.startswith('TASK-') or name == 'VERIFY-fixes.md': return 'KEEP-INFRA', 'config / instructions'
        if name.startswith('._'): return 'ARCHIVE', 'macOS metadata junk'
        if name.endswith('.js') or name.endswith('.css'): return 'UNSURE', 'root code file not requested in the crawl'
        if name.endswith(('.py',)): return 'ARCHIVE', 'old patch / test script in the root (not in tools/)'
        if name.endswith(('.png', '.jpg', '.jpeg', '.webp')):
            if p in tool_in or p in script_in: return 'KEEP-SOURCE', 'input of a tool or script'
            return 'ARCHIVE', 'loose picture: not referenced, not requested'
        if name.endswith(('.csv',)): return 'UNSURE', 'root data file (my Razorpay exports?)'
        if name.endswith(('.html',)): return 'ARCHIVE', 'extra HTML page, not the site entry'
        if name.endswith(('.txt', '.md', '.pdf')): return 'UNSURE', 'document / text file'
        return 'UNSURE', 'other root file'
    if top == 'scratch': return 'ARCHIVE', 'scratch dump (gitignored)'
    if top in PROTECTED_TOPS:
        if top in ('tools', 'audit', 'api', 'data'): return 'KEEP-INFRA', 'tool / report / API / data folder'
        if top in ('incoming-backs', 'incoming-videos', 'video-out', '_old-images', '_old-backs'): return 'KEEP-SOURCE', 'working or source folder (protected)'
        if p in tool_in: return 'KEEP-SOURCE', 'input of a tool'
        ext = os.path.splitext(p)[1].lower()
        if ext in ('.pyc', '.log', '.bak'): return 'ARCHIVE', 'generated / temporary file'
        return 'UNSURE', 'inside a protected folder, not requested in the crawl'
    # assets/ and other free folders
    if top == 'assets':
        if p in tool_in or p in script_in: return 'KEEP-SOURCE', 'input of a tool or script'
        return 'ARCHIVE', 'in assets/, not referenced and not requested'
    if p in tool_in: return 'KEEP-SOURCE', 'input of a tool'
    return 'UNSURE', 'not classified'

rows = []
for x in inv:
    c, why = classify(x['path'])
    rows.append({**x, 'class': c, 'reason': why})

with open(f'{D}/classification.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)

arch = [r for r in rows if r['class'] == 'ARCHIVE']
uns = [r for r in rows if r['class'] == 'UNSURE']
with open(f'{D}/archive-plan.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['path', 'size', 'tracked', 'reason', 'confidence'])
    for r in arch: w.writerow([r['path'], r['size'], r['tracked'], r['reason'], 'high' if r['tracked'] == 'yes' or r['path'].startswith('scratch/') else 'medium'])
with open(f'{D}/unsure.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['path', 'size', 'reason']); [w.writerow([r['path'], r['size'], r['reason']]) for r in uns]

# duplicates (exact, by SHA-1)
g = collections.defaultdict(list)
for r in rows:
    if int(r['size']) > 0: g[r['sha1']].append(r)
with open(f'{D}/duplicates.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['sha1', 'size', 'copies', 'paths'])
    for h, l in g.items():
        if len(l) > 1: w.writerow([h, l[0]['size'], len(l), ' | '.join(x['path'] for x in l)])

cnt = collections.Counter(r['class'] for r in rows)
mb = collections.defaultdict(float)
for r in rows: mb[r['class']] += int(r['size']) / 1048576
print({k: (cnt[k], round(mb[k], 1)) for k in cnt})
print('ARCHIVE by top folder:')
c2 = collections.Counter((r['path'].split('/')[0] if '/' in r['path'] else '(root)') for r in arch)
print(c2.most_common(10))
print('UNSURE by top folder:', collections.Counter((r['path'].split('/')[0] if '/' in r['path'] else '(root)') for r in uns).most_common(10))
