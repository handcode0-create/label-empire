# Label Empire

Simulation de gestion d'un label musical dans le monde réel (villes et pays réels, artistes et labels fictifs).
Vite + React + TypeScript + Zustand + Vitest. Conçu par HANCODE STUDIO (Abidjan).

## Lancer

```bash
git pull
npm install
npm run dev      # jeu sur http://localhost:5173
npm test         # tests du moteur
npm run build    # build de production
```

## Structure

- `src/engine/` : moteur pur, sans React. `advanceWeek(state)` fait avancer d'une semaine ; chaque action renvoie `{ state, error?, info? }`.
  Modules : scouting, production (écriture, studio, mixage, sortie), market (écoutes, classements), tour, economy (équipe, bureaux, prêt, événements), selectors.
- `src/data/` : villes, studios, partenaires, recrues, artistes.
- `src/store/gameStore.ts` : état du jeu, sélections, notifications, sauvegarde automatique (localStorage).
- `src/screens/mock/` : les 21 écrans, fidèles à la maquette et branchés sur le moteur.
- `public/logos/` et `tools/logo_gen/` : 24 logos et l'outil Python qui les génère (`npm run logos`).

## Règles clés

6 actions par semaine, victoire à 100 de réputation, défaite après 4 semaines de trésorerie négative,
places d'artistes : 3 au départ, +1 par bureau et par palier.

## Grand Tournoi, battles et scènes

- **Grand Tournoi mondial** (Découvrir > Concours > Grand Tournoi) : recrutement de 4 à 10 candidats dans plusieurs pays (2 par pays maximum), tirage au sort qui mélange les nationalités, barrage puis quarts, demi-finales et finale. Le joueur couronne lui-même le vainqueur.
- **Battle de punchlines** : mini-jeu animé joué pour coacher un duel. Technique bat Impact, Impact bat Humour, Humour bat Technique, le Flow est neutre. Les points gagnés s'ajoutent au score du candidat.
- **Scènes avec dialogues** (`src/data/story.ts`) : l'histoire avance selon la réputation, les signatures, les sorties et le tournoi. Espace ou Entrée pour avancer, Échap pour passer.
- **Avatars** : `python3 tools/avatars/prompts.py` génère `docs/avatars/PROMPTS.md` (prompts pour ChatGPT/Midjourney). Déposer les images dans `avatars_src/` puis `npm run avatars`. Sans image, le jeu affiche un monogramme.

## Studio, marketing, projets et fiches
- **Titre auto** (`src/data/titles.ts`), **feats** (artiste du label gratuit, ou artiste découvert payant + 12 % des revenus) et **médias** (`src/data/media.ts`, 17 médias fictifs avec logos `public/media/*.svg`, générés par `tools/logo_gen/media_logos.py`).
- **EP / albums** (`src/engine/projects.ts`, écran `Projets`) : EP 3–6 titres, album 7–20, publication une fois les titres sortis.
- **Monde rival déterministe** (`src/engine/rivals.ts`) : 23 labels (logos `public/logos`), ~69 artistes, titres, EP, albums, contrats. Les lignes de classement portent `artistId/songId/projectId` et ouvrent les fiches `Artiste`, `Titre`, `Label`. Classements : singles, albums, EP, artistes.
