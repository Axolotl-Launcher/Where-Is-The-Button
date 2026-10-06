"""Tile PNG stills into a labelled contact sheet.

usage: python scripts/sheet.py <out.png> <cols> <img1> <img2> ...
Each tile is labelled with the frame number parsed from the file name.
"""
import re
import sys
from PIL import Image, ImageDraw, ImageFont

out, cols, *files = sys.argv[1:]
cols = int(cols)
tiles = [Image.open(f).convert('RGB') for f in files]
tw = 640
th = round(tw * tiles[0].height / tiles[0].width)
pad = 6
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad) + pad), (32, 32, 36))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('arial.ttf', 22)
except OSError:
    font = ImageFont.load_default()
for i, (img, f) in enumerate(zip(tiles, files)):
    x = pad + (i % cols) * (tw + pad)
    y = pad + (i // cols) * (th + pad)
    sheet.paste(img.resize((tw, th), Image.LANCZOS), (x, y))
    m = re.search(r'-(\d+)\.png$', f)
    label = f'f{int(m.group(1))}  {int(m.group(1))/60:.2f}s' if m else f
    draw.rectangle([x, y, x + 150, y + 30], fill=(0, 0, 0))
    draw.text((x + 6, y + 4), label, fill=(255, 255, 255), font=font)
sheet.save(out)
print(out)
