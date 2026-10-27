#!/usr/bin/env python3
"""Générateur de logos de label en SVG (Label Empire).

Sans dépendance (bibliothèque standard uniquement). Déterministe : le même
nom + la même graine donnent toujours le même logo.

Exemples :
  python tools/logo_gen/logo_gen.py --name "Savane Records" --out /tmp/logo
  python tools/logo_gen/logo_gen.py --batch --count 24 --out public/logos
  python tools/logo_gen/logo_gen.py --presets --out public/logos      # jeu de logos du jeu
"""
from __future__ import annotations
import argparse, json, math, random, re, sys, unicodedata
from dataclasses import dataclass, asdict
from pathlib import Path

# Palette de la maquette (couleurs du jeu)
PALETTES = {
    "magenta": ("#FF3D9A", "#8B5CF6"),
    "or": ("#FFC63D", "#FF5470"),
    "cyan": ("#35D3F0", "#8B5CF6"),
    "vert": ("#3DDC97", "#35D3F0"),
    "braise": ("#FF5470", "#FFC63D"),
    "nuit": ("#8B5CF6", "#2A1B4D"),
}
SHAPES = ["cercle", "hexagone", "bouclier", "losange", "carre", "octogone", "triangle"]
MOTIFS = ["monogramme", "vinyle", "ondes", "etoile", "note", "couronne", "eclair", "soleil"]
BG = "#120B24"
INK = "#F4F0FF"


@dataclass
class Spec:
    name: str
    shape: str
    motif: str
    palette: str
    ring: bool
    seed: int


def slug(text: str) -> str:
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-") or "label"


def initials(name: str) -> str:
    words = [w for w in re.split(r"\s+", name.strip()) if w]
    if not words:
        return "L"
    if len(words) == 1:
        return words[0][:2].upper()
    return (words[0][0] + words[1][0]).upper()


def make_spec(name: str, seed: int = 0, **forced) -> Spec:
    rnd = random.Random(f"{name}|{seed}")
    spec = Spec(
        name=name,
        shape=rnd.choice(SHAPES),
        motif=rnd.choice(MOTIFS),
        palette=rnd.choice(list(PALETTES)),
        ring=rnd.random() < 0.5,
        seed=seed,
    )
    for k, v in forced.items():
        if v is not None:
            setattr(spec, k, v)
    return spec


# ---------- formes (repère 200x200, centre 100,100) ----------
def poly(points):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in points)


def regular(n, r, rot=-90):
    return [(100 + r * math.cos(math.radians(rot + i * 360 / n)),
             100 + r * math.sin(math.radians(rot + i * 360 / n))) for i in range(n)]


def shape_path(shape: str, r: float = 88, fill="url(#g)", extra="") -> str:
    if shape == "cercle":
        return f'<circle cx="100" cy="100" r="{r}" fill="{fill}" {extra}/>'
    if shape == "hexagone":
        return f'<polygon points="{poly(regular(6, r + 4, -90))}" fill="{fill}" {extra}/>'
    if shape == "octogone":
        return f'<polygon points="{poly(regular(8, r + 2, -67.5))}" fill="{fill}" {extra}/>'
    if shape == "losange":
        return f'<polygon points="100,{100 - r - 6} {100 + r + 6},100 100,{100 + r + 6} {100 - r - 6},100" fill="{fill}" {extra}/>'
    if shape == "carre":
        s = r * 1.7
        return f'<rect x="{100 - s / 2:.1f}" y="{100 - s / 2:.1f}" width="{s:.1f}" height="{s:.1f}" rx="{s * 0.22:.1f}" fill="{fill}" {extra}/>'
    if shape == "triangle":
        return f'<polygon points="{poly(regular(3, r + 8, -90))}" fill="{fill}" {extra}/>'
    # bouclier
    return (f'<path d="M100 {100 - r - 4} L{100 + r * 0.9:.1f} {100 - r * 0.55:.1f} '
            f'V{100 + r * 0.1:.1f} Q{100 + r * 0.9:.1f} {100 + r * 0.75:.1f} 100 {100 + r + 6} '
            f'Q{100 - r * 0.9:.1f} {100 + r * 0.75:.1f} {100 - r * 0.9:.1f} {100 + r * 0.1:.1f} '
            f'V{100 - r * 0.55:.1f} Z" fill="{fill}" {extra}/>')


# ---------- motifs (dessinés en encre claire au centre) ----------
def motif_svg(motif: str, name: str, dark: str) -> str:
    c = INK
    if motif == "monogramme":
        ini = initials(name)
        size = 74 if len(ini) == 1 else 62
        return (f'<text x="100" y="{100 + size * 0.34:.0f}" text-anchor="middle" font-family="Rajdhani, Impact, Arial Narrow, sans-serif" '
                f'font-weight="700" font-size="{size}" letter-spacing="2" fill="{c}">{ini}</text>')
    if motif == "vinyle":
        return (f'<circle cx="100" cy="100" r="44" fill="{dark}" opacity=".85"/>'
                + "".join(f'<circle cx="100" cy="100" r="{r}" fill="none" stroke="{c}" stroke-opacity=".5" stroke-width="1.6"/>' for r in (38, 30, 22))
                + f'<circle cx="100" cy="100" r="11" fill="{c}"/><circle cx="100" cy="100" r="3.5" fill="{dark}"/>')
    if motif == "ondes":
        hs = [18, 40, 62, 34, 52, 26, 14]
        bars = "".join(f'<rect x="{46 + i * 15:.0f}" y="{100 - h / 2:.0f}" width="9" height="{h}" rx="4.5" fill="{c}"/>' for i, h in enumerate(hs))
        return bars
    if motif == "etoile":
        pts = []
        for i in range(10):
            r = 46 if i % 2 == 0 else 19
            a = math.radians(-90 + i * 36)
            pts.append((100 + r * math.cos(a), 104 + r * math.sin(a)))
        return f'<polygon points="{poly(pts)}" fill="{c}"/>'
    if motif == "note":
        return (f'<path d="M84 128 V68 L124 58 V116" fill="none" stroke="{c}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>'
                f'<ellipse cx="76" cy="130" rx="15" ry="11" fill="{c}"/><ellipse cx="116" cy="118" rx="15" ry="11" fill="{c}"/>')
    if motif == "couronne":
        return (f'<path d="M58 126 L50 80 L80 102 L100 66 L120 102 L150 80 L142 126 Z" fill="{c}"/>'
                f'<rect x="58" y="132" width="84" height="10" rx="4" fill="{c}"/>')
    if motif == "eclair":
        return f'<path d="M110 54 L72 106 H98 L88 148 L130 92 H103 Z" fill="{c}" stroke="{c}" stroke-width="3" stroke-linejoin="round"/>'
    # soleil
    rays = "".join(
        f'<line x1="{100 + 34 * math.cos(math.radians(a)):.1f}" y1="{100 + 34 * math.sin(math.radians(a)):.1f}" '
        f'x2="{100 + 52 * math.cos(math.radians(a)):.1f}" y2="{100 + 52 * math.sin(math.radians(a)):.1f}" '
        f'stroke="{c}" stroke-width="7" stroke-linecap="round"/>' for a in range(0, 360, 30))
    return f'<circle cx="100" cy="100" r="22" fill="{c}"/>{rays}'


def icon_group(spec: Spec) -> str:
    a, b = PALETTES[spec.palette]
    body = shape_path(spec.shape, r=80)
    if spec.ring:
        body += shape_path(spec.shape, r=93, fill="none",
                           extra=f'stroke="{a}" stroke-opacity=".55" stroke-width="3"')
    glow = shape_path(spec.shape, r=80, fill="none", extra='stroke="#ffffff" stroke-opacity=".18" stroke-width="2"')
    return body + glow + motif_svg(spec.motif, spec.name, b if spec.palette != "nuit" else "#120B24")


def defs(spec: Spec, uid: str) -> str:
    a, b = PALETTES[spec.palette]
    return (f'<defs><linearGradient id="g{uid}" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs>')


def render_icon(spec: Spec, size: int = 512, background: bool = False) -> str:
    uid = slug(spec.name)[:12] + str(spec.seed)
    body = icon_group(spec).replace("url(#g)", f"url(#g{uid})")
    bg = f'<rect width="200" height="200" rx="36" fill="{BG}"/>' if background else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 200 200" role="img" '
            f'aria-label="Logo {escape(spec.name)}"><title>{escape(spec.name)}</title>{defs(spec, uid)}{bg}{body}</svg>')


def render_full(spec: Spec, height: int = 160) -> str:
    """Logo complet : icône + nom du label."""
    uid = slug(spec.name)[:12] + str(spec.seed)
    body = icon_group(spec).replace("url(#g)", f"url(#g{uid})")
    text_w = max(len(spec.name), 6) * 34
    width = 228 + text_w + 24
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width * height // 200}" height="{height}" viewBox="0 0 {width} 200" role="img" '
            f'aria-label="Logo {escape(spec.name)}"><title>{escape(spec.name)}</title>{defs(spec, uid)}'
            f'{body}<text x="228" y="118" textLength="{text_w}" lengthAdjust="spacingAndGlyphs" font-family="Rajdhani, Impact, Arial Narrow, sans-serif" '
            f'font-weight="700" font-size="58" fill="{INK}">{escape(spec.name.upper())}</text></svg>')


def escape(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


# ---------- jeu de logos prédéfinis du jeu ----------
PRESET_NAMES = ["Savane Records", "Harmattan Music", "Meridian Group", "Atlas Sound", "Vox Nova", "Lagune Studio",
                "Soleil Noir", "Kora Nation", "Baobab Beats", "Nuit d'Abidjan", "Cauris Sound", "Ébène Records",
                "Delta Waves", "Mistral Music", "Zenith Label", "Rythme Royal", "Ivoire Sound", "Sahel Groove",
                "Étoile du Sud", "Tonnerre Records", "Marée Haute", "Orage Music", "Oasis Records", "Phénix Sound"]


def write_set(specs: list[Spec], out: Path) -> list[dict]:
    out.mkdir(parents=True, exist_ok=True)
    manifest = []
    for i, s in enumerate(specs, 1):
        base = f"{i:02d}-{slug(s.name)}"
        (out / f"{base}.svg").write_text(render_icon(s), encoding="utf-8")
        (out / f"{base}-complet.svg").write_text(render_full(s), encoding="utf-8")
        manifest.append({"id": base, "icon": f"{base}.svg", "full": f"{base}-complet.svg", **asdict(s)})
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Génère des logos de label en SVG.")
    p.add_argument("--name", help="Nom du label (un seul logo)")
    p.add_argument("--seed", type=int, default=0)
    p.add_argument("--shape", choices=SHAPES)
    p.add_argument("--motif", choices=MOTIFS)
    p.add_argument("--palette", choices=list(PALETTES))
    p.add_argument("--batch", action="store_true", help="Génère plusieurs logos aléatoires")
    p.add_argument("--count", type=int, default=12)
    p.add_argument("--presets", action="store_true", help="Génère le jeu de logos prédéfinis du jeu")
    p.add_argument("--out", default="public/logos")
    a = p.parse_args(argv)
    out = Path(a.out)
    if a.presets:
        specs = [make_spec(n, a.seed) for n in PRESET_NAMES]
    elif a.batch:
        specs = [make_spec(f"Label {i}", a.seed + i) for i in range(1, a.count + 1)]
    elif a.name:
        specs = [make_spec(a.name, a.seed, shape=a.shape, motif=a.motif, palette=a.palette)]
    else:
        p.error("Donnez --name, --batch ou --presets")
    m = write_set(specs, out)
    print(f"{len(m)} logos écrits dans {out}/ (icône + version complète + manifest.json)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
