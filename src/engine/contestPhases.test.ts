import { describe, expect, it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { contestPlan, phaseExtraCost, startContest } from './scouting'
import type { NewGameConfig } from './types'

const cfg = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42,
} as NewGameConfig

describe('concours en plusieurs phases', () => {
  it('par défaut : finale seule en 2 semaines (comportement d’origine)', () => {
    expect(contestPlan({})).toEqual({ phases: 1, interval: 2 })
  })
  it('3 phases hebdomadaires : élimination chaque semaine, talents révélés, finale à la fin', () => {
    let g = createGame(cfg)
    g.cash = 500_000
    const r = startContest(g, { name: 'Test', cityId: 'abidjan', format: 'salle', budget: 12000, jury: [], phases: 3, interval: 1 })
    expect(r.error).toBeUndefined()
    g = r.state
    expect(g.cash).toBe(500_000 - 12000 - 2 * phaseExtraCost('salle'))
    const k = g.contests[0]
    expect(k.endWeek - k.startWeek).toBe(3)
    const poolBefore = g.pool.length
    const seen: number[] = []
    for (let i = 0; i < 5 && g.contests[0].status === 'ouvert'; i++) { g = advanceWeek(g); seen.push(g.contests[0].phase ?? 0) }
    expect(g.contests[0].status).toBe('termine')
    expect(Math.max(...seen)).toBe(2)
    expect(g.contests[0].finalists.length).toBe(4 + 2)
    expect(g.pool.length).toBeGreaterThan(poolBefore)
  })
  it('un rythme de 2 semaines allonge le concours', () => {
    let g = createGame(cfg); g.cash = 500_000
    g = startContest(g, { name: 'Lent', cityId: 'abidjan', format: 'salle', budget: 12000, jury: [], phases: 3, interval: 2 }).state
    expect(g.contests[0].endWeek - g.contests[0].startWeek).toBe(6)
  })
})
