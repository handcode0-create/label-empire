import type { GameState } from './types'
import { clamp } from './util'

/** Crédibilité du label (0..100) : ce que pensent les artistes, la presse et le public de vos méthodes. Elle s'oppose souvent au succès commercial. */
export const credOf = (g: Pick<GameState, 'credibility'>) => g.credibility ?? 50
export function addCred(s: GameState, v: number) { s.credibility = clamp(Math.round((credOf(s) + v) * 100) / 100, 0, 100) }

export type CredTier = { id: 'culte' | 'respecte' | 'equilibre' | 'commercial' | 'vendu'; name: string; tone: 'g' | 'c' | 'e' | 'r' | 'i'; text: string }
export function credTier(c: number): CredTier {
  if (c >= 75) return { id: 'culte', name: 'Label culte', tone: 'g', text: 'Les artistes se battent pour signer chez vous, le public pardonne vos erreurs.' }
  if (c >= 58) return { id: 'respecte', name: 'Label respecté', tone: 'c', text: 'Votre parole compte : la presse et les artistes vous font confiance.' }
  if (c >= 40) return { id: 'equilibre', name: 'Label équilibré', tone: 'i', text: 'Ni héros ni vendu : vos choix restent lisibles pour tout le monde.' }
  if (c >= 25) return { id: 'commercial', name: 'Label commercial', tone: 'e', text: 'On vous reconnaît pour vos chiffres, pas pour vos principes. Les fans sont plus volatils.' }
  return { id: 'vendu', name: 'Label vendu', tone: 'r', text: 'Le public se méfie, les artistes regardent ailleurs, la presse attend la chute.' }
}

/** Les fans partent moins vite d'un label respecté et plus vite d'un label discrédité. */
export const churnFactor = (g: Pick<GameState, 'credibility'>) => { const c = credOf(g); return c >= 70 ? 0.8 : c >= 58 ? 0.92 : c < 25 ? 1.3 : c < 40 ? 1.15 : 1 }
/** Pondération des négociations de contrat : les artistes signent plus volontiers chez un label crédible. */
export const signingBonus = (g: Pick<GameState, 'credibility'>) => clamp((credOf(g) - 50) * 0.003, -0.12, 0.12)

/** Variation hebdomadaire : retour très lent vers l'équilibre et usure d'un accord avec Meridian. */
export function credTick(s: GameState, notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]) {
  const before = credTier(credOf(s)).id
  let d = (50 - credOf(s)) * 0.01
  if (s.deal) d -= 0.15
  addCred(s, d)
  const after = credTier(credOf(s)).id
  if (before !== after) notes.push({ tag: 'Image', text: `Votre image change : vous devenez un « ${credTier(credOf(s)).name} ».`, tone: credTier(credOf(s)).tone })
}

/** Une sortie de qualité fait monter la crédibilité, un titre bâclé la fait baisser. */
export function credRelease(s: GameState, quality: number | undefined) {
  if (quality === undefined) return
  if (quality >= 75) addCred(s, 0.5)
  else if (quality < 50) addCred(s, -0.5)
}

/** Épilogue : la manière dont le label a gagné. */
export function credEpilogue(g: Pick<GameState, 'credibility'>): string {
  switch (credTier(credOf(g)).id) {
    case 'culte': return 'On dit désormais que votre label a gagné sans jamais se renier : des gamins fondent des groupes en citant votre catalogue.'
    case 'respecte': return 'Votre nom est synonyme de parole tenue : les artistes viennent à vous avant qu’on ait besoin de les chercher.'
    case 'equilibre': return 'Vous avez gagné sans illusion : quelques compromis, quelques principes, et un label qui tient debout.'
    case 'commercial': return 'Le succès est là, les chiffres aussi. Reste à savoir si quelqu’un se souviendra des chansons.'
    default: return 'Le trône est à vous, mais la presse écrit déjà l’histoire que vous ne vouliez pas lire : celle d’un empire bâti sur des raccourcis.'
  }
}
