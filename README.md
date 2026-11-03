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

6 actions par semaine, victoire quand les 43 objectifs sont tous accomplis (`src/engine/objectives.ts`), sauvetage Meridian après 4 semaines de trésorerie négative (défaite seulement si la faillite persiste à 6 semaines après sauvetage),
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

## Génération automatique des avatars
1. Copier `.env.example` en `.env` et y mettre `OPENAI_API_KEY=...` (le fichier `.env` n'est jamais commité).
2. `npm run avatars:generate` : génère dans `avatars_src/` les images manquantes (personnages de l'histoire d'abord). Options : `-- --only story`, `-- --force`, `-- --dry`.
3. `npm run avatars` : conversion WebP 512 px dans `public/avatars/` + manifeste.
Les prompts viennent de `docs/avatars/prompts.json`, régénéré par `python3 tools/avatars/prompts.py`.

## Histoire (fil rouge)
Un fil rouge : devenir le premier label mondial face à **Meridian Group** (Tomás Reyes). Le jeu ne s'arrête jamais sur un mauvais passage : 43 objectifs en 4 actes (récompenses en cash, seuils de réputation 30 / 55 / 65 / 80 / 90 / 100), écran Objectifs. On peut accepter l'offre de Tomás (+750 000 $, −20 % de recettes 2 ans, −5 réputation, rachat de liberté possible) ; la faillite déclenche un sauvetage Meridian (+250 000 $, −30 % de recettes, −8 réputation). Quatre actes liés aux paliers de réputation (`src/data/story.ts`) : refus de l'offre de rachat, premières sorties, Grand Tournoi, tournées, plan Horizon révélé par Inès, sommet. **Scénario étendu** (`ARC_SCENES`, nouveau personnage Awa Sylla, journaliste d'investigation) : équipe, premier clip, deux voix, presse, premier disque d'or, bureau à l'étranger, écoute privée de l'album, **dossier Horizon** (choix réel : publier = +2,5 de réputation et 8 semaines d'offensive Meridian ; négocier = −1 de réputation et ~6 mois de trêve, `storyEffects.ts`), platine, veille du sommet, duel final face à Tomás. Les scènes se déclenchent à l'accomplissement des objectifs. `goalFor(g)` donne l'objectif courant : affiché dans la carte « Objectif de l'histoire » du Monde et à la fin de chaque scène. Épilogues de victoire et de défaite sur l'écran de fin.

## Certifications
Disques d'or, de platine et de diamant (`src/engine/certifications.ts`, écran Certifications depuis le Hub). Seuils d'écoutes cumulées : titre 3 M / 10 M / 30 M, EP et album 8 M / 25 M / 80 M. Chaque certification verse une prime (5 k$ / 20 k$ / 100 k$) et de la réputation, et alimente trois objectifs.


## Missions et actualités
Missions à échéance (classement, sorties, fans, recettes, écoutes) : récompense en cash et réputation si réussies, perte de réputation si manquées (max 3 actives). Fil d'actualités : événements du label, vie de l'industrie et manœuvres de Meridian. Écran `Actualites`, accessible depuis le Hub.

Filtres de statut sur l'écran Artistes (tournée, enregistrement, promo, inactif). Cérémonie annuelle (semaine 52) : titre et artiste de l'année ; si le vainqueur est de votre label : +$60 000 et +2 de réputation ; palmarès dans Actualités.

**Standby et catalogue** : un titre mixé peut être mis en standby (Sortie ou Catalogue) pour rejoindre un EP/album ; les titres en standby d'un projet sortent avec lui (semaine suivante). L'onglet Sorties ouvre le Catalogue : projets, singles et standby par artiste.

**Clips, plateformes, actualités d'accueil** : clips vidéo (lo-fi, studio, cinéma : coût, durée de tournage, qualité, vues et revenus publicitaires, buzz et prestige à la sortie) ; espace Plateformes refondu (logos SVG générés par `tools/logo_gen`, répartition des écoutes, liste des titres avec leurs plateformes ; 5 plateformes fictives : parts de marché par continent, rémunération, démarchage de playlists avec chances estimées et délai de 8 semaines) ; **distribution automatique** (`syncPlatforms`) : dès la sortie, le titre est mis en ligne sur toutes les plateformes accessibles (réputation requise ; ClipWave exige un clip sorti), puis ajouté aux autres quand la réputation monte, avec une actualité ; les écoutes par plateforme ne comptent que là où le titre est en ligne, et le démarchage de playlists exige que le titre y soit référencé ; le Hub affiche les actualités de la semaine.

**Banque de titres** : 8 thèmes (Amour, Fête, Ambition, Société, Nostalgie, Voyage, Argent, Spiritualité) en français, anglais et nouchi, des milliers de combinaisons ; générateur de noms d'EP et d'albums ; aucun doublon avec vos titres ni avec ceux des rivaux (bouton dé dans Écriture, Catalogue et EP & albums).

## Pochettes, inédits et scènes de tournée
- **Pochettes** : chaque single, EP et album a une pochette SVG générée (8 styles × 8 palettes), modifiable via « Pochette » dans Sorties › Catalogue ; visible aussi sur la fiche titre et l'écran de programmation.
- **Inédits** : les titres écrits, enregistrés ou mixés peuvent être mis en standby puis ajoutés à un EP/album ; à la sortie du projet ils sont marqués « Inédit » (+ léger buzz).
- **Production express** : publier un EP/album avec des inédits inachevés (écrits ou enregistrés) les enregistre et les mixe automatiquement (studio local, +25 %), coût affiché dans le Catalogue.
- **Défilement** : barres de défilement masquées partout (le scroll reste actif).
- **Brouillons** : les paroles sont sauvegardées automatiquement et survivent au passage de semaine ; liste « Sons en cours » pour reprendre à n’importe quelle étape ; rappels dans l’agenda.
- **15 genres** : Afro-pop, Coupé-décalé, Hip-hop, R&B, Amapiano, Pop, Électro, Rock, Mbalax, Kuduro, Dancehall, Drill, Rumba, Zouk, Gospel (affinités par ville, studios et médias).
- **Certifications SNEP** : barème de référence SNEP (depuis avril 2018 : singles 15 M/30 M/50 M ; albums 50 k/100 k/200 k/300 k/500 k unités, piste principale comptée pour moitié, ÷ 1 000) ×0,2 pour Bakoma ; accessibles depuis Sorties et l’accueil.
- **Scènes de tournée** : scènes cinématiques déclenchées par les concerts (salle, billets, taux de remplissage), avec choix repos / prime pour l'artiste.

## Monde dynamique (événements, tendances, rivaux, artistes)
- **Événements** (`src/engine/events.ts`) : 17 types avec choix, coûts et issues incertaines (sponsor, scandale, burn-out, fuite, playlist en exclusivité, censure, festival, contrôle fiscal, concert caritatif, vague de genre, change, tension entre artistes, débauchage par un rival, offre de rachat Meridian…). Cooldown par type, résultat affiché dans le rapport.
- **Tendances & saisons** (`src/engine/dynamics.ts`) : genres en hausse / en baisse pendant 6–11 semaines, effet viral, saisons (festivals, rentrée, fêtes, creux de janvier). Écran **Marché** (bouton sur l’accueil).
- **Rivaux** : sorties rivales actives qui réduisent vos écoutes dans les villes ciblées (plus fort si même genre) ; contre-campagne possible en événement. **Riposte** : quand un de vos titres cartonne (sorti depuis moins de 6 semaines, top 10), les rivaux du même genre sortent plus souvent un titre, ciblent les villes où vous dominez (+25 % d’impact) et la presse l’annonce (étiquette « Riposte »).
- **Meridian** : offensives de 6 à 9 semaines sur une région (−10 % d’écoutes), rachat d’artiste, partenariat si la négociation réussit.
- **Artistes** : fidélité (moral, sorties, hits, ego), relations entre artistes (feats, médiations, conflits), départ possible ; jauges sur la fiche artiste.

## Monde 100 % dynamique (v2)
- **Rivaux vivants** (`rivalLife.ts`) : popularité, sorties annoncées, nouveaux EP et albums, transferts, brouilles de labels, signatures du vivier, artistes débauchés qui rejoignent un concurrent ; classements stockés dans `rivals.chart` (semaine en cours) et `rivals.prev`.
- **Suites des décisions** (`events.ts`) : un choix programme des effets ou un nouvel événement quelques semaines plus tard (`echoes`) ; historique dans `history`, suites visibles dans Actualités.
- **Artistes** (`artistLife.ts`) : progression des compétences (plafond = potentiel), ego qui grandit avec le succès, offres concurrentes, relations (sessions improvisées, accrochages), humeur déduite de l'état réel, âge qui avance.
- **Fans** (`fans.ts`) : ferveur du public, déception si le titre est raté, saturation par ville, migration vers les villes voisines.
- **Économie** (`prices.ts`) : prix des studios, médias, démarchages et loyers (saison, inflation, réputation), taux de change par devise (`fx`), clips, mixages et tournées indexés sur l'inflation ; marchés vivants (`markets` : taille, taxes et piratage par ville évoluent, `payout` : rémunération des plateformes).
- **Presse et rumeurs** (`rumors.ts`) : rumeurs sur des faits réels, confirmées ou démenties ; actualités dérivées de l'état du monde ; saisons décalées dans l'hémisphère sud ; calendrier de sorties avec les vraies sorties rivales annoncées.
- **Calibrage** : `VITE_SIM_LOG=1 npx vitest run src/engine/sim.test.ts` joue 260 semaines avec un joueur automatique ; réputation 100 entre les semaines 214 et 231 (cible 208 à 260).

## Économie du succès
- **Saturation des marchés** (`cityCapacity`, `advanceWeek`) : l'ensemble du catalogue d'un label ne peut pas dépasser 1,1 à 2 fois la taille d'une ville par semaine (selon la réputation) ; au-delà, les écoutes sont réduites proportionnellement.
- **Impôt sur les bénéfices** (`weeklyTax`, ligne « Impôt sur les bénéfices » du rapport et des Finances) : 20 % entre 40 k$ et 120 k$ de bénéfice hebdomadaire, 35 % jusqu'à 300 k$, 50 % au-delà.
- **Coût du succès** (`prestige`, `prices.ts`) : studios, médias, démarchage de playlists, clips, mixages et tournées coûtent plus cher quand la réputation monte (×1,6 à 50, ×2,8 à 100) ; les salaires suivent (+80 % à 100).

## Page Enregistrer (Studio) et images manquantes
- La page Studio a été refaite (choix du morceau, de l'artiste, du studio et du budget, avec le total affiché sur le bouton « Enregistrer »).
- Six décors de scène (`plateau`, `redaction`, `ceremonie`, `agence`, `terrasse`, `tour`) et le portrait `story-awa` sont facultatifs : un décor de secours est utilisé tant qu'ils sont absents. Prompts dans `docs/images/PROMPTS_MANQUANTS.md`.

## Artistes rivaux : interactions
Depuis les classements, un clic sur n'importe quel artiste ouvre sa fiche. Pour un artiste d'un label concurrent, le panneau « Interagir » propose :
- **Featuring** : cachet selon sa popularité et votre prestige, 15 % des revenus du titre, bonus de qualité et audience dans sa ville. Réputation minimale requise (`rivalFeatQuote`). Le duo s'écrit dans l'écran Écriture.
- **Rachat de contrat** : prix selon sa popularité et les années restantes (`buyoutQuote`), réputation minimale, place libre et une action. L'artiste quitte le monde rival (`rivals.signed`) et rejoint votre label.

## Histoire : suite (actes 2 à 4)
11 scènes de plus, accrochées aux objectifs et aux événements réels : le passé de Kwame (Griot Records, racheté par Meridian), les cinq villes, le dîner du roster (choix : -3 000 $, moral +8), la une d'Awa après la publication du dossier (choix : interview exclusive, +0,6 de réputation) ou son silence après la trêve, le top 10 mondial, la réaction de Tomás quand vous rachetez un artiste rival, les cinq continents, le diamant, le numéro un mondial et l'indépendance vis-à-vis de Meridian. L'épilogue de victoire (`epilogueWin`) se complète selon vos choix (dossier publié ou trêve, aucun accord avec Meridian, artistes rachetés).

## Profil du joueur et paramètres
Écran « Profil » (dernier onglet de la barre latérale) : modifier le nom du fondateur, la nationalité, le genre principal, l'avatar (ou une photo importée) et le logo ; renommer le label coûte 2 000 $ (annoncé dans l'actualité). Carrière en un coup d'œil, options (sauvegarde auto, animations réduites, sons, mémorisées dans le navigateur), sauvegarde manuelle, export/import `.json`, retour menu, nouvelle partie et suppression avec double confirmation.

## Arcs d'artistes
Les artistes du label vivent de petites histoires en plusieurs temps (événements + suites différées) : polémique sur les réseaux, épuisement et retour, mariage et famille, et — pour un artiste formé, fidèle et populaire — l'envie de fonder son label (sous-label co-fondé, ou départ béni : il devient un label rival amical visible dans les classements). Un arc à la fois par artiste ; le journal est affiché dans le panneau « Histoire » de sa fiche. Code : `src/engine/arcs.ts`.

## Enquête Horizon
Après la rencontre avec Awa Sylla, un tableau d'enquête (écran « Enquête », lien sur le Hub) permet de réunir 8 indices (chances selon le profil de votre équipe, 1 action + de l'argent), de les relier par des fils rouges (liens valides seulement), et de les faire vérifier par Awa (résultat 2 semaines plus tard). Les démarches ratées augmentent la méfiance de Meridian (offensive à 3). Trois solidités (fragile, solide ≥ 8, irréfutable ≥ 18) changent la portée de « Publier » (réputation, durée de l'offensive, frais d'avocats) et de « Négocier » (jusqu'à +25 000 $). Nouveau choix « attendre » dans la scène du dossier, puis la scène « Le dossier est prêt » quand il est solide. Code : `src/engine/inquiry.ts`.

## Installation sur ordinateur (PWA)
Label Empire est une application web installable : `public/manifest.webmanifest`, service worker `public/sw.js` (démarrage hors ligne, mises à jour automatiques) et icônes `public/icon.svg`, `icon-maskable.svg`, PNG 192/512/180, `favicon.svg` et `favicon.ico`. Dans Chrome ou Edge, le bouton « Installer l'application » (menu principal et écran Profil) ouvre l'installation ; sinon menu ⋮ → « Installer Label Empire ». Les PNG se régénèrent à partir des SVG (voir l'historique du commit). Le service worker n'est actif qu'en production.

## Scènes de négociation et tampon de signature
- Chaque proposition de contrat (signature depuis la découverte ou renégociation d'un artiste) déclenche une scène cinématique dynamique (`contractScene` dans `src/data/story.ts`) : l'artiste, sa fiche et votre offre sont mis en scène avec la voix du navigateur.
- Offre acceptée : le contrat apparaît au centre, la signature se trace puis le tampon « SIGNÉ · APPROUVÉ » s'abat sur la page. Offre refusée : scène de refus, sans tampon.
- Les scènes dynamiques ne sont pas enregistrées dans `seenScenes` (elles se rejouent à chaque négociation).

## Tournées : choix de la salle et prix des billets
Chaque étape propose les cinq types de salle (club, théâtre, salle de concert, arène, stade) avec capacité, coût, billet conseillé, remplissage et bénéfice estimés pour l'artiste. Une salle est marquée « Conseillé » (meilleur bénéfice débloqué), un « Prix optimal » maximise les recettes, et des prix rapides (−30 % à +60 %) montrent l'effet sur le remplissage. Voir `venueOptions` et `priceOptions` dans `src/engine/tour.ts`.

## Percée locale
Un artiste perce d'abord dans sa ville d'origine (ex. New York si vous y installez le label). Ailleurs ses écoutes restent très faibles (≈ 4 %) tant qu'il n'a pas conquis sa ville (fans ≥ 3 % du marché local) ; ensuite la portée s'étend à la zone (≈ 70 %), à la langue (≈ 40 %), puis au reste du monde (≈ 22 %), et plus vite là où il a déjà des fans (concerts, écoutes). Voir `reachIn` dans `src/engine/market.ts` ; la fiche artiste affiche la jauge « Percée locale ». Les certifications suivent le barème SNEP (15 M d'écoutes pour un single d'or) : avec la percée locale, le premier disque arrive plus tard.

## Certifications selon la réputation & langue des noms
- Un niveau de disque n'est homologué que si le label a la réputation requise : platine 30, double platine 45, triple platine 60, diamant 75 (l'or n'a pas de minimum). Les écoutes seules ne suffisent plus (`CERT_MIN_REP`, `levelForRep`).
- Les noms d'EP/albums suggérés suivent la langue de l'artiste (français, anglais ou nouchi, modifiable) ; l'écriture d'un titre reprend aussi la langue de l'artiste choisi.

## Médias du monde
Le catalogue compte 45 médias fictifs (radios, TV, presse, web, streaming) en Afrique, Europe, Amériques, Asie/Océanie et à l'échelle mondiale. Les tarifs montent avec la portée : de ~2 000 $ pour une radio locale à 45 000 $ pour une TV nord-américaine et 120 000 $ pour la radio mondiale (réputation 75). L'écran de sortie les filtre par zone. Logos générés par `tools/logo_gen/media_logos.py`.

## Destinations, concours et noms générés
- 7 nouvelles villes : Kinshasa, Casablanca, Madrid, Amsterdam, Atlanta, Miami, Bogotá (26 destinations au total).
- Concours : toutes les villes dont la réputation requise ne dépasse pas la vôtre de plus de 25 (`CONTEST_RANGE`) sont ouvertes (New York et Los Angeles dès 15 de réputation) ; les autres sont affichées verrouillées.
- Boutons « 🎲 Générer » pour le nom d'un concours et d'une tournée (`src/data/eventNames.ts`) ; la tournée reçoit un nom généré dès l'ouverture, et un nom reste obligatoire.

## Concours en phases
Un concours peut compter de 1 à 5 phases (finale seule par défaut), avec une phase chaque semaine ou toutes les 2 semaines. À chaque phase intermédiaire (auditions, quarts, demi-finales…), la moitié des candidats est éliminée et un talent se révèle (exclusif jusqu'à la finale) ; chaque phase supplémentaire coûte 25 % du minimum du format. Voir `startContest`, `resolveContests`, `contestPlan` dans `src/engine/scouting.ts`.
