import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { ageOf, artistWish, skillCap, train } from './artistLife'
import { relKey } from './dynamics'
import { createGame } from './newGame'
import { bookStudio, writeSong } from './production'
import { SIM_CFG } from './simBot'
import type { Artist, GameState } from './types'

const NO_EVENTS = Object.fromEntries(['fx', 'raise', 'viral', 'gig', 'rival', 'sponsor', 'scandal', 'burnout', 'leak', 'playlist', 'festival', 'censure', 'poach', 'meridian', 'clash', 'audit', 'charity', 'wave'].map((k) => [k, 99999]))
const game = () => { const g = createGame({ ...SIM_CFG, seed: 4 }); g.eventSeen = { ...NO_EVENTS }; g.cash = 500_000; return g }
const signed = (g: GameState, id: string, o: Partial<Artist> = {}): Artist => {
  const a: Artist = { ...structuredClone(g.artists[0]), id, stageName: id, isFounder: false, morale: 80, contract: { royalty: 0.3, advance: 1000, weeks: 500, signedWeek: 1, scope: 'monde' }, ...o }
  g.artists.push(a)
  return a
}

describe('vie des artistes', () => {
  it('les compétences progressent avec l’expérience, bornées par le potentiel', () => {
    const g = game()
    const a = g.artists[0]
    a.potential = 2; a.skills.voix = 60
    const cap = skillCap(a)
    expect(cap).toBe(62)
    for (let i = 0; i < 30; i++) train(a, 'voix', 1)
    expect(a.skills.voix).toBe(cap)
    expect(train(a, 'voix', 5)).toBe(false)
  })
  it('écrire, enregistrer et tourner font gagner de l’expérience', () => {
    let g = game()
    const a = g.artists[0]
    const before = { ...a.skills }
    for (let i = 0; i < 8; i++) {
      const w = writeSong(g, { title: 'Titre ' + i, artistId: a.id, genre: a.genre, theme: 'Amour', lang: a.lang, mood: 'Solaire', lyrics: 'je chante la nuit je chante le jour pour toi mon amour toujours', writer: 'artiste' })
      g = w.state; g.ap = 6
      const song = g.songs[g.songs.length - 1]
      g = bookStudio(g, song.id, 'ebene', 7).state; g.ap = 6
    }
    const gained = (k: string) => g.artists[0].skills[k] - before[k]
    expect(gained('voix') + gained('ecriture') + gained('creativite')).toBeGreaterThan(0)
  })
  it('l’ego grimpe avec les succès', () => {
    let g = game()
    const a = signed(g, 'star')
    a.fans = { abidjan: 2_000_000 }
    g.songs.push({ id: 'h', title: 'Hit', artistId: 'star', genre: a.genre, theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste', lyricsQ: 70, mastering: true, quality: 70, stage: 'released', readyWeek: 1, release: { week: 1, strategy: 'regionale', cityIds: ['abidjan'], promo: 0, loc: [] }, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {}, hist: [{ w: 1, st: 900_000, rk: 1 }, { w: 2, st: 900_000, rk: 1 }, { w: 3, st: 900_000, rk: 1 }] }, hype: 0 })
    const e0 = a.ego ?? 45
    g = advanceWeek(g)
    expect(g.artists.find((x) => x.id === 'star')!.ego!).toBeGreaterThan(e0)
  })
  it('une offre concurrente arrive aux artistes en vue et ambitieux, avec une suite à traiter', () => {
    let g = game()
    const a = signed(g, 'ambitieux', { ego: 95, loyalty: 20 })
    a.fans = { abidjan: 90_000 }
    let found = false
    for (let i = 0; i < 120 && !found; i++) {
      g = advanceWeek(g)
      if (g.event && !g.event.resolved && g.event.artistId === 'ambitieux') found = true
      else if (g.artists.every((x) => x.id !== 'ambitieux')) break
    }
    expect(found || !g.artists.some((x) => x.id === 'ambitieux')).toBe(true)
    expect(g.news.some((n) => n.text.includes('ambitieux'))).toBe(true)
  })
  it('deux artistes proches s’influencent : session improvisée', () => {
    let g = game()
    signed(g, 'a1'); signed(g, 'a2', { genre: 'Hip-hop' })
    g.relations[relKey('a1', 'a2')] = 80
    const fans0 = g.artists.find((x) => x.id === 'a1')!.fans
    const total0 = Object.values(fans0).reduce((t, v) => t + v, 0)
    let session = false
    for (let i = 0; i < 80 && !session; i++) { g.relations[relKey('a1', 'a2')] = 80; g = advanceWeek(g); session = g.report!.notes.some((n) => n.text.includes('improvisent une session')) }
    expect(session).toBe(true)
    expect(Object.values(g.artists.find((x) => x.id === 'a1')!.fans).reduce((t, v) => t + v, 0)).toBeGreaterThan(total0 - 1000)
  })
  it('la rivalité entre artistes du même genre dégrade leur relation', () => {
    let g = game()
    const x = signed(g, 'r1'), y = signed(g, 'r2')
    x.genre = y.genre = 'Afro-pop'
    for (const id of ['r1', 'r2']) g.songs.push({ id: 's' + id, title: id, artistId: id, genre: 'Afro-pop', theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste', lyricsQ: 70, mastering: true, quality: 70, stage: 'released', readyWeek: 1, release: { week: 1, strategy: 'regionale', cityIds: ['abidjan'], promo: 0, loc: [] }, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} }, hype: 0 })
    for (let i = 0; i < 4; i++) g = advanceWeek(g)
    expect(g.relations[relKey('r1', 'r2')]).toBeLessThan(0)
  })
  it('l’humeur affichée reflète l’état réel et l’âge avance avec les années', () => {
    const g = game()
    const a = signed(g, 'humeur')
    expect(artistWish(g, a)[0]).toBe('Confiant')
    a.fatigue = 90
    expect(artistWish(g, a)[0]).toBe('Épuisé')
    a.fatigue = 0; a.loyalty = 10
    expect(artistWish(g, a)[0]).toBe('Distant')
    a.loyalty = 80; a.offer = { label: 'Orion Sound', until: 99 }
    expect(artistWish(g, a)).toEqual(['Tenté', expect.stringContaining('Orion Sound')])
    const age = ageOf(g, a)
    g.week = 60
    expect(ageOf(g, a)).toBe(age + 1)
  })
  it('les candidats du vivier évoluent : notoriété et exigences augmentent', () => {
    let g = game()
    const c = g.pool.find((x) => x.status !== 'concours')!
    const fans0 = Object.values(c.fans).reduce((t, v) => t + v, 0)
    g.week = 3
    for (let i = 0; i < 12; i++) g = advanceWeek(g)
    const c2 = g.pool.find((x) => x.id === c.id)
    if (c2) expect(Object.values(c2.fans).reduce((t, v) => t + v, 0)).toBeGreaterThan(fans0)
  })
})
