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
  it('décerne des prix à la semaine 52', { timeout: 30_000 }, () => {
    let g = createGame(cfg)
    expect(artistStatus(g, g.artists[0].id)).toBe('inactif')
    for (let i = 0; i < 52; i++) g = advanceWeek(g)
    expect(g.awards.length).toBeGreaterThanOrEqual(2)
    expect(g.awards.map((a) => a.category)).toEqual(expect.arrayContaining(['artiste', 'titre']))
  })
})

import { awardCalendar, nomineesFor } from './awards'
describe('calendrier des awards', () => {
  it('nominations 8 semaines avant la cérémonie de fin d’année', () => {
    expect(awardCalendar(1)).toMatchObject({ year: 1, nominationsWeek: 44, ceremonyWeek: 52, announced: false })
    expect(awardCalendar(44)).toMatchObject({ announced: true, nominationsIn: 0, ceremonyIn: 8 })
    expect(awardCalendar(52)).toMatchObject({ year: 2, ceremonyWeek: 104, announced: false })
  })
  it('les nominations sont annoncées en semaine 44 et effacées après la cérémonie', { timeout: 30_000 }, () => {
    let g = createGame(cfg)
    for (let i = 0; i < 43; i++) g = advanceWeek(g)
    expect(g.week).toBe(44)
    expect(g.nominations?.year).toBe(1)
    expect(g.nominations!.cats.length).toBeGreaterThan(0)
    const n = nomineesFor(g, 'titre')
    expect(n.length).toBeLessThanOrEqual(5)
    for (let i = 0; i < 8; i++) g = advanceWeek(g)
    expect(g.week).toBe(52)
    expect(g.nominations).toBeUndefined()
    expect(g.awards.length).toBeGreaterThan(0)
  })
})
