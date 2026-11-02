import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { ARCS, arcEvent } from './arcs'
import { resolveEvent, dueEchoEvent, echoesTick } from './events'
import { createGame } from './newGame'
import { allRivalArtists, rivalLabelsIn } from './rivalLife'
import { createRng } from './rng'
import { SIM_CFG } from './simBot'
import type { Artist, GameState } from './types'

const game = () => { const g = createGame({ ...SIM_CFG, seed: 8 }); g.cash = 200_000; return g }
const signed = (g: GameState, o: Partial<Artist> = {}): Artist => {
  const a: Artist = { ...structuredClone(g.artists[0]), id: 'zed', stageName: 'Zed', realName: 'Zed K', isFounder: false, morale: 80, fatigue: 0, loyalty: 80, fans: { abidjan: 90_000 }, skills: { voix: 70, ecriture: 60, charisme: 55 }, contract: { royalty: 0.3, advance: 1000, weeks: 500, signedWeek: 1, scope: 'monde' }, ...o }
  g.artists.push(a); return a
}
const open = (g: GameState, id: string) => { const a = g.artists.find((x) => x.id === 'zed')!; const def = ARCS.find((x) => x.id === id)!; g.event = { id: 'e', kind: 'arc', week: g.week, ...def.open(g, a, createRng(1)) }; return a }

describe('arcs d\'artistes', () => {
  it('chaque arc propose une issue prudente en premier et des choix chiffrés', () => {
    for (const arc of ARCS) {
      const g = game(); signed(g); g.week = 60
      const e = open(g, arc.id)
      expect(e).toBeTruthy()
      expect(g.event!.choices.length).toBeGreaterThanOrEqual(2)
      for (const c of g.event!.choices) expect(c.detail.length).toBeGreaterThan(8)
    }
  })
  it('seuls les artistes éligibles reçoivent un arc, un seul à la fois', () => {
    const g = game(); g.week = 60
    expect(arcEvent(g, createRng(1))).toBeNull()
    const a = signed(g, { fatigue: 80, fans: { abidjan: 1000 }, contract: { royalty: 0.3, advance: 1, weeks: 500, signedWeek: 58, scope: 'monde' } })
    const ev = arcEvent(g, createRng(1))
    expect(ev?.artistId).toBe('zed'); expect(a.arcActive).toBe('repos')
  })
  it('la pause mène à un événement de retour, puis clôt l\'arc', () => {
    let g = game(); g.week = 60; const a0 = signed(g, { fatigue: 80 }); open(g, 'repos')
    g = resolveEvent(g, 'pause').state
    const a = g.artists.find((x) => x.id === 'zed')!
    expect(a.fatigue).toBeLessThan(a0.fatigue); expect(a.arcActive).toBe('repos')
    g.week += 4; g.event = null
    const back = dueEchoEvent(g, g.week)
    expect(back?.title).toContain('retour')
    g.event = back
    g = resolveEvent(g, 'calm').state
    expect(g.artists.find((x) => x.id === 'zed')!.arcActive).toBeUndefined()
    expect(g.artists.find((x) => x.id === 'zed')!.arcs!.at(-1)!.end).toBe(true)
  })
  it('bénir le départ fonde un label rival qui apparaît dans le monde rival', () => {
    let g = game(); g.week = 80; signed(g, { departing: false }); open(g, 'label')
    const cash = g.cash
    g = resolveEvent(g, 'benir').state
    expect(g.cash).toBe(cash + 12000)
    expect(g.rivals.founded?.[0].name).toBe('Zed Music')
    g = advanceWeek(g)
    expect(g.artists.some((x) => x.id === 'zed')).toBe(false)
    const lab = rivalLabelsIn(g).find((l) => l.name === 'Zed Music')
    expect(lab).toBeTruthy(); expect(lab!.artistIds).toContain('rx-zed')
    expect(allRivalArtists(g).some((x) => x.id === 'rx-zed')).toBe(true)
  })
  it('patienter fait revenir l\'artiste avec une demande plus pressante', () => {
    let g = game(); g.week = 80; signed(g); open(g, 'label')
    g = resolveEvent(g, 'retenir').state
    g.week += 10; const ev = dueEchoEvent(g, g.week)
    expect(ev?.choices.map((c) => c.id)).toEqual(['sous', 'benir'])
  })
  it('si l\'artiste est parti entre-temps, la suite est abandonnée', () => {
    let g = game(); g.week = 80; signed(g); open(g, 'label'); g = resolveEvent(g, 'retenir').state
    g.artists = g.artists.filter((x) => x.id !== 'zed'); g.week += 10
    expect(dueEchoEvent(g, g.week)).toBeNull()
    echoesTick(g, [])
  })
})
