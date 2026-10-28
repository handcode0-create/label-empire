import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { resolveEvent } from './events'
import { addHeat, fanPct, fanTick, heatOf, releaseReaction, saturation } from './fans'
import { createGame } from './newGame'
import { SIM_CFG } from './simBot'
import type { GameEvent, GameState, Song } from './types'

const game = () => { const g = createGame({ ...SIM_CFG, seed: 6 }); g.cash = 300_000; return g }
const song = (g: GameState, quality: number, week = 1): Song => ({ id: 'q' + quality, title: 'T' + quality, artistId: g.artists[0].id, genre: 'Afro-pop', theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste', lyricsQ: 70, mastering: true, quality, stage: 'released', readyWeek: 1, release: { week, strategy: 'regionale', cityIds: ['abidjan'], promo: 0, loc: [] }, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} }, hype: 0 })

describe('fans et public', () => {
  it('un titre raté déçoit : fans perdus dans les villes ciblées et ferveur en baisse', () => {
    const g = game(); const a = g.artists[0]; a.fans = { abidjan: 10_000, dakar: 10_000 }
    const notes: { tag: string; text: string; tone: 'r' }[] = []
    releaseReaction(g, song(g, 30), notes)
    expect(a.fans.abidjan).toBeLessThan(10_000)
    expect(a.fans.dakar).toBe(10_000)
    expect(heatOf(a)).toBeLessThan(50)
    expect(notes[0].text).toContain('déçoit')
  })
  it('un excellent titre fidélise', () => {
    const g = game(); const a = g.artists[0]
    releaseReaction(g, song(g, 85), [])
    expect(heatOf(a)).toBeGreaterThan(50)
  })
  it('une ferveur élevée ralentit l’érosion des fans', () => {
    const g = game()
    const hot = g.artists[0]; hot.fans = { abidjan: 100_000 }; hot.heat = 100
    const cold = { ...structuredClone(hot), id: 'cold', isFounder: false, heat: 0 }; g.artists.push(cold)
    g.week = 30
    fanTick(g, [])
    expect(hot.fans.abidjan).toBeGreaterThan(cold.fans.abidjan)
  })
  it('la saturation d’une ville freine le recrutement de fans', () => {
    const g = game(); const a = g.artists[0]
    a.fans = { abidjan: 100_000 }
    const low = saturation(g, 'abidjan')
    a.fans = { abidjan: 5_000_000 }
    expect(saturation(g, 'abidjan')).toBeLessThan(low)
    a.fans = { abidjan: 99_000_000 }
    expect(saturation(g, 'abidjan')).toBe(0)
  })
  it('un scandale mal géré fait perdre un pourcentage de la base, dans toutes les villes', () => {
    const g = game(); const a = g.artists[0]; a.fans = { abidjan: 100_000, paris: 50_000 }
    g.event = { id: 'e', kind: 't', week: 1, title: 'T', text: '', artistId: a.id, choices: [{ id: 'x', label: 'x', detail: '', cost: 0, fx: [{ t: 'fanPct', v: -0.1 }, { t: 'heat', v: -20 }] }] } as GameEvent
    const s = resolveEvent(g, 'x').state
    expect(s.artists[0].fans.abidjan).toBe(90_000)
    expect(s.artists[0].fans.paris).toBe(45_000)
    expect(heatOf(s.artists[0])).toBe(30)
    fanPct(a, 0.5); addHeat(a, 10)
    expect(a.fans.paris).toBe(75_000)
  })
  it('un tube déplace une part des fans vers les villes voisines de la même zone', () => {
    let g = game(); const a = g.artists[0]; a.fans = { abidjan: 400_000 }
    g.songs.push({ ...song(g, 80, 1), stats: { ...song(g, 80).stats, hist: [{ w: 1, st: 900_000, rk: 1 }, { w: 2, st: 900_000, rk: 1 }, { w: 3, st: 900_000, rk: 1 }] } })
    g = advanceWeek(g)
    expect(Object.keys(g.artists[0].fans).length).toBeGreaterThan(1)
  })
})
