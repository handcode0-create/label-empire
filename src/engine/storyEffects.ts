import type { GameState, Result } from './types'
import { addRep, clone, fail, ok, spend } from './util'
import { addCred } from './credibility'

/** Choix faits pendant les scènes de l'histoire qui ont des conséquences réelles sur la partie. */
export type StoryEffect = 'dossier-publier' | 'dossier-negocier' | 'roster-diner' | 'awa-exclusif'

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
  s.eventSeen['dossier'] = s.week
  s.eventSeen[effect] = s.week // mémorise le choix pour les scènes et l'épilogue
  if (effect === 'dossier-publier') {
    // Awa publie : le public est scandalisé, la réputation grimpe, Meridian contre-attaque plusieurs semaines.
    addRep(s, 2.5)
    addCred(s, 4)
    s.meridian = { phase: 'offensive', until: s.week + 8, since: s.week }
    s.news ??= []
    s.news.unshift({ id: `dos-${s.week}`, week: s.week, tag: 'Enquête', text: 'Le dossier « Horizon » est publié : Meridian est accusé d’acheter des places au classement.', tone: 'c' })
    return ok(s, 'Dossier publié : réputation en hausse, Meridian contre-attaque pendant 8 semaines.')
  }
  // Négociation : Meridian suspend ses offensives longtemps, mais la presse l'apprend peu à peu (léger coût de réputation).
  s.meridian = { phase: 'calme', until: 0, since: s.week + 12 }
  s.reputation = Math.max(0, s.reputation - 1)
  addCred(s, -3)
  s.news ??= []
  s.news.unshift({ id: `dos-${s.week}`, week: s.week, tag: 'Coulisses', text: 'Un accord de non-agression circule entre Meridian et le label : certains y voient une capitulation.', tone: 'e' })
  return ok(s, 'Trêve obtenue : Meridian suspend ses offensives environ 6 mois, au prix de −1 de réputation.')
}
