"""Nutrition picture for a product's gallery, cut out of the real back panel of the pack.

    python tools/nutrition-card.py kanda-poha <back-mockup.png>

The two tables printed on the back (Nutrition Facts, Nutrition Information) are CROPPED from the client's back mockup (Drive folder
"Magic Meals back mockup", one PNG per product); nothing is retyped or retouched. They are placed one above the other on a calm off-white
4:5 card with rounded corners and a soft shadow, saved as pdp/<slug>/gallery/nutrition-1200.webp (<= 180 KB) and -800.webp (<= 90 KB).
CROPS holds the pixel boxes (left, top, right, bottom) of the two tables in the 2056 x 2826 mockup of each product.
"""
import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
CROPS = {
    'kanda-poha': {'facts': (205, 968, 1010, 1928), 'info': (243, 1934, 1022, 2300)},
    'jain-poha': {'facts': (205, 1060, 1005, 1975), 'info': (245, 1990, 1022, 2340)},
    'idli-sambar': {'facts': (222, 972, 1005, 1905), 'info': (255, 1940, 1015, 2308)},
    'upma': {'facts': (210, 990, 1005, 1930), 'info': (255, 1958, 1020, 2318)},
    'mumbai-misal': {'facts': (207, 972, 998, 1935), 'info': (250, 1942, 1020, 2318)},
    'jain-upma': {'facts': (220, 1046, 1012, 1975), 'info': (243, 1992, 1018, 2340)},
    'tomato-soup': {'facts': (195, 980, 1000, 1932), 'info': (240, 1950, 1000, 2300)},
    'sweet-corn-soup': {'facts': (195, 980, 1000, 1932), 'info': (240, 1952, 1000, 2302)},
    'hot-and-sour-soup': {'facts': (195, 970, 1000, 1928), 'info': (242, 1955, 1002, 2300)},
    'dal-makhani': {'facts': (205, 968, 1005, 1920), 'info': (248, 1948, 1004, 2314)},
    'dal-tadka': {'facts': (198, 978, 998, 1930), 'info': (240, 1948, 1000, 2296)},
    'dal-fry': {'facts': (242, 1056, 1006, 1962), 'info': (246, 2010, 1006, 2335)},
    'gujarati-dal': {'facts': (212, 968, 1002, 1910), 'info': (240, 1962, 1004, 2306)},
    'jain-dal-makhani': {'facts': (212, 1052, 1006, 1968), 'info': (240, 1998, 1006, 2340)},
    'jain-dal-khichdi': {'facts': (208, 1058, 1000, 1952), 'info': (242, 1998, 1000, 2338)},
    'jain-masala-khichdi-kadhi': {'facts': (206, 1052, 998, 1956), 'info': (242, 2000, 1000, 2336)},
    'jain-schezwan-rice': {'facts': (206, 1058, 998, 1956), 'info': (246, 2000, 1002, 2342)},
    'jain-veg-biryani': {'facts': (212, 1052, 1002, 1952), 'info': (246, 1998, 1002, 2338)},
    'fried-rice-manchurian': {'facts': (202, 1022, 998, 1950), 'info': (238, 1982, 1000, 2312)},
    'fried-rice': {'facts': (202, 972, 1002, 1916), 'info': (242, 1946, 1004, 2304)},
    'schezwan-rice': {'facts': (202, 982, 1000, 1916), 'info': (246, 1966, 1002, 2308)},
    'mexican-rice': {'facts': (198, 976, 1000, 1912), 'info': (240, 1940, 1002, 2306)},
    'dal-khichdi': {'facts': (196, 978, 1002, 1926), 'info': (240, 1936, 1002, 2292)},
    'masala-khichdi-kadhi': {'facts': (202, 1022, 998, 1950), 'info': (238, 1960, 1000, 2314)},
    'veg-biryani': {'facts': (206, 982, 1004, 1912), 'info': (242, 1960, 1004, 2306)},
    'jeera-rice': {'facts': (198, 982, 1002, 1926), 'info': (240, 1936, 1002, 2302)},
    'tawa-pulao': {'facts': (198, 988, 1000, 1930), 'info': (240, 1944, 1000, 2306)},
}
W, H = 1200, 1500
BG = (249, 247, 243)


def save_webp(im, path, limit):
    for q in (86, 82, 78, 74, 70, 66, 62, 58, 54, 50):
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=q, method=6)
        if buf.tell() <= limit:
            break
    path.write_bytes(buf.getvalue())
    return buf.tell()


def rounded(im, r):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = im.convert('RGBA')
    out.putalpha(mask)
    return out


def main():
    slug, src = sys.argv[1], sys.argv[2]
    im = Image.open(src).convert('RGBA')
    white = Image.new('RGBA', im.size, (255, 255, 255, 255))
    white.alpha_composite(im)
    im = white.convert('RGB')
    gap = 36
    crops = [im.crop(CROPS[slug][key]) for key in ('facts', 'info')]
    tw = 820
    while sum(round(c.height * tw / c.width) for c in crops) + gap > H - 80 and tw > 700:
        tw -= 10                     # a tall pair of tables: shrink a little so both fit the card
    parts = [c.resize((tw, round(c.height * tw / c.width)), Image.LANCZOS) for c in crops]
    total = sum(p.height for p in parts) + gap
    assert total <= H - 80, total
    y = (H - total) // 2
    canvas = Image.new('RGB', (W, H), BG)
    for p in parts:
        x = (W - tw) // 2
        card = rounded(p, 26)
        shadow = Image.new('L', (W, H), 0)
        ImageDraw.Draw(shadow).rounded_rectangle((x, y + 8, x + tw, y + p.height + 8), 26, fill=70)
        shadow = shadow.filter(ImageFilter.GaussianBlur(14))
        canvas = Image.composite(Image.new('RGB', (W, H), (60, 56, 70)), canvas, shadow.point(lambda v: int(v * 0.55)))
        canvas.paste(card, (x, y), card)
        y += p.height + gap
    out = ROOT / 'pdp' / slug / 'gallery'
    out.mkdir(parents=True, exist_ok=True)
    b1 = save_webp(canvas, out / 'nutrition-1200.webp', 180 * 1024)
    b2 = save_webp(canvas.resize((800, 1000), Image.LANCZOS), out / 'nutrition-800.webp', 90 * 1024)
    print(f'{slug}: nutrition card {b1 / 1024:.0f}/{b2 / 1024:.0f} KB')


if __name__ == '__main__':
    main()
