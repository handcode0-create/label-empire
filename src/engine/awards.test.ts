import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { artistStatus } from './selectors'
import type { NewGameConfig } from './types'

const cfg: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42,
} as NewGameConfig

describe('cérémonie annuelle & statuts', () => {
  it('décerne des prix à la semaine 52', () => {
    let g = createGame(cfg)
    expect(artistStatus(g, g.artists[0].id)).toBe('inactif')
    for (let i = 0; i < 52; i++) g = advanceWeek(g)
    expect(g.awards.length).toBe(2)
    expect(g.awards.map((a) => a.category).sort()).toEqual(['artiste', 'titre'])
  })
})
