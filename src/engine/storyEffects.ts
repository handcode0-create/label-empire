import type { GameState, Result } from './types'
import { addRep, clone, fail, ok, spend } from './util'
import { addCred } from './credibility'
import { inquiryStrength, tierOf, TIER_NAME } from './inquiry'

/** Choix faits pendant les scènes de l'histoire qui ont des conséquences réelles sur la partie. */
export type StoryEffect = 'dossier-publier' | 'dossier-negocier' | 'roster-diner' | 'awa-exclusif' | 'dossier-attendre'

export function applyStoryEffect(s0: GameState, effect: StoryEffect): Result {
  const s = clone(s0)
  s.eventSeen ??= {}
  if (effect === 'roster-diner') {
    if (s.eventSeen['roster-diner']) return fail(s0, 'Ce choix a déjà été fait.')
    const e = spend(s, 3000, 'Dîner du roster')
    if (e) return fail(s0, e)
    s.eventSeen['roster-diner'] = s.week
    for (const a of s.artists) if (!a.isFounder) a.morale = Math.min(100, a.morale + 8)
    addCred(s, 1)
    return ok(s, 'Un dîner pour tout le roster : le moral des artistes remonte de 8 points (−3 000 $).')
  }
  if (effect === 'awa-exclusif') {
    if (s.eventSeen['awa-exclusif']) return fail(s0, 'Ce choix a déjà été fait.')
    s.eventSeen['awa-exclusif'] = s.week
    addRep(s, 0.6)
    addCred(s, 1.5)
    s.news ??= []
    s.news.unshift({ id: `awa-${s.week}`, week: s.week, tag: 'Presse', text: `Interview exclusive de ${s.label.founder} dans « Écho des Marchés » : une page entière sur le label.`, tone: 'c' })
    return ok(s, 'Interview exclusive publiée : +0,6 de réputation.')
  }
  if (s.eventSeen['dossier']) return fail(s0, 'Ce choix a déjà été fait.')
  if (effect === 'dossier-attendre') {
    if (s.eventSeen['dossier-attendre']) return fail(s0, 'Vous avez déjà demandé du temps.')
    s.eventSeen['dossier-attendre'] = s.week
    return ok(s, 'Vous gardez le dossier au chaud. Complétez l’enquête (écran Enquête) : Awa reviendra quand il sera solide.')
  }
  const tier = tierOf(inquiryStrength(s))
  s.eventSeen['dossier'] = s.week
  s.eventSeen[effect] = s.week // mémorise le choix pour les scènes et l'épilogue
  if (effect === 'dossier-publier') {
    // Awa publie : le public est scandalisé, la réputation grimpe, Meridian contre-attaque plusieurs semaines.
    const rep = [1.5, 2.5, 3.5][tier], cred = [1, 4, 6][tier], weeks = [10, 8, 5][tier]
    addRep(s, rep)
    addCred(s, cred)
    s.meridian = { phase: 'offensive', until: s.week + weeks, since: s.week }
    s.eventSeen['dossier-tier'] = tier
    s.news ??= []
    if (tier === 0) { s.cash = Math.max(0, s.cash - 8000); s.log.push('Frais d’avocats suite à la plainte de Meridian : −$8 000') }
    if (tier === 2) for (const m of s.rivalMoves ?? []) m.strength = Math.round(m.strength * 0.7 * 100) / 100
    const txt = tier === 0 ? 'Le dossier « Horizon » est publié, mais ses failles permettent à Meridian de répliquer par une plainte.' : tier === 1 ? 'Le dossier « Horizon » est publié : Meridian est accusé d’acheter des places au classement.' : 'Le dossier « Horizon » est publié, pièces à l’appui : Meridian ne peut rien démentir et recule sur toute la ligne.'
    s.news.unshift({ id: `dos-${s.week}`, week: s.week, tag: 'Enquête', text: txt, tone: tier === 0 ? 'e' : 'c' })
    return ok(s, `${TIER_NAME[tier]} publié : réputation +${rep}, Meridian contre-attaque ${weeks} semaines${tier === 0 ? ' (−$8 000 de frais d’avocats)' : tier === 2 ? ' et ses attaques sont affaiblies' : ''}.`)
  }
  // Négociation : Meridian suspend ses offensives longtemps, mais la presse l'apprend peu à peu (léger coût de réputation).
  s.meridian = { phase: 'calme', until: 0, since: s.week + 12 }
  const loss = [1, 0.5, 0][tier]
  s.reputation = Math.max(0, s.reputation - loss)
  if (tier === 2) { s.cash += 25000; s.log.push('Meridian paie pour le silence : +$25 000') }
  s.eventSeen['dossier-tier'] = tier
  addCred(s, -3)
  s.news ??= []
  s.news.unshift({ id: `dos-${s.week}`, week: s.week, tag: 'Coulisses', text: 'Un accord de non-agression circule entre Meridian et le label : certains y voient une capitulation.', tone: 'e' })
  return ok(s, `Trêve obtenue (${TIER_NAME[tier].toLowerCase()}) : Meridian suspend ses offensives environ 6 mois${loss ? `, au prix de −${loss} de réputation` : ' et verse $25 000 pour votre silence'}.`)
}
