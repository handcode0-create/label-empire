import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { chartFor, rankInCity } from './market'
import { createGame } from './newGame'
import { departToRival, makeRivals, rivalArtistIn, rivalLabelsIn, rivalSongIn, signToRival } from './rivalLife'
import { SIM_CFG } from './simBot'

const fresh = () => createGame({ ...SIM_CFG, seed: 5 })

describe('monde rival vivant', () => {
  it('les classements bougent d’une semaine à l’autre et les rivaux sortent de nouveaux titres', () => {
    let g = fresh()
    const first = chartFor(g, 'monde', 'abidjan').map((r) => r.title).join('|')
    const titles0 = g.rivals.songs.length
    const seen = new Set<string>()
    for (let i = 0; i < 40; i++) { g = advanceWeek(g); seen.add(chartFor(g, 'monde', 'abidjan').map((r) => r.title).join('|')) }
    expect(seen.size).toBeGreaterThan(10)
    expect(seen.has(first)).toBe(false)
    expect(g.rivals.songs.length).toBeGreaterThan(titles0 + 10)
    expect(g.rivals.week).toBe(g.week - 1)
  })
  it('les nouveaux titres rivaux sont consultables et cumulent des écoutes', () => {
    let g = fresh()
    for (let i = 0; i < 60; i++) g = advanceWeek(g)
    const song = g.rivals.songs[0]
    expect(rivalSongIn(g, song.id)!.title).toBe(song.title)
    const a = rivalArtistIn(g, song.artistId)!
    expect(a.songs.some((x) => x.id === song.id)).toBe(true)
    expect(Object.values(g.rivals.plays).reduce((t, v) => t + v, 0)).toBeGreaterThan(1_000_000)
  })
  it('260 semaines : transferts, brouilles et popularités bornées', () => {
    let g = fresh()
    const labelsAtStart = new Map(Object.entries(g.rivals.dyn).map(([id, d]) => [id, d.label]))
    let feuds = 0
    for (let i = 0; i < 260; i++) { g = advanceWeek(g); if (g.rivals.feud) feuds++ }
    const moved = Object.entries(g.rivals.dyn).filter(([id, d]) => labelsAtStart.has(id) && labelsAtStart.get(id) !== d.label).length
    expect(moved).toBeGreaterThan(0)
    expect(feuds).toBeGreaterThan(0)
    for (const d of Object.values(g.rivals.dyn)) { expect(d.pop).toBeGreaterThanOrEqual(0.15); expect(d.pop).toBeLessThanOrEqual(1) }
    const total = rivalLabelsIn(g).reduce((t, l) => t + l.artistIds.length, 0)
    expect(total).toBe(69 + g.rivals.extra.length)
  }, 60_000)
  it('un label rival qui signe un candidat, ou débauche un artiste, l’ajoute au monde rival', () => {
    const g = fresh()
    const cand = g.pool[0]
    const notes: { tag: string; text: string; tone: 'r' }[] = []
    signToRival(g, cand, notes)
    const x = g.rivals.extra.find((a) => a.stageName === cand.stageName)!
    expect(rivalArtistIn(g, x.id)!.songs.length).toBe(2)
    expect(notes[0].text).toContain(cand.stageName)
    const mine = g.artists[0]
    const to = departToRival(g, mine, 'Meridian Group')
    expect(to).toBe('Meridian Group')
    expect(rivalLabelsIn(g).find((l) => l.name === 'Meridian Group')!.artistIds).toContain(`rx-${mine.id}`)
  })
  it('classement rival : le rang dépend de l’état du monde rival, et une ancienne sauvegarde reçoit un monde par défaut', () => {
    const g = fresh()
    const top = g.rivals.chart.singles.abidjan[0].st
    expect(rankInCity(g, 'abidjan', top + 1)).toBe(1)
    expect(rankInCity(g, 'abidjan', 0)).toBe(g.rivals.chart.singles.abidjan.length + 1)
    const old = { ...g, rivals: undefined } as never as typeof g
    const R = makeRivals(old)
    expect(Object.keys(R.dyn).length).toBe(69)
    expect(R.chart.singles.abidjan.length).toBe(14)
  })
})

describe('projets rivaux dynamiques', () => {
  it('les rivaux publient de nouveaux EP et albums, visibles dans les classements et leur fiche', () => {
    let g = fresh()
    for (let i = 0; i < 160; i++) g = advanceWeek(g)
    expect(g.rivals.projects.length).toBeGreaterThan(3)
    const p = g.rivals.projects[0]
    const a = rivalArtistIn(g, p.artistId)!
    expect(a.projects.some((x) => x.id === p.id)).toBe(true)
    expect(p.songIds.length).toBeGreaterThanOrEqual(3)
    const names = new Set(g.rivals.projects.map((x) => x.name))
    expect(names.size).toBe(g.rivals.projects.length)
    const ids = new Set<string>()
    for (const kind of ['eps', 'albums'] as const) for (const r of chartFor(g, 'monde', 'abidjan', kind)) if (r.projectId) ids.add(r.projectId)
    expect([...ids].some((id) => g.rivals.projects.some((x) => x.id === id))).toBe(true)
  }, 60_000)
})
