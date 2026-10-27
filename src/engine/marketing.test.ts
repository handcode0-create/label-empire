import { describe, expect, it } from 'vitest'
import { generateTitle } from '../data/titles'
import { MEDIA } from '../data/media'
import { releaseCost } from './production'
import { createRng } from './rng'

describe('titres automatiques', () => {
  it('génère des titres non vides, différents des existants', () => {
    const rng = createRng(42)
    const taken: string[] = []
    for (let i = 0; i < 20; i++) {
      const t = generateTitle(rng, { theme: 'Ambition', mood: 'Confiant', lang: 'Français', genre: 'Hip-hop' }, taken)
      expect(t.length).toBeGreaterThan(2)
      expect(taken).not.toContain(t)
      taken.push(t)
    }
  })
})

describe('médias', () => {
  it('ont un id unique et un coût compté dans la sortie', () => {
    expect(new Set(MEDIA.map((m) => m.id)).size).toBe(MEDIA.length)
    const m = MEDIA[0]
    expect(releaseCost({ promo: 1000, loc: [], media: [m.id] })).toBe(1000 + m.cost)
  })
})
