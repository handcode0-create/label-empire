import { describe, expect, it } from 'vitest'
import { createGame } from './newGame'
import { reachIn } from './market'
import { cityById } from '../data/world'
import type { NewGameConfig } from './types'

const cfg = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'newyork', currency: 'USD', difficulty: 'normal', seed: 42,
} as NewGameConfig

describe('percée locale', () => {
  const g = createGame(cfg)
  const a = g.artists[0]
  const home = cityById(a.originCityId)
  const far = ['lagos', 'nairobi', 'abidjan'].map(cityById).find((c) => c.id !== home.id)!
  it('la ville d’origine donne toujours 100 % des écoutes', () => {
    expect(reachIn(g, a.id, home).mult).toBe(1)
  })
  it('sans fans chez soi, les autres villes restent très faibles', () => {
    a.fans = {}
    expect(reachIn(g, a.id, far).mult).toBeLessThanOrEqual(0.05)
  })
  it('une fois la ville d’origine conquise, la portée augmente', () => {
    a.fans = { [home.id]: home.base }
    const r = reachIn(g, a.id, far)
    expect(r.breakthrough).toBe(1)
    expect(r.mult).toBeGreaterThan(0.2)
    expect(r.mult).toBeLessThanOrEqual(1)
  })
})
