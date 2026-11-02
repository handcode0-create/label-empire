import { inquiryStrength } from '../engine/inquiry'
import { cityById, palierFor } from './world'
import { usd } from '../lib'
import type { GameState } from '../engine/types'
import { signedCount } from '../engine/util'
import { entrantOf } from '../engine/tournament'
import { lastPlayed } from '../engine/tour'
import { rivalArtistIn } from '../engine/rivalLife'

export type CharId = 'narrateur' | 'ines' | 'kwame' | 'tomas' | 'joueur' | 'awa'
export interface Char { name: string; role: string; gradient: string; side: 'left' | 'right'; portrait?: string }
/** Personnages de l'histoire (fictifs). Les portraits viennent de public/avatars/story/<clé>.webp, sinon monogramme. */
export const CHARS: Record<Exclude<CharId, 'narrateur'>, Char> = {
  ines: { name: 'Inès Marchetti', role: 'Directrice des opérations', gradient: '#FF3D9A,#FFC63D', side: 'left', portrait: 'story-ines' },
  kwame: { name: 'Kwame Baro', role: 'Maître de cérémonie', gradient: '#35D3F0,#8B5CF6', side: 'left', portrait: 'story-kwame' },
  tomas: { name: 'Tomás Reyes', role: 'Directeur de Meridian Group', gradient: '#8B5CF6,#FF5470', side: 'left', portrait: 'story-tomas' },
  awa: { name: 'Awa Sylla', role: 'Journaliste d’investigation', gradient: '#3DDC97,#35D3F0', side: 'left', portrait: 'story-awa' },
  joueur: { name: 'Vous', role: 'Fondateur', gradient: '#FFC63D,#FF3D9A', side: 'right', portrait: 'story-joueur' },
}
export type Mood = 'neutre' | 'joie' | 'tension' | 'surprise' | 'confiance'
export interface Line { who: CharId; text: string; mood?: Mood; side?: 'left' | 'right'; choices?: { label: string; reply: Line[]; effect?: 'accept-meridian' | 'repos' | 'prime' | 'dossier-publier' | 'dossier-negocier' | 'dossier-attendre' | 'roster-diner' | 'awa-exclusif' }[] }
export type Bg = 'ville' | 'bureau' | 'scene' | 'nuit' | 'studio' | 'arene' | 'finale' | 'aeroport' | 'plateau' | 'redaction' | 'ceremonie' | 'agence' | 'terrasse' | 'tour'
/** Décors à générer (voir docs/images/PROMPTS_MANQUANTS.md) : tant que l'image n'existe pas, le décor de secours est utilisé. */
export const BG_FALLBACK: Partial<Record<Bg, Bg>> = { plateau: 'studio', redaction: 'bureau', ceremonie: 'scene', agence: 'ville', terrasse: 'nuit', tour: 'finale' }
export interface Scene { id: string; bg: Bg; title?: string; lines: Line[]; when: (g: GameState) => boolean }

export interface Ctx { bureau: string; cash: string; palier: string; goal: string; label: string; founder: string; city: string; tournoi: string; winner: string; verdict: string; ville: string; artiste: string; villeTournee: string; salle: string; rival: string; rivalLabel: string; billets: string; capacite: string; taux: string; tournee: string }
export function contextFor(g: GameState): Ctx {
  const t = g.tournament
  const winner = t?.winnerId ? entrantOf(t, t.winnerId).stageName : ''
  const lp = lastPlayed(g)
  const lpArtist = lp ? g.artists.find((a) => a.id === lp.tour.artistId) : undefined
  const signedId = g.rivals?.signed?.[g.rivals.signed.length - 1]
  const lastRival = signedId ? rivalArtistIn(g, signedId) : undefined
  return {
    bureau: g.offices.length ? cityById(g.offices[g.offices.length - 1].cityId).name : '', cash: usd(g.cash), palier: palierFor(g.reputation).name, goal: goalFor(g).text,
    label: g.label.name, founder: g.label.founder, city: cityById(g.label.hqCityId).name,
    rival: lastRival?.stageName ?? 'cet artiste', rivalLabel: lastRival?.labelName ?? 'son ancien label',
    artiste: lpArtist?.stageName ?? 'Votre artiste', villeTournee: lp ? cityById(lp.stop.cityId).name : '', salle: lp?.stop.venue ?? '', billets: lp ? (lp.stop.sold ?? 0).toLocaleString('fr-FR') : '', capacite: lp ? lp.stop.capacity.toLocaleString('fr-FR') : '', taux: lp ? String(Math.round(((lp.stop.sold ?? 0) / lp.stop.capacity) * 100)) : '', tournee: lp?.tour.name ?? '',
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
const A = (text: string, mood?: Mood): Line => ({ who: 'awa', text, mood })

/** Le fil rouge : battre Meridian Group en atteignant 100 de réputation (label mondial) avant d'être racheté. */
export const STORY_GOAL = 'Accomplir tous les objectifs et devenir le premier label mondial face à Meridian Group.'
export interface Goal { step: string; title: string; text: string }
/** Objectif courant de l'histoire, déduit de l'état de la partie (affiché au Monde et à la fin de chaque scène). */
export function goalFor(g: GameState): Goal {
  const released = g.songs.some((x) => x.stage === 'released')
  if (g.reputation < 100 && signedCount(g) === 0 && !g.artists.some((a) => a.isFounder && g.songs.some((x) => x.artistId === a.id))) return { step: 'artiste', title: 'Une voix', text: 'Trouver une voix : signez votre premier artiste (Découvrir, concours ou Grand Tournoi) ou écrivez pour le fondateur.' }
  if (!released) return { step: 'titre', title: 'Un premier titre', text: 'Écrire, enregistrer, mixer puis sortir un premier titre : Meridian regarde déjà vos débuts.' }
  if (g.reputation < 30) return { step: 'local', title: 'Label national', text: 'Atteindre 30 de réputation : sortez des titres régulièrement et faites-vous un nom.' }
  if (g.reputation < 55) return { step: 'national', title: 'Label régional', text: 'Atteindre 55 de réputation : ouvrez un bureau, visez plusieurs pays et gardez vos artistes loin de Meridian.' }
  if (g.reputation < 80) return { step: 'regional', title: 'Label continental', text: 'Atteindre 80 de réputation : partez en tournée à l’étranger et dépassez les titres de Meridian aux classements.' }
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
    id: 'rival-1', bg: 'nuit', title: 'Acte 2 · Un nom qui circule', when: (g) => g.reputation >= 30,
    lines: [
      N('Un nom commence à circuler dans les couloirs de l’industrie : {label}. Quelqu’un a décidé de venir voir de plus près.'),
      T('Ainsi, c’est vous, {founder}. Meridian Group suit vos chiffres depuis un mois.', 'confiance'),
      { who: 'tomas', text: 'Je suis venu vous refaire l’offre. Plus généreuse que la première.', mood: 'confiance', choices: [
        { label: 'Accepter l’accord (+750 000 $, mais −20 % de recettes pendant 2 ans, −5 de réputation)', effect: 'accept-meridian', reply: [P('Vos conditions, Tomás. J’ai besoin de cet argent pour tenir.', 'neutre'), T('Sage décision. Meridian prélèvera sa part sur chaque dollar que vous gagnerez. Vous pourrez racheter votre liberté plus tard.', 'confiance'), I('Patron… vous venez de leur donner une laisse. Rachetez-vous dès que vous le pouvez.', 'tension')] },
        { label: 'Combien ?', reply: [T('Assez pour que vous cessiez de rêver et que vos artistes aient un vrai contrat. Réfléchissez-y.'), P('J’ai réfléchi. La réponse reste non.', 'tension')] },
        { label: 'Non.', reply: [P('La réponse n’a pas changé, Tomás.', 'tension')] },
      ] },
      T('Tout le monde est à vendre, jusqu’au jour où le prix devient trop bas pour refuser. Rendez-vous au sommet, si vous y arrivez.', 'tension'),
      I('Il ne bluffe pas : ses recruteurs sont partout où brillent les nouveaux talents. Prochain palier : cinquante-cinq points.', 'tension'),
    ],
  },
  {
    id: 'rival-2', bg: 'bureau', title: 'Acte 3 · Le plan Horizon', when: (g) => g.reputation >= 55,
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
    id: 'sommet', bg: 'finale', title: 'Acte 4 · Le sommet', when: (g) => g.reputation >= 80,
    lines: [
      N('Les salles se remplissent, les classements se resserrent. {label} n’est plus un secret.'),
      K('Ce soir, le public vous réclame, {founder}. Et il y a quelqu’un au premier rang qui ne sourit pas.', 'confiance'),
      T('Cent points de réputation, c’est là que se joue la légende. Si vous les atteignez, Meridian Group fermera ses portes. Sinon, je rachèterai tout.', 'confiance'),
      I('Il joue sa dernière carte, patron. Plus qu’un dernier palier.', 'tension'),
      P('Alors regardez bien, Tomás. Ce n’est pas la fin, c’est le début de l’histoire.', 'confiance'),
    ],
  },
]

/** Épilogues affichés sur l'écran de fin. */
export const EPILOGUE_WIN = 'Tomás Reyes a quitté son bureau ce matin-là sans un mot. Meridian Group a plié, et le plan Horizon avec lui. Inès a ouvert une bouteille ; Kwame a annoncé votre nom devant des milliers de voix.'
/** Épilogue de victoire : le texte de base, complété selon les choix faits pendant la partie. */
export function epilogueWin(g: GameState): string {
  const bits = [EPILOGUE_WIN]
  if (g.eventSeen?.['dossier-publier'] !== undefined) bits.push('Awa Sylla a signé la dernière page de son enquête : « Le dossier Horizon n’était que le début. »')
  else if (g.eventSeen?.['dossier-negocier'] !== undefined) bits.push('Awa Sylla a rouvert son coffre. Elle n’a pas eu besoin de publier : Meridian s’est effondré seul.')
  if (g.deal === null) bits.push('Pas un dollar de Meridian dans vos comptes : le label n’a jamais appartenu qu’à ceux qui l’ont construit.')
  if ((g.rivals?.signed?.length ?? 0) > 0) bits.push('Les artistes rachetés à la concurrence ont ouvert la voie : on dit désormais que votre adresse est celle où l’on est écouté.')
  return bits.slice(0, 3).join(' ')
}
export const EPILOGUE_LOSE = 'Meridian Group a racheté le catalogue de {label} pour presque rien. Tomás n’est même pas venu à la signature. Inès a rangé ses dossiers en silence : l’histoire n’est pas finie, elle attend un nouveau fondateur.'

const played = (g: GameState) => g.tours.flatMap((t) => t.stops.filter((s) => s.sold !== undefined).map((stop) => ({ t, stop })))
const fill = (x: { stop: { sold?: number; capacity: number } }) => (x.stop.sold ?? 0) / x.stop.capacity
/** Scènes liées aux tournées : départ, premier concert, salle comble, salle clairsemée, fatigue, stade, fin de tournée. */
const TOUR_SCENES: Scene[] = [
  {
    id: 'tournee-visa', bg: 'aeroport', title: 'Tournée · Les formalités', when: (g) => g.tours.some((t) => t.stops.some((s) => cityById(s.cityId).visa)),
    lines: [
      N('Comptoir d’enregistrement. Une file de passagers, un tampon qui claque, et un dossier de visa à moitié rempli.'),
      I('Certaines villes demandent des papiers : prévoyez toujours deux semaines d’avance, sinon l’avion décolle sans vous.', 'neutre'),
      P('Je note : jamais de tournée à l’étranger sans visa dans la poche.', 'confiance'),
    ],
  },
  {
    id: 'tournee-premier-concert', bg: 'scene', title: 'Tournée · Premier concert', when: (g) => played(g).length >= 1,
    lines: [
      N('Les coulisses de {salle}, à {villeTournee}. Un jeu de lumières balaie les rideaux ; de l’autre côté, la salle gronde.'),
      I('{artiste} tremble un peu. C’est normal : le premier soir, on joue pour toutes les fois où personne n’écoutait.', 'confiance'),
      N('Les lumières s’éteignent. {billets} personnes retiennent leur souffle, puis le premier accord éclate.'),
      P('{billets} billets sur {capacite} : on vient de commencer quelque chose.', 'joie'),
    ],
  },
  {
    id: 'tournee-salle-comble', bg: 'arene', title: 'Tournée · Salle comble', when: (g) => played(g).some((x) => fill(x) >= 0.9),
    lines: [
      N('{salle} affiche complet. Les téléphones forment une mer de petites lumières, et le refrain revient en écho depuis le balcon.'),
      I('{taux} % de remplissage à {villeTournee}. Les promoteurs vont se battre pour la prochaine date.', 'joie'),
      P('Voilà ce que valent des mois de travail. On garde ce rythme.', 'joie'),
    ],
  },
  {
    id: 'tournee-salle-clairsemee', bg: 'nuit', title: 'Tournée · Une soirée difficile', when: (g) => played(g).some((x) => fill(x) < 0.4),
    lines: [
      N('{salle}, {villeTournee}. Des rangées entières de fauteuils vides renvoient l’écho de la sono.'),
      I('{billets} billets seulement sur {capacite}. Le prix, la ville, la date : quelque chose n’a pas pris.', 'tension'),
      { who: 'joueur', text: 'Que fait-on ?', mood: 'neutre', choices: [
        { label: 'Accorder une prime à l’équipe', effect: 'prime', reply: [I('Deux mille dollars bien placés : le moral remonte, et le groupe remontera sur scène demain.', 'confiance')] },
        { label: 'Laisser {artiste} se reposer', effect: 'repos', reply: [I('Une bonne nuit de sommeil vaut mieux qu’un mauvais concert. Je m’en occupe.', 'neutre')] },
        { label: 'On corrigera le prix la prochaine fois', reply: [P('On ajustera les prix et les salles : une scène vide, ça se corrige.', 'confiance')] },
      ] },
    ],
  },
  {
    id: 'tournee-fatigue', bg: 'nuit', title: 'Tournée · Les nerfs', when: (g) => g.tours.some((t) => t.status === 'running') && g.artists.some((a) => a.fatigue >= 70),
    lines: [
      N('Minuit passé, dans le bus. Les valises s’empilent, les visages se ferment. {artiste} fixe la vitre sans un mot.'),
      I('La fatigue s’accumule : la voix tient, mais le public finira par le remarquer.', 'tension'),
      { who: 'joueur', text: 'On fait quoi ?', mood: 'neutre', choices: [
        { label: 'Un jour de repos complet', effect: 'repos', reply: [I('Sage décision. Une journée perdue vaut mieux qu’un concert raté.', 'confiance')] },
        { label: 'Une prime pour tenir', effect: 'prime', reply: [I('2 000 $ pour remonter le moral. Ça ne remplace pas le sommeil, mais ça aide.', 'neutre')] },
        { label: 'On enchaîne, le public attend', reply: [I('Alors on serre les dents. Mais ne vous étonnez pas si la voix lâche.', 'tension')] },
      ] },
    ],
  },
  {
    id: 'tournee-grande-salle', bg: 'arene', title: 'Tournée · Les grandes scènes', when: (g) => played(g).some((x) => x.stop.kind === 'arene' || x.stop.kind === 'stade'),
    lines: [
      N('Les gradins montent jusqu’au ciel. Au centre, la scène semble minuscule, et pourtant tout le stade respire en même temps.'),
      I('{salle} : {billets} spectateurs. Peu de labels indépendants jouent à cette échelle.', 'joie'),
      P('Meridian pensait nous voir disparaître. Ce soir, c’est nous qu’on regarde.', 'confiance'),
    ],
  },
  {
    id: 'tournee-fin', bg: 'aeroport', title: 'Tournée · Retour à la maison', when: (g) => g.tours.some((t) => t.status === 'done'),
    lines: [
      N('Le dernier avion se pose à la tombée de la nuit. {tournee} est terminée ; les flight-cases sont vides, les cœurs pleins.'),
      I('Les chiffres arriveront dans le rapport. Mais regardez-les : ils ont changé en une tournée.', 'confiance'),
      P('Il reste tant de villes. Reposons-nous, puis repartons plus fort.', 'joie'),
    ],
  },
]
SCENES.push(...TOUR_SCENES)

const done = (g: GameState, id: string) => (g.objectives ?? []).includes(id)
/** Scènes de l'histoire déclenchées par les objectifs : le scénario avance avec la progression du label. */
const ARC_SCENES: Scene[] = [
  {
    id: 'equipe-grandit', bg: 'bureau', title: 'Acte 1 · Une vraie équipe', when: (g) => done(g, 'equipe'),
    lines: [
      N('Sept chaises autour de la table, et plus personne ne mange debout. Le local de {city} a changé de visage.'),
      I('Il y a six mois, vous étiez deux dans une pièce qui sentait la peinture. Aujourd’hui, on dit « le label » comme on dit « la maison ».', 'joie'),
      P('Une équipe ne se compte pas en têtes. Elle se compte en gens prêts à rester quand ça se complique.', 'confiance'),
      I('Alors préparez-vous : Meridian ne s’attaque jamais à un label, il s’attaque à ceux qui le font tourner.', 'tension'),
    ],
  },
  {
    id: 'premier-clip', bg: 'plateau', title: 'Acte 1 · Mise en images', when: (g) => g.songs.some((s) => s.clip?.status === 'sorti'),
    lines: [
      N('Un plateau de tournage, des câbles partout, un réalisateur qui crie « coupez ! » pour la onzième fois.'),
      I('Le clip est sorti, patron. Les gens ne se contentent plus d’écouter : ils regardent, ils partagent, ils reconnaissent.', 'joie'),
      P('Un visage, une ville, une couleur. C’est comme ça qu’un nom devient une image.', 'confiance'),
    ],
  },
  {
    id: 'duo-artistes', bg: 'bureau', title: 'Acte 2 · Deux voix, un label', when: (g) => done(g, 'deux-artistes'),
    lines: [
      N('Deux artistes dans le même couloir, un seul mur à partager pour les affiches.'),
      I('Deux voix, c’est le début d’un roster. Et le début des ennuis : l’ego, la jalousie, les studios réservés au même moment.', 'tension'),
      P('Je préfère une rivalité interne qui fait grandir qu’une loyauté qui s’endort.', 'confiance'),
      I('Surveillez leur humeur et leur fidélité, patron. Meridian guette ceux qui se sentent oubliés.', 'tension'),
    ],
  },
  {
    id: 'presse-awa', bg: 'redaction', title: 'Acte 2 · La presse s’en mêle', when: (g) => done(g, 'fans-100k'),
    lines: [
      N('Une journaliste attend à l’accueil depuis une heure. Elle a refusé le café, accepté le silence.'),
      A('Awa Sylla, pour « Écho des Marchés ». Cent mille fans en si peu de temps, c’est rare. Ça ne s’achète pas, d’habitude.', 'confiance'),
      P('Alors je vous dirai comment ça se gagne : en sortant de bons titres, et en restant humble avec ceux qui les écoutent.', 'confiance'),
      A('Beau discours. Je travaille sur un sujet qui vous concerne : les classements de Meridian sont trop propres. Trop réguliers.', 'tension'),
      I('Elle a raison de poser la question. Nous en reparlerons quand vous serez assez haut pour qu’ils aient peur.', 'neutre'),
      A('Gardez mon numéro. Un jour, vous aurez besoin d’une plume qui ne dépend de personne.', 'confiance'),
    ],
  },
  {
    id: 'disque-or', bg: 'ceremonie', title: 'Acte 2 · Le premier disque d’or', when: (g) => (g.certs ?? []).length >= 1,
    lines: [
      K('Mesdames et messieurs, un instant de silence : le label reçoit sa toute première certification !', 'joie'),
      N('Le cadre doré passe de main en main. Dans la salle, quelqu’un pleure sans oser l’admettre.'),
      P('Ce disque appartient à chaque personne qui a écouté ce titre en boucle un soir de pluie.', 'joie'),
      I('Meridian en a mille dans ses couloirs. Mais celui-ci, patron, personne ne vous l’a offert.', 'confiance'),
    ],
  },
  {
    id: 'bureau-etranger', bg: 'agence', title: 'Acte 2 · Une adresse à l’étranger', when: (g) => done(g, 'bureau'),
    lines: [
      N('{bureau}, un matin de pluie fine. Au rez-de-chaussée d’un immeuble ordinaire, une plaque neuve : {label}.'),
      I('Un bureau local change tout, patron : des relais radio, des promoteurs qui décrochent, des contrats négociés sans passer par un fuseau horaire.', 'confiance'),
      P('Meridian a une adresse dans chaque capitale. Désormais, nous aussi.', 'confiance'),
      I('Attention au loyer et au personnel : une adresse coûte chaque semaine, qu’on y joue ou non.', 'neutre'),
    ],
  },
  {
    id: 'album-premiere', bg: 'terrasse', title: 'Acte 3 · Écoute privée', when: (g) => done(g, 'album'),
    lines: [
      N('Un toit-terrasse, quelques bougies, des enceintes posées sur une table pliante. Les premiers invités arrivent en silence.'),
      K('Je n’ai pas besoin de lire les chiffres. Je regarde les visages : ils savent déjà que c’est un grand disque.', 'confiance'),
      P('Un album, c’est une promesse tenue sur quarante minutes. Je voulais qu’il sonne comme une ville entière.', 'joie'),
      I('La presse l’a reçu hier. Awa Sylla m’a écrit une seule ligne : « Enfin du vrai. »', 'joie'),
    ],
  },
  {
    id: 'dossier-horizon', bg: 'redaction', title: 'Acte 3 · Le dossier Horizon', when: (g) => g.reputation >= 62 && (done(g, 'album') || done(g, 'top3-pays')),
    lines: [
      N('Une enveloppe kraft glisse sous la porte, un mardi à la tombée de la nuit. Pas de nom, juste un numéro de téléphone.'),
      A('Je vous l’avais promis. Ce que Meridian ne veut pas qu’on lise : des factures, des virements, des « campagnes d’écoute » programmées avant chaque sortie.', 'tension'),
      I('C’est le plan Horizon dans sa forme la plus sale, patron. Ils n’achètent pas des labels seulement : ils achètent des places dans les classements.', 'tension'),
      A('Je peux tout publier demain matin. Mais Tomás Reyes a des avocats et la mémoire longue.', 'tension'),
      { who: 'joueur', text: 'Il faut décider maintenant.', mood: 'tension', choices: [
        { label: 'Publier le dossier (réputation et durée de l’offensive selon la solidité de l’enquête)', effect: 'dossier-publier', reply: [A('Alors demain, le monde saura. Préparez-vous à la riposte, elle sera brutale.', 'confiance'), P('Qu’elle vienne. Le public choisira ce qu’il veut écouter.', 'confiance')] },
        { label: 'Négocier une trêve (pas d’offensive ~6 mois ; plus avantageux si le dossier est solide)', effect: 'dossier-negocier', reply: [I('Une trêve, c’est un répit. Pas une victoire. Mais notre catalogue aura le temps de grandir à l’abri.', 'neutre'), A('Je garde les originaux. Si Tomás recommence, ils partiront le jour même.', 'tension')] },
        { label: 'Pas encore : je veux des preuves incontestables (écran Enquête)', effect: 'dossier-attendre', reply: [A('Prudent. Mais chaque semaine, Meridian peut apprendre que quelqu’un a ouvert l’enveloppe. Trouvez-moi des preuves qui tiennent devant un juge.', 'tension'), I('Un dossier solide change tout : la publication fait plus de dégâts, la négociation rapporte plus.', 'neutre')] },
      ] },
      N('Quelle que soit la décision, quelque chose a changé : Meridian sait désormais que {label} sait.'),
    ],
  },
  {
    id: 'dossier-pret', bg: 'redaction', title: 'Acte 3 · Le dossier est prêt', when: (g) => g.eventSeen?.['dossier-attendre'] !== undefined && g.eventSeen?.['dossier'] === undefined && inquiryStrength(g) >= 8,
    lines: [
      N('Awa étale les pièces sur la table : virements, factures, captures, un témoignage enregistré. Pour la première fois, le puzzle tient debout.'),
      A('Voilà. Chaque lien est recoupé. Si je publie, Tomás ne pourra pas nous attaquer sur les faits.', 'confiance'),
      I('C’est exactement ce qu’il faut pour que la décision pèse vraiment, patron. À vous de choisir ce que vous en faites.', 'confiance'),
      { who: 'joueur', text: 'Le moment est venu.', mood: 'tension', choices: [
        { label: 'Publier le dossier (plus la preuve est solide, plus le gain est grand)', effect: 'dossier-publier', reply: [A('Demain, à la une. Avec ça, personne chez Meridian ne dormira cette nuit.', 'confiance')] },
        { label: 'Négocier une trêve en position de force', effect: 'dossier-negocier', reply: [A('Une trêve avec un dossier pareil, c’est un contrat. Vous pouvez dicter vos conditions.', 'neutre')] },
      ] },
    ],
  },
  {
    id: 'platine-scene', bg: 'ceremonie', title: 'Acte 3 · Au-delà de l’or', when: (g) => (g.certs ?? []).some((c) => c.level !== 'or'),
    lines: [
      K('Platine ! Le disque qui ne s’obtient pas par hasard, ni par quelques bons soirs de chance.', 'joie'),
      I('Selon le barème de la SNEP, c’est une marque que seuls des artistes installés atteignent. Les majors le savent.', 'confiance'),
      P('On n’est plus ceux qu’on regarde de haut, Inès. On est ceux qu’on vient voir.', 'confiance'),
    ],
  },
  {
    id: 'veille-sommet', bg: 'tour', title: 'Acte 4 · La veille', when: (g) => g.reputation >= 92,
    lines: [
      N('Dernier étage, la ville en bas, la lumière du bureau allumée tard. {label} n’a jamais été aussi proche du sommet.'),
      I('Tomás a quitté son bureau cet après-midi. Il n’a laissé qu’une phrase à son assistante : « Dites-leur que je viendrai en personne. »', 'tension'),
      P('Alors il vient voir ce qu’il a perdu.', 'confiance'),
      I('Ou ce qu’il compte reprendre. Quelques jours encore, patron : tenez vos artistes, vos comptes, et votre calme.', 'tension'),
    ],
  },
  {
    id: 'duel-final', bg: 'tour', title: 'Acte 4 · Face à Tomás', when: (g) => g.reputation >= 98,
    lines: [
      N('Un salon vide au sommet d’une tour. Une baie vitrée, une seule lumière, et un homme debout face à la ville.'),
      T('Cent points de réputation, {founder}. Je ne pensais pas voir ça de mon vivant.', 'tension'),
      { who: 'joueur', text: 'Vous êtes venu me racheter, Tomás ?', mood: 'confiance', choices: [
        { label: 'Vous êtes venu me racheter ?', reply: [T('Plus maintenant. Je suis venu voir celui qui a gagné.', 'surprise')] },
        { label: 'Vous avez perdu, Tomás.', reply: [T('Peut-être. Mais je n’ai jamais été le seul à jouer contre vous : demandez aux chiffres qui vous ont suivi jusqu’ici.', 'tension')] },
        { label: 'Merci de m’avoir dit non, la première fois.', reply: [T('C’est la première fois qu’on me remercie pour ça.', 'surprise')] },
      ] },
      T('Allez au bout. Le plan Horizon n’a jamais prévu quelqu’un qui sorte des bonnes chansons au lieu de payer pour les classements.', 'confiance'),
      P('Alors regardez. Ce n’est pas la fin de Meridian, c’est le début de ceux qui n’ont plus peur.', 'confiance'),
    ],
  },
]
SCENES.push(...ARC_SCENES)

const seenAt = (g: GameState, k: string) => g.eventSeen?.[k]
/** Suite de l'histoire : passé de Kwame, enquête d'Awa, roster, rachat d'un artiste rival et chemin vers le sommet. */
const ARC_SCENES_2: Scene[] = [
  {
    id: 'kwame-passe', bg: 'scene', title: 'Acte 2 · Ce que Kwame n’a jamais dit', when: (g) => done(g, 'tournoi'),
    lines: [
      N('La salle du Grand Tournoi est vide. Les projecteurs refroidissent, les chaises restent en désordre. Kwame range lui-même son micro.'),
      K('Quinze ans que je présente les autres, {founder}. Vous ne vous êtes jamais demandé pourquoi je n’annonçais jamais mon propre nom ?', 'neutre'),
      K('J’ai eu un label, avant. Griot Records. Douze artistes, un studio qui sentait le café et le tabac. Meridian l’a racheté en une nuit.', 'tension'),
      I('Ça ressemble au premier chapitre du plan Horizon, patron. Ils commencent toujours par ceux qui ont une belle équipe et un mauvais mois.', 'tension'),
      K('Je ne suis pas là pour la revanche. Je suis là pour voir quelqu’un dire non plus longtemps que moi.', 'confiance'),
      P('Alors restez au premier rang, Kwame. Vous verrez jusqu’où va mon « non ».', 'confiance'),
    ],
  },
  {
    id: 'cinq-villes', bg: 'ville', title: 'Acte 2 · Cinq villes, un message', when: (g) => done(g, 'pays-3'),
    lines: [
      N('Sur la carte du bureau, cinq épingles roses. Hier, il n’y en avait que deux.'),
      I('Le public de ces villes ne vous connaissait pas il y a un an, patron. Aujourd’hui, il chante vos refrains avant la fin du morceau.', 'joie'),
      N('Le téléphone sonne. Un numéro masqué, une voix calme, très posée.'),
      T('Cinq villes. Vous commencez à m’intéresser, {founder}. Pas assez pour que je m’inquiète. Assez pour que je regarde.', 'confiance'),
      P('Regardez bien, Tomás. Je n’ai encore rien montré.', 'confiance'),
      I('Il vient de nous donner son rythme : il observe, il compte, puis il frappe. On a le temps de se préparer.', 'tension'),
    ],
  },
  {
    id: 'roster-diner', bg: 'nuit', title: 'Acte 3 · Un roster, une famille', when: (g) => done(g, 'trois-artistes'),
    lines: [
      N('Trois artistes, trois humeurs, et un seul couloir pour s’éviter. Ce soir, personne ne parle à personne.'),
      I('Un roster, ça ne se gère pas avec des tableaux, patron. Il y a de la jalousie, de la fatigue, des gens qui comparent leurs écoutes dans les toilettes.', 'tension'),
      { who: 'joueur', text: 'Qu’est-ce que tu me conseilles, Inès ?', mood: 'neutre', choices: [
        { label: 'Offrir un dîner à tout le roster (3 000 $, moral +8)', effect: 'roster-diner', reply: [I('Une grande table, des plats à partager, personne ne parle de chiffres. Je réserve ça pour samedi.', 'joie'), P('Que chacun sache qu’ici, on gagne ensemble ou pas du tout.', 'confiance')] },
        { label: 'Les laisser régler ça entre eux', reply: [I('C’est votre choix, patron. Mais les silences coûtent plus cher que les dîners.', 'neutre')] },
      ] },
      N('Dans le couloir, une porte s’entrouvre. Quelqu’un a tout entendu, et sourit.'),
    ],
  },
  {
    id: 'awa-une', bg: 'redaction', title: 'Acte 3 · À la une', when: (g) => seenAt(g, 'dossier-publier') !== undefined && g.week > (seenAt(g, 'dossier-publier') ?? 0),
    lines: [
      N('Le journal est encore chaud. Le titre de la une tient sur trois lignes, et personne ne l’a corrigé.'),
      A('Trois cent douze mille partages en une nuit. Meridian a démenti avant midi, ce qui est toujours bon signe : on ne dément pas ce qui est faux.', 'joie'),
      I('Leurs avocats ont déjà écrit à la rédaction. Awa a tout classé dans un tiroir marqué « Plus tard ».', 'confiance'),
      { who: 'awa', text: 'Je prépare une suite. Il me manque une voix : la vôtre.', mood: 'confiance', choices: [
        { label: 'Accorder une interview exclusive (+0,6 de réputation)', effect: 'awa-exclusif', reply: [A('Une page entière, sans question piège. Vous dites ce que vous avez construit, pas ce que Meridian a détruit.', 'confiance'), P('Alors je commencerai par ceux qui ont écouté nos disques avant de savoir notre nom.', 'joie')] },
        { label: 'Rester sobre, laisser les faits parler', reply: [A('Une réponse d’adulte. Les faits tiendront leurs promesses.', 'neutre')] },
      ] },
    ],
  },
  {
    id: 'awa-silence', bg: 'redaction', title: 'Acte 3 · Le silence d’Awa', when: (g) => seenAt(g, 'dossier-negocier') !== undefined && g.week > (seenAt(g, 'dossier-negocier') ?? 0) + 2,
    lines: [
      N('La rédaction est calme. Un peu trop. Awa Sylla ne lève pas les yeux de son écran.'),
      A('J’ai tenu parole. Les originaux dorment dans un coffre, à mon nom, avec la date du jour.', 'tension'),
      P('Vous me jugez.', 'tension'),
      A('Je constate. Une trêve, c’est un répit qu’on offre à l’autre. Si Tomás recommence, je n’aurai pas besoin de votre accord.', 'tension'),
      I('Elle n’est pas fâchée, patron. Elle est prudente. C’est pire, et c’est plus utile.', 'neutre'),
    ],
  },
  {
    id: 'top10-monde-scene', bg: 'nuit', title: 'Acte 3 · Dans le top mondial', when: (g) => done(g, 'top10-monde'),
    lines: [
      N('Un écran géant, un classement mondial, et pour la première fois un nom que tout le monde connaît dans le haut de la liste : le vôtre.'),
      K('Dix places. Il y en a cent mille qui rêvent d’y entrer, {founder}. Vous n’y êtes pas arrivé par chance.', 'joie'),
      I('Meridian a relevé ses budgets promo dans trois villes ce matin. Ils savent que vous êtes là, patron.', 'tension'),
      P('Qu’ils dépensent. Un classement, ça se mérite chaque semaine.', 'confiance'),
    ],
  },
  {
    id: 'rachat-rival', bg: 'bureau', title: 'Acte 3 · Un contrat qui change de main', when: (g) => (g.rivals?.signed?.length ?? 0) >= 1,
    lines: [
      N('Un coup de fil, avant même que le café soit chaud. Tomás n’a pas pris la peine de se présenter.'),
      T('Vous avez racheté {rival} à {rivalLabel}. Je n’aime pas qu’on ouvre le catalogue des autres comme un tiroir.', 'tension'),
      P('Ce n’est pas un tiroir, Tomás. C’est un artiste qui voulait une maison où on l’écoute.', 'confiance'),
      T('Une maison qui coûte cher, {founder}. Je compte vos factures aussi bien que vos disques.', 'tension'),
      I('Un rachat de contrat, patron, c’est une déclaration de guerre polie. Attendez-vous à ce que les autres labels referment leurs portes.', 'tension'),
      K('Et à ce que tous les artistes mal payés de la planète regardent désormais votre adresse.', 'joie'),
    ],
  },
  {
    id: 'cinq-continents', bg: 'finale', title: 'Acte 4 · Il fait toujours jour quelque part', when: (g) => done(g, 'continents-4'),
    lines: [
      N('Cinq continents. Sur l’écran du bureau, un chronomètre indique l’heure de chaque ville : il y a toujours quelqu’un qui écoute {label}.'),
      I('Il n’y a pas un fuseau horaire où le label dort, patron. C’est une victoire, et c’est une fatigue.', 'joie'),
      K('Un jour, un gamin entendra votre nom sans savoir d’où il vient. C’est ça, un label mondial.', 'confiance'),
      P('Alors continuons, Kwame. Il reste une dernière tour à traverser.', 'confiance'),
    ],
  },
  {
    id: 'diamant', bg: 'ceremonie', title: 'Acte 4 · Le diamant', when: (g) => done(g, 'disque-diamant'),
    lines: [
      K('Le diamant ! Il n’y a plus de salle assez grande pour contenir ça, {founder}.', 'joie'),
      N('Le cadre pèse plus lourd que les autres. Personne n’ose le toucher le premier.'),
      I('Meridian en a eu un, il y a six ans. Un seul, et ils l’ont exposé à l’entrée de leur tour.', 'confiance'),
      P('Le nôtre reste au bureau, Inès. Pour que chaque matin, on se souvienne de qui l’a rendu possible.', 'joie'),
    ],
  },
  {
    id: 'numero-un-scene', bg: 'finale', title: 'Acte 4 · Numéro un', when: (g) => done(g, 'numero-un'),
    lines: [
      N('Quelque part dans le monde, un titre de {label} vient de passer en tête du classement. Personne ne l’a vu venir, sauf ceux qui l’ont écrit.'),
      A('Le monde a changé de ton ce matin. Je n’ai jamais autant écrit sur une chanson, {founder}.', 'joie'),
      T('Un classement n’est pas un trône. Vous le saurez bientôt, et à vos frais.', 'tension'),
      P('Alors venez me le dire en face, Tomás.', 'confiance'),
    ],
  },
  {
    id: 'independance-scene', bg: 'tour', title: 'Acte 4 · Sans un dollar de Meridian', when: (g) => done(g, 'independance'),
    lines: [
      N('Un message arrive sur la messagerie privée. Pas de formule de politesse, juste un chiffre : 90.'),
      T('Quatre-vingt-dix points, et pas un centime de chez moi. Je n’ai connu que deux labels capables de ça. Je les ai rachetés tous les deux.', 'surprise'),
      I('Il vient de reconnaître que vous êtes différent, patron. Ne lui donnez pas l’occasion de se reprendre.', 'tension'),
      P('Je n’ai pas besoin de lui. Mais il m’aura appris à ne jamais dépendre de personne.', 'confiance'),
    ],
  },
]
SCENES.push(...ARC_SCENES_2)

export function nextStoryScene(g: GameState): Scene | undefined {
  const seen = g.seenScenes ?? []
  return SCENES.find((s) => !seen.includes(s.id) && s.when(g))
}
