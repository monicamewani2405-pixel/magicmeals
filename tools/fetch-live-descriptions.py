"""Copy the product descriptions from the old live store (magicmeals.shop) into product-descriptions.js.

    python tools/fetch-live-descriptions.py

Reads the public WooCommerce Store API (no login), maps each prototype product id to its live product
(MAP below) and writes product-descriptions.js:
    intro  first paragraph of the live short description (plain text)
    specs  [label, value] pairs from the short description (Net Weight, Rehydrated Weight, Cuisine Type, Shelf Life)
    html   the live long description, reduced to p / h3 / ul / ol / li / strong / br
Text is copied word for word (only HTML attributes, empty paragraphs and non-breaking spaces are dropped).
Products with no live match are not written and keep their old text.
"""
import html, json, re, sys, urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = 'https://magicmeals.shop/wp-json/wc/store/v1/products?per_page=100&page=%d'

# prototype product id -> live product slug
MAP = {
    'rajma-masala': 'rajma-masala', 'paneer-butter-masala': 'paneer-butter-masala', 'paneer-bhurji': 'paneer-bhurji',
    'pind-ke-chhole': 'pind-ke-chhole', 'pav-bhaji': 'magic-meals-pav-bhaji', 'bhindi-masala': 'bhindi-masala',
    'veg-kadhai': 'veg-kadhai', 'veg-makhanwala': 'magic-meals-veg-makhanwala',
    'moong-masala': 'jain-moong-masala-ready-to-eat',      # the live store only sells the Jain version
    'dal-makhani': 'magic-meals-dal-makhani', 'dal-tadka': 'magic-meals-dal-tadka',
    'dal-fry': 'jain-dal-fry-ready-to-eat',                 # Jain only on the live store
    'gujarati-dal': 'magic-meals-gujarati-dal', 'dal-khichdi': 'dal-khichdi', 'masala-khichdi-kadhi': 'masala-khichdi-kadhi',
    'veg-biryani': 'veg-biryani', 'jeera-rice': 'jeera-rice', 'tawa-pulao': 'tawa-pulao',
    'fried-rice-manchurian': 'fried-rice-with-manchurian-gravy', 'fried-rice': 'fried-rice',
    'schezwan-rice': 'schezwan-rice', 'mexican-rice': 'mexican-rice', 'kanda-poha': 'kanda-poha',
    'jain-poha': 'jain-instant-poha',                       # Jain only on the live store
    'idli-sambar': 'magic-meals-idli-sambar', 'upma': 'magic-meals-upma', 'mumbai-misal': 'mumbai-misal',
    'tomato-soup': 'tomato-soup', 'sweet-corn-soup': 'sweet-corn-soup', 'hot-and-sour-soup': 'hot-sour-soup',
    'gajar-halwa': 'magic-meals-gajar-halwa-ready-to-eat-instant-carrot-dessert-delight',
    'aam-ras': 'magic-meals-aam-ras', 'rawa-sheera': 'magic-meals-rawa-sheera',
    # combos with the same dishes on the live store
    'punjabi-comfort-combo': 'dal-makhani-tawa-pulao',
    'south-indian-breakfast-combo': 'magic-meals-power-breakfast-combo-idli-sambar-upma',
    'maharashtrian-nashta-combo': 'magic-meals-power-breakfast-combo-mumbai-misal-kanda-poha',
    'fiesta-bowl-combo': 'magic-meals-global-fusion-combo-sweet-corn-soup-mexican-rice',
    'dinner-dessert-combo': 'magic-meals-light-dinner-combo-dal-khichdi-gajar-halwa-2',
    'indo-chinese-feast-combo': 'magic-meals-indo-chinese-combo-hot-sour-soup-fried-rice-with-manchurian-gravy',
    # the combos from the client's list (added later); id = slug of the title in main.js
    'north-indian-combo-paneer-butter-masala-jeera-rice-rawa-sheera': 'magic-meals-north-indian-combo-paneer-butter-masala-jeera-rice-rawa-sheera',
    'north-indian-combo-paneer-butter-masala-tawa-pulao-rawa-sheera': 'paneer-butter-masala-tawa-pulao-rawa-sheera',
    'north-indian-combo-paneer-butter-masala-veg-biryani-rawa-sheera': 'paneer-butter-masala-veg-biryani-rawa-sheera',
    'comfort-combo-rajma-masala-jeera-rice-gajar-halwa': 'magic-meals-comfort-combo-rajma-masala-jeera-rice-gajar-halwa-2',
    'comfort-combo-rajma-masala-tawa-pulao-gajar-halwa': 'rajma-masala-tawa-pulao-gajar-halwa',
    'comfort-combo-rajma-masala-fried-rice-with-manchurian-gravy-gajar-halwa': 'rajma-masala-fried-rice-with-manchurian-gravy-gajar-halwa',
    'homestyle-combo-veg-makhanwala-jeera-rice-gajar-halwa': 'magic-meals-homestyle-combo-veg-makhanwala-jeera-rice-gajar-halwa-2',
    'homestyle-combo-veg-makhanwala-tawa-pulao-gajar-halwa': 'veg-makhanwala-tawa-pulao-gajar-halwa',
    'homestyle-combo-veg-makhanwala-veg-biryani-gajar-halwa': 'veg-makhanwala-veg-biryani-gajar-halwa',
    'street-style-combo-pav-bhaji-rawa-sheera': 'magic-meals-street-style-combo-pav-bhaji-rawa-sheera-2',
    'protein-veg-combo-paneer-bhurji-jeera-rice-aam-ras': 'magic-meals-protein-veg-combo-paneer-bhurji-jeera-rice-aam-ras',
    'protein-veg-combo-paneer-bhurji-veg-biryani-aam-ras': 'paneer-bhurji-veg-biryani-aamras',
    'protein-veg-combo-paneer-bhurji-tawa-pulao-aam-ras': 'paneer-bhurji-tawa-pulao-aamras',
    'punjabi-swaad-combo-pind-ke-chole-jeera-rice-gajar-halwa': 'magic-meals-punjabi-swaad-combo-pind-ke-chole-jeera-rice-gajar-halwa-2',
    'punjabi-swaad-pind-ke-chole-tawa-pulao-gajar-halwa': 'pind-ke-chole-tawa-pulao-gajar-halwa',
    'punjabi-swaad-pind-ke-chole-veg-biryani-gajar-halwa': 'pind-ke-chole-veg-biryani-gajar-halwa',
    'classic-dinner-combo-tomato-soup-dal-makhani-jeera-rice': 'magic-meals-classic-dinner-combo-tomato-soup-dal-makhani-jeera-rice',
    'royal-combo-veg-biryani-rawa-sheera': 'magic-meals-royal-combo-veg-biryani-rawa-sheera-2',
    'royal-combo-tawa-pulao-aam-ras': 'tawa-pulav-and-aam-ras',
    'comfort-night-combo-dal-fry-jeera-rice': 'magic-meals-comfort-night-combo-dal-fry-jeera-rice',
    # Jain combos (the old store sells these in addition to the regular ones with the same dishes)
    'jain-street-style-combo-pav-bhaji-rawa-sheera': 'magic-meals-street-style-combo-pav-bhaji-rawa-sheera',
    'jain-protein-veg-combo-paneer-bhurji-jeera-rice-aam-ras': 'magic-meals-protein-veg-combo-paneer-bhurji-jeera-rice-aamras',
    'jain-royal-combo-veg-biryani-rawa-sheera': 'magic-meals-royal-combo-veg-biryani-rawa-sheera',
    'jain-royal-fusion-combo-schezwan-rice-aam-ras': 'magic-meals-royal-fusion-combo-schezwan-rice-aamras',
    'jain-classic-dinner-combo-dal-makhani-jeera-rice': 'magic-meals-classic-dinner-combo-dal-makhani-jeera-rice',
    'jain-power-breakfast-combo-poha-upma': 'power-breakfast-combo-poha-upma',
    'jain-punjabi-swaad-combo-pind-ke-chole-jeera-rice-dal-fry': 'magic-meals-punjabi-swaad-combo-pind-ke-chole-jeera-rice-dal-fry',
    'jain-homestyle-combo-veg-makhanwala-jeera-rice-dal-fry': 'magic-meal-homestyle-combo-veg-makhanwala-jeera-rice-dal-fry',
    # 'jain-light-comfort-combo' (Dal Khichdi + Tomato Soup) has no live product: not mapped on purpose
}
# combos on the client's list that are not on the live store: id -> (group name, [(dish name, prototype id of the single)])
EXTRA = {
    'comfort-combo-rajma-masala-veg-biryani-gajar-halwa': ('Comfort Combo', [('Rajma Masala', 'rajma-masala'), ('Veg Biryani', 'veg-biryani'), ('Gajar Halwa', 'gajar-halwa')]),
    'street-style-combo-pav-bhaji-tawa-pulao': ('Street Style Combo', [('Pav Bhaji', 'pav-bhaji'), ('Tawa Pulao', 'tawa-pulao')]),
}
KEEP = {'p', 'h3', 'ul', 'ol', 'li', 'strong', 'br'}


def fix_text(s):
    s = html.unescape(s).replace(' ', ' ')
    return re.sub(r'[ 	]+', ' ', s)


class Clean(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in KEEP:
            self.out.append('<%s>' % tag)

    def handle_startendtag(self, tag, attrs):
        if tag == 'br':
            self.out.append('<br>')

    def handle_endtag(self, tag):
        if tag in KEEP and tag != 'br':
            self.out.append('</%s>' % tag)

    def handle_data(self, d):
        self.out.append(html.escape(fix_text(d), quote=False))

    def handle_entityref(self, n):
        self.out.append(html.escape(fix_text('&%s;' % n), quote=False))

    def handle_charref(self, n):
        self.out.append(html.escape(fix_text('&#%s;' % n), quote=False))


def clean_html(raw):
    c = Clean()
    c.feed(raw)
    s = ''.join(c.out)
    s = re.sub(r'<(p|li|h3|strong)>\s*(?:&nbsp;|\xa0)?\s*</\1>', '', s)    # empty paragraphs
    s = s.replace('\xa0', ' ')
    return re.sub(r'>\s*\n\s*<', '><', s).strip()


def plain(raw):
    return re.sub(r'\s+', ' ', fix_text(re.sub(r'<[^>]+>', '', raw))).strip()


def main():
    live = {}
    for pg in range(1, 6):
        req = urllib.request.Request(API % pg, headers={'User-Agent': 'magicmeals-prototype-sync'})
        data = json.load(urllib.request.urlopen(req, timeout=60))
        if not data:
            break
        for p in data:
            live[p['slug']] = p
    print('live products:', len(live))

    out, missing = {}, []
    for pid, slug in MAP.items():
        p = live.get(slug)
        if not p:
            missing.append((pid, slug))
            continue
        short, long_ = p['short_description'], p['description']
        # one live product (paneer-butter-masala-tawa-pulao-rawa-sheera) has a stray "Notepad / PWA" text pasted in front of its real
        # description, ending in  ...supported browsers"Bring home...  Everything before "Bring home" is dropped (not our text to show).
        long_ = re.sub(r'^.*?Installable on supported browsers(?:&#8221;|”|")', '<p>', long_, flags=re.S)
        m = re.search(r'<p[^>]*>(.*?)</p>', short, re.S)
        intro = plain(m.group(1)) if m else ''
        rest = short[m.end():] if m else short
        # the spec lines ("Net Weight: 95g") come as <li> items or as <br>-separated text, depending on the product
        lines = re.sub(r'<[^>]+>', '', re.sub(r'</li>|<br[^>]*>|</p>', '\n', rest)).split('\n')
        specs = []
        for l in lines:
            mm = re.match(r'^\s*([A-Za-z ]{3,30}?)\s*:\s*(.+?)\s*$', fix_text(l))
            if mm:
                specs.append([mm.group(1), mm.group(2)])
        out[pid] = {'slug': slug, 'intro': intro, 'specs': specs, 'html': clean_html(long_)}

    # Combos that have no live product. The intro is our own wording (same pattern as the live combos); the preparation steps are
    # copied from each dish's own live description, so the water amounts and times are the real ones. Marked "placeholder": true.
    for pid, (group, dishes) in EXTRA.items():
        names = [n for n, _ in dishes]
        intro = ('Enjoy a wholesome ready-to-eat meal with the Magic Meals %s featuring %s. Just add hot water to each pouch '
                 'and enjoy in minutes.') % (group, ', '.join(names[:-1]) + ' and ' + names[-1])
        steps = ''
        for n, comp in dishes:
            m = re.search(r'Preparation Instructions.*?(<ol>.*?</ol>)', out[comp]['html'], re.S)
            steps += '<p><strong>%s</strong></p>%s' % (n, m.group(1))
        out[pid] = {'slug': None, 'placeholder': True, 'intro': intro, 'specs': [],
                    'html': '<h3>Preparation Instructions</h3>%s' % steps}

    bad = [k for k, v in out.items() if not v['intro'] or len(v['specs']) < 4 or '�' in json.dumps(v, ensure_ascii=False)]
    body = json.dumps(out, ensure_ascii=False, indent=1)
    (ROOT / 'product-descriptions.js').write_text(
        '/* product-descriptions.js: GENERATED by tools/fetch-live-descriptions.py. Do not edit by hand.\n'
        '   The description text of each product as it is on the old live store (magicmeals.shop).\n'
        '   main.js shows it on the product page; products not listed here keep their own text. */\n'
        'window.PRODUCT_DESCRIPTIONS = ' + body + ';\n', encoding='utf-8')
    print('written:', len(out), 'products')
    print('missing on live:', missing)
    print('check (no intro / <4 specs / bad char):', bad)


if __name__ == '__main__':
    sys.exit(main())
