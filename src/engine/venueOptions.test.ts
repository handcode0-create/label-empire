import { describe, expect, it } from 'vitest'
import { createGame } from './newGame'
import { priceOptions, venueOptions } from './tour'
import type { NewGameConfig } from './types'

const cfg = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42,
} as NewGameConfig

describe('suggestions de salles et de prix', () => {
  const g = createGame(cfg)
  const a = g.artists[0] ?? { ...g.pool[0], contract: undefined } as never
  it('propose les 5 types de salle, dont un seul conseillé et débloqué', () => {
    const o = venueOptions(g, a, 'abidjan', [])
    expect(o.map((v) => v.kind)).toEqual(['club', 'theatre', 'salle', 'arene', 'stade'])
    expect(o.filter((v) => v.best)).toHaveLength(1)
    expect(o.find((v) => v.best)!.locked).toBe(false)
    expect(o.find((v) => v.kind === 'stade')!.locked).toBe(true)
    o.forEach((v) => expect(v.price).toBeGreaterThan(0))
  })
  it('le prix optimal rapporte au moins autant que le prix conseillé', () => {
    const p = priceOptions(g, a, { cityId: 'abidjan', capacity: 1200, kind: 'theatre' }, [])
    expect(p.optimal.gross).toBeGreaterThanOrEqual(p.steps[2].gross)
    expect(p.steps).toHaveLength(5)
  })
})
