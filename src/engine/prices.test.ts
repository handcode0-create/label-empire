import { describe, it, expect } from 'vitest'
import { STUDIOS } from '../data/people'
import { MEDIA } from '../data/media'
import { advanceWeek } from './advanceWeek'
import { officeRequirement, weeklyFixedCosts } from './economy'
import { createGame } from './newGame'
import { fxRate, fxShock, fxTick, inflation, mediaCost, rentFor, seasonDemand, studioPrice } from './prices'
import { bookStudio, releaseCost, writeSong } from './production'
import { weeklyStreams } from './market'
import { SIM_CFG } from './simBot'

const game = () => { const g = createGame({ ...SIM_CFG, seed: 8 }); g.cash = 500_000; return g }

describe('économie vivante', () => {
  it('le prix d’un studio varie avec la saison, l’inflation et la réputation', () => {
    const g = game(); const st = STUDIOS.find((x) => x.id === 'brooklyn')!
    g.week = 3; const janvier = studioPrice(g, st)
    g.week = 48; const fetes = studioPrice(g, st)
    expect(fetes).toBeGreaterThan(janvier)
    g.week = 200; g.reputation = 80; expect(studioPrice(g, st)).toBeGreaterThan(fetes)
    expect(seasonDemand(48)).toBeGreaterThan(seasonDemand(3))
    expect(inflation(261)).toBeGreaterThan(1.2)
  })
  it('le prix varie d’une semaine à l’autre pour un même studio', () => {
    const g = game(); const st = STUDIOS[3]
    const prices = new Set<number>()
    for (let w = 10; w < 22; w++) { g.week = w; prices.add(studioPrice(g, st)) }
    expect(prices.size).toBeGreaterThan(4)
  })
  it('la réservation facture le tarif du jour', () => {
    let g = game()
    g = writeSong(g, { title: 'Prix', artistId: g.artists[0].id, genre: 'Afro-pop', theme: 'Amour', lang: 'français', mood: 'Solaire', lyrics: 'je chante la nuit je chante le jour pour toi mon amour toujours', writer: 'artiste' }).state
    g.week = 48; g.ap = 6
    const st = STUDIOS.find((x) => x.id === 'ebene')!
    const cash0 = g.cash
    const r = bookStudio(g, g.songs[0].id, 'ebene', 4)
    expect(r.error).toBeUndefined()
    expect(cash0 - r.state.cash).toBeGreaterThanOrEqual(studioPrice(g, st) * 4)
    expect(studioPrice(g, st)).not.toBe(st.pricePerDay)
  })
  it('les médias et loyers dépendent de la réputation, de la saison et du temps', () => {
    const g = game(); const m = MEDIA[3]
    const base = mediaCost(g, m)
    g.reputation = 70; g.week = 120
    expect(mediaCost(g, m)).toBeGreaterThan(base)
    expect(releaseCost({ promo: 0, loc: [], media: [m.id] }, g)).toBe(mediaCost(g, m))
    expect(releaseCost({ promo: 0, loc: [], media: [m.id] })).toBe(m.cost)
    const r1 = rentFor(g, 'paris'); g.week = 160
    expect(rentFor(g, 'paris')).not.toBe(r1)
    expect(officeRequirement(g, 'paris', 'bureau').cost).toBe(rentFor(g, 'paris') * 4)
    g.offices.push({ cityId: 'paris', kind: 'bureau', since: 1 })
    expect(weeklyFixedCosts(g).rent).toBeGreaterThan(0)
  })
  it('les devises fluctuent, reviennent vers la parité et pèsent sur les revenus', () => {
    const g = game()
    const seen = new Set<number>()
    for (let i = 0; i < 40; i++) { fxTick(g, []); seen.add(fxRate(g, 'NGN')) }
    expect(seen.size).toBeGreaterThan(20)
    expect(fxRate(g, 'USD')).toBe(1)
    fxShock(g, 'NGN', 0.3)
    expect(fxRate(g, 'NGN')).toBeLessThan(0.75)
    for (let i = 0; i < 150; i++) fxTick(g, [])
    expect(Math.abs(fxRate(g, 'NGN') - 1)).toBeLessThan(0.25)
  })
  it('un choc de change réduit les droits perçus dans la zone', () => {
    const mk = (shock: number) => {
      let g = game(); g.eventSeen = Object.fromEntries(['fx', 'raise', 'viral', 'gig', 'rival', 'sponsor', 'scandal', 'burnout', 'leak', 'playlist', 'festival', 'censure', 'poach', 'meridian', 'clash', 'audit', 'charity', 'wave'].map((k) => [k, 99999]))
      g.songs.push({ id: 'x', title: 'x', artistId: g.artists[0].id, genre: 'Afro-pop', theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste', lyricsQ: 70, mastering: true, quality: 70, stage: 'released', readyWeek: 1, release: { week: 1, strategy: 'locale', cityIds: ['lagos'], promo: 0, loc: [] }, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} }, hype: 0 })
      g.fx = { NGN: shock }
      g = advanceWeek(g)
      return g.songs[0].stats.revenue
    }
    expect(mk(0.6)).toBeLessThan(mk(1) * 0.8)
  })
})

import { commissionClip } from './clips'
import { chooseMix } from './production'
import { liveCity, marketTick, opCost } from './prices'
import { planTour } from './tour'
import { newStop, tourSummary } from './tour'
import { CITIES } from '../data/world'

describe('marchés vivants et prestations', () => {
  it('les marchés grandissent (plus vite dans les émergents), le piratage recule', () => {
    const g = game()
    const lagos0 = liveCity(g, CITIES.find((c) => c.id === 'lagos')!).base
    const dakar = CITIES.find((c) => c.id === 'dakar')!
    for (let i = 0; i < 200; i++) marketTick(g, [])
    const lagos = liveCity(g, CITIES.find((c) => c.id === 'lagos')!)
    const d = liveCity(g, dakar)
    expect(lagos.base).toBeGreaterThan(lagos0)
    expect(d.base / dakar.base).toBeGreaterThan(lagos.base / lagos0)
    expect(d.piracy).toBeLessThan(dakar.piracy)
  })
  it('la rémunération des plateformes et les taxes évoluent et sont annoncées', () => {
    const g = game()
    const notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[] = []
    const payouts = new Set<number>()
    for (let i = 0; i < 400; i++) { marketTick(g, notes); payouts.add(g.payout) }
    expect(payouts.size).toBeGreaterThan(50)
    expect(g.payout).toBeGreaterThanOrEqual(0.8); expect(g.payout).toBeLessThanOrEqual(1.15)
    expect(notes.some((n) => n.text.includes('taxe') || n.text.includes('fiscalité'))).toBe(true)
  })
  it('un marché plus grand augmente les écoutes réelles', () => {
    const g = game()
    const song = { id: 'x', title: 'x', artistId: g.artists[0].id, genre: 'Afro-pop', theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste' as const, lyricsQ: 70, mastering: true, quality: 70, stage: 'released' as const, readyWeek: 1, release: { week: 1, strategy: 'locale' as const, cityIds: ['abidjan'], promo: 0, loc: [] }, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} }, hype: 0 }
    const c = CITIES.find((x) => x.id === 'abidjan')!
    const before = weeklyStreams(g, song, c, 2)
    g.markets = { abidjan: { base: c.base * 2, tax: c.tax, piracy: c.piracy } }
    expect(weeklyStreams(g, song, c, 2)).toBeGreaterThan(before * 1.5)
  })
  it('clips, mixages et tournées suivent l’inflation', () => {
    let g = game()
    g = writeSong(g, { title: 'Op', artistId: g.artists[0].id, genre: 'Afro-pop', theme: 'Amour', lang: 'français', mood: 'Solaire', lyrics: 'je chante la nuit je chante le jour pour toi mon amour toujours', writer: 'artiste' }).state
    g.week = 200; g.ap = 6
    expect(opCost(g, 15_000)).toBeGreaterThan(17_000)
    g.songs[0].stage = 'recorded'; g.songs[0].readyWeek = 1
    const cash = g.cash
    const m = chooseMix(g, g.songs[0].id, 'international', false)
    expect(m.error).toBeUndefined()
    expect(cash - m.state.cash).toBe(opCost(g, 9500))
    g.songs[0].stage = 'mixed'; g.ap = 6
    const c0 = g.cash
    const c = commissionClip(g, g.songs[0].id, 'standard')
    expect(c0 - c.state.cash).toBe(opCost(g, 15_000))
    const a = g.artists[0]; const stops = [newStop('abidjan', 205, 1)]
    const early = { ...g, week: 1 }, late = { ...g, week: 200 }
    expect(tourSummary(late, a, stops, []).cost).toBeGreaterThan(tourSummary(early, a, stops, []).cost * 1.1)
    void planTour
  })
})
