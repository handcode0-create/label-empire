#!/usr/bin/env python3
"""Génère les prompts d'avatars (docs/avatars/PROMPTS.md) pour un générateur d'images (ChatGPT, Midjourney, etc.).

Usage : python3 tools/avatars/prompts.py
Les 36 portraits d'artistes (9 régions x 2 femmes + 2 hommes) et 4 personnages de l'histoire.
Chaque image porte le nom de sa clé : afrique-ouest-f1.png, story-ines.png, etc.
"""
from pathlib import Path

STYLE = (
    "Modern 2D cartoon character portrait for a music-industry video game. Bust shot, facing slightly three-quarters, "
    "confident expressive face, big friendly eyes, clean bold outlines, smooth cel shading with soft rim light. "
    "Vibrant saturated modern color palette (magenta, violet, cyan, gold) in the clothes and lighting. "
    "Stylish contemporary streetwear and stage fashion. Centered, square 1:1 composition, head and shoulders, "
    "plain flat dark violet background (#1C1236), no text, no logo, no watermark, no real-person likeness. "
    "Polished professional game-art quality, consistent style across the whole set."
)

REGIONS = [
    ("afrique-ouest", "West African, deep brown skin"),
    ("afrique-est-sud", "Southern or East African, rich brown skin"),
    ("afrique-nord", "North African, olive to tan skin"),
    ("europe", "European, light to medium skin, mixed backgrounds"),
    ("amerique-nord", "North American, diverse backgrounds"),
    ("amerique-latine", "Latin American, warm tan skin"),
    ("asie-est", "East Asian"),
    ("asie-sud-ouest", "South Asian or Middle Eastern"),
    ("oceanie", "Oceanian, Pacific Islander or Australian"),
]

# Quatre styles distincts par région : 2 femmes, 2 hommes
LOOKS = {
    "f1": ("young woman", "bold braided hairstyle, gold hoop earrings, neon pink cropped jacket, microphone charm necklace"),
    "f2": ("young woman", "voluminous curly hair, bright cyan oversized hoodie, sparkling rings, playful smile"),
    "m1": ("young man", "sharp fade haircut with a shaved line, gold chain, violet varsity jacket, confident smirk"),
    "m2": ("young man", "short twists, round tinted glasses, mustard yellow bomber jacket, relaxed grin"),
}

STORY = {
    "story-ines": "Inès Marchetti, 30s woman, label operations director, European, sleek dark bob haircut, tailored magenta blazer, tablet in hand, warm and organized expression",
    "story-kwame": "Kwame Baro, 40s man, master of ceremonies, West African, charismatic, sparkling gold jacket, headset microphone, big showman smile",
    "story-tomas": "Tomás Reyes, 50s man, rival record executive, Latin American, silver-streaked hair, dark navy suit with violet tie, calculating confident half-smile",
    "story-joueur": "Young label founder, neutral and welcoming, modern smart-casual jacket in violet and gold, determined optimistic expression, unisex friendly look",
}


def main() -> None:
    out = ["# Prompts d'avatars", "",
           "Générez chaque image avec votre outil, puis déposez-la dans `avatars_src/` sous le nom indiqué (PNG ou JPG, carré, 1024 px conseillé).",
           "Ensuite : `npm run avatars` convertit tout en WebP 512 px dans `public/avatars/` et met à jour le manifeste. Le jeu utilise un monogramme tant qu'une image manque.", "",
           "## Prompt de style (à coller en tête de chaque prompt)", "", f"> {STYLE}", ""]
    out += ["## Portraits d'artistes", ""]
    for rid, look in REGIONS:
        out += [f"### {rid}", ""]
        for v, (who, desc) in LOOKS.items():
            out += [f"**`{rid}-{v}.png`**", "", f"> {STYLE} Subject: a {who}, {look}; {desc}.", ""]
    out += ["## Personnages de l'histoire", ""]
    for key, desc in STORY.items():
        out += [f"**`{key}.png`**", "", f"> {STYLE} Subject: {desc}.", ""]
    path = Path(__file__).resolve().parents[2] / "docs" / "avatars" / "PROMPTS.md"
    path.write_text("\n".join(out), encoding="utf-8")
    print(f"{path} : {len(REGIONS) * 4} portraits + {len(STORY)} personnages")


if __name__ == "__main__":
    main()
