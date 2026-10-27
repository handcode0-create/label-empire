import { describe, expect, it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame, startingCash, validateConfig } from './newGame'
import { songQuality } from './quality'
import type { NewGameConfig } from './types'

const cfg: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne',
  mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42,
}

describe('nouvelle partie', () => {
  it('crée le fondateur comme artiste', () => {
    const g = createGame(cfg)
    expect(g.artists).toHaveLength(1)
    expect(g.cash).toBe(120_000)
  })
  it('refuse une répartition de points invalide', () => {
    expect(validateConfig({ ...cfg, staffSkills: { negociation: 9 } })).toContain('Répartir exactement 10 points de staff')
  })
  it('réputation haute = moins de cash', () => {
    expect(startingCash(60, 'normal')).toBeLessThan(startingCash(10, 'normal'))
  })
})

describe('advanceWeek', () => {
  it('est déterministe et pure', () => {
    const g = createGame(cfg)
    const a = advanceWeek(g, { actions: [] })
    const b = advanceWeek(g, { actions: [] })
    expect(a).toEqual(b)
    expect(g.week).toBe(1)
    expect(a.week).toBe(2)
  })
  it('ne laisse jamais la trésorerie devenir négative via une dépense', () => {
    const g = createGame(cfg)
    const n = advanceWeek(g, { actions: [{ type: 'spend', label: 'Concours', amount: 999_999 }] })
    expect(n.cash).toBeGreaterThanOrEqual(g.cash - 1_500)
  })
})

describe('qualité', () => {
  it('reste entre 0 et 100', () => {
    expect(songQuality({ voix: 100, ecriture: 100, production: 100, studio: 100, arrangement: 100, luck: 100 }, 50)).toBe(100)
  })
})
