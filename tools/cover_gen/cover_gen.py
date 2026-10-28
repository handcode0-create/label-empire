#!/usr/bin/env python3
"""Générateur de pochettes (PNG) pour Label Empire — outil interne.

Dépendances : Pillow, numpy.   pip install pillow numpy

Un même (titre, artiste, graine) donne toujours la même pochette.

Exemples :
  python tools/cover_gen/cover_gen.py --title "Soleil Rouge" --artist "Kaya Dembé" --kind EP --out /tmp/covers
  python tools/cover_gen/cover_gen.py --title "Nuit Blanche" --artist "Zaki" --style skyline --palette 3 --out /tmp/covers
  python tools/cover_gen/cover_gen.py --batch catalogue.json --out public/covers
  python tools/cover_gen/cover_gen.py --demo --out /tmp/demo          # planche des 8 styles
  python tools/cover_gen/cover_gen.py --from-save save.json --out public/covers   # sauvegarde du jeu

catalogue.json : [{"title": "...", "artist": "...", "kind": "Single|EP|Album", "style": 0-7, "palette": 0-7, "seed": 1}, ...]
(les champs style / palette / seed sont optionnels ; ils correspondent aux indices du sélecteur de pochettes du jeu).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import re
import sys
import unicodedata
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

FONT_DIRS = ["/usr/share/fonts/truetype/google-fonts", "/usr/share/fonts/opentype/inter", "/usr/share/fonts/truetype/dejavu",
             str(Path(__file__).parent / "fonts"), "C:/Windows/Fonts", "/Library/Fonts", "/System/Library/Fonts/Supplemental"]
FONT_BOLD = ["Poppins-Bold.ttf", "Inter-Bold.otf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"]
FONT_REG = ["Poppins-Medium.ttf", "Poppins-Regular.ttf", "InterDisplay-Medium.otf", "DejaVuSans.ttf", "arial.ttf"]


def find_font(names: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for d in FONT_DIRS:
        for n in names:
            p = Path(d) / n
            if p.exists():
                return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


# ── Palettes : (fond haut, fond bas, accent 1, accent 2, texte) — alignées sur la charte du jeu
PALETTES = [
    ("#2A0B4D", "#0C0719", "#F43F9D", "#FFC63D", "#FFF4FB"),   # 0 magenta nuit
    ("#3A2500", "#0E0A04", "#FFC63D", "#FF7A3D", "#FFF8E6"),   # 1 or
    ("#06324A", "#050B1A", "#35D3F0", "#8B5CF6", "#EAFBFF"),   # 2 cyan
    ("#06361F", "#040E0A", "#3DDC97", "#C6F24A", "#EDFFF6"),   # 3 vert
    ("#4A0F0A", "#12060A", "#FF5A3D", "#FFC63D", "#FFF1EC"),   # 4 braise
    ("#14102B", "#050410", "#8B5CF6", "#F43F9D", "#F3EEFF"),   # 5 nuit
    ("#3B0A2E", "#14051C", "#FF6BB8", "#35D3F0", "#FFF0F8"),   # 6 bubblegum
    ("#10261E", "#050A08", "#E8D9A8", "#3DDC97", "#FBF7EA"),   # 7 sable
]
STYLES = ["soleil", "vagues", "prisme", "anneaux", "rayures", "skyline", "grille", "eclat"]
LAYOUTS = ["bas", "centre", "haut"]


def hex2rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "cover"


def seed_of(title: str, artist: str, seed: int) -> int:
    return int(hashlib.sha256(f"{title}|{artist}|{seed}".encode()).hexdigest()[:12], 16)


# ── Fond ─────────────────────────────────────────────────────────────────────
def gradient_bg(S: int, top, bottom, angle: float) -> Image.Image:
    y, x = np.mgrid[0:S, 0:S].astype(np.float32) / S
    t = (x - .5) * math.sin(angle) + (y - .5) * math.cos(angle) + .5
    t = np.clip(t, 0, 1)[..., None]
    arr = np.array(top, np.float32) * (1 - t) + np.array(bottom, np.float32) * t
    return Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA")


def radial_glow(S: int, cx: float, cy: float, r: float, color, strength: float = .8) -> Image.Image:
    y, x = np.mgrid[0:S, 0:S].astype(np.float32)
    d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r
    a = np.clip(1 - d, 0, 1) ** 2 * strength
    arr = np.zeros((S, S, 4), np.uint8)
    arr[..., :3] = color
    arr[..., 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def glow(layer: Image.Image, radius: float, boost: float = 1.0) -> Image.Image:
    """Halo : ajoute une version floutée du calque sous le calque."""
    blur = layer.filter(ImageFilter.GaussianBlur(radius))
    if boost != 1:
        a = blur.getchannel("A").point(lambda v: min(255, int(v * boost)))
        blur.putalpha(a)
    return Image.alpha_composite(blur, layer)


# ── Styles (dessinent sur un calque RGBA de S×S) ─────────────────────────────
def st_soleil(S, rnd, c1, c2, bg):
    L = Image.new("RGBA", (S, S))
    d = ImageDraw.Draw(L)
    cx, cy, r = S * rnd.uniform(.38, .62), S * rnd.uniform(.36, .48), S * rnd.uniform(.22, .30)
    # disque dégradé vertical c2 → c1
    disc = Image.new("RGBA", (S, S))
    px = np.zeros((S, S, 4), np.uint8)
    for yy in range(int(cy - r), int(cy + r)):
        t = (yy - (cy - r)) / (2 * r)
        px[yy, :, :3] = mix(c2, c1, t)
        px[yy, :, 3] = 255
    disc = Image.fromarray(px, "RGBA")
    mask = Image.new("L", (S, S))
    ImageDraw.Draw(mask).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    # bandes horizontales qui découpent la partie basse (look rétro)
    md = ImageDraw.Draw(mask)
    for i in range(7):
        y0 = cy + r * (.05 + i * .15)
        md.rectangle([0, y0, S, y0 + r * (.015 + i * .012)], fill=0)
    disc.putalpha(ImageChops.multiply(disc.getchannel("A"), mask))
    L = glow(disc, S * .03, 1.4)
    # sol sombre + lignes d'horizon
    hy = cy + r * 1.35
    d = ImageDraw.Draw(L)
    d.rectangle([0, hy, S, S], fill=bg + (255,))
    for i in range(1, 9):
        y = hy + (S - hy) * (i / 8) ** 1.8
        d.line([0, y, S, y], fill=c1 + (int(200 * (1 - i / 10)),), width=max(2, S // 400))
    return L


def st_vagues(S, rnd, c1, c2, bg):
    L = Image.new("RGBA", (S, S))
    d = ImageDraw.Draw(L)
    n = rnd.randint(7, 10)
    for i in range(n):
        base = S * (.28 + .72 * i / n)
        amp, freq, ph = S * rnd.uniform(.02, .06), rnd.uniform(1.2, 3.2), rnd.uniform(0, 6.28)
        pts = [(x, base + amp * math.sin(x / S * freq * 6.28 + ph)) for x in range(0, S + 8, 8)]
        col = mix(c1, c2, i / (n - 1)) + (int(70 + 150 * i / n),)
        d.polygon(pts + [(S, S), (0, S)], fill=col)
        d.line(pts, fill=mix(c2, (255, 255, 255), .35) + (150,), width=max(2, S // 300))
    return glow(L, S * .012, .8)


def st_prisme(S, rnd, c1, c2, bg):
    L = Image.new("RGBA", (S, S))
    d = ImageDraw.Draw(L)
    cx, cy = S * rnd.uniform(.42, .58), S * rnd.uniform(.38, .5)
    R = S * rnd.uniform(.24, .32)
    pts = [(cx + R * math.cos(math.radians(a - 90)), cy + R * math.sin(math.radians(a - 90))) for a in (0, 120, 240)]
    for i in range(14):   # copies décalées = profondeur
        k = i / 14
        sc = 1 + k * .9
        p = [(cx + (x - cx) * sc, cy + (y - cy) * sc) for x, y in pts]
        d.polygon(p, outline=mix(c1, c2, k) + (int(230 * (1 - k)),), width=max(3, S // 260))
    d.polygon(pts, fill=mix(c1, bg, .55) + (230,))
    # faisceau dispersé
    for i, a in enumerate(range(-20, 25, 9)):
        ang = math.radians(a)
        x1, y1 = cx + R * .5, cy
        x2, y2 = S, cy + math.tan(ang) * (S - x1) * .8
        d.line([x1, y1, x2, y2], fill=mix(c1, c2, i / 5) + (190,), width=max(4, S // 130))
    return glow(L, S * .015, 1.2)


def st_anneaux(S, rnd, c1, c2, bg):
    L = Image.new("RGBA", (S, S))
    d = ImageDraw.Draw(L)
    cx, cy = S * rnd.uniform(.35, .65), S * rnd.uniform(.35, .55)
    n = rnd.randint(11, 17)
    for i in range(n):
        k = i / (n - 1)
        r = S * (.06 + .62 * k)
        ox, oy = (k * S * .06) * (1 if rnd.random() > .5 else -1), k * S * .05
        d.ellipse([cx - r + ox, cy - r + oy, cx + r + ox, cy + r + oy], outline=mix(c2, c1, k) + (int(255 - 150 * k),), width=max(3, int(S * (.006 + .01 * (1 - k)))))
    d.ellipse([cx - S * .05, cy - S * .05, cx + S * .05, cy + S * .05], fill=c2 + (255,))
    return glow(L, S * .012, 1.0)


def st_rayures(S, rnd, c1, c2, bg):
    L = Image.new("RGBA", (S * 2, S * 2))
    d = ImageDraw.Draw(L)
    n, w = rnd.randint(9, 16), 0
    step = S * 2 / n
    for i in range(n):
        k = i / n
        wd = step * rnd.uniform(.25, .6)
        d.rectangle([i * step, -S, i * step + wd, S * 3], fill=mix(c1, c2, k) + (int(120 + 130 * rnd.random()),))
    L = L.rotate(rnd.choice([-35, -25, 25, 35]), resample=Image.BICUBIC)
    L = L.crop((S // 2, S // 2, S // 2 + S, S // 2 + S))
    return glow(L, S * .01, .7)


def st_skyline(S, rnd, c1, c2, bg):
    L = Image.new("RGBA", (S, S))
    sun = radial_glow(S, S * rnd.uniform(.3, .7), S * .5, S * .55, c1, .85)
    L = Image.alpha_composite(L, sun)
    d = ImageDraw.Draw(L)
    for layer in range(3):
        k = layer / 2
        col = mix(bg, mix(c1, bg, .35), .55 - .4 * k)
        x = -S * .02
        base = S * (.96 - .0 * layer)
        while x < S:
            w = S * rnd.uniform(.05, .11)
            h = S * rnd.uniform(.12, .34) * (1 + .5 * k) * (1 if layer else .8)
            d.rectangle([x, base - h, x + w, base], fill=col + (255,))
            if layer == 2:   # fenêtres éclairées
                for wy in np.arange(base - h + S * .02, base - S * .01, S * .028):
                    for wx in np.arange(x + w * .15, x + w * .85, S * .02):
                        if rnd.random() < .22:
                            d.rectangle([wx, wy, wx + S * .008, wy + S * .014], fill=c2 + (230,))
            x += w + S * rnd.uniform(0, .012)
    return L


def st_grille(S, rnd, c1, c2, bg):
    L = Image.new("RGBA", (S, S))
    d = ImageDraw.Draw(L)
    hy = S * rnd.uniform(.5, .6)
    d.rectangle([0, hy, S, S], fill=mix(bg, c1, .12) + (255,))
    for i in range(1, 15):   # lignes horizontales en perspective
        y = hy + (S - hy) * (i / 14) ** 2.2
        d.line([0, y, S, y], fill=c1 + (int(240 * (i / 14) ** .6),), width=max(2, S // 330))
    for i in range(-14, 15):  # fuyantes
        d.line([S / 2 + i * S * .02, hy, S / 2 + i * S * .24, S], fill=c1 + (190,), width=max(2, S // 330))
    sun = radial_glow(S, S / 2, hy, S * .42, c2, .9)
    L = Image.alpha_composite(sun, L)
    return glow(L, S * .01, 1.1)


def st_eclat(S, rnd, c1, c2, bg):
    L = Image.new("RGBA", (S, S))
    d = ImageDraw.Draw(L)
    cx, cy = S * rnd.uniform(.4, .6), S * rnd.uniform(.38, .5)
    n = rnd.randint(18, 30)
    for i in range(n):
        a = i / n * 6.2832 + rnd.uniform(-.06, .06)
        r1, r2 = S * rnd.uniform(.4, .75), S * rnd.uniform(.03, .08)
        w = rnd.uniform(.03, .09)
        p = [(cx + r2 * math.cos(a - w), cy + r2 * math.sin(a - w)), (cx + r1 * math.cos(a), cy + r1 * math.sin(a)), (cx + r2 * math.cos(a + w), cy + r2 * math.sin(a + w))]
        d.polygon(p, fill=mix(c1, c2, rnd.random()) + (rnd.randint(110, 235),))
    d.ellipse([cx - S * .07, cy - S * .07, cx + S * .07, cy + S * .07], fill=mix(c2, (255, 255, 255), .6) + (255,))
    return glow(L, S * .018, 1.3)


STYLE_FUNCS = {"soleil": st_soleil, "vagues": st_vagues, "prisme": st_prisme, "anneaux": st_anneaux, "rayures": st_rayures,
               "skyline": st_skyline, "grille": st_grille, "eclat": st_eclat}


# ── Finitions ────────────────────────────────────────────────────────────────
def grain(img: Image.Image, amount: float, rnd: random.Random) -> Image.Image:
    rs = np.random.RandomState(rnd.randint(0, 2 ** 31))
    n = rs.normal(0, amount, img.size[::-1] + (1,)).astype(np.float32)
    a = np.array(img.convert("RGB"), np.float32) + n
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def vignette(img: Image.Image, strength: float = .55) -> Image.Image:
    S = img.size[0]
    y, x = np.mgrid[0:S, 0:S].astype(np.float32) / S
    d = np.sqrt((x - .5) ** 2 + (y - .5) ** 2) * 1.35
    m = 1 - np.clip(d, 0, 1) ** 2.2 * strength
    a = np.array(img.convert("RGB"), np.float32) * m[..., None]
    return Image.fromarray(a.astype(np.uint8), "RGB").convert("RGBA")


def fit_font(draw, text, names, max_w, max_size, min_size):
    size = max_size
    while size > min_size:
        f = find_font(names, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return find_font(names, min_size)


def wrap(draw, text, font, max_w) -> list[str]:
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def spaced(draw, xy, text, font, fill, spacing):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + spacing


def spaced_width(draw, text, font, spacing):
    return sum(draw.textlength(c, font=font) + spacing for c in text) - spacing


def typography(img: Image.Image, title: str, artist: str, kind: str, ink, accent, layout: str) -> Image.Image:
    S = img.size[0]
    pad = int(S * .07)
    d = ImageDraw.Draw(img, "RGBA")
    max_w = S - 2 * pad
    t = title.upper()
    # titre : 1 à 3 lignes, taille maximale qui tient
    best = None
    for size in range(int(S * .17), int(S * .06), -6):
        f = find_font(FONT_BOLD, size)
        lines = wrap(d, t, f, max_w)
        if len(lines) <= 3 and all(d.textlength(l, font=f) <= max_w for l in lines):
            best = (f, lines, size)
            break
    f, lines, size = best or (find_font(FONT_BOLD, int(S * .06)), wrap(d, t, find_font(FONT_BOLD, int(S * .06)), max_w), int(S * .06))
    lh = int(size * 1.0)
    block_h = lh * len(lines)
    small = find_font(FONT_REG, int(S * .032))
    sp = S * .006
    if layout == "haut":
        y0 = pad + int(S * .05)
    elif layout == "centre":
        y0 = (S - block_h) // 2
    else:
        y0 = S - pad - int(S * .09) - block_h
    # ombre douce derrière le titre pour la lisibilité
    sh = Image.new("RGBA", img.size)
    sd = ImageDraw.Draw(sh)
    for i, l in enumerate(lines):
        x = pad if layout != "centre" else (S - d.textlength(l, font=f)) / 2
        sd.text((x, y0 + i * lh), l, font=f, fill=(0, 0, 0, 170))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(S * .012)))
    d = ImageDraw.Draw(img, "RGBA")
    for i, l in enumerate(lines):
        x = pad if layout != "centre" else (S - d.textlength(l, font=f)) / 2
        d.text((x, y0 + i * lh), l, font=f, fill=ink + (255,))
    # filet d'accent + nom de l'artiste
    a_txt = artist.upper()
    ay = y0 + block_h + int(S * .045)
    if layout == "centre":
        ax = (S - spaced_width(d, a_txt, small, sp)) / 2
        d.rectangle([S / 2 - S * .05, ay - S * .012, S / 2 + S * .05, ay - S * .006], fill=accent + (255,))
    else:
        ax = pad
        d.rectangle([pad, ay - S * .012, pad + S * .1, ay - S * .006], fill=accent + (255,))
    spaced(d, (ax, ay + S * .008), a_txt, small, ink + (235,), sp)
    # pastille du type de projet (coin supérieur droit)
    if kind:
        kf = find_font(FONT_BOLD, int(S * .026))
        k = kind.upper()
        kw = spaced_width(d, k, kf, S * .004)
        bx1, by0 = S - pad, pad * .8 if layout != "haut" else S - pad - int(S * .07)
        by0 = pad * .8
        d.rounded_rectangle([bx1 - kw - S * .05, by0, bx1, by0 + S * .06], radius=S * .03, fill=accent + (255,))
        spaced(d, (bx1 - kw - S * .025, by0 + S * .014), k, kf, (15, 10, 30), S * .004)
    return img


# ── Assemblage ───────────────────────────────────────────────────────────────
def make_cover(title: str, artist: str = "", kind: str = "Single", style: int | str | None = None, palette: int | None = None,
               seed: int = 0, size: int = 1400, layout: str | None = None, text: bool = True) -> Image.Image:
    rnd = random.Random(seed_of(title, artist, seed))
    st = STYLES[style % len(STYLES)] if isinstance(style, int) else (style or rnd.choice(STYLES))
    if st not in STYLE_FUNCS:
        raise SystemExit(f"Style inconnu : {st}. Choix : {', '.join(STYLES)}")
    pal = PALETTES[(palette if palette is not None else rnd.randrange(len(PALETTES))) % len(PALETTES)]
    top, bot, c1, c2, ink = (hex2rgb(h) for h in pal)
    S = size * 2   # sur-échantillonnage ×2 puis réduction (anti-aliasing)
    img = gradient_bg(S, top, bot, rnd.uniform(-.5, .5))
    img = Image.alpha_composite(img, radial_glow(S, S * rnd.uniform(.2, .8), S * rnd.uniform(.15, .5), S * .75, c1, .28))
    img = Image.alpha_composite(img, STYLE_FUNCS[st](S, rnd, c1, c2, bot))
    img = vignette(img)
    img = grain(img, 6, rnd)
    if text:
        img = typography(img, title, artist, kind, ink, c1, layout or rnd.choice(LAYOUTS))
    return img.resize((size, size), Image.LANCZOS).convert("RGB")


def save(img: Image.Image, out: Path, name: str, fmt: str) -> Path:
    out.mkdir(parents=True, exist_ok=True)
    p = out / f"{name}.{fmt}"
    img.save(p, quality=92) if fmt == "jpg" else img.save(p, optimize=True)
    return p


def from_save(path: Path) -> list[dict]:
    """Lit une sauvegarde du jeu (JSON) : projets et singles, avec leur style/palette éventuels."""
    raw = json.loads(path.read_text())
    g = raw.get("game", raw)
    artists = {a["id"]: a.get("stageName", "") for a in g.get("artists", [])}
    items = []
    for p in g.get("projects", []):
        c = p.get("cover") or {}
        items.append({"title": p["name"], "artist": artists.get(p.get("artistId"), ""), "kind": p.get("kind", "EP"), "style": c.get("style"), "palette": c.get("palette")})
    inproj = {sid for p in g.get("projects", []) for sid in p.get("songIds", [])}
    for s in g.get("songs", []):
        if s["id"] in inproj:
            continue
        c = s.get("cover") or {}
        items.append({"title": s["title"], "artist": artists.get(s.get("artistId"), ""), "kind": "Single", "style": c.get("style"), "palette": c.get("palette")})
    return items


def demo_sheet(out: Path, size: int) -> Path:
    tile = size // 2
    sheet = Image.new("RGB", (tile * 4, tile * 2))
    names = ["Soleil Rouge", "Vagues d'Or", "Prisme", "Écho Infini", "Rayures", "Nuit d'Abidjan", "Neon Grid", "Éclats"]
    for i, st in enumerate(STYLES):
        c = make_cover(names[i], "Artiste Fictif", ["Single", "EP", "Album"][i % 3], style=i, palette=i, size=tile)
        sheet.paste(c, ((i % 4) * tile, (i // 4) * tile))
    out.mkdir(parents=True, exist_ok=True)
    p = out / "planche-styles.png"
    sheet.save(p)
    return p


def main(argv=None):
    ap = argparse.ArgumentParser(description="Générateur de pochettes Label Empire")
    ap.add_argument("--title"), ap.add_argument("--artist", default=""), ap.add_argument("--kind", default="Single", choices=["Single", "EP", "Album"])
    ap.add_argument("--style", help="nom (" + ", ".join(STYLES) + ") ou indice 0-7")
    ap.add_argument("--palette", type=int, help="indice 0-7")
    ap.add_argument("--layout", choices=LAYOUTS)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--size", type=int, default=1400, help="côté en pixels (3000 pour les plateformes)")
    ap.add_argument("--format", default="png", choices=["png", "jpg"])
    ap.add_argument("--no-text", action="store_true", help="fond seul, sans titre")
    ap.add_argument("--batch", type=Path), ap.add_argument("--from-save", type=Path), ap.add_argument("--demo", action="store_true")
    ap.add_argument("--out", type=Path, default=Path("covers_out"))
    a = ap.parse_args(argv)

    if a.demo:
        print(demo_sheet(a.out, a.size))
        return 0
    jobs: list[dict] = []
    if a.batch:
        jobs = json.loads(a.batch.read_text())
    elif a.from_save:
        jobs = from_save(a.from_save)
    elif a.title:
        jobs = [{"title": a.title, "artist": a.artist, "kind": a.kind, "style": a.style, "palette": a.palette, "seed": a.seed, "layout": a.layout}]
    else:
        ap.error("Donnez --title, --batch, --from-save ou --demo.")
    for j in jobs:
        sty = j.get("style")
        if isinstance(sty, str) and sty.isdigit():
            sty = int(sty)
        img = make_cover(j["title"], j.get("artist", ""), j.get("kind", "Single"), sty, j.get("palette"), j.get("seed", a.seed), a.size, j.get("layout"), not a.no_text)
        print(save(img, a.out, slug(f"{j.get('artist', '')} {j['title']}"), a.format))
    return 0


if __name__ == "__main__":
    sys.exit(main())
