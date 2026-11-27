"""Replace a product's cooking video in Shopify with a newer file, without a gap on the live site.

    python tools/replace-cooking-videos.py add --only bhindi-masala,dal-tadka    upload the NEW video next to the old one, wait until Shopify has processed it,
                                                                                 rewrite videos/product-videos.js with the NEW urls (old ids saved in data/cooking-replace-old.json)
    python tools/replace-cooking-videos.py purge                                 AFTER the site with the new urls is live: delete the old videos from Shopify

Reads the same data/cooking-video-map.csv (point the slug's row at the NEW file first) and .env.local as tools/upload-cooking-videos.py, which it imports.
Why two steps: the site that is live now still points at the old video urls. Deleting them first would show "video could not load" until the new site is deployed."""
import importlib.util, json, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_argv = sys.argv
sys.argv = ['x']                                   # the module prints its help text when imported, nothing else
spec = importlib.util.spec_from_file_location('ucv', ROOT / 'tools' / 'upload-cooking-videos.py')
u = importlib.util.module_from_spec(spec); spec.loader.exec_module(u)
sys.argv = _argv
STATE = ROOT / 'data' / 'cooking-replace-old.json'


def media(ad, slug):
    d = ad.gql('query($h:String!){ productByIdentifier(identifier:{handle:$h}){ id title media(first:50){ nodes{ id alt mediaContentType status } } } }', {'h': slug})['productByIdentifier']
    vids = [m for m in d['media']['nodes'] if m['mediaContentType'] == 'VIDEO' and (m.get('alt') or '').endswith(u.MARK)]
    return d['id'], d['title'], vids


def upload_new(ad, row):
    slug = row['slug']
    pid, title, old = media(ad, slug)
    path = u.SRC / row['file']
    data = path.read_bytes()
    st = ad.gql('mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){ stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ message } } }',
                {'i': [{'resource': 'VIDEO', 'filename': path.name, 'mimeType': 'video/mp4', 'httpMethod': 'POST', 'fileSize': str(len(data))}]})['stagedUploadsCreate']
    if st['userErrors']:
        raise SystemExit(f'{slug}: staged upload refused: {st["userErrors"]}')
    tgt = st['stagedTargets'][0]
    ctype, body = u.multipart([(p['name'], p['value']) for p in tgt['parameters']], path.name, data, 'video/mp4')
    urllib.request.urlopen(urllib.request.Request(tgt['url'], data=body, headers={'Content-Type': ctype.decode()}), timeout=600).read()
    r = ad.gql('mutation($p:ProductUpdateInput!,$m:[CreateMediaInput!]){ productUpdate(product:$p, media:$m){ product{ id } userErrors{ field message } } }',
               {'p': {'id': pid}, 'm': [{'originalSource': tgt['resourceUrl'], 'alt': f'How to prepare {title} {u.MARK}', 'mediaContentType': 'VIDEO'}]})['productUpdate']
    if r['userErrors']:
        raise SystemExit(f'{slug}: attach failed: {r["userErrors"]}')
    _, _, now = media(ad, slug)
    new = [m for m in now if m['id'] not in {o['id'] for o in old}]
    print(f'  {slug}: uploaded {len(data) / 1048576:.1f} MB; old media {len(old)}, new {len(new)}')
    return pid, [o['id'] for o in old], new[0]['id'] if new else None


def ready_sources(ad, mid, timeout=900):
    t0 = time.time()
    while time.time() - t0 < timeout:
        n = ad.gql('query($id:ID!){ node(id:$id){ ... on Video { status sources{ url mimeType height width format } } } }', {'id': mid})['node']
        if n['status'] == 'READY':
            return n['sources']
        if n['status'] == 'FAILED':
            return None
        time.sleep(6)
    return None


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
    ad = u.Admin()
    if cmd == 'add':
        if not only:
            raise SystemExit('add needs --only slug,slug')
        state, replaced = {}, {}
        for r in u.load_map(only):
            pid, old_ids, new_id = upload_new(ad, r)
            state[r['slug']] = {'product': pid, 'old': old_ids}
            replaced[r['slug']] = ready_sources(ad, new_id) if new_id else None
            print(f'  {r["slug"]}: new video {"READY" if replaced[r["slug"]] else "NOT READY"}')
        if any(v is None for v in replaced.values()):
            raise SystemExit('a new video did not become ready: nothing written (the old videos are untouched)')
        STATE.write_text(json.dumps(state, indent=1), encoding='utf-8')
        allrows, sources = u.load_map(), {}
        for r in allrows:
            if r['slug'] in replaced:
                sources[r['slug']] = replaced[r['slug']]
            else:
                _, _, vid = u.find_video(ad, r['slug'])
                if vid:
                    sources[r['slug']] = u.wait_ready(ad, r['slug'])
        u.write_js(allrows, sources)
    elif cmd == 'purge':
        state = json.loads(STATE.read_text(encoding='utf-8'))
        for slug, s in state.items():
            if s['old']:
                r = ad.gql('mutation($p:ID!,$m:[ID!]!){ productDeleteMedia(productId:$p, mediaIds:$m){ deletedMediaIds mediaUserErrors{ message } } }', {'p': s['product'], 'm': s['old']})['productDeleteMedia']
                print(f'  {slug}: deleted {len(r["deletedMediaIds"])} old video(s)', r['mediaUserErrors'] or '')
        STATE.unlink()
    else:
        print(__doc__)


main()
