"""Regenerate the extension icons from the UtilityInstant brand mark.

Matches public/utilityinstant-favicon.png used by the main site: a
rounded-square #315fdf tile with a bold white "Ui" wordmark. Requires
Pillow (`pip install pillow`). Run from this directory:

    python tools/make_icons.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [16, 32, 48, 128]
BRAND_BLUE = (49, 95, 223, 255)  # #315fdf, same token as --primary in app/globals.css
WHITE = (255, 255, 255, 255)
FONT_PATH = r"C:\Windows\Fonts\arialbd.ttf"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "icons")


def rounded_square(size, radius_ratio=0.22):
    scale = 4
    big = size * scale
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(big * radius_ratio)
    draw.rounded_rectangle([0, 0, big - 1, big - 1], radius=radius, fill=BRAND_BLUE)

    font_size = int(big * 0.56)
    font = ImageFont.truetype(FONT_PATH, font_size)
    text = "Ui"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pos = ((big - tw) / 2 - bbox[0], (big - th) / 2 - bbox[1])
    draw.text(pos, text, font=font, fill=WHITE)

    return img.resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for size in SIZES:
        icon = rounded_square(size)
        path = os.path.join(OUT_DIR, f"icon{size}.png")
        icon.save(path)
        print("wrote", path)


if __name__ == "__main__":
    main()
