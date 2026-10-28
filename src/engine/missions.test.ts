import { describe, it, expect } from 'vitest'
import { createGame } from './newGame'
import type { NewGameConfig } from './types'

const cfg: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne',
  mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42,
}

import { advanceWeek } from './advanceWeek'

describe('missions & actualités', () => {
  it('propose des missions et alimente le fil', () => {
    let g = createGame(cfg)
    g = advanceWeek(g)
    expect(g.missions.length).toBeGreaterThan(0)
    expect(g.missions.length).toBeLessThanOrEqual(12 + 3)
    for (let i = 0; i < 12; i++) g = advanceWeek(g)
    expect(g.news.length).toBeGreaterThan(0)
    expect(g.news.length).toBeLessThanOrEqual(80)
    expect(g.missions.some((m) => m.status === 'echoue' || m.status === 'reussi')).toBe(true)
  })
})
