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
