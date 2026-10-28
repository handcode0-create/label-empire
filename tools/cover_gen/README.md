# Générateur de pochettes (PNG)

Outil interne Python (Pillow + numpy) : `pip install pillow numpy`. Même titre + artiste + graine = même pochette.

```bash
python tools/cover_gen/cover_gen.py --title "Soleil Rouge" --artist "Kaya Dembé" --kind EP --out /tmp/covers
python tools/cover_gen/cover_gen.py --title "Nuit d'Abidjan" --artist Zaki --style skyline --palette 5 --size 3000 --out /tmp/covers
python tools/cover_gen/cover_gen.py --batch catalogue.json --out public/covers
python tools/cover_gen/cover_gen.py --from-save sauvegarde.json --out public/covers   # projets + singles du jeu
python tools/cover_gen/cover_gen.py --demo --out /tmp/demo                            # planche des 8 styles
```

- 8 styles (mêmes indices que le sélecteur du jeu) : soleil, vagues, prisme, anneaux, rayures, skyline, grille, eclat
- 8 palettes de la charte (magenta, or, cyan, vert, braise, nuit, bubblegum, sable), 3 mises en page de titre
- Finitions : halo, vignette, grain, ombre du titre, pastille Single/EP/Album ; rendu ×2 puis réduit (anti-aliasing)
- `--no-text` pour le fond seul, `--format jpg`, `--size 3000` pour les plateformes
- `catalogue.json` : `[{"title","artist","kind","style","palette","seed"}]` (style/palette/seed optionnels)

Tests : `cd tools/cover_gen && python3 -m unittest`.
