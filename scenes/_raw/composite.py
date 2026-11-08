"""Fallback: paste only the bowl opening (ellipse shrunk ~3%) of a generated image onto the untouched base bowl, so the bowl stays pixel-identical."""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
base = Image.open('scenes/_base-bowl.png').convert('RGB')
gen = Image.open(sys.argv[1]).convert('RGB')
cx, cy, rx, ry = 512, 432, 350 * 0.97, 148 * 0.97
m = Image.new('L', base.size, 0)
ImageDraw.Draw(m).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
m = m.filter(ImageFilter.GaussianBlur(3))
out = Image.composite(gen, base, m)
out.save(sys.argv[2])
print('wrote', sys.argv[2])
