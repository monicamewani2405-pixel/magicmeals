"""Cooking videos: posters, upload to Shopify product media, and the generated map the product page reads.

    python tools/upload-cooking-videos.py posters            make videos/posters/<slug>.webp from each video (ffmpeg + Pillow)
    python tools/upload-cooking-videos.py upload             upload each video to its Shopify product, wait until processed,
                                                             write videos/product-videos.js
    python tools/upload-cooking-videos.py upload --only rajma-masala,upma    (a test with two products)
    python tools/upload-cooking-videos.py write              rebuild videos/product-videos.js from what is already in Shopify

Reads   data/cooking-video-map.csv        product slug (= Shopify handle) -> video file inside incoming-videos/cooking-instruction/
        .env.local                        SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET (git-ignored; never printed or written anywhere)
Writes  videos/posters/<slug>.webp, videos/product-videos.js

The Admin token is a temporary one (about 24 h) fetched with the app's client credentials on every run.
Safe to re-run: a product that already has a "(cooking video)" video in Shopify is not uploaded again.
"""
import csv, json, subprocess, sys, time, urllib.parse, urllib.request, urllib.error, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'incoming-videos' / 'cooking-instruction'
POSTERS = ROOT / 'videos' / 'posters'
OUT_JS = ROOT / 'videos' / 'product-videos.js'
SHOP = '1z10zd-y0.myshopify.com'
API = '2026-07'
MARK = '(cooking video)'
FFBIN = Path.home() / 'AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin'


def exe(name):
    p = FFBIN / (name + '.exe')
    return str(p) if p.exists() else name


def load_map(only=None):
    rows = list(csv.DictReader(open(ROOT / 'data' / 'cooking-video-map.csv', encoding='utf-8')))
    if only:
        rows = [r for r in rows if r['slug'] in only]
    return rows


def probe(path):
    j = json.loads(subprocess.check_output([exe('ffprobe'), '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', str(path)]))
    v = next(s for s in j['streams'] if s['codec_type'] == 'video')
    return float(j['format']['duration']), int(v['width']), int(v['height'])


# ---------------------------------------------------------------- posters
def make_posters(rows):
    from PIL import Image, ImageFilter, ImageStat
    import io
    POSTERS.mkdir(parents=True, exist_ok=True)
    for r in rows:
        src = SRC / r['file']
        dur, w, h = probe(src)
        best = None
        for pc in (20, 30, 40, 50, 60, 70):   # never the end: some videos finish on an animated graphic
            png = subprocess.check_output([exe('ffmpeg'), '-v', 'error', '-ss', f'{dur * pc / 100:.2f}', '-i', str(src), '-frames:v', '1',
                                           '-vf', 'scale=540:-2', '-f', 'image2pipe', '-vcodec', 'png', '-'])
            im = Image.open(io.BytesIO(png)).convert('RGB')
            sharp = ImageStat.Stat(im.convert('L').filter(ImageFilter.FIND_EDGES)).var[0]   # blur and flat text cards score low
            if best is None or sharp > best[0]:
                best = (sharp, im, pc)
        best[1].save(POSTERS / f"{r['slug']}.webp", 'WEBP', quality=78)
        print(f"poster {r['slug']}: frame at {best[2]}%, {(POSTERS / (r['slug'] + '.webp')).stat().st_size // 1024} KB")


# ---------------------------------------------------------------- Shopify
def env():
    d = {}
    for line in open(ROOT / '.env.local', encoding='utf-8'):
        if '=' in line and not line.lstrip().startswith('#'):
            k, v = line.split('=', 1)
            d[k.strip()] = v.strip().strip('"').strip("'")
    return d


def token():
    e = env()
    body = urllib.parse.urlencode({'grant_type': 'client_credentials', 'client_id': e['SHOPIFY_CLIENT_ID'], 'client_secret': e['SHOPIFY_CLIENT_SECRET']}).encode()
    req = urllib.request.Request(f'https://{SHOP}/admin/oauth/access_token', data=body, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    return json.load(urllib.request.urlopen(req, timeout=60))['access_token']


class Admin:
    def __init__(self):
        self.t = token()

    def gql(self, query, variables=None):
        for attempt in range(6):
            req = urllib.request.Request(f'https://{SHOP}/admin/api/{API}/graphql.json', data=json.dumps({'query': query, 'variables': variables or {}}).encode(),
                                         headers={'Content-Type': 'application/json', 'X-Shopify-Access-Token': self.t})
            try:
                res = json.load(urllib.request.urlopen(req, timeout=120))
            except urllib.error.HTTPError as ex:
                if ex.code in (429, 502, 503):
                    time.sleep(2 + attempt * 3); continue
                raise SystemExit(f'Shopify HTTP {ex.code}')
            if res.get('errors'):
                if any('Throttled' in str(x) for x in res['errors']):
                    time.sleep(3 + attempt * 3); continue
                raise SystemExit('Shopify error: ' + json.dumps(res['errors'])[:600])
            return res['data']
        raise SystemExit('Shopify kept throttling')


def find_video(ad, slug):
    d = ad.gql('query($h:String!){ productByIdentifier(identifier:{handle:$h}){ id title media(first:50){ nodes{ id alt mediaContentType status } } } }', {'h': slug})['productByIdentifier']
    if not d:
        return None, None, None
    vid = next((m for m in d['media']['nodes'] if m['mediaContentType'] == 'VIDEO' and (m.get('alt') or '').endswith(MARK)), None)
    return d['id'], d['title'], vid


def multipart(fields, fname, data, ctype):
    b = uuid.uuid4().hex
    parts = []
    for k, v in fields:
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    parts.append(f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{fname}"\r\nContent-Type: {ctype}\r\n\r\n'.encode())
    parts.append(data)
    parts.append(f'\r\n--{b}--\r\n'.encode())
    return b'multipart/form-data; boundary=' + b.encode(), b''.join(parts)


def upload_one(ad, row):
    slug = row['slug']
    pid, title, vid = find_video(ad, slug)
    if not pid:
        print(f'  {slug}: NO such product handle in Shopify, skipped'); return None
    if vid:
        print(f'  {slug}: already has a cooking video in Shopify ({vid["status"]}), not uploaded again'); return vid['id']
    path = SRC / row['file']
    data = path.read_bytes()
    st = ad.gql('mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){ stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ message } } }',
                {'i': [{'resource': 'VIDEO', 'filename': path.name, 'mimeType': 'video/mp4', 'httpMethod': 'POST', 'fileSize': str(len(data))}]})['stagedUploadsCreate']
    if st['userErrors']:
        raise SystemExit(f'{slug}: staged upload refused: {st["userErrors"]}')
    tgt = st['stagedTargets'][0]
    ctype, body = multipart([(p['name'], p['value']) for p in tgt['parameters']], path.name, data, 'video/mp4')
    try:
        urllib.request.urlopen(urllib.request.Request(tgt['url'], data=body, headers={'Content-Type': ctype.decode()}), timeout=600).read()
    except urllib.error.HTTPError as ex:
        raise SystemExit(f'{slug}: file upload failed HTTP {ex.code}')
    alt = f'How to prepare {title} {MARK}'
    r = ad.gql('mutation($p:ProductUpdateInput!,$m:[CreateMediaInput!]){ productUpdate(product:$p, media:$m){ product{ id } userErrors{ field message } } }',
               {'p': {'id': pid}, 'm': [{'originalSource': tgt['resourceUrl'], 'alt': alt, 'mediaContentType': 'VIDEO'}]})['productUpdate']
    if r['userErrors']:
        raise SystemExit(f'{slug}: attach failed: {r["userErrors"]}')
    _, _, vid = find_video(ad, slug)
    print(f'  {slug}: uploaded {len(data) / 1048576:.1f} MB and attached ({vid["id"] if vid else "media id pending"})')
    return vid['id'] if vid else None


def wait_ready(ad, slug, timeout=900):
    t0 = time.time()
    while time.time() - t0 < timeout:
        _, _, vid = find_video(ad, slug)
        if vid and vid['status'] == 'READY':
            d = ad.gql('query($id:ID!){ node(id:$id){ ... on Video { sources{ url mimeType height width format } } } }', {'id': vid['id']})['node']
            return d['sources']
        if vid and vid['status'] == 'FAILED':
            print(f'  {slug}: Shopify FAILED to process the video'); return None
        time.sleep(6)
    print(f'  {slug}: still processing after {timeout}s'); return None


def write_js(rows, sources):
    out = {}
    for r in rows:
        slug = r['slug']
        if slug not in sources or not sources[slug]:
            continue
        dur, w, h = probe(SRC / r['file']) if (SRC / r['file']).exists() else (0, 0, 0)
        mp4 = sorted([s for s in sources[slug] if s['mimeType'] == 'video/mp4'], key=lambda s: s['height'])
        out[slug] = {'poster': f'videos/posters/{slug}.webp', 'duration': round(dur), 'w': w, 'h': h,
                     'sources': [{'u': s['url'], 'w': s['width'], 'h': s['height']} for s in mp4]}
    body = json.dumps(out, separators=(',', ':'), ensure_ascii=False)   # compact: this file loads on every page
    OUT_JS.write_text('/* GENERATED by tools/upload-cooking-videos.py: do not edit. Product id -> its cooking video (hosted by Shopify) and poster. */\n'
                      'window.PRODUCT_VIDEOS = ' + body + ';\n', encoding='utf-8')
    print(f'wrote {OUT_JS.relative_to(ROOT)}: {len(out)} products')


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    only = None
    if '--only' in sys.argv:
        only = set(sys.argv[sys.argv.index('--only') + 1].split(','))
    rows = load_map(only)
    if cmd == 'posters':
        make_posters(rows)
    elif cmd in ('upload', 'write'):
        ad = Admin()
        if cmd == 'upload':
            print(f'uploading {len(rows)} videos')
            for r in rows:
                upload_one(ad, r)
        print('waiting for Shopify to process the videos')
        allrows = load_map()
        sources = {}
        for r in allrows:
            _, _, vid = find_video(ad, r['slug'])
            if vid:
                sources[r['slug']] = wait_ready(ad, r['slug'])
        write_js(allrows, sources)
    else:
        print(__doc__)


main()
