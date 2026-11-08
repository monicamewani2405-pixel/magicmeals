"""The 4th picture of every combo page: the Nutrition Information table of each pouch in the combo, one under the other, plus the combo total.

    python tools/combo-nutrition-card.py [combo-id ...]      (no ids = every combo in pdp/combos/combo-gallery.js)

Tables are cut from the pouches' back mockups (%TEMP%\\backs\\<slug>.png, same boxes as tools/nutrition-card.py: CROPS[slug]['info']);
the total is the sum of the pouches' kcal / protein per serving (NUTRITION in tools/sync-nutrition.py), the same numbers the site shows.
Writes pdp/combos/<id>/gallery/nutrition-{1200,800}.webp.
"""
import importlib.util
import json
import os
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
BACKS = Path(os.environ['TEMP']) / 'backs'


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'tools' / file)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


NC = load('nutrition_card', 'nutrition-card.py')
SN = load('sync_nutrition', 'sync-nutrition.py')
W, H, BG = 1200, 1500, NC.BG
INK, MUTED, BLUE = (28, 28, 36), (96, 96, 108), (1, 115, 194)
FONT, FONTB = r'C:\Windows\Fonts\segoeui.ttf', r'C:\Windows\Fonts\segoeuib.ttf'


def titles():
    t = (ROOT / 'main.js').read_text(encoding='utf-8')
    return dict(re.findall(r"id: '([a-z0-9-]+)',\s*\n\s*title: '((?:[^'\\]|\\.)*)'", t))


def trim(im):
    """Drop what the generous crop box caught below the table's bottom border (the 'PACKED & MARKETED BY' line)."""
    a = np.array(im.convert('L')).astype(int)
    dark = (a < 90)[:, int(im.width * 0.1):int(im.width * 0.9)].mean(1)
    last = [y for y in range(im.height // 2, im.height) if dark[y] > 0.3]
    return im.crop((0, 0, im.width, min(im.height, last[-1] + 14))) if last else im


def card(cid, dishes, names):
    f = lambda p, s: ImageFont.truetype(p, s)
    crops = []
    for d in dishes:
        im = Image.open(BACKS / f'{d}.png').convert('RGBA')
        white = Image.new('RGBA', im.size, (255, 255, 255, 255))
        white.alpha_composite(im)
        crops.append(trim(white.convert('RGB').crop(NC.CROPS[d]['info'])))
    head, foot, label, gap = 170, 150, 50, 26
    avail = H - head - foot - len(crops) * (label + gap)
    tw = 820
    while sum(round(c.height * tw / c.width) for c in crops) > avail and tw > 520:
        tw -= 10
    parts = [c.resize((tw, round(c.height * tw / c.width)), Image.LANCZOS) for c in crops]
    canvas = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(canvas)
    d.text((W // 2, 62), 'Nutrition in this combo', font=f(FONTB, 50), fill=INK, anchor='mm')
    d.text((W // 2, 112), 'Per serving, as printed on each pack', font=f(FONT, 28), fill=MUTED, anchor='mm')
    used = sum(p.height for p in parts) + len(parts) * (label + gap)
    y = head + (H - head - foot - used) // 2
    x = (W - tw) // 2
    for slug, p in zip(dishes, parts):
        kcal, prot = SN.NUTRITION[slug]
        rf = f(FONT, 26)
        for right in (f'{kcal} kcal · {prot} protein', f'{kcal} kcal · {prot}'):
            room = tw - d.textlength(right, font=rf) - 24
            size = 30
            while d.textlength(names.get(slug, slug), font=f(FONTB, size)) > room and size > 24:
                size -= 1
            if d.textlength(names.get(slug, slug), font=f(FONTB, size)) <= room:
                break
        d.text((x + tw, y + 22), right, font=rf, fill=MUTED, anchor='rm')
        d.text((x, y + 22), names.get(slug, slug), font=f(FONTB, size), fill=INK, anchor='lm')
        y += label
        shadow = Image.new('L', (W, H), 0)
        ImageDraw.Draw(shadow).rounded_rectangle((x, y + 8, x + tw, y + p.height + 8), 22, fill=70)
        shadow = shadow.filter(ImageFilter.GaussianBlur(12))
        canvas = Image.composite(Image.new('RGB', (W, H), (60, 56, 70)), canvas, shadow.point(lambda v: int(v * 0.5)))
        canvas.paste(NC.rounded(p, 22), (x, y), NC.rounded(p, 22))
        y += p.height + gap
        d = ImageDraw.Draw(canvas)
    kcal = sum(SN.NUTRITION[s][0] for s in dishes)
    prot = sum(float(SN.NUTRITION[s][1].rstrip('g')) for s in dishes)
    d.rounded_rectangle((x, H - foot + 20, x + tw, H - 30), 36, fill=BLUE)
    msg = f'Whole combo: {kcal} kcal · {prot:.1f} g protein'
    size = 34
    while d.textlength(msg, font=f(FONTB, size)) > tw - 60 and size > 20:
        size -= 1
    d.text((W // 2, H - foot + 75), msg, font=f(FONTB, size), fill=(255, 255, 255), anchor='mm')
    out = ROOT / 'pdp' / 'combos' / cid / 'gallery'
    out.mkdir(parents=True, exist_ok=True)
    b1 = NC.save_webp(canvas, out / 'nutrition-1200.webp', 190 * 1024)
    b2 = NC.save_webp(canvas.resize((800, 1000), Image.LANCZOS), out / 'nutrition-800.webp', 95 * 1024)
    print(f'{cid}: {len(dishes)} pouches, tables {tw}px wide, {kcal} kcal, {b1 / 1024:.0f}/{b2 / 1024:.0f} KB')


def main():
    combos = SN.combos()
    names = titles()
    ids = sys.argv[1:] or list(combos)
    for cid in ids:
        card(cid, combos[cid]['dishes'], names)


if __name__ == '__main__':
    main()
