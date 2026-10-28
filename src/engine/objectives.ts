import { cityById } from '../data/world'
import { bestRank } from './market'
import type { GameState } from './types'
import { addRep, clone, fail, ok, totalFans } from './util'

export interface Objective {
  id: string; act: 1 | 2 | 3 | 4; title: string; desc: string
  reward: { cash?: number; rep?: number }
  done: (g: GameState) => boolean
  progress?: (g: GameState) => string
}
const released = (g: GameState) => g.songs.filter((s) => s.stage === 'released')
const ratio = (a: number, b: number) => `${Math.min(a, b).toLocaleString('fr-FR')} / ${b.toLocaleString('fr-FR')}`
const continents = (g: GameState) => new Set(g.stats.countriesReached.map((id) => cityById(id).continent)).size

export const ACT_TITLES: Record<number, string> = { 1: 'Acte 1 · Fondations', 2: 'Acte 2 · Expansion', 3: 'Acte 3 · Guerre contre Meridian', 4: 'Acte 4 · Légende' }

/** Panoplie d'objectifs : le jeu ne se termine que lorsque tous sont accomplis (jamais sur un simple mauvais passage). */
export const OBJECTIVES: Objective[] = [
  { id: 'artiste', act: 1, title: 'Signer un artiste', desc: 'Signez votre premier artiste sous contrat.', reward: { cash: 6_000 }, done: (g) => g.artists.some((a) => !a.isFounder), progress: (g) => ratio(g.artists.filter((a) => !a.isFounder).length, 1) },
  { id: 'premier-titre', act: 1, title: 'Un premier titre', desc: 'Sortez votre premier titre.', reward: { cash: 6_000 }, done: (g) => released(g).length >= 1, progress: (g) => ratio(released(g).length, 1) },
  { id: 'trois-titres', act: 1, title: 'Six titres sortis', desc: 'Sortez six titres.', reward: { cash: 12_000 }, done: (g) => released(g).length >= 6, progress: (g) => ratio(released(g).length, 6) },
  { id: 'equipe', act: 1, title: 'Une vraie équipe', desc: 'Faites grandir l’équipe jusqu’à 7 personnes.', reward: { cash: 9_000 }, done: (g) => g.staff.length >= 7, progress: (g) => ratio(g.staff.length, 7) },
  { id: 'fans-10k', act: 1, title: '50 000 fans', desc: 'Rassemblez 50 000 fans.', reward: { cash: 9_000 }, done: (g) => totalFans(g) >= 50_000, progress: (g) => ratio(Math.round(totalFans(g)), 50_000) },
  { id: 'rep-25', act: 1, title: 'Label national', desc: 'Atteignez 30 de réputation.', reward: { cash: 30_000 }, done: (g) => g.reputation >= 30, progress: (g) => ratio(Math.floor(g.reputation), 30) },

  { id: 'feat', act: 2, title: 'Un featuring', desc: 'Sortez un titre en featuring.', reward: { cash: 12_000 }, done: (g) => released(g).some((s) => !!s.feat) },
  { id: 'media', act: 2, title: 'Campagne média', desc: 'Sortez un titre avec une campagne média.', reward: { cash: 9_000 }, done: (g) => released(g).some((s) => (s.release?.media?.length ?? 0) > 0) },
  { id: 'ep', act: 2, title: 'Un EP', desc: 'Publiez un EP.', reward: { cash: 18_000 }, done: (g) => g.projects.some((p) => p.status === 'sorti' && p.kind === 'EP') },
  { id: 'pays-3', act: 2, title: 'Cinq villes conquises', desc: 'Atteignez 5 villes différentes.', reward: { cash: 18_000 }, done: (g) => g.stats.countriesReached.length >= 5, progress: (g) => ratio(g.stats.countriesReached.length, 5) },
  { id: 'tournee', act: 2, title: 'Une tournée', desc: 'Terminez une tournée.', reward: { cash: 24_000 }, done: (g) => g.tours.some((t) => t.status === 'done') },
  { id: 'bureau', act: 2, title: 'Un bureau à l’étranger', desc: 'Ouvrez un bureau ou un partenaire local.', reward: { cash: 24_000 }, done: (g) => g.offices.length >= 2 },
  { id: 'tournoi', act: 2, title: 'Le Grand Tournoi', desc: 'Menez un Grand Tournoi jusqu’à la couronne.', reward: { cash: 30_000 }, done: (g) => g.tournament?.status === 'termine' },
  { id: 'rep-50', act: 2, title: 'Label régional', desc: 'Atteignez 55 de réputation.', reward: { cash: 60_000 }, done: (g) => g.reputation >= 55, progress: (g) => ratio(Math.floor(g.reputation), 55) },
  { id: 'revenus-1m', act: 2, title: 'Trois millions de recettes', desc: 'Cumulez 3 000 000 $ de recettes.', reward: { cash: 60_000 }, done: (g) => g.stats.totalRevenue >= 3_000_000, progress: (g) => ratio(Math.round(g.stats.totalRevenue), 3_000_000) },

  { id: 'trois-artistes', act: 3, title: 'Un roster', desc: 'Avez quatre artistes sous contrat.', reward: { cash: 36_000 }, done: (g) => g.artists.filter((a) => !a.isFounder).length >= 4, progress: (g) => ratio(g.artists.filter((a) => !a.isFounder).length, 4) },
  { id: 'album', act: 3, title: 'Un album', desc: 'Publiez un album.', reward: { cash: 48_000 }, done: (g) => g.projects.some((p) => p.status === 'sorti' && p.kind === 'Album') },
  { id: 'disque-or', act: 2, title: 'Disque d’or', desc: 'Obtenez la certification or sur un titre.', reward: { cash: 18_000 }, done: (g) => (g.certs ?? []).length >= 1 },
  { id: 'top3-pays', act: 3, title: 'Podium national', desc: 'Placez un titre dans le top 3 de votre pays.', reward: { cash: 60_000 }, done: (g) => { const r = bestRank(g, 'pays', g.label.hqCityId); return r !== null && r <= 3 } },
  { id: 'pays-8', act: 3, title: 'Douze villes conquises', desc: 'Atteignez 12 villes différentes.', reward: { cash: 72_000 }, done: (g) => g.stats.countriesReached.length >= 12, progress: (g) => ratio(g.stats.countriesReached.length, 12) },
  { id: 'rep-75', act: 3, title: 'Label continental', desc: 'Atteignez 80 de réputation.', reward: { cash: 120_000 }, done: (g) => g.reputation >= 80, progress: (g) => ratio(Math.floor(g.reputation), 80) },
  { id: 'fans-1m', act: 3, title: 'Deux millions de fans', desc: 'Rassemblez 2 000 000 de fans.', reward: { cash: 120_000 }, done: (g) => totalFans(g) >= 2_000_000, progress: (g) => ratio(Math.round(totalFans(g)), 2_000_000) },
  { id: 'revenus-10m', act: 3, title: 'Trente millions de recettes', desc: 'Cumulez 30 000 000 $ de recettes.', reward: { cash: 180_000 }, done: (g) => g.stats.totalRevenue >= 30_000_000, progress: (g) => ratio(Math.round(g.stats.totalRevenue), 30_000_000) },

  { id: 'disque-platine', act: 3, title: 'Double disque de platine', desc: 'Obtenez la certification double platine ou mieux.', reward: { cash: 60_000 }, done: (g) => (g.certs ?? []).some((c) => ['platine2', 'platine3', 'diamant'].includes(c.level)) },
  { id: 'disque-diamant', act: 4, title: 'Disque de diamant', desc: 'Obtenez la certification diamant.', reward: { cash: 180_000 }, done: (g) => (g.certs ?? []).some((c) => c.level === 'diamant') },
  { id: 'continents-4', act: 4, title: 'Cinq continents', desc: 'Atteignez 5 continents.', reward: { cash: 180_000 }, done: (g) => continents(g) >= 5, progress: (g) => ratio(continents(g), 5) },
  { id: 'numero-un', act: 4, title: 'Numéro un mondial', desc: 'Placez un titre n°1 du classement mondial.', reward: { cash: 180_000 }, done: (g) => bestRank(g, 'monde', g.label.hqCityId) === 1 },
  { id: 'rep-100', act: 4, title: 'Label mondial', desc: 'Atteignez 100 de réputation : Meridian Group tombe.', reward: { cash: 1_000_000 }, done: (g) => g.reputation >= 100, progress: (g) => ratio(Math.floor(g.reputation), 100) },
]

export const objectiveById = (id: string) => OBJECTIVES.find((o) => o.id === id)
export const doneCount = (g: GameState) => (g.objectives ?? []).length
/** Prochain objectif non accompli, dans l'ordre de l'histoire. */
export const nextObjective = (g: GameState) => OBJECTIVES.find((o) => !(g.objectives ?? []).includes(o.id))

/** Valide les objectifs atteints (une seule fois), verse les récompenses ; renvoie les titres accomplis. */
export function checkObjectives(s: GameState): Objective[] {
  const gained: Objective[] = []
  for (const o of OBJECTIVES) {
    if (s.objectives.includes(o.id) || !o.done(s)) continue
    s.objectives.push(o.id)
    s.cash += o.reward.cash ?? 0
    addRep(s, o.reward.rep ?? 0)
    gained.push(o)
  }
  return gained
}

// ---------- Meridian Group : l'offre de rachat et le sauvetage ----------
export const MERIDIAN_OFFER = { cash: 750_000, levy: 0.2, weeks: 104, repPenalty: 5 }
export const MERIDIAN_BAILOUT = { cash: 250_000, levy: 0.3, weeks: 104, repPenalty: 8 }
/** Coût pour se racheter : proportionnel aux semaines restantes. */
export const buyoutCost = (weeksLeft: number) => 8_000 * weeksLeft

export function acceptMeridianOffer(s0: GameState): Result2 {
  if (s0.deal) return fail(s0, 'Un accord avec Meridian est déjà en cours.')
  const s = clone(s0)
  s.cash += MERIDIAN_OFFER.cash
  s.reputation = Math.max(0, s.reputation - MERIDIAN_OFFER.repPenalty)
  s.deal = { kind: 'offre', weeksLeft: MERIDIAN_OFFER.weeks, levy: MERIDIAN_OFFER.levy }
  return ok(s, `Accord signé : +$${MERIDIAN_OFFER.cash.toLocaleString('fr-FR')}, mais Meridian prélève ${MERIDIAN_OFFER.levy * 100} % de vos recettes pendant ${MERIDIAN_OFFER.weeks} semaines et votre réputation baisse de ${MERIDIAN_OFFER.repPenalty}.`)
}

export function buyBackFreedom(s0: GameState): Result2 {
  if (!s0.deal) return fail(s0, 'Aucun accord avec Meridian.')
  const cost = buyoutCost(s0.deal.weeksLeft)
  if (s0.cash < cost) return fail(s0, `Rachat impossible : il faut $${cost.toLocaleString('fr-FR')}.`)
  const s = clone(s0)
  s.cash -= cost; s.spent += cost
  s.deal = null
  return ok(s, 'Vous avez racheté votre liberté : Meridian ne prélève plus rien.')
}

/** Appliqué en fin de semaine : prélève la part de Meridian sur les recettes. */
export function applyDealLevy(s: GameState, receipts: number, note: (t: string) => void): number {
  if (!s.deal) return receipts
  const cut = Math.round(receipts * s.deal.levy)
  s.cash -= cut
  s.deal.weeksLeft -= 1
  if (cut > 0) note(`Meridian prélève $${cut.toLocaleString('fr-FR')} (${Math.round(s.deal.levy * 100)} % de vos recettes).`)
  if (s.deal.weeksLeft <= 0) { s.deal = null; note('L’accord avec Meridian est arrivé à terme : vous êtes libre.') }
  return receipts - cut
}

/** Après 4 semaines de trésorerie négative : sauvetage forcé par Meridian (une seule fois) plutôt que la fin de partie. */
export function applyBailout(s: GameState): void {
  s.cash = MERIDIAN_BAILOUT.cash
  s.reputation = Math.max(0, s.reputation - MERIDIAN_BAILOUT.repPenalty)
  s.deal = { kind: 'sauvetage', weeksLeft: MERIDIAN_BAILOUT.weeks, levy: MERIDIAN_BAILOUT.levy }
  s.bailouts = (s.bailouts ?? 0) + 1
  s.negWeeks = 0
}
type Result2 = import('./types').Result
