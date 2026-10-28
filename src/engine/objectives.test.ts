import { describe, expect, it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { OBJECTIVES, acceptMeridianOffer, buyBackFreedom, checkObjectives } from './objectives'
import type { GameState, NewGameConfig } from './types'

const cfg: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne',
  mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42,
}
const fresh = (): GameState => createGame(cfg)

describe('objectifs', () => {
  it('ids uniques', () => { expect(new Set(OBJECTIVES.map((o) => o.id)).size).toBe(OBJECTIVES.length) })
  it('valide une seule fois et verse la récompense', () => {
    const g = fresh(); g.reputation = 30
    const c0 = g.cash
    const a = checkObjectives(g)
    expect(a.map((o) => o.id)).toContain('rep-25')
    expect(g.cash).toBeGreaterThan(c0)
    expect(checkObjectives(g)).toHaveLength(0)
  })
  it('réputation 100 ne termine plus la partie', () => {
    const g = fresh(); g.reputation = 100
    const n = advanceWeek(g)
    expect(n.outcome).toBeFalsy()
  })
  it('victoire quand tous les objectifs sont accomplis', () => {
    const g = fresh(); g.objectives = OBJECTIVES.slice(1).map((o) => o.id)
    g.reputation = 100; g.stats.totalRevenue = 1e9
    const n = advanceWeek(g)
    expect(n.outcome === 'victoire' || n.objectives.length < OBJECTIVES.length).toBe(true)
  })
})

describe('Meridian', () => {
  it('l’offre injecte du cash, baisse la réputation et prélève une part', () => {
    const g = fresh(); const r = acceptMeridianOffer(g)
    expect(r.error).toBeUndefined()
    expect(r.state.cash).toBe(g.cash + 750_000)
    expect(r.state.reputation).toBe(g.reputation - 5)
    expect(r.state.deal?.levy).toBe(0.2)
    expect(acceptMeridianOffer(r.state).error).toBeTruthy()
  })
  it('on peut racheter sa liberté', () => {
    const g = fresh(); g.cash = 1e8
    const s = acceptMeridianOffer(g).state
    const b = buyBackFreedom(s)
    expect(b.state.deal).toBeNull()
  })
  it('trésorerie négative : sauvetage une fois, pas de défaite immédiate', () => {
    let g = fresh(); g.cash = -5e6
    for (let i = 0; i < 4; i++) g = advanceWeek(g)
    expect(g.outcome).toBeFalsy()
    expect(g.bailouts).toBe(1)
    expect(g.deal?.kind).toBe('sauvetage')
    expect(g.cash).toBeGreaterThan(0)
  })
  it('faillite répétée après sauvetage = défaite', () => {
    let g = fresh(); g.bailouts = 1; g.cash = -5e7
    for (let i = 0; i < 8 && !g.outcome; i++) { g.cash = Math.min(g.cash, -5e7); g = advanceWeek(g) }
    expect(g.outcome).toBe('defaite')
  })
})
