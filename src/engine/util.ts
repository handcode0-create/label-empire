import { createRng, type Rng } from './rng'
import type { GameState, Result } from './types'

/** RNG lié à l'état : chaque appel avance rngState, donc tout reste rejouable. */
export function drawRng(s: GameState): Rng {
  const rng = createRng(s.rngState)
  s.rngState = (Math.imul(s.rngState, 1664525) + 1013904223) >>> 0
  return rng
}
/** Réglages de difficulté : écoutes, charges fixes et pression des rivaux. */
export const DIFFICULTY_MODS = {
  facile: { streams: 1.15, costs: 0.85, pressure: 0.75 },
  normal: { streams: 1, costs: 1, pressure: 1 },
  difficile: { streams: 0.82, costs: 1.2, pressure: 1.3 },
} as const
export const modsOf = (s: GameState) => DIFFICULTY_MODS[s.label?.difficulty ?? 'normal'] ?? DIFFICULTY_MODS.normal
export const clone = (s: GameState): GameState => structuredClone(s)
export const fail = (s: GameState, error: string): Result => ({ state: s, error })
export const ok = (s: GameState, info?: string): Result => ({ state: s, info })
export const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const money = (n: number) => '$' + Math.round(n).toLocaleString('fr-FR')

/** Compétence de staff effective : points du fondateur + niveaux des recrues du rôle. */
export function staffSkill(s: GameState, key: string): number {
  const bonus = s.staff.filter((m) => m.skill === key).reduce((t, m) => t + m.level, 0)
  return (s.staffSkills[key] ?? 0) + bonus
}
export const totalFans = (s: GameState) => s.artists.reduce((t, a) => t + sum(a.fans), 0)
export function fansInCity(s: GameState, cityId: string) {
  return s.artists.reduce((t, a) => t + (a.fans[cityId] ?? 0), 0)
}
export function spend(s: GameState, amount: number, label: string): string | null {
  if (s.cash - amount < 0) return `Trésorerie insuffisante (${label} : ${money(amount)}).`
  s.cash -= amount
  s.spent += amount
  s.log.push(`${label} : −${money(amount)}`)
  return null
}
export function useAp(s: GameState, n = 1): string | null {
  if (s.ap < n) return "Plus d'actions disponibles cette semaine. Validez la semaine pour en récupérer."
  s.ap -= n
  return null
}

/** Places d'artistes sous contrat : 3 au départ, +1 par bureau ou partenaire, +1 par palier atteint. */
/** Réputation : les gains sont freinés (échelle globale) et de plus en plus difficiles à mesure qu'on monte. */
export const REP_SCALE = 0.55
export function addRep(s: { reputation: number }, v: number) {
  if (v <= 0) { s.reputation = Math.max(0, s.reputation + v); return }
  const f = REP_SCALE * Math.max(0.2, 1 - s.reputation / 135)
  s.reputation = Math.min(100, s.reputation + v * f)
}
export const artistSlots = (s: GameState) => 3 + s.offices.length - 1 + Math.floor(s.reputation / 25)
export const signedCount = (s: GameState) => s.artists.filter((a) => !a.isFounder).length
