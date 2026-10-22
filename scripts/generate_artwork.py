#!/usr/bin/env python3
"""Generate Waveform's flat artwork set (album covers, artist images,
playlist covers, app icon) as 600x600 PNGs. Deterministic: same seed,
same art. Flat geometric compositions only — no gradients, no photos.

Run: python3 scripts/generate_artwork.py
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "artwork")
os.makedirs(OUT, exist_ok=True)
S = 600
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def motif(draw, kind, pal, rng):
    bg, a, b, c = pal
    if kind == "sun":
        cx, cy, r = 300, 270, 150
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=a)
        for i in range(5):
            y = 400 + i * 36
            draw.rectangle([0, y, S, y + 14], fill=b)
    elif kind == "arcs":
        for i, col in enumerate([a, b, c, a, b]):
            r = 420 - i * 70
            draw.arc([-r + 80, S - r - 60, r + 80, S + r - 60], start=180, end=360, fill=col, width=34)
        draw.ellipse([470, 90, 540, 160], fill=a)
    elif kind == "grid":
        for gx in range(6):
            for gy in range(6):
                if rng.random() > 0.45:
                    x, y = 60 + gx * 88, 60 + gy * 88
                    if (gx + gy) % 3 == 0:
                        draw.ellipse([x, y, x + 44, y + 44], fill=a)
                    else:
                        draw.rectangle([x, y, x + 44, y + 44], fill=b if (gx * gy) % 2 else c)
    elif kind == "diagonal":
        draw.polygon([(0, S), (S, 120), (S, S)], fill=a)
        draw.ellipse([120, 120, 300, 300], fill=c)
        draw.rectangle([0, 470, S, 492], fill=b)
    elif kind == "orbit":
        cx, cy = 300, 300
        for r, col in [(230, b), (170, c), (110, a)]:
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=16)
        draw.ellipse([cx - 46, cy - 46, cx + 46, cy + 46], fill=a)
        ang = rng.uniform(0, 6.28)
        px, py = cx + 170 * math.cos(ang), cy + 170 * math.sin(ang)
        draw.ellipse([px - 26, py - 26, px + 26, py + 26], fill=c)
    elif kind == "peaks":
        draw.polygon([(0, S), (180, 220), (360, S)], fill=a)
        draw.polygon([(180, S), (400, 160), (S, S)], fill=b)
        draw.ellipse([420, 70, 510, 160], fill=c)
    elif kind == "wave":
        for i in range(9):
            y = 90 + i * 52
            amp = 26 + (i % 3) * 16
            pts = [(x, y + amp * math.sin(x / 68.0 + i)) for x in range(0, S + 20, 20)]
            draw.line(pts, fill=[a, b, c][i % 3], width=17)
    elif kind == "steps":
        cols = [a, b, c]
        for i in range(5):
            h = 110 + i * 88
            draw.rectangle([70 + i * 96, S - h, 140 + i * 96, S], fill=cols[i % 3])
        draw.ellipse([400, 60, 520, 180], fill=a)


def cover(name, pal, kind, seed):
    rng = random.Random(seed)
    img = Image.new("RGB", (S, S), pal[0])
    motif(ImageDraw.Draw(img), kind, pal, rng)
    img.save(os.path.join(OUT, f"{name}.png"))


def text_cover(name, bg, lines, fg="#FFFFFF"):
    img = Image.new("RGB", (S, S), bg)
    d = ImageDraw.Draw(img)
    y = 64
    for text, size in lines:
        font = ImageFont.truetype(FONT_BOLD, size)
        d.text((52, y), text, font=font, fill=fg)
        y += int(size * 1.22)
    d.rectangle([52, S - 92, 150, S - 76], fill=fg)
    img.save(os.path.join(OUT, f"{name}.png"))


# (id, palette [bg, a, b, c], motif)  — palettes are flat and saturated; bg dark or light.
ALBUMS = [
    ("album-neon-meridian", ("#10131F", "#FF4D6D", "#FFD166", "#4CC9F0"), "sun"),
    ("album-cartographer", ("#0E1A1A", "#2EC4B6", "#E0FBFC", "#EE6C4D"), "orbit"),
    ("album-slow-tides", ("#F2EDE4", "#118AB2", "#073B4C", "#FFD166"), "wave"),
    ("album-festival-lights", ("#1D1033", "#FFD166", "#EF476F", "#06D6A0"), "grid"),
    ("album-terminal-velocity", ("#141414", "#F15E6C", "#FFFFFF", "#FFC24B"), "steps"),
    ("album-velvet-static", ("#221C26", "#C77DFF", "#FFAFCC", "#8ECAE6"), "arcs"),
    ("album-deep-focus", ("#0B2027", "#70C1B3", "#F3FFBD", "#247BA0"), "peaks"),
    ("album-insert-coin", ("#160F29", "#F72585", "#4CC9F0", "#FFD166"), "diagonal"),
]
ARTISTS = [
    ("artist-nova-reina", ("#FF4D6D", "#10131F", "#FFD166", "#FFFFFF"), "sun"),
    ("artist-atlas-grey", ("#2EC4B6", "#0E1A1A", "#E0FBFC", "#EE6C4D"), "orbit"),
    ("artist-mira-sol", ("#118AB2", "#F2EDE4", "#073B4C", "#FFD166"), "wave"),
    ("artist-paper-lanterns", ("#EF476F", "#1D1033", "#FFD166", "#06D6A0"), "grid"),
    ("artist-vector-club", ("#F15E6C", "#141414", "#FFFFFF", "#FFC24B"), "steps"),
    ("artist-sable-june", ("#C77DFF", "#221C26", "#FFAFCC", "#8ECAE6"), "arcs"),
    ("artist-orion-fields", ("#70C1B3", "#0B2027", "#F3FFBD", "#247BA0"), "peaks"),
    ("artist-midnight-arcade", ("#F72585", "#160F29", "#4CC9F0", "#FFD166"), "diagonal"),
]
for name, pal, kind in ALBUMS:
    cover(name, pal, kind, seed=hash(name) % 10000)
for name, pal, kind in ARTISTS:
    # Artist images: motif runs on the artist color as the field.
    cover(name, (pal[0], pal[1], pal[2], pal[3]), kind, seed=hash(name) % 9999)

text_cover("playlist-daily-mix-01", "#2D4BFF", [("Daily", 96), ("Mix 01", 96)])
text_cover("playlist-daily-mix-02", "#E13300", [("Daily", 96), ("Mix 02", 96)])
text_cover("playlist-daily-mix-03", "#0E7A3D", [("Daily", 96), ("Mix 03", 96)])
text_cover("playlist-weekly-mix", "#5038B8", [("Your", 84), ("Weekly", 84), ("Mix", 84)])
text_cover("playlist-liked", "#5038B8", [("Liked", 96), ("Songs", 96)])
text_cover("playlist-night-drive", "#10131F", [("Night", 96), ("Drive", 96)], fg="#4CC9F0")
text_cover("playlist-power-run", "#BA5D07", [("Power", 96), ("Run", 96)])
text_cover("playlist-deep-focus", "#0B2027", [("Deep", 96), ("Focus", 96)], fg="#70C1B3")
text_cover("playlist-chill", "#477D95", [("Chill", 96), ("Meridian", 84)])
text_cover("playlist-top-hits", "#E8115B", [("Top Hits", 88), ("Lab", 88)])

# --- App icon: flat green waveform bars on near-black -----------------------
ICON = 1024
img = Image.new("RGB", (ICON, ICON), "#121212")
d = ImageDraw.Draw(img)
heights = [180, 320, 470, 640, 470, 320, 180]
bw, gap, x = 74, 46, (ICON - (7 * 74 + 6 * 46)) // 2
for h in heights:
    d.rounded_rectangle([x, (ICON - h) // 2, x + bw, (ICON + h) // 2], radius=37, fill="#1DB954")
    x += bw + gap
img.save(os.path.join(os.path.dirname(__file__), "..", "assets", "icon.png"))

fg = Image.new("RGBA", (ICON, ICON), (0, 0, 0, 0))
d = ImageDraw.Draw(fg)
x = (ICON - (7 * 74 + 6 * 46)) // 2
for h in heights:
    d.rounded_rectangle([x, (ICON - h) // 2, x + bw, (ICON + h) // 2], radius=37, fill="#1DB954")
    x += bw + gap
fg.save(os.path.join(os.path.dirname(__file__), "..", "assets", "android-icon-foreground.png"))

print("artwork done:", len(os.listdir(OUT)), "files")
