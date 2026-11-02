import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { chartFor } from './market'
import { createGame } from './newGame'
import { allRivalArtists, rivalArtistIn } from './rivalLife'
import { buyoutQuote, buyoutRival, rivalFeatQuote } from './rivalDeals'
import { writeSong } from './production'
import { SIM_CFG } from './simBot'

const fresh = () => createGame({ ...SIM_CFG, seed: 7 })

describe('interactions avec les artistes rivaux', () => {
  it('le rachat de contrat fait entrer l\'artiste au label et le retire du monde rival', () => {
    const g = fresh()
    g.cash = 50_000_000; g.reputation = 80
    const r = allRivalArtists(g).sort((a, b) => a.popularity - b.popularity)[0]
    const before = g.artists.length
    const res = buyoutRival(g, r.id)
    expect(res.error).toBeUndefined()
    expect(res.state.artists.length).toBe(before + 1)
    const a = res.state.artists.find((x) => x.id === `rb-${r.id}`)!
    expect(a.stageName).toBe(r.stageName)
    expect(allRivalArtists(res.state).some((x) => x.id === r.id)).toBe(false)
    expect(res.state.cash).toBeLessThan(50_000_000)
    let s = res.state
    for (let i = 0; i < 3; i++) s = advanceWeek(s)
    expect(chartFor(s, 'monde', 'abidjan', 'artistes').filter((x) => x.artistId === r.id && !x.mine).length).toBe(0)
  })
  it('refuse sans argent, sans réputation ou sans place', () => {
    const g = fresh()
    const r = allRivalArtists(g).sort((a, b) => b.popularity - a.popularity)[0]
    g.cash = 10; expect(buyoutRival(g, r.id).error).toBeTruthy()
    g.cash = 90_000_000; g.reputation = 0; expect(buyoutRival(g, r.id).error).toContain('Réputation')
    expect(buyoutQuote(g, rivalArtistIn(g, r.id)!).ok).toBe(false)
  })
  it('un feat avec un rival coûte un cachet, exige de la réputation et ajoute le partenaire au titre', () => {
    const g = fresh()
    g.cash = 5_000_000; g.reputation = 90
    const r = allRivalArtists(g)[0]
    const q = rivalFeatQuote(g, r)
    const res = writeSong(g, { title: 'Duo test', artistId: g.artists[0].id, genre: 'Afro-pop', theme: 'Amour', lang: 'français', mood: 'Solaire', lyrics: 'un deux trois quatre cinq six sept huit neuf', writer: 'artiste', feat: { kind: 'rival', id: r.id } })
    expect(res.error).toBeUndefined()
    const song = res.state.songs.find((x) => x.title === 'Duo test')!
    expect(song.feat?.rivalId).toBe(r.id)
    expect(song.feat?.fee).toBe(q.fee)
    g.reputation = 0
    const low = allRivalArtists(g).sort((a, b) => b.popularity - a.popularity)[0]
    expect(writeSong(g, { title: 'Duo bis', artistId: g.artists[0].id, genre: 'Afro-pop', theme: 'Amour', lang: 'français', mood: 'Solaire', lyrics: 'un deux trois quatre cinq six sept huit neuf', writer: 'artiste', feat: { kind: 'rival', id: low.id } }).error).toContain('refuse')
  })
})
