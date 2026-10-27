#!/usr/bin/env python3
"""Génère les prompts d'avatars (docs/avatars/PROMPTS.md) pour un générateur d'images (ChatGPT, Midjourney, etc.).

Usage : python3 tools/avatars/prompts.py
Les 36 portraits d'artistes (9 régions x 2 femmes + 2 hommes) et 4 personnages de l'histoire.
Chaque image porte le nom de sa clé : afrique-ouest-f1.png, story-ines.png, etc.
"""
import json
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

# Quatre styles par région, tous différents d'une région à l'autre (36 tenues distinctes) : f1, f2, m1, m2
LOOKS = {
    "afrique-ouest": [
        "long knotless braids with gold cuffs, gold hoop earrings, neon pink cropped jacket with wax-print lining, microphone charm necklace",
        "voluminous natural afro with a headwrap in bright wax print, cyan oversized hoodie, sparkling rings, playful smile",
        "sharp fade haircut with a shaved line, gold chain, violet varsity jacket, confident smirk",
        "short twists, round tinted glasses, mustard yellow bomber jacket over a wax-print shirt, relaxed grin",
    ],
    "afrique-est-sud": [
        "short bleached buzz cut, beaded statement collar necklace, orange puffer vest, bold confident gaze",
        "bantu knots, gold nose ring, lime green tracksuit jacket, joyful laugh",
        "high-top dreadlocks tied up, small gold earring, black leather jacket with magenta trim, intense focused look",
        "clean shaved head, short beard, cream knit sweater with geometric beaded pattern, warm wise smile",
    ],
    "afrique-nord": [
        "long wavy dark hair, kohl-lined eyes, embroidered teal jacket, delicate gold coin necklace, poised smile",
        "sleek high ponytail, silver ear cuffs, oversized white streetwear windbreaker with violet stripes, cheeky wink",
        "curly dark hair with undercut, trimmed beard, burgundy tracksuit, silver chain, cool half-smile",
        "short wavy hair, thin mustache, open denim jacket over a white tee, wireless earbuds, laid-back grin",
    ],
    "europe": [
        "platinum blonde bob, bold red lipstick, black oversized blazer with gold pins, sharp confident look",
        "copper red curly hair, freckles, pastel violet hoodie, small silver piercings, bright smile",
        "messy brown hair, light stubble, olive green bomber jacket, headphones around the neck, easygoing smile",
        "slicked back black hair, thin gold glasses, charcoal turtleneck, minimal silver chain, calm composed look",
    ],
    "amerique-nord": [
        "long box braids with cyan beads, gold grills smile, baby blue puffer jacket, dazzling confidence",
        "wavy shoulder-length chestnut hair, denim jacket covered in enamel pins, band tee, friendly grin",
        "cornrows, diamond stud earrings, oversized red letterman jacket, bold smirk",
        "messy blond surfer hair, bucket hat, pastel pink oversized shirt, chill relaxed smile",
    ],
    "amerique-latine": [
        "long dark wavy hair with a flower clip, big gold hoops, red crop top with ruffled sleeves, radiant smile",
        "curly hair in a high puff, colorful beaded earrings, yellow track jacket, energetic laugh",
        "curly black hair with fade, thin mustache, open floral print shirt, gold chain, charming grin",
        "long hair tied in a low bun, short beard, black hoodie with neon green details, cool serious look",
    ],
    "asie-est": [
        "straight black hair with blunt bangs and pink tips, layered silver necklaces, white oversized blazer, cool confident look",
        "two space buns, star-shaped hair clips, lavender cardigan over a graphic tee, cheerful smile",
        "dyed silver tousled hair, small hoop earring, black techwear jacket with cyan straps, intense gaze",
        "neat side-parted hair, round gold glasses, beige trench coat over a turtleneck, gentle smile",
    ],
    "asie-sud-ouest": [
        "long thick braid adorned with gold rings, small nose stud, emerald green embroidered jacket, warm smile",
        "short layered hair with a magenta streak, oversized retro windbreaker in purple and teal, playful grin",
        "styled wavy black hair, groomed beard, navy bomber jacket with gold embroidery, confident smile",
        "short curly hair, round glasses, mustard knit cardigan, headphones around the neck, thoughtful smile",
    ],
    "oceanie": [
        "long dark curly hair with a hibiscus flower, shell necklace, coral pink jacket, sunny smile",
        "sun-bleached wavy hair, freckles, turquoise surf hoodie, beaded bracelet, carefree laugh",
        "dark hair in a top knot, traditional-inspired geometric tattoo on the shoulder, black tank top with gold chain, proud smile",
        "short sandy hair, light stubble, open patterned bowling shirt in violet and teal, relaxed grin",
    ],
}
WHO = {"f1": "young woman", "f2": "young woman", "m1": "young man", "m2": "young man"}

STORY = {
    "story-ines": "Inès Marchetti, 30s woman, label operations director, European, sleek dark bob haircut, tailored magenta blazer, tablet in hand, warm and organized expression",
    "story-kwame": "Kwame Baro, 40s man, master of ceremonies, West African, charismatic, sparkling gold jacket, headset microphone, big showman smile",
    "story-tomas": "Tomás Reyes, 50s man, rival record executive, Latin American, silver-streaked hair, dark navy suit with violet tie, calculating confident half-smile",
    "story-joueur": "Young label founder, neutral and welcoming, modern smart-casual jacket in violet and gold, determined optimistic expression, unisex friendly look",
    "story-joueur-m": "Young man, label founder in his late 20s, West African, deep brown skin, short neat fade haircut with a subtle shaved line, short trimmed beard, violet tailored jacket with gold embroidery over a black tee, thin gold chain, determined optimistic half-smile, entrepreneur energy",
}


def main() -> None:
    out = ["# Prompts d'avatars", "",
           "Générez chaque image avec votre outil, puis déposez-la dans `avatars_src/` sous le nom indiqué (PNG ou JPG, carré, 1024 px conseillé).",
           "Ensuite : `npm run avatars` convertit tout en WebP 512 px dans `public/avatars/` et met à jour le manifeste. Le jeu utilise un monogramme tant qu'une image manque.", "",
           "## Prompt de style (à coller en tête de chaque prompt)", "", f"> {STYLE}", ""]
    items: list[dict] = []
    out += ["## Portraits d'artistes", ""]
    for rid, look in REGIONS:
        out += [f"### {rid}", ""]
        for v, desc in zip(WHO, LOOKS[rid]):
            prompt = f"{STYLE} Subject: a {WHO[v]}, {look}; {desc}."
            items.append({"file": f"{rid}-{v}.png", "prompt": prompt})
            out += [f"**`{rid}-{v}.png`**", "", f"> {prompt}", ""]
    out += ["## Personnages de l'histoire", ""]
    for key, desc in STORY.items():
        prompt = f"{STYLE} Subject: {desc}."
        items.insert(len([i for i in items if i["file"].startswith("story-")]), {"file": f"{key}.png", "prompt": prompt})
        out += [f"**`{key}.png`**", "", f"> {prompt}", ""]
    path = Path(__file__).resolve().parents[2] / "docs" / "avatars" / "PROMPTS.md"
    path.write_text("\n".join(out), encoding="utf-8")
    # Liste machine pour tools/avatars/generate.mjs (personnages de l'histoire d'abord)
    (path.parent / "prompts.json").write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{path} : {len(REGIONS) * 4} portraits + {len(STORY)} personnages")


if __name__ == "__main__":
    main()
