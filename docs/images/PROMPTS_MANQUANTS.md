# Images manquantes : prompts

Le jeu fonctionne sans ces images (décors de secours et monogrammes), mais elles améliorent les scènes de l'histoire.
Dès qu'une image est déposée au bon endroit, elle est utilisée automatiquement (aucun code à modifier).

## 1. Décors de scène (6 images, format paysage 16:10)

À enregistrer en **WebP, environ 1228 × 768**, dans `public/scenes/<nom>.webp` (même rendu que `bureau.webp`, `studio.webp`, etc.).

Style commun à ajouter à chaque prompt :

> Cinematic wide shot, richly detailed, realistic illustration with painterly lighting, dusk atmosphere, deep violet and magenta color palette with warm gold accents and cyan highlights, soft volumetric light, shallow depth of field, premium video-game cinematic background, no people, no text, no logo, no watermark, 16:10 composition.

| Fichier | Scène où il sert | Remplace aujourd'hui |
|---|---|---|
| `plateau.webp` | Premier clip | `studio` |
| `redaction.webp` | Presse (Awa Sylla), dossier Horizon | `bureau` |
| `ceremonie.webp` | Disque d'or, disque de platine | `scene` |
| `agence.webp` | Bureau à l'étranger | `ville` |
| `terrasse.webp` | Écoute privée de l'album | `nuit` |
| `tour.webp` | Veille du sommet, duel face à Tomás | `finale` |

### `plateau.webp` (tournage d'un clip)
> A music video shoot set in a large dark studio: a cyc wall lit with magenta and violet LED panels, a camera on a dolly track with a monitor showing a bright playback frame, a small crane, cables on the floor, fog haze, a clapperboard on a flight case, rows of spotlights overhead, empty set waiting for the artist, a neon sign in the corner.

### `redaction.webp` (rédaction d'un média d'investigation)
> A night newsroom of an independent investigative magazine: cluttered desks with laptops and stacks of documents, a wall pinboard with photos, red string and sticky notes connecting company names, a large window showing city lights at dusk, a green desk lamp, coffee cups, a printed chart with rising lines, an unfinished headline on a big monitor, moody and tense.

### `ceremonie.webp` (remise de disque)
> A small awards ceremony backstage and stage: a glossy stage with a velvet curtain, a podium with microphone, framed gold and platinum records on easels lit by warm spotlights, confetti falling slowly, a banner with abstract shapes (no text), a red carpet edge, rows of out-of-focus seats in the foreground, celebratory golden glow.

### `agence.webp` (bureau d'une ville étrangère)
> The street front of a new foreign office of a record label: a modern three-floor building on a rainy evening, glass door with a freshly mounted blank brass plaque, warm interior light, a city street with wet pavement reflecting neon signs, a scooter parked, palm trees and distant skyscrapers, a taxi passing, inviting and hopeful mood.

### `terrasse.webp` (écoute privée sur un toit)
> A rooftop terrace at night for a private album listening party: string lights, a folding table with two studio monitor speakers and a turntable, candles in jars, lounge cushions and low sofas, a skyline of a big city glowing in violet and cyan, a few paper cups, album artwork prints pinned along a rail, a warm intimate atmosphere.

### `tour.webp` (sommet de la tour de Meridian)
> The top-floor executive lounge of a rival media group's skyscraper at night: floor-to-ceiling windows overlooking a huge illuminated city, a dark minimalist office with a long black desk, a single warm lamp, a wall of platinum records and screens showing abstract charts, polished floor reflecting city lights, cold navy and violet tones with a hint of gold, powerful and slightly menacing.

## 2. Personnage manquant (1 portrait)

Un seul personnage de l'histoire n'a pas de portrait : **Awa Sylla**, journaliste d'investigation (scènes « La presse s'en mêle » et « Le dossier Horizon »).

À enregistrer en **WebP, 512 × 512**, dans `public/avatars/story-awa.webp`.

> Modern 2D cartoon character portrait for a music-industry video game. Bust shot, facing slightly three-quarters, confident expressive face, big friendly eyes, clean bold outlines, smooth cel shading with soft rim light. Vibrant saturated modern color palette (magenta, violet, cyan, gold) in the clothes and lighting. Stylish contemporary streetwear and stage fashion. Centered, square 1:1 composition, head and shoulders, plain flat dark violet background (#1C1236), no text, no logo, no watermark, no real-person likeness. Polished professional game-art quality, consistent style across the whole set.
> **Character:** Awa Sylla, 30s woman, investigative journalist, West African, deep brown skin, short natural hair with a gold hair pin, oversized beige trench coat over a teal turtleneck, press badge on a lanyard, small notebook and pen, sharp curious expression with a slight knowing smile.

Les autres personnages (Inès, Kwame, Tomás, le fondateur en deux versions) et les 36 portraits d'artistes existent déjà. Pour régénérer tous les prompts : `python3 tools/avatars/prompts.py`.

## 3. Après génération

1. Convertir en WebP si besoin : `python3 -c "from PIL import Image; Image.open('plateau.png').convert('RGB').save('public/scenes/plateau.webp', quality=88)"`.
2. Vérifier à l'écran en jouant la scène (touche Échap pour la passer).
3. Tant qu'une image est absente, le décor de secours indiqué dans le tableau s'affiche à la place.
