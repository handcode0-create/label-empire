import { cityById, palierFor } from './world'
import { usd } from '../lib'
import type { GameState } from '../engine/types'
import { signedCount } from '../engine/util'
import { entrantOf } from '../engine/tournament'

export type CharId = 'narrateur' | 'ines' | 'kwame' | 'tomas' | 'joueur'
export interface Char { name: string; role: string; gradient: string; side: 'left' | 'right'; portrait?: string }
/** Personnages de l'histoire (fictifs). Les portraits viennent de public/avatars/story/<clé>.webp, sinon monogramme. */
export const CHARS: Record<Exclude<CharId, 'narrateur'>, Char> = {
  ines: { name: 'Inès Marchetti', role: 'Directrice des opérations', gradient: '#FF3D9A,#FFC63D', side: 'left', portrait: 'story-ines' },
  kwame: { name: 'Kwame Baro', role: 'Maître de cérémonie', gradient: '#35D3F0,#8B5CF6', side: 'left', portrait: 'story-kwame' },
  tomas: { name: 'Tomás Reyes', role: 'Directeur de Meridian Group', gradient: '#8B5CF6,#FF5470', side: 'left', portrait: 'story-tomas' },
  joueur: { name: 'Vous', role: 'Fondateur', gradient: '#FFC63D,#FF3D9A', side: 'right', portrait: 'story-joueur' },
}
export type Mood = 'neutre' | 'joie' | 'tension' | 'surprise' | 'confiance'
export interface Line { who: CharId; text: string; mood?: Mood; side?: 'left' | 'right'; choices?: { label: string; reply: Line[] }[] }
export type Bg = 'ville' | 'bureau' | 'scene' | 'nuit' | 'studio' | 'arene' | 'finale' | 'aeroport'
export interface Scene { id: string; bg: Bg; title?: string; lines: Line[]; when: (g: GameState) => boolean }

export interface Ctx { cash: string; palier: string; goal: string; label: string; founder: string; city: string; tournoi: string; winner: string; verdict: string; ville: string }
export function contextFor(g: GameState): Ctx {
  const t = g.tournament
  const winner = t?.winnerId ? entrantOf(t, t.winnerId).stageName : ''
  return {
    cash: usd(g.cash), palier: palierFor(g.reputation).name, goal: goalFor(g).text,
    label: g.label.name, founder: g.label.founder, city: cityById(g.label.hqCityId).name,
    tournoi: t?.name ?? '', ville: t ? cityById(t.cityId).name : '', winner,
    verdict: t?.winnerId && t.winnerId === t.favoriteId ? 'Le public avait voté pour lui : la salle explose.' : 'Le public attendait l’autre nom : un murmure traverse la salle.',
  }
}
export const fillText = (text: string, c: Ctx) => text.replace(/\{(\w+)\}/g, (_, k: string) => (c as unknown as Record<string, string>)[k] ?? '')

const N = (text: string): Line => ({ who: 'narrateur', text })
const I = (text: string, mood?: Mood): Line => ({ who: 'ines', text, mood })
const K = (text: string, mood?: Mood): Line => ({ who: 'kwame', text, mood })
const T = (text: string, mood?: Mood): Line => ({ who: 'tomas', text, mood })
const P = (text: string, mood?: Mood): Line => ({ who: 'joueur', text, mood })

/** Le fil rouge : battre Meridian Group en atteignant 100 de réputation (label mondial) avant d'être racheté. */
export const STORY_GOAL = 'Devenir le premier label mondial (réputation 100) avant que Meridian Group ne vous rachète.'
export interface Goal { step: string; title: string; text: string }
/** Objectif courant de l'histoire, déduit de l'état de la partie (affiché au Monde et à la fin de chaque scène). */
export function goalFor(g: GameState): Goal {
  const released = g.songs.some((x) => x.stage === 'released')
  if (g.reputation < 100 && signedCount(g) === 0 && !g.artists.some((a) => a.isFounder && g.songs.some((x) => x.artistId === a.id))) return { step: 'artiste', title: 'Une voix', text: 'Trouver une voix : signez votre premier artiste (Découvrir, concours ou Grand Tournoi) ou écrivez pour le fondateur.' }
  if (!released) return { step: 'titre', title: 'Un premier titre', text: 'Écrire, enregistrer, mixer puis sortir un premier titre : Meridian regarde déjà vos débuts.' }
  if (g.reputation < 25) return { step: 'local', title: 'Label national', text: 'Atteindre 25 de réputation : sortez des titres régulièrement et faites-vous un nom.' }
  if (g.reputation < 50) return { step: 'national', title: 'Label régional', text: 'Atteindre 50 de réputation : ouvrez un bureau, visez plusieurs pays et gardez vos artistes loin de Meridian.' }
  if (g.reputation < 75) return { step: 'regional', title: 'Label continental', text: 'Atteindre 75 de réputation : partez en tournée à l’étranger et dépassez les titres de Meridian aux classements.' }
  if (g.reputation < 100) return { step: 'continental', title: 'Label mondial', text: 'Atteindre 100 de réputation et devenir le numéro un mondial, face à Meridian Group.' }
  return { step: 'fin', title: 'Légende', text: 'Vous avez gagné la guerre contre Meridian : le monde est à vous.' }
}

/** Les scènes se jouent dans l'ordre de cette liste, dès que leur condition est remplie et qu'elles n'ont pas encore été vues. */
export const SCENES: Scene[] = [
  {
    id: 'intro', bg: 'ville', title: 'Acte 1 · Le refus', when: () => true,
    lines: [
      N('{city}, un soir de chaleur. Au-dessus d’un petit studio, une enseigne s’allume : {label}.'),
      N('Il y a trois jours, {founder} a refusé l’offre de rachat de Meridian Group, le géant qui a déjà absorbé tous les labels indépendants de la région.'),
      I('Vous avez dit non à Tomás Reyes en face, patron. Il m’a chargée de vous transmettre une phrase.', 'tension'),
      I('« Revenez me voir quand vous serez le premier label du monde, ou quand vous n’aurez plus un dollar. Dans les deux cas, je rachèterai ce qui reste. »', 'tension'),
      P('Alors nous serons le premier label du monde.', 'confiance'),
      I('Vous partez avec {cash} en caisse et le rang de « {palier} ». Le but, lui, est fixé : cent points de réputation.', 'neutre'),
      I('Chaque semaine, vous avez six actions : repérer, enregistrer, sortir des titres. Et chaque dollar compte.'),
      { who: 'ines', text: 'Une question avant que la nuit ne passe ?', choices: [
        { label: 'Par où commencer ?', reply: [I('Par une voix. Découvrir un artiste, ou lancer le Grand Tournoi pour en trouver plusieurs d’un coup. Puis un titre sorti vaut mieux que dix idées.')] },
        { label: 'Et si je me trompe ?', reply: [I('Alors vous apprendrez vite. Mais surveillez la trésorerie : quatre semaines dans le rouge, et c’est Meridian qui signe à votre place.', 'tension')] },
      ] },
      N('L’histoire de {label} commence ce soir.'),
    ],
  },
  {
    id: 'premier-artiste', bg: 'bureau', title: 'Acte 1 · Une première signature', when: (g) => signedCount(g) >= 1,
    lines: [
      I('Le contrat est signé. C’est la première fois que le nom {label} figure au bas d’une page qui compte.', 'joie'),
      I('Et Meridian le sait déjà. Ils ont un recruteur dans chaque grande ville : ils se battront pour chaque voix.', 'tension'),
      P('Une signature ne fait pas une carrière. Il faut maintenant lui donner des chansons.', 'confiance'),
      I('Écriture, studio, mixage, puis une date de sortie. Je prépare le planning, patron.'),
    ],
  },
  {
    id: 'premier-studio', bg: 'studio', title: 'Acte 1 · Première session', when: (g) => g.songs.some((s) => s.stage === 'recorded' || s.stage === 'mixed' || s.stage === 'scheduled' || s.stage === 'released'),
    lines: [
      N('Les néons du studio s’allument. Derrière la vitre, le micro attend.'),
      I('La prise est bonne, patron. Maintenant, tout se joue au mixage.', 'joie'),
      P('Un titre ne vaut que par ce que le public en retient. Faisons-le sonner : chaque morceau nous rapproche du sommet.', 'confiance'),
    ],
  },
  {
    id: 'premiere-sortie', bg: 'nuit', title: 'Acte 1 · Première sortie', when: (g) => g.songs.some((s) => s.stage === 'released'),
    lines: [
      N('Minuit passé. Quelque part, un téléphone lance le premier titre du label.'),
      I('Les écoutes arrivent, patron. Ce n’est qu’un début, mais elles arrivent.', 'joie'),
      N('Sur l’écran du bureau, un message sans nom s’affiche : « Joli début. Les débuts sont toujours jolis. — T. R. »'),
      P('Il nous surveille déjà. Parfait : qu’il regarde bien.', 'confiance'),
    ],
  },
  {
    id: 'alerte-cash', bg: 'bureau', title: 'Acte 1 · Les comptes', when: (g) => g.week > 3 && g.cash < 15000 && g.cash >= 0,
    lines: [
      I('Patron, il faut qu’on parle des comptes. La trésorerie fond plus vite que prévu.', 'tension'),
      P('Combien de semaines nous reste-t-il ?', 'tension'),
      { who: 'ines', text: 'Moins que je ne voudrais. Si nous tombons, Meridian rachète le catalogue pour presque rien : c’est exactement ce qu’il attend.', mood: 'tension', choices: [
        { label: 'On sortira un titre vite.', reply: [I('Alors on serre les coûts et on mise sur la prochaine sortie. Je m’en occupe.', 'confiance')] },
        { label: 'Et le prêt ?', reply: [I('Possible, mais il pèsera sur les semaines suivantes. Utilisez-le avec une date de sortie en tête.')] },
      ] },
    ],
  },
  {
    id: 'depart-tournee', bg: 'aeroport', title: 'Acte 2 · Cap sur l’étranger', when: (g) => g.tours.length > 0,
    lines: [
      N('Hall des départs, au coucher du soleil. Les valises roulent, les projets aussi.'),
      I('Premier vol du label. Meridian a pris de l’avance dans chaque ville : le seul moyen de les rattraper, c’est d’y arriver avec un public déjà conquis.', 'confiance'),
      P('Alors conquérons-le, une ville après l’autre.', 'confiance'),
    ],
  },
  {
    id: 'tournoi-ouverture', bg: 'arene', title: 'Acte 2 · Le Grand Tournoi', when: (g) => !!g.tournament,
    lines: [
      I('Patron, voici Kwame Baro. C’est lui qui présentera le tournoi « {tournoi} ».'),
      K('Dix voix, plusieurs pays, un seul vainqueur. Le public ne pardonne ni la peur ni l’ennui.', 'confiance'),
      I('Meridian sponsorise presque tous les concours de la région. Celui-ci, c’est le nôtre : le gagnant sera le visage du label face à eux.', 'confiance'),
      P('Je veux des talents qui viennent de partout. Des accents, des langues, des styles.'),
      K('Alors partez les chercher. Deux candidats par pays au maximum : au tirage, on mélangera les nationalités.'),
      I('Chaque voyage coûte une action et un peu d’argent. Quatre candidats suffisent pour commencer, dix pour une vraie fresque.'),
    ],
  },
  {
    id: 'tournoi-tirage', bg: 'arene', title: 'Acte 2 · Le tirage au sort', when: (g) => g.tournament?.status === 'en_cours' || g.tournament?.status === 'choix' || g.tournament?.status === 'termine',
    lines: [
      N('Les projecteurs s’allument sur {ville}. Les candidats se regardent ; certains se saluent, d’autres évitent les regards.'),
      I('Au dernier rang, là-bas : un homme en costume bleu nuit. Meridian envoie un recruteur pour récupérer ce que nous aurons révélé.', 'tension'),
      K('Mesdames et messieurs, le tirage est fait ! Les nationalités vont se croiser, et seuls les plus tranchants passeront.', 'joie'),
      I('Vous pouvez coacher un duel de votre choix. Si vous gagnez le battle de punchlines, votre candidat marque des points.'),
      K('Souvenez-vous : la technique bat l’impact, l’impact bat l’humour, l’humour bat la technique.', 'confiance'),
    ],
  },
  {
    id: 'tournoi-finale', bg: 'arene', title: 'Acte 2 · La finale', when: (g) => g.tournament?.status === 'choix' || g.tournament?.status === 'termine',
    lines: [
      K('Le public retient son souffle. Deux voix restent. Une seule couronne.', 'tension'),
      I('Le vote du public et du jury est tombé. Mais c’est vous qui décidez, patron.'),
      P('Je n’ai pas besoin d’un vote pour savoir ce que j’ai entendu ce soir.', 'confiance'),
      N('Dans la salle, le silence pèse plus lourd que les basses.'),
    ],
  },
  {
    id: 'tournoi-couronnement', bg: 'finale', title: 'Acte 2 · La couronne', when: (g) => g.tournament?.status === 'termine',
    lines: [
      K('Votre vainqueur du soir : {winner} !', 'joie'),
      N('{verdict}'),
      I('{winner} est à vous pendant quatre semaines. Après cela, les recruteurs de Meridian frapperont à sa porte.', 'confiance'),
      P('Alors ne perdons pas une semaine. Signons-le : c’est notre première pièce contre eux.', 'confiance'),
    ],
  },
  {
    id: 'rival-1', bg: 'nuit', title: 'Acte 2 · Un nom qui circule', when: (g) => g.reputation >= 25,
    lines: [
      N('Un nom commence à circuler dans les couloirs de l’industrie : {label}. Quelqu’un a décidé de venir voir de plus près.'),
      T('Ainsi, c’est vous, {founder}. Meridian Group suit vos chiffres depuis un mois.', 'confiance'),
      { who: 'tomas', text: 'Je suis venu vous refaire l’offre. Plus généreuse que la première.', mood: 'confiance', choices: [
        { label: 'Combien ?', reply: [T('Assez pour que vous cessiez de rêver et que vos artistes aient un vrai contrat. Réfléchissez-y.'), P('J’ai réfléchi. La réponse reste non.', 'tension')] },
        { label: 'Non.', reply: [P('La réponse n’a pas changé, Tomás.', 'tension')] },
      ] },
      T('Tout le monde est à vendre, jusqu’au jour où le prix devient trop bas pour refuser. Rendez-vous au sommet, si vous y arrivez.', 'tension'),
      I('Il ne bluffe pas : ses recruteurs sont partout où brillent les nouveaux talents. Prochain palier : cinquante points.', 'tension'),
    ],
  },
  {
    id: 'rival-2', bg: 'bureau', title: 'Acte 3 · Le plan Horizon', when: (g) => g.reputation >= 50,
    lines: [
      T('Vous avez grandi plus vite que prévu, {founder}. Je n’aime pas qu’on me prenne mes villes.', 'tension'),
      P('Je ne prends rien. Je sors de bons titres, et le public suit.', 'confiance'),
      T('Alors continuons à jouer. Mais sachez que j’ai déjà approché certains de vos artistes.', 'surprise'),
      I('Patron, je dois vous dire la vérité. J’ai dirigé les opérations de Meridian pendant six ans.', 'tension'),
      I('Leur « plan Horizon » : racheter tous les labels, tous les catalogues, jusqu’à ce qu’un seul nom décide de ce que le monde écoute. Vous êtes le dernier obstacle.', 'tension'),
      P('Alors c’est pour ça que tu es partie.', 'neutre'),
      I('Je ne leur ai jamais pardonné. Aidez-moi à les arrêter, patron : atteignez le sommet.', 'confiance'),
    ],
  },
  {
    id: 'sommet', bg: 'finale', title: 'Acte 4 · Le sommet', when: (g) => g.reputation >= 75,
    lines: [
      N('Les salles se remplissent, les classements se resserrent. {label} n’est plus un secret.'),
      K('Ce soir, le public vous réclame, {founder}. Et il y a quelqu’un au premier rang qui ne sourit pas.', 'confiance'),
      T('Cent points de réputation, c’est là que se joue la légende. Si vous les atteignez, Meridian Group fermera ses portes. Sinon, je rachèterai tout.', 'confiance'),
      I('Il joue sa dernière carte, patron. Plus qu’un palier.', 'tension'),
      P('Alors regardez bien, Tomás. Ce n’est pas la fin, c’est le début de l’histoire.', 'confiance'),
    ],
  },
]

/** Épilogues affichés sur l'écran de fin. */
export const EPILOGUE_WIN = 'Tomás Reyes a quitté son bureau ce matin-là sans un mot. Meridian Group a plié, et le plan Horizon avec lui. Inès a ouvert une bouteille ; Kwame a annoncé votre nom devant des milliers de voix.'
export const EPILOGUE_LOSE = 'Meridian Group a racheté le catalogue de {label} pour presque rien. Tomás n’est même pas venu à la signature. Inès a rangé ses dossiers en silence : l’histoire n’est pas finie, elle attend un nouveau fondateur.'

export function nextStoryScene(g: GameState): Scene | undefined {
  const seen = g.seenScenes ?? []
  return SCENES.find((s) => !seen.includes(s.id) && s.when(g))
}
