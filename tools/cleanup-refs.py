"""Stage 1 of the cleanup task (read-only): finds every file path that code mentions.
Writes audit/cleanup/static-refs.csv, dynamic-patterns.csv and prints a summary.   Run from the project root: python tools/cleanup-refs.py
Kinds: site (html/css/js/json served to browsers), api (serverless), tool (tools/*), script (loose root .py/.md), data (csv/json data files)."""
import csv, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
OUT = os.path.join('audit', 'cleanup'); os.makedirs(OUT, exist_ok=True)

EXT = r'(?:png|jpe?g|webp|avif|svg|gif|ico|mp4|mov|m4v|webm|pdf|woff2?|ttf|otf|css|js|mjs|json|csv|html|txt|xml|webmanifest)'
SKIP_TOP = {'.git', 'node_modules', '_archive', '_old-images', '_old-backs', 'scratch', 'incoming-backs', 'incoming-videos', 'video-out', '.vercel'}
SKIP_PREFIX = ('audit/cleanup/', 'audit/tmp/', 'razorpay-zones/', 'vendor/')
TEXT_EXT = {'.html', '.css', '.js', '.mjs', '.json', '.py', '.md', '.csv', '.txt', '.v2', '.nopouch'}

# real files, for resolving and case checks
real = {}
for dp, dn, fn in os.walk('.'):
    dn[:] = [d for d in dn if d not in {'.git', 'node_modules'}]
    for f in fn:
        p = os.path.join(dp, f)[2:].replace('\\', '/')
        real[p.lower()] = p
realset = set(real.values())

def kind_of(p):
    top = p.split('/')[0]
    if top == 'api': return 'api'
    if top == 'tools': return 'tool'
    if top == 'audit': return 'audit'
    if p.endswith(('.py', '.md')) or top.startswith('TASK'): return 'script'
    if top == 'data': return 'data'
    return 'site'

QUOTED = re.compile(r'''(["'`])((?:(?!\1)[^\n\\]|\\.){1,300}?\.''' + EXT + r'''(?:[?#][^"'`\n]*)?)\1''', re.I)
URLFN = re.compile(r'url\(\s*([^)\n]+?)\s*\)', re.I)
ATTR = re.compile(r'''(?:src|href|poster|content|data-[\w-]+)\s*=\s*([^\s"'>]+\.''' + EXT + r''')''', re.I)

def split_candidates(raw):
    # srcset-like: "a.webp 800w, b.webp 1200w"
    out = []
    for part in re.split(r',\s+(?=[^\s,])', raw):
        part = part.strip().split(' ')[0] if re.search(r'\s\d+(w|x)\b', part) else part.strip()
        out.append(part)
    return out or [raw]

def resolve(src, ref):
    if re.match(r'^(https?:|data:|mailto:|tel:|//|blob:|#)', ref): return None, 'external'
    r = ref.split('#')[0].split('?')[0].replace('\\', '/')
    if not r: return None, 'empty'
    if '${' in r or '+' in r and re.search(r'["\']\s*\+', ref): return None, 'dynamic'
    from urllib.parse import unquote
    r = unquote(r)
    cands = []
    if r.startswith('/'): cands.append(r.lstrip('/'))
    else:
        base = os.path.dirname(src)
        cands.append(os.path.normpath(os.path.join(base, r)).replace('\\', '/'))
        cands.append(os.path.normpath(r).replace('\\', '/'))
    for c in cands:
        if c in realset: return c, 'ok'
    for c in cands:
        if c.lower() in real: return real[c.lower()], 'CASE-MISMATCH'
    return cands[0], 'missing'

rows, dyn = [], []
files = []
for dp, dn, fn in os.walk('.'):
    dn[:] = [d for d in dn if not (dp == '.' and d in SKIP_TOP)]
    for f in fn:
        p = os.path.join(dp, f)[2:].replace('\\', '/')
        if p.startswith(SKIP_PREFIX): continue
        if os.path.splitext(f)[1].lower() in TEXT_EXT: files.append(p)

for p in sorted(files):
    try:
        text = open(p, encoding='utf-8', errors='replace').read()
    except OSError:
        continue
    if len(text) > 4_000_000: continue
    kind = kind_of(p)
    lines = text.split('\n')
    for ln, line in enumerate(lines, 1):
        if len(line) > 20000: line = line[:20000]
        seen = set()
        for m in QUOTED.finditer(line):
            seen.add(m.group(2))
        for m in URLFN.finditer(line):
            seen.add(m.group(1).strip('"\''))
        for m in ATTR.finditer(line):
            seen.add(m.group(1))
        for raw in seen:
            if '${' in raw:
                dyn.append([p, ln, kind, raw[:200]]); continue
            if p.endswith(('.json', '.csv')) and len(raw) > 250: continue
            for cand in split_candidates(raw):
                tgt, st = resolve(p, cand)
                if st in ('external', 'empty'): continue
                if st == 'dynamic': dyn.append([p, ln, kind, raw[:200]]); continue
                rows.append([p, ln, kind, cand[:200], tgt, st])

with open(os.path.join(OUT, 'static-refs.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['source', 'line', 'kind', 'raw', 'resolved', 'status']); w.writerows(rows)
with open(os.path.join(OUT, 'dynamic-patterns.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['source', 'line', 'kind', 'pattern']); w.writerows(dyn)

st = collections.Counter(r[5] for r in rows)
print('refs', len(rows), dict(st), '| dynamic patterns', len(dyn))
used = {r[4] for r in rows if r[5] in ('ok', 'CASE-MISMATCH')}
print('distinct files referenced', len(used))
site_used = {r[4] for r in rows if r[5] in ('ok', 'CASE-MISMATCH') and r[2] in ('site', 'api', 'data')}
print('referenced by site/api/data code', len(site_used))
print('--- broken (missing) by kind/source, first 40')
n = 0
for r in rows:
    if r[5] == 'missing' and r[2] in ('site', 'api', 'data'):
        print(r[0], r[1], r[3]); n += 1
        if n >= 40: break
print('--- case mismatches (site/api/data)')
for r in rows:
    if r[5] == 'CASE-MISMATCH' and r[2] in ('site', 'api', 'data'): print(r[0], r[1], r[3], '->', r[4])
