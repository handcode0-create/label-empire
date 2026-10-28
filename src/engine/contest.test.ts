import { describe, expect, it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { startContest } from './scouting'
import type { NewGameConfig } from './types'

const cfg: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne',
  mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 7,
}
describe('continuité des concours', () => {
  it('un concours lancé survit au passage des semaines puis livre ses finalistes', () => {
    let g = createGame(cfg)
    const r = startContest(g, { name: 'Révélation', cityId: 'abidjan', format: 'salle', budget: 12000, jury: [] })
    expect(r.error).toBeUndefined(); g = r.state
    g = advanceWeek(g)
    expect(g.contests[0].status).toBe('ouvert')
    g = advanceWeek(g)
    expect(g.contests[0].status).toBe('termine')
    expect(g.contests[0].finalists).toHaveLength(4)
    expect(g.contests[0].finalists.every((id) => g.pool.some((a) => a.id === id))).toBe(true)
  })
})
