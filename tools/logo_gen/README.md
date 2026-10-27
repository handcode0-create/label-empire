# Générateur de logos de label (SVG)

Outil Python sans dépendance (Python 3.9+). Un même nom et une même graine donnent toujours le même logo.

```bash
# Un logo pour un label précis
python tools/logo_gen/logo_gen.py --name "Savane Records" --out /tmp/logo
python tools/logo_gen/logo_gen.py --name "Savane Records" --shape bouclier --motif vinyle --palette or --out /tmp/logo

# 12 logos aléatoires (varier avec --seed)
python tools/logo_gen/logo_gen.py --batch --count 12 --seed 7 --out /tmp/logos

# Le jeu de 24 logos prédéfinis du jeu (écrit dans public/logos)
python tools/logo_gen/logo_gen.py --presets --out public/logos
```

Pour chaque label : `NN-nom.svg` (icône carrée 200×200, utilisable comme icône) et `NN-nom-complet.svg` (icône + nom), plus `manifest.json` (forme, motif, palette, graine).

- Formes : cercle, hexagone, bouclier, losange, carré, octogone, triangle
- Motifs : monogramme, vinyle, ondes, étoile, note, couronne, éclair, soleil
- Palettes : celles de la maquette (magenta, or, cyan, vert, braise, nuit)

Tests : `cd tools/logo_gen && python3 -m unittest`.
