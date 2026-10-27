#!/usr/bin/env python3
"""Génère les logos SVG des médias du jeu dans public/media/<id>.svg.

Usage : python3 tools/logo_gen/media_logos.py
Les ids et noms viennent de src/data/media.ts (liste dupliquée ici pour rester sans dépendance).
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import logo_gen as lg  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SRC = (ROOT / "src" / "data" / "media.ts").read_text(encoding="utf-8")
ITEMS = re.findall(r"id: '([^']+)', name: '([^']+)', kind: '(\w+)'", SRC)
STYLE = {  # un langage visuel par type de média
    "Radio": ("cercle", "ondes"),
    "TV": ("carre", "etoile"),
    "Presse": ("losange", "monogramme"),
    "Web": ("octogone", "eclair"),
    "Streaming": ("hexagone", "note"),
}
PALS = ["magenta", "or", "cyan", "vert", "braise", "nuit"]


def main() -> None:
    out = ROOT / "public" / "media"
    out.mkdir(parents=True, exist_ok=True)
    for i, (mid, name, kind) in enumerate(ITEMS):
        shape, motif = STYLE[kind]
        spec = lg.make_spec(name, 0, shape=shape, motif=motif, palette=PALS[i % len(PALS)], ring=(i % 2 == 0))
        (out / f"{mid}.svg").write_text(lg.render_icon(spec), encoding="utf-8")
    print(f"{len(ITEMS)} logos de médias -> {out}")


if __name__ == "__main__":
    main()
