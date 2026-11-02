import type { GameState, Result } from './types'
import { addRep, clone, fail, ok } from './util'

/** Choix faits pendant les scènes de l'histoire qui ont des conséquences réelles sur la partie. */
export type StoryEffect = 'dossier-publier' | 'dossier-negocier'

export function applyStoryEffect(s0: GameState, effect: StoryEffect): Result {
  const s = clone(s0)
  s.eventSeen ??= {}
  if (s.eventSeen['dossier']) return fail(s0, 'Ce choix a déjà été fait.')
  s.eventSeen['dossier'] = s.week
  if (effect === 'dossier-publier') {
    // Awa publie : le public est scandalisé, la réputation grimpe, Meridian contre-attaque plusieurs semaines.
    addRep(s, 2.5)
    s.meridian = { phase: 'offensive', until: s.week + 8, since: s.week }
    s.news ??= []
    s.news.unshift({ id: `dos-${s.week}`, week: s.week, tag: 'Enquête', text: 'Le dossier « Horizon » est publié : Meridian est accusé d’acheter des places au classement.', tone: 'c' })
    return ok(s, 'Dossier publié : réputation en hausse, Meridian contre-attaque pendant 8 semaines.')
  }
  // Négociation : Meridian suspend ses offensives longtemps, mais la presse l'apprend peu à peu (léger coût de réputation).
  s.meridian = { phase: 'calme', until: 0, since: s.week + 12 }
  s.reputation = Math.max(0, s.reputation - 1)
  s.news ??= []
  s.news.unshift({ id: `dos-${s.week}`, week: s.week, tag: 'Coulisses', text: 'Un accord de non-agression circule entre Meridian et le label : certains y voient une capitulation.', tone: 'e' })
  return ok(s, 'Trêve obtenue : Meridian suspend ses offensives environ 6 mois, au prix de −1 de réputation.')
}
