import { describe, it, expect } from 'vitest'
import { createGame } from './newGame'
import { advanceWeek } from './advanceWeek'
import { resolveEvent } from './events'
import { addBoost, pressureMult, trendMult, loyaltyOf, seasonMult } from './dynamics'
import type { GameState, NewGameConfig, Song } from './types'

const cfg = {
  labelName: 'S', logoId: 'ring', founderName: 'F', nationality: 'Ivoirienne', mainGenre: 'Afro-pop', startReputation: 30, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 11,
} as unknown as NewGameConfig
const mkSong = (id: string, artistId: string, week: number): Song => ({ id, title: id, artistId, genre: 'Afro-pop', theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste', lyricsQ: 70, mastering: true, quality: 70, stage: 'released', readyWeek: 1, release: { week, strategy: 'regionale', cityIds: ['abidjan', 'accra'], promo: 0, loc: [] }, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} }, hype: 0 })

describe('monde dynamique', () => {
  it('150 semaines : événements variés, tendances, rivaux, sans valeur aberrante', { timeout: 30_000 }, () => {
    let g: GameState = createGame(cfg)
    g.cash = 500_000
    const kinds = new Set<string>(); let trends = 0, moves = 0, offensives = 0
    for (let i = 0; i < 150; i++) {
      if (!g.songs.some((s) => s.stage === 'released' && g.week - (s.release?.week ?? 0) < 6)) g.songs.push(mkSong('h' + i, g.artists[0].id, g.week))
      g = advanceWeek(g)
      if (g.outcome) break
      if (g.event && !g.event.resolved) {
        kinds.add(g.event.kind)
        const pick = g.event.choices[i % g.event.choices.length]
        const r = resolveEvent(g, pick.id)
        if (!r.error) g = r.state
      }
      trends = Math.max(trends, g.trends.length); moves = Math.max(moves, g.rivalMoves.length); if (g.meridian.phase === 'offensive') offensives++
      expect(Number.isFinite(g.cash)).toBe(true)
      expect(g.reputation).toBeGreaterThanOrEqual(0)
    }
    expect(kinds.size).toBeGreaterThanOrEqual(7)
    expect(trends).toBeGreaterThan(0)
    expect(moves).toBeGreaterThan(0)
  })
  it('tendance, boost et pression modifient les écoutes', () => {
    const g = createGame(cfg)
    const song = mkSong('x', g.artists[0].id, 1)
    g.trends.push({ id: 't', genre: 'Afro-pop', mult: 1.3, start: 1, until: 20, kind: 'hausse', cause: '' })
    expect(trendMult(g, 'Afro-pop', 10)).toBeGreaterThan(1.29)
    addBoost(g, { kind: 'streams', mult: 2, weeks: 3, songId: 'x', label: 't' })
    g.rivalMoves.push({ id: 'r', week: 1, until: 9, label: 'L', artist: 'A', title: 'T', genre: 'Afro-pop', cityIds: ['abidjan'], strength: 0.2 })
    expect(pressureMult(g, song, 'abidjan', 5)).toBeCloseTo(0.8)
    expect(pressureMult(g, song, 'paris', 5)).toBe(1)
    expect(seasonMult('Gospel', 50)).toBeGreaterThan(1)
  })
  it('la fidélité baisse si le moral est bas', () => {
    let g = createGame(cfg)
    g.eventSeen = Object.fromEntries(['fx', 'raise', 'viral', 'gig', 'rival', 'sponsor', 'scandal', 'burnout', 'leak', 'playlist', 'festival', 'censure', 'poach', 'meridian', 'clash', 'audit', 'charity', 'wave'].map((k) => [k, 9999])) // aucun événement : on isole la règle de fidélité
    const a = g.artists[0]
    g.artists.push({ ...structuredClone(a), id: 'x2', isFounder: false, stageName: 'Test', morale: 20, loyalty: 60, contract: { royalty: 0.3, signedWeek: 1, weeks: 500 } as never })
    for (let i = 0; i < 6; i++) g = advanceWeek(g)
    expect(loyaltyOf(g.artists.find((x) => x.id === 'x2')!)).toBeLessThan(60)
  })
})
