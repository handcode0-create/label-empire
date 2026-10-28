import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { isSouth, seasonMult } from './dynamics'
import { createGame } from './newGame'
import { releaseCalendar } from './production'
import { rumorsTick } from './rumors'
import { SIM_CFG } from './simBot'
import { cityById } from '../data/world'

const game = () => { const g = createGame({ ...SIM_CFG, seed: 12 }); g.cash = 500_000; g.reputation = 40; return g }

describe('presse, rumeurs et saisons', () => {
  it('les rumeurs naissent d’un fait réel et se confirment ou se démentent à l’échéance', () => {
    let g = game()
    const seen = new Set<string>()
    for (let i = 0; i < 150; i++) {
      g = advanceWeek(g)
      for (const r of g.rumors) if (r.status !== 'ouverte') seen.add(r.status)
      expect(g.rumors.filter((r) => r.status === 'ouverte').length).toBeLessThanOrEqual(3)
    }
    expect(seen.has('confirmee')).toBe(true)
    expect(seen.has('dementie')).toBe(true)
  }, 60_000)
  it('une rumeur de sortie vraie programme réellement la sortie du rival', () => {
    const g = game()
    for (let i = 0; i < 300; i++) { g.week = 10 + i; rumorsTick(g, []); const r = g.rumors.find((x) => x.kind === 'sortie' && x.truth); if (r) { expect(g.rivals.dyn[r.ref!].planned).toBe(r.due); return } }
    throw new Error('aucune rumeur de sortie vraie')
  })
  it('une rumeur sur un de vos artistes confirmée provoque une offre à traiter', () => {
    const g = game()
    g.artists.push({ ...structuredClone(g.artists[0]), id: 'z', stageName: 'Zed', isFounder: false, contract: { royalty: 0.3, advance: 1, weeks: 999, signedWeek: 1, scope: 'monde' } })
    g.rumors.push({ id: 'r', week: 1, due: 2, kind: 'offre', text: 'x', truth: true, status: 'ouverte', ref: 'z', to: 'Meridian Group' })
    g.week = 2
    rumorsTick(g, [])
    expect(g.artists.find((a) => a.id === 'z')!.offer?.label).toBe('Meridian Group')
    expect(g.echoes.some((e) => e.event && e.artistId === 'z')).toBe(true)
  })
  it('les saisons sont décalées dans l’hémisphère sud', () => {
    const north = cityById('paris'), south = cityById('johannesburg')
    expect(isSouth(south)).toBe(true); expect(isSouth(north)).toBe(false)
    expect(seasonMult('Gospel', 48, north)).toBeGreaterThan(1)
    expect(seasonMult('Gospel', 48, south)).toBe(1)
    expect(seasonMult('Gospel', 48 - 26, south)).toBeGreaterThan(1)
  })
  it('le calendrier de sorties annonce les vraies sorties rivales et la saison', () => {
    const g = game()
    const star = Object.values(g.rivals.dyn).sort((a, b) => b.pop - a.pop)[0]
    star.planned = 7
    const cal = releaseCalendar(g, 5, 5)
    expect(cal[2].tone).toBe('rival')
    expect(cal[2].tag).toContain('Sortie rivale')
    expect(releaseCalendar(g, 25, 1)[0].tone).toBe('fest')
  })
  it('l’actualité est alimentée par l’état du monde, sans texte figé répété', () => {
    let g = game()
    const texts = new Set<string>()
    for (let i = 0; i < 60; i++) { g = advanceWeek(g); for (const n of g.news.slice(0, 4)) texts.add(n.text) }
    expect(texts.size).toBeGreaterThan(60)
  }, 30_000)
})
