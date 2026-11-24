"""Stage 1 of the cleanup task (read-only): writes audit/cleanup/inventory.csv and a by-folder summary.
Run from the project root:  python tools/cleanup-inventory.py
Columns: path, size, ext, modified, sha1, tracked, ignored."""
import csv, hashlib, os, subprocess, sys, time, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
OUT = os.path.join('audit', 'cleanup')
os.makedirs(OUT, exist_ok=True)
SKIP_DIRS = {'.git', 'node_modules'}

def git(*a):
    return subprocess.run(['git', *a], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout

tracked = set(git('-c', 'core.quotepath=off', 'ls-files').splitlines())

files = []
for dp, dn, fn in os.walk('.'):
    dn[:] = [d for d in dn if d not in SKIP_DIRS]
    for f in fn:
        p = os.path.join(dp, f)[2:].replace('\\', '/')
        files.append(p)

# ignored? ask git in one call
ign = set()
r = subprocess.run(['git', '-c', 'core.quotepath=off', 'check-ignore', '--stdin'], input='\n'.join(files), capture_output=True, text=True, encoding='utf-8', errors='replace')
ign = set(r.stdout.splitlines())

def sha1(p):
    h = hashlib.sha1()
    with open(p, 'rb') as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()

rows = []
for p in sorted(files):
    try:
        st = os.stat(p)
        rows.append([p, st.st_size, os.path.splitext(p)[1].lower(), time.strftime('%Y-%m-%d %H:%M', time.localtime(st.st_mtime)), sha1(p),
                     'yes' if p in tracked else 'no', 'yes' if p in ign else 'no'])
    except OSError as e:
        print('skip', p, e, file=sys.stderr)

with open(os.path.join(OUT, 'inventory.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['path', 'size', 'ext', 'modified', 'sha1', 'tracked', 'ignored']); w.writerows(rows)

top = collections.defaultdict(lambda: [0, 0])
ext = collections.defaultdict(lambda: [0, 0])
for r in rows:
    t = r[0].split('/')[0] if '/' in r[0] else '(root)'
    top[t][0] += 1; top[t][1] += r[1]
    ext[r[2] or '(none)'][0] += 1; ext[r[2] or '(none)'][1] += r[1]
print('files', len(rows), 'MB', round(sum(r[1] for r in rows) / 1048576, 1))
print('--- by top folder (files, MB)')
for k, v in sorted(top.items(), key=lambda x: -x[1][1]): print('%-22s %6d %9.1f' % (k, v[0], v[1] / 1048576))
print('--- by type (files, MB)')
for k, v in sorted(ext.items(), key=lambda x: -x[1][1])[:20]: print('%-10s %6d %9.1f' % (k, v[0], v[1] / 1048576))
dups = collections.defaultdict(list)
for r in rows:
    if r[1] > 0: dups[r[4]].append(r[0])
d = {k: v for k, v in dups.items() if len(v) > 1}
print('duplicate groups', len(d), 'redundant files', sum(len(v) - 1 for v in d.values()))
