import { describe, it, expect } from 'vitest'
import { runSim } from './simBot'

/**
 * Calibrage : 260 semaines avec un joueur actif (voir simBot.ts).
 * `VITE_SIM_LOG=1 npm test -- sim` affiche la trajectoire ; `VITE_SIM_SEED=2` ne joue qu'une graine.
 * Cible de conception : réputation 100 atteinte vers la semaine 240 à 300 (environ 5 à 6 ans) par un joueur actif.
 */
const only = import.meta.env.VITE_SIM_SEED ? [Number(import.meta.env.VITE_SIM_SEED)] : [1, 2]
// Long (plusieurs minutes) : exécuté seulement à la demande (VITE_SIM_LOG ou VITE_SIM_SEED).
describe.skipIf(!import.meta.env.VITE_SIM_LOG && !import.meta.env.VITE_SIM_SEED)('simulation 260 semaines', () => {
  it('le joueur actif progresse sans valeur aberrante', () => {
    const rows = only.map((seed) => ({ seed, ...runSim(seed, 340) }))
    if (import.meta.env.VITE_SIM_LOG) for (const r of rows) console.log(`SIM seed ${r.seed} · rép/26 sem ${JSON.stringify(r.repAt)} · 100 atteint: ${r.hit100 ?? 'non'} · cash ${r.cash} · fans ${r.fans} · titres ${r.songs}`)
    for (const r of rows) { expect(Number.isFinite(r.cash)).toBe(true); expect(r.songs).toBeGreaterThan(5); expect(r.hit100 ?? 999).toBeGreaterThanOrEqual(230); expect(r.hit100 ?? 999).toBeLessThanOrEqual(320) }
  }, 900_000)
})
