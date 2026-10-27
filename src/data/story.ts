import { cityById } from './world'
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
export type Bg = 'ville' | 'bureau' | 'scene' | 'nuit'
export interface Scene { id: string; bg: Bg; title?: string; lines: Line[]; when: (g: GameState) => boolean }

export interface Ctx { label: string; founder: string; city: string; tournoi: string; winner: string; verdict: string; ville: string }
export function contextFor(g: GameState): Ctx {
  const t = g.tournament
  const winner = t?.winnerId ? entrantOf(t, t.winnerId).stageName : ''
  return {
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

/** Les scènes se jouent dans l'ordre de cette liste, dès que leur condition est remplie et qu'elles n'ont pas encore été vues. */
export const SCENES: Scene[] = [
  {
    id: 'intro', bg: 'ville', title: 'Chapitre 1 · Les premières notes', when: () => true,
    lines: [
      N('{city}, une nuit de chaleur. Au-dessus d’un petit studio, une enseigne s’allume : {label}.'),
      N('Pas encore de disque d’or, pas de tournée. Seulement une idée, un peu d’argent et beaucoup de culot.'),
      I('Patron, les lumières sont allumées et les téléphones sonnent déjà. Les managers veulent savoir qui vous êtes.', 'joie'),
      P('Dis-leur la vérité : un nouveau label qui n’a pas peur de commencer petit.', 'confiance'),
      I('Alors voici les règles. Chaque semaine, vous avez six actions : repérer, enregistrer, sortir des titres. Et chaque dollar compte.', 'neutre'),
      { who: 'ines', text: 'Une question avant que la nuit ne passe ?', choices: [
        { label: 'Par où commencer ?', reply: [I('Par la carte du Monde. Puis Découvrir pour trouver une voix. Un bon titre sorti vaut mieux que dix idées.')] },
        { label: 'Et si je me trompe ?', reply: [I('Alors vous apprendrez vite. Mais surveillez la trésorerie : quatre semaines dans le rouge, et c’est la faillite.', 'tension')] },
      ] },
      I('Et si vous voulez faire du bruit dès le départ, il existe un Grand Tournoi : recruter des talents dans plusieurs pays et les faire s’affronter en battle.', 'confiance'),
      N('L’histoire de {label} commence ce soir.'),
    ],
  },
  {
    id: 'premier-artiste', bg: 'bureau', title: 'Une première signature', when: (g) => signedCount(g) >= 1,
    lines: [
      I('Le contrat est signé. C’est la première fois que le nom {label} figure au bas d’une page qui compte.', 'joie'),
      P('Une signature ne fait pas une carrière. Il faut maintenant lui donner des chansons.', 'confiance'),
      I('Écriture, studio, mixage, puis une date de sortie. Je prépare le planning, patron.'),
    ],
  },
  {
    id: 'premiere-sortie', bg: 'nuit', title: 'Première sortie', when: (g) => g.songs.some((s) => s.stage === 'released'),
    lines: [
      N('Minuit passé. Quelque part, un téléphone lance le premier titre du label.'),
      I('Les écoutes arrivent, patron. Ce n’est qu’un début, mais elles arrivent.', 'joie'),
      P('Regarde les villes qui s’allument sur la carte. Elles écoutent.', 'confiance'),
    ],
  },
  {
    id: 'alerte-cash', bg: 'bureau', title: 'Les comptes', when: (g) => g.week > 3 && g.cash < 15000 && g.cash >= 0,
    lines: [
      I('Patron, il faut qu’on parle des comptes. La trésorerie fond plus vite que prévu.', 'tension'),
      P('Combien de semaines nous reste-t-il ?', 'tension'),
      { who: 'ines', text: 'Moins que je ne voudrais. Il faut sortir des titres, limiter les dépenses ou emprunter.', mood: 'tension', choices: [
        { label: 'On sortira un titre vite.', reply: [I('Alors on serre les coûts et on mise sur la prochaine sortie. Je m’en occupe.', 'confiance')] },
        { label: 'Et le prêt ?', reply: [I('Possible, mais il pèsera sur les semaines suivantes. Utilisez-le avec une date de sortie en tête.')] },
      ] },
    ],
  },
  {
    id: 'tournoi-ouverture', bg: 'bureau', title: 'Le Grand Tournoi', when: (g) => !!g.tournament,
    lines: [
      I('Patron, voici Kwame Baro. C’est lui qui présentera le tournoi « {tournoi} ».'),
      K('Dix voix, plusieurs pays, un seul vainqueur. Le public ne pardonne ni la peur ni l’ennui.', 'confiance'),
      P('Je veux des talents qui viennent de partout. Des accents, des langues, des styles.'),
      K('Alors partez les chercher. Deux candidats par pays au maximum : au tirage, on mélangera les nationalités.'),
      I('Chaque voyage coûte une action et un peu d’argent. Quatre candidats suffisent pour commencer, dix pour une vraie fresque.'),
    ],
  },
  {
    id: 'tournoi-tirage', bg: 'scene', title: 'Le tirage au sort', when: (g) => g.tournament?.status === 'en_cours' || g.tournament?.status === 'choix' || g.tournament?.status === 'termine',
    lines: [
      N('Les projecteurs s’allument sur {ville}. Les candidats se regardent ; certains se saluent, d’autres évitent les regards.'),
      K('Mesdames et messieurs, le tirage est fait ! Les nationalités vont se croiser, et seuls les plus tranchants passeront.', 'joie'),
      I('Vous pouvez coacher un duel de votre choix. Si vous gagnez le battle de punchlines, votre candidat marque des points.'),
      K('Souvenez-vous : la technique bat l’impact, l’impact bat l’humour, l’humour bat la technique.', 'confiance'),
    ],
  },
  {
    id: 'tournoi-finale', bg: 'scene', title: 'La finale', when: (g) => g.tournament?.status === 'choix' || g.tournament?.status === 'termine',
    lines: [
      K('Le public retient son souffle. Deux voix restent. Une seule couronne.', 'tension'),
      I('Le vote du public et du jury est tombé. Mais c’est vous qui décidez, patron.'),
      P('Je n’ai pas besoin d’un vote pour savoir ce que j’ai entendu ce soir.', 'confiance'),
      N('Dans la salle, le silence pèse plus lourd que les basses.'),
    ],
  },
  {
    id: 'tournoi-couronnement', bg: 'scene', title: 'La couronne', when: (g) => g.tournament?.status === 'termine',
    lines: [
      K('Votre vainqueur du soir : {winner} !', 'joie'),
      N('{verdict}'),
      I('{winner} est à vous pendant quatre semaines. Après cela, les rivaux frapperont à sa porte.', 'confiance'),
      P('Alors ne perdons pas une semaine. Signons-le.', 'confiance'),
    ],
  },
  {
    id: 'rival-1', bg: 'nuit', title: 'Chapitre 2 · Un nom qui circule', when: (g) => g.reputation >= 25,
    lines: [
      N('Un nom commence à circuler dans les couloirs de l’industrie : {label}. Quelqu’un a décidé de venir voir de plus près.'),
      T('Ainsi, c’est vous, {founder}. Meridian Group suit vos chiffres depuis un mois.', 'confiance'),
      P('Alors vous savez que nous ne sommes pas à vendre.', 'tension'),
      T('Tout le monde est à vendre, jusqu’au jour où le prix devient trop bas pour refuser. Bonne chance, vous en aurez besoin.'),
      I('Il bluffe peut-être. Mais ses recruteurs sont partout où brillent les nouveaux talents.', 'tension'),
    ],
  },
  {
    id: 'rival-2', bg: 'bureau', title: 'Chapitre 3 · Le jeu change', when: (g) => g.reputation >= 50,
    lines: [
      T('Vous avez grandi plus vite que prévu, {founder}. Je n’aime pas qu’on me prenne mes villes.', 'tension'),
      P('Je ne prends rien. Je sors de bons titres, et le public suit.', 'confiance'),
      T('Alors continuons à jouer. Mais sachez que j’ai déjà approché certains de vos artistes.', 'surprise'),
      I('Patron, surveillez le moral de vos artistes et leurs contrats. Les rivaux savent attendre.', 'tension'),
    ],
  },
  {
    id: 'sommet', bg: 'scene', title: 'Chapitre 4 · Le sommet', when: (g) => g.reputation >= 75,
    lines: [
      N('Les salles se remplissent, les classements se resserrent. {label} n’est plus un secret.'),
      I('Vous avez bâti un label qui compte dans plusieurs pays. Il ne reste qu’un dernier palier.', 'joie'),
      T('Cent points de réputation, c’est là que se joue la légende. Je serai au premier rang.', 'confiance'),
      P('Alors regardez bien. Ce n’est pas la fin, c’est le début de l’histoire.', 'confiance'),
    ],
  },
]

export function nextStoryScene(g: GameState): Scene | undefined {
  const seen = g.seenScenes ?? []
  return SCENES.find((s) => !seen.includes(s.id) && s.when(g))
}
