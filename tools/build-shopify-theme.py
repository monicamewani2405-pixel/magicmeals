"""Builds the Shopify theme from this site.   python tools/build-shopify-theme.py

Output (git-ignored):  shopify-theme/            the theme folder (layout, templates, config, locales, assets)
                       shopify-theme.zip          what you upload in Shopify admin: Online Store > Themes > Add theme > Upload zip file
                       shopify-theme-preview/     the same site with the Liquid resolved, to test in a browser (tools/theme-preview-check.py)

How it works (read this before changing anything):
  * The site is a single-page app (hash router). The theme wraps it as-is: layout/theme.liquid holds the page, the code files are theme assets.
  * Pictures are NOT in the theme (a zip is limited to ~50 MB). They live in Shopify Files (tools/theme-media.py). Paths written in HTML and CSS are
    rewritten to their Shopify address at build time. Paths the JavaScript assembles are rewritten while the page runs by the small shim that is
    inlined first in the page (window.MMA, same naming rule as tools/theme-media.py flat()).
  * Sign-in is Shopify's own (new customer accounts): the site's sign-in window and profile page are left out; the account icon opens /account.
  * Brochure form -> Shopify contact form. Pincode check -> zone estimate only (no server). Policy pages are inlined. Checkout -> the store's own /cart page
    (templates/cart.liquid) where Razorpay Magic Checkout runs, copied from your live theme.
"""
import json, os, re, shutil, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'shopify-theme'
PREV = ROOT / 'shopify-theme-preview'
ZIP = ROOT / 'shopify-theme.zip'
CDN = 'https://cdn.shopify.com/s/files/1/1062/6072/6043/files/'
MEDIA_EXT = ('.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.pdf', '.woff2', '.woff', '.ttf')
MEDIA = set(json.loads((ROOT / 'data' / 'theme-media.json').read_text(encoding='utf-8')))


def flat(path):
    return re.sub(r'[^a-z0-9._-]+', '-', path.replace('/', '__').lower().replace('.jpeg', '.jpg')).strip('-')


def cdn(path):
    return CDN + flat(path)


def aname(path):                    # theme asset file name (Shopify assets are flat)
    return path.replace('/', '__')


def read(p):
    return (ROOT / p).read_text(encoding='utf-8')


def patch(text, old, new, label, count=1):
    assert text.count(old) == count, f'patch "{label}": expected {count}, found {text.count(old)}'
    return text.replace(old, new)


# ---------------------------------------------------------------- media rewriting for static files (HTML / CSS)
def resolve_media(src_file, ref):
    r = ref.split('#')[0].split('?')[0]
    if not r or re.match(r'^(https?:|data:|//|#|\{)', r):
        return None
    base = os.path.dirname(src_file)
    for cand in ((os.path.normpath(os.path.join(base, r)).replace('\\', '/')), os.path.normpath(r).replace('\\', '/'), r.lstrip('/')):
        if cand in MEDIA:
            return cand
    return None


def rewrite_css(text, src_file):
    def sub(m):
        q, ref = m.group(1), m.group(2).strip()
        hit = resolve_media(src_file, ref)
        if hit:
            return f'url({q}{cdn(hit)}{q})'
        if ref.lower().split('?')[0].endswith(MEDIA_EXT) and not re.match(r'^(https?:|data:|//)', ref):
            print('  WARNING css', src_file, 'refers to a picture that is not uploaded:', ref)
        return m.group(0)
    return re.sub(r'url\(\s*([\'"]?)([^)\'"]+)\1\s*\)', sub, text)


# ---------------------------------------------------------------- what goes in the theme
SCRIPTS = []          # theme assets, in page order, from index.html (minus the ones that do not apply on Shopify)
DROP_SCRIPTS = {'auth.js', 'profile.js', 'magic-checkout.js'}
DROP_CSS = {'profile.css'}
EXTRA_ASSETS = ['vendor/three.min.js', 'vendor/OrbitControls.js']          # loaded later by the code, not by a tag


def build():
    for d in (OUT, PREV):
        if d.exists():
            shutil.rmtree(d)
    for sub in ('layout', 'templates', 'config', 'locales', 'assets'):
        (OUT / sub).mkdir(parents=True)
    html = read('index.html')

    # ---- head pieces
    head = html[html.index('<head>') + 6:html.index('</head>')]
    title = re.search(r'<title>.*?</title>', head, re.S).group(0)
    desc = re.search(r'<meta name="description"[^>]*>', head).group(0)
    fonts = [l.strip() for l in head.split('\n') if 'fonts.g' in l]
    icon = '<link rel="icon" type="image/png" href="' + cdn('cropped_logo.png') + '">'
    preload = []
    for m in re.finditer(r'<link rel="preload" as="image" href="([^"]+)"([^>]*)>', head):
        preload.append(f'<link rel="preload" as="image" href="{cdn(m.group(1))}"{m.group(2)}>')
    css_tags, css_names = [], []
    for m in re.finditer(r'<link rel="stylesheet" href="([^"?]+)(?:\?[^"]*)?">', head):
        href = m.group(1)
        if href.startswith('http') or href in DROP_CSS:
            continue
        css_names.append(href)
        css_tags.append(f'<link rel="stylesheet" href="@@ASSET:{aname(href)}@@">')

    # ---- body: SPA markup without the sign-in window and without the script tags
    body = html[html.index('<body>') + 6:html.index('</body>')]
    a = body.index('<!-- Sign In / Sign Up / Forgot modal')
    b = body.index('<!-- GSAP 3.12.5')
    body = body[:a] + body[b:]                                    # (the sign-in window sits between those two comments)
    script_srcs = re.findall(r'<script src="([^"?]+)(?:\?[^"]*)?"[^>]*></script>', body)
    body = re.sub(r'[ \t]*<script src="[^"]+"[^>]*></script>\n?', '', body)
    body = re.sub(r'<link rel="stylesheet"[^>]*>\n?', '', body)
    body = re.sub(r'(src|href|poster|content)="([^"]+)"', lambda m: (f'{m.group(1)}="{cdn(r)}"' if (r := resolve_media('index.html', m.group(2))) else m.group(0)), body)
    scripts = [s for s in script_srcs if s not in DROP_SCRIPTS]
    # the theme's own scripts: account link instead of the sign-in window, in front of main.js
    scripts.insert(scripts.index('pack-prices.js') if 'pack-prices.js' in scripts else 0, 'theme-account.js')
    assets = css_names + scripts + EXTRA_ASSETS + ['theme-cart.css']
    SCRIPTS[:] = scripts

    assets_map = {n: aname(n) for n in ('vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/three.min.js', 'vendor/OrbitControls.js')}
    shim = read('tools/theme-media-shim.js').replace('@@CDN@@', CDN)
    policies = {k: read(f'policies/{k}.html') for k in ('delivery-policy', 'privacy-policy', 'return-refund-policy', 'terms-conditions')}
    for k, v in policies.items():
        assert '</script' not in v.lower()

    def inline_data(liquid):
        """-> (script with the file base and the theme asset addresses [Liquid evaluated], script with the policy pages [Liquid switched off])"""
        pol = json.dumps(policies, ensure_ascii=False).replace('</', '<\\/')
        amap = ('{' + ','.join(f'"{k}":"@@ASSET:{v}@@"' for k, v in assets_map.items()) + '}')
        return (f'<script>window.MM_FILES="{CDN}";window.MM_ASSETS={amap};window.MM_ASSET=function(n){{return window.MM_ASSETS[n]||n}};</script>',
                f'<script>window.MM_POLICIES={pol};</script>')

    contact_form = ('{% form \'contact\', id: \'mmBrochureShopifyForm\', style: \'display:none\' %}'
                    '<input type="hidden" name="contact[name]"><input type="hidden" name="contact[email]"><input type="hidden" name="contact[phone]">'
                    '<input type="hidden" name="contact[body]">{% endform %}')

    razorpay = read('tools/theme-razorpay-block.html')

    # any picture path still written in the page markup (reel thumbnails, logos, inline styles) -> its Shopify address, same rule as the run-time shim
    token = re.compile(r"""(^|[\s"'(=,;>])((?:\./)?(?:(?:pdp|pouch-art|assets|scenes|how-it-works|videos/posters|heroes|brochure)/[^\s"'()<>,?#]+|(?:logo_live|cropped_logo|magic_meals_logo_saffron|magic_hero_[a-z_]+|thumb_[A-Za-z0-9_-]+))\.(?:png|jpe?g|webp|svg|gif|ico|pdf))""", re.I)
    body = token.sub(lambda m: m.group(1) + cdn(m.group(2)[2:] if m.group(2).startswith('./') else m.group(2)), body)
    spa_head = '\n  '.join([title, desc] + fonts + preload + [icon] + css_tags)
    spa_body = body.strip() + '\n  ' + contact_form + '\n  ' + '\n  '.join(f'<script src="@@ASSET:{aname(s)}@@" defer></script>' for s in scripts)

    def asset_liquid(t):
        return re.sub(r'@@ASSET:([^@]+)@@', lambda m: "{{ '" + m.group(1) + "' | asset_url }}", t)

    def asset_preview(t):
        return re.sub(r'@@ASSET:([^@]+)@@', lambda m: 'assets/' + m.group(1), t)

    layout = f'''<!doctype html>
<html lang="{{{{ request.locale.iso_code | default: 'en' }}}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{{% if template.name == 'index' %}}
  {spa_head}
  {{% raw %}}<script>{shim}</script>{{% endraw %}}
  {inline_data(True)[0]}
  {{% raw %}}{inline_data(True)[1]}{{% endraw %}}
{{% else %}}
  <title>{{{{ page_title }}}} – {{{{ shop.name }}}}</title>
  {icon}
  {fonts[0] if fonts else ''}
  <link rel="stylesheet" href="@@ASSET:theme-cart.css@@">
{{% endif %}}
  {{{{ content_for_header }}}}
</head>
<body class="template-{{{{ template.name }}}}">
{{% if template.name == 'index' %}}
  {spa_body}
  {{{{ content_for_layout }}}}
{{% else %}}
  <header class="mm-bar"><a href="/" class="mm-bar-logo"><img src="{cdn('logo_live.png')}" alt="Magic Meals" width="150" height="60"></a>
    <nav class="mm-bar-nav"><a href="/#shop">Shop</a><a href="/cart">Cart ({{{{ cart.item_count }}}})</a><a href="{{{{ routes.account_url }}}}">{{% if customer %}}My account{{% else %}}Sign in{{% endif %}}</a></nav></header>
  <main class="mm-page">{{{{ content_for_layout }}}}</main>
  <footer class="mm-foot"><a href="/">Magic Meals</a> · <a href="/#delivery-policy">Delivery</a> · <a href="/#return-refund-policy">Returns</a> · <a href="/#privacy-policy">Privacy</a> · <a href="/#terms-conditions">Terms</a></footer>
  {{% if template.name == 'cart' %}}
  {razorpay_static()}
  {{% endif %}}
{{% endif %}}
</body>
</html>
'''
    layout = asset_liquid(layout)
    # the Razorpay block needs the customer's email / phone from Liquid: inject after the raw block
    layout = layout.replace('@@RZP_EMAIL@@', '{{ customer.email | escape }}').replace('@@RZP_PHONE@@', '{{ customer.phone | escape }}')
    (OUT / 'layout' / 'theme.liquid').write_text(layout, encoding='utf-8')

    # ---- other layouts / templates
    (OUT / 'layout' / 'password.liquid').write_text('''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{{ shop.name }}</title>{{ content_for_header }}
<style>body{font-family:system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px}</style></head>
<body><main><h1>{{ shop.name }}</h1><p>This store is not open yet.</p>{{ content_for_layout }}</main></body></html>
''', encoding='utf-8')
    redirect = lambda target, msg='Opening…': f'<p>{msg}</p>\n<script>location.replace({target});</script>\n'
    T = OUT / 'templates'
    (T / 'index.liquid').write_text('', encoding='utf-8')
    (T / 'product.liquid').write_text(redirect("'/#p-{{ product.handle }}'"), encoding='utf-8')          # the product handle is the site's product id
    for n in ('collection', 'list-collections', 'search'):
        (T / f'{n}.liquid').write_text(redirect("'/#shop'"), encoding='utf-8')
    for n in ('page', 'blog', 'article'):
        (T / f'{n}.liquid').write_text(redirect("'/'"), encoding='utf-8')
    (T / '404.liquid').write_text('<h1>Page not found</h1><p><a href="/">Back to Magic Meals</a></p>\n', encoding='utf-8')
    (T / 'gift_card.liquid').write_text('<h1>Gift card</h1><p>{{ gift_card.initial_value | money }}</p><p>Code: {{ gift_card.code | format_code }}</p><p><a href="{{ shop.url }}">Shop now</a></p>\n', encoding='utf-8')
    (T / 'cart.liquid').write_text(read('tools/theme-cart.liquid'), encoding='utf-8')
    (OUT / 'config' / 'settings_schema.json').write_text(json.dumps([{'name': 'theme_info', 'theme_name': 'Magic Meals', 'theme_version': '1.0.0', 'theme_author': 'Magic Meals',
                                                                       'theme_documentation_url': 'https://magicmeals.shop', 'theme_support_url': 'https://magicmeals.shop'}], indent=2), encoding='utf-8')
    (OUT / 'config' / 'settings_data.json').write_text('{}\n', encoding='utf-8')
    (OUT / 'locales' / 'en.default.json').write_text('{}\n', encoding='utf-8')

    # ---- assets: code and styles (pictures are in Shopify Files)
    for n in assets:
        if n == 'theme-account.js':
            text = read('tools/theme-account.js')
        elif n == 'theme-cart.css':
            text = read('tools/theme-cart.css')
        else:
            text = read(n)
            if n.endswith('.css'):
                text = rewrite_css(text, n)
            elif n.endswith('.js'):
                text = patch_js(n, text)
        (OUT / 'assets' / aname(n)).write_text(text, encoding='utf-8') if n.endswith(('.js', '.css')) else None
        if n.startswith('vendor/'):
            shutil.copy(ROOT / n, OUT / 'assets' / aname(n))      # vendor files are copied byte for byte (patch_js leaves them alone)

    # ---- preview: the same page with the Liquid resolved, for tools/theme-preview-check.py
    PREV.mkdir()
    shutil.copytree(OUT / 'assets', PREV / 'assets')
    prev_layout = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  {asset_preview(spa_head)}
  <script>{shim}</script>
  {asset_preview(inline_data(False)[0])}
  {inline_data(False)[1]}
</head>
<body class="template-index">
  {asset_preview(spa_body).replace(contact_form, '<form id="mmBrochureShopifyForm" action="/contact" method="post" style="display:none"><input type="hidden" name="contact[name]"><input type="hidden" name="contact[email]"><input type="hidden" name="contact[phone]"><input type="hidden" name="contact[body]"></form>')}
</body>
</html>
'''
    (PREV / 'index.html').write_text(prev_layout, encoding='utf-8')

    # ---- zip
    if ZIP.exists():
        ZIP.unlink()
    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in sorted(OUT.rglob('*')):
            if p.is_file():
                z.write(p, p.relative_to(OUT).as_posix())
    size = ZIP.stat().st_size / 1048576
    n_assets = len(list((OUT / 'assets').iterdir()))
    print(f'theme: {n_assets} assets, zip {size:.1f} MB -> {ZIP}')
    assert size < 45, 'the zip is too close to Shopify\'s 50 MB limit'


def razorpay_static():
    return read('tools/theme-razorpay-block.html').strip()


# ---------------------------------------------------------------- code patches for the Shopify version (each one asserts that it applied)
def patch_js(name, text):
    if name == 'shopify-config.js':
        text = patch(text, "shopDomain: '1z10zd-y0.myshopify.com',", "shopDomain: window.location.host,        // the Shopify theme runs on the store itself: same address for the Storefront API and the cart pages", 'cfg domain')
        text = patch(text, 'directMagic: false,', 'directMagic: false,', 'cfg direct')
    elif name == 'main.js':
        text = patch(text, "fetch(`policies/${key}.html`).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })",
                     "Promise.resolve((window.MM_POLICIES || {})[key] || '').then(t => { if (!t) throw new Error(404); return t; })", 'policies')
        text = patch(text, "loadScriptOnce('vendor/three.min.js').then(() => loadScriptOnce('vendor/OrbitControls.js'))",
                     "loadScriptOnce(window.MM_ASSET('vendor/three.min.js')).then(() => loadScriptOnce(window.MM_ASSET('vendor/OrbitControls.js')))", 'three')
    elif name == 'heroes/home.js':
        text = patch(text, "loadScript('vendor/gsap.min.js')", "loadScript(window.MM_ASSET('vendor/gsap.min.js'))", 'home gsap')
        text = patch(text, "loadScript('vendor/ScrollTrigger.min.js')", "loadScript(window.MM_ASSET('vendor/ScrollTrigger.min.js'))", 'home st')
    elif name == 'pincode.js':
        text = patch(text, "fetch('/api/pincode?pin=' + encodeURIComponent(pin), { headers: { Accept: 'application/json' } })",
                     "Promise.reject(new Error('no courier lookup in the Shopify theme'))", 'pincode')
    elif name == 'brochure/brochure.js':
        a = text.index('    fetch(ENDPOINT, {')
        b = text.index('  // ---- build the tab and the dialog')
        text = text[:a] + '''    // Shopify theme: the details go through the store's own contact form (hidden in the page), which emails them to the store
    var sf = document.getElementById('mmBrochureShopifyForm');
    if (!sf) { clearTimeout(timer); statusEl.textContent = FAIL_MSG; resetButton(); return; }
    var nm = fields.name.value.trim(), em = fields.email.value.trim(), ph = normPhone(fields.phone.value.trim());
    sf.querySelector('[name="contact[name]"]').value = nm;
    sf.querySelector('[name="contact[email]"]').value = em;
    sf.querySelector('[name="contact[phone]"]').value = ph;
    sf.querySelector('[name="contact[body]"]').value = 'Brochure download request\\nName: ' + nm + '\\nEmail: ' + em + '\\nPhone: ' + ph;
    if (fields.website.value) { clearTimeout(timer); sending = false; success(); return; }      // honeypot filled: pretend it worked, send nothing
    fetch(sf.getAttribute('action'), { method: 'POST', body: new FormData(sf), credentials: 'same-origin', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(timer); if (r.ok) { sending = false; success(); } else { statusEl.textContent = FAIL_MSG; resetButton(); } })
      .catch(function () { clearTimeout(timer); statusEl.textContent = FAIL_MSG; resetButton(); });
  }

''' + text[b:]
        text = patch(text, "var PDF_URL = 'assets/brochure/Magic-Meals-Brochure.pdf';", "var PDF_URL = window.MMA ? window.MMA('assets/brochure/Magic-Meals-Brochure.pdf') : 'assets/brochure/Magic-Meals-Brochure.pdf';", 'pdf')
    return text


if __name__ == '__main__':
    build()
