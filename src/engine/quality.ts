/** Q = 0.30V + 0.25E + 0.20P + 0.10S + 0.10A + 0.05L + ε (toutes entrées 0..100). */
export interface QualityInput { voix: number; ecriture: number; production: number; studio: number; arrangement: number; luck: number }
export function songQuality(i: QualityInput, noise = 0): number {
  const q = 0.3 * i.voix + 0.25 * i.ecriture + 0.2 * i.production + 0.1 * i.studio + 0.1 * i.arrangement + 0.05 * i.luck + noise
  return Math.max(0, Math.min(100, q))
}
