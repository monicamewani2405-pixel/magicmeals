"""Pictures for the Shopify theme: which files the site uses, upload them to Shopify Files, keep the path -> Shopify address map.

    python tools/theme-media.py list                 work out the files the site uses -> data/theme-media.json (a list) and print the size
    python tools/theme-media.py upload [--limit N]   upload what is not uploaded yet to Shopify Files (resumable) -> data/theme-media-map.json
    python tools/theme-media.py verify               check every address in the map answers 200

Why: a Shopify theme zip is limited to about 50 MB, the site's pictures are ~300 MB, so they live in Shopify Files (served by Shopify's own CDN).
Shopify Files has no folders: the site path 'pdp/rajma-masala/gallery/hero-800.webp' is stored as 'pdp__rajma-masala__gallery__hero-800.webp'.
That naming is what the theme's MMA() helper rebuilds at run time for paths the code assembles itself.
Needs .env.local (SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET, scope write_files); tokens are never printed or written."""
import csv, json, mimetypes, re, sys, time, urllib.error, urllib.parse, urllib.request, importlib.util
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIST_F = ROOT / 'data' / 'theme-media.json'
MAP_F = ROOT / 'data' / 'theme-media-map.json'
MEDIA = ('.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.pdf', '.woff2', '.woff', '.ttf')
# directories the JavaScript builds paths into (every file there counts as used), minus the unused source folders
DIRS = [r'^pdp/[^/]+/gallery/', r'^pdp/combos/[^/]+/(gallery/|stage)', r'^pdp/shared/ingredients/', r'^pouch-art/tex/', r'^pouch-art/cards/', r'^scenes/', r'^how-it-works/',
        r'^videos/posters/', r'^assets/(hero|combos|brochure)/', r'^heroes/']
SKIP_TOP = {'_old-images', '_old-backs', 'incoming-backs', 'incoming-videos', 'video-out', 'scratch', 'audit', 'tools', '.git', 'node_modules', '_archive', 'razorpay-zones'}


def flat(path):
    return re.sub(r'[^a-z0-9._-]+', '-', path.replace('/', '__').lower().replace('.jpeg', '.jpg')).strip('-')   # Shopify itself turns .jpeg into .jpg


def used_files():
    refs = list(csv.DictReader(open(ROOT / 'audit' / 'cleanup' / 'static-refs.csv', encoding='utf-8')))
    static = {r['resolved'] for r in refs if r['status'] in ('ok', 'CASE-MISMATCH') and r['kind'] in ('site', 'api', 'data')}
    out = set()
    for p in ROOT.rglob('*'):
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel.split('/')[0] in SKIP_TOP or not rel.lower().endswith(MEDIA) or '/._' in '/' + rel or '_old' in rel:
            continue
        if rel in static or any(re.match(d, rel) for d in DIRS):
            out.add(rel)
    return sorted(out)


def load_admin():
    spec = importlib.util.spec_from_file_location('ucv', ROOT / 'tools' / 'upload-cooking-videos.py')
    argv = sys.argv; sys.argv = ['x']
    u = importlib.util.module_from_spec(spec); spec.loader.exec_module(u)
    sys.argv = argv
    return u


def put(target, path):
    data = (ROOT / path).read_bytes()
    boundary = 'b' + str(abs(hash(path)))
    parts = []
    for p in target['parameters']:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{p["name"]}"\r\n\r\n{p["value"]}\r\n'.encode())
    ctype = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{flat(path)}"\r\nContent-Type: {ctype}\r\n\r\n'.encode())
    parts.append(data); parts.append(f'\r\n--{boundary}--\r\n'.encode())
    req = urllib.request.Request(target['url'], data=b''.join(parts), headers={'Content-Type': 'multipart/form-data; boundary=' + boundary})
    for attempt in range(4):
        try:
            urllib.request.urlopen(req, timeout=300).read(); return True
        except urllib.error.HTTPError as ex:
            if ex.code in (429, 500, 502, 503) and attempt < 3: time.sleep(3 + attempt * 4); continue
            print('   upload failed', path, ex.code); return False
        except Exception as ex:
            if attempt < 3: time.sleep(3); continue
            print('   upload failed', path, str(ex)[:60]); return False


def is_image(path):
    return path.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif'))


def upload(limit=None):
    files = json.loads(LIST_F.read_text(encoding='utf-8'))
    mp = json.loads(MAP_F.read_text(encoding='utf-8')) if MAP_F.exists() else {}
    todo = [f for f in files if f not in mp][:limit]
    print(f'{len(files)} files, {len(mp)} already uploaded, uploading {len(todo)}')
    if not todo: return
    u = load_admin(); ad = u.Admin()
    BATCH = 25
    for i in range(0, len(todo), BATCH):
        batch = todo[i:i + BATCH]
        inputs = [{'resource': 'IMAGE' if is_image(p) else 'FILE', 'filename': flat(p), 'mimeType': mimetypes.guess_type(p)[0] or 'application/octet-stream',
                   'httpMethod': 'POST', 'fileSize': str((ROOT / p).stat().st_size)} for p in batch]
        st = ad.gql('mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){ stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ message } } }', {'i': inputs})['stagedUploadsCreate']
        if st['userErrors']:
            raise SystemExit(f'staged upload refused: {st["userErrors"]}')
        with ThreadPoolExecutor(6) as ex:
            ok = list(ex.map(lambda a: put(a[0], a[1]), zip(st['stagedTargets'], batch)))
        good = [(p, t) for (p, t), k in zip(zip(batch, st['stagedTargets']), ok) if k]
        if not good: continue
        r = ad.gql('mutation($f:[FileCreateInput!]!){ fileCreate(files:$f){ files{ id } userErrors{ field message } } }',
                   {'f': [{'originalSource': t['resourceUrl'], 'contentType': 'IMAGE' if is_image(p) else 'FILE', 'filename': flat(p)} for p, t in good]})['fileCreate']
        if r['userErrors']:
            print('   fileCreate problems:', r['userErrors'][:3])
        for (p, t), f in zip(good, r['files'] or []):
            mp[p] = {'id': f['id'], 'name': flat(p)}
        MAP_F.write_text(json.dumps(mp, indent=0), encoding='utf-8')
        print(f'  {min(i + BATCH, len(todo))}/{len(todo)}'); sys.stdout.flush()
    resolve(ad)


def resolve(ad=None):
    """Read the final Shopify address of every uploaded file (files finish processing a little after the upload)."""
    mp = json.loads(MAP_F.read_text(encoding='utf-8'))
    ad = ad or load_admin().Admin()
    pending = [p for p, v in mp.items() if 'url' not in v]
    for attempt in range(40):
        for i in range(0, len(pending), 100):
            ids = [mp[p]['id'] for p in pending[i:i + 100]]
            d = ad.gql('query($ids:[ID!]!){ nodes(ids:$ids){ ... on MediaImage { id fileStatus image{ url } } ... on GenericFile { id fileStatus url } } }', {'ids': ids})['nodes']
            for p, n in zip(pending[i:i + 100], d):
                if n and n.get('fileStatus') == 'READY':
                    mp[p]['url'] = (n.get('image') or {}).get('url') or n.get('url')
                elif n and n.get('fileStatus') == 'FAILED':
                    mp[p]['failed'] = True
        pending = [p for p in pending if 'url' not in mp[p] and not mp[p].get('failed')]
        MAP_F.write_text(json.dumps(mp, indent=0), encoding='utf-8')
        if not pending: break
        print(f'  {len(pending)} files still processing'); time.sleep(8)
    print('failed:', [p for p, v in mp.items() if v.get('failed')][:10], '| unresolved:', len(pending))


def verify():
    mp = json.loads(MAP_F.read_text(encoding='utf-8'))
    bad = []
    def head(item):
        p, v = item
        try:
            return p, urllib.request.urlopen(urllib.request.Request(v['url'].split('?')[0], method='HEAD', headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).status
        except Exception as ex:
            return p, getattr(ex, 'code', str(ex)[:30])
    with ThreadPoolExecutor(8) as ex:
        for p, code in ex.map(head, [(p, v) for p, v in mp.items() if v.get('url')]):
            if code != 200: bad.append((p, code))
    print('checked', len(mp), 'not 200:', len(bad), bad[:10])


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'list':
        files = used_files()
        names = [flat(f) for f in files]
        assert len(set(names)) == len(names), 'two files would get the same Shopify name'
        LIST_F.write_text(json.dumps(files, indent=0), encoding='utf-8')
        tot = sum((ROOT / f).stat().st_size for f in files)
        print(len(files), 'files,', round(tot / 1048576), 'MB; biggest:', max(((ROOT / f).stat().st_size, f) for f in files))
    elif cmd == 'upload':
        upload(int(sys.argv[sys.argv.index('--limit') + 1]) if '--limit' in sys.argv else None)
    elif cmd == 'resolve':
        resolve()
    elif cmd == 'verify':
        verify()
    else:
        print(__doc__)
