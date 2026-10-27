#!/usr/bin/env python3
"""Convertit les images de avatars_src/ en WebP 512 px dans public/avatars/ et écrit manifest.json.

Usage : python3 tools/avatars/pack.py   (ou : npm run avatars)
Nécessite Pillow : pip install pillow
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "avatars_src"
OUT = ROOT / "public" / "avatars"
SIZE = 512


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files: dict[str, str] = {}
    for p in sorted(SRC.glob("*")):
        if p.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue
        im = Image.open(p).convert("RGB")
        w, h = im.size
        side = min(w, h)
        im = im.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2)).resize((SIZE, SIZE), Image.LANCZOS)
        name = p.stem + ".webp"
        im.save(OUT / name, "WEBP", quality=88, method=6)
        files[p.stem] = name
    (OUT / "manifest.json").write_text(json.dumps({"files": files}, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"{len(files)} avatar(s) -> {OUT}")


if __name__ == "__main__":
    main()
