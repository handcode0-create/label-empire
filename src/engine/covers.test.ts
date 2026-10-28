import { describe, it, expect } from 'vitest'
import { createGame } from './newGame'
import { assignSong, createProject, releaseProject, setCover, setStandby } from './projects'
import { careForTourArtist } from './tour'
import type { GameState, NewGameConfig, Song } from './types'

const cfg = {
  labelName: 'S', logoId: 'ring', founderName: 'F', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 3,
} as unknown as NewGameConfig
const song = (id: string, artistId: string): Song => ({ id, title: id, artistId, genre: 'Afro-pop', theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste', lyricsQ: 70, mastering: true, quality: 70, stage: 'mixed', readyWeek: 1, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} }, hype: 0 })

describe('pochettes, inédits, soin de tournée', () => {
  it('setCover sur titre et projet', () => {
    let g: GameState = createGame(cfg)
    const a = g.artists[0].id
    g.songs.push(song('a', a))
    g = createProject(g, 'EP', 'EP', a).state
    g = setCover(g, 'song', 'a', { style: 2, palette: 3 }).state
    g = setCover(g, 'project', g.projects[0].id, { style: 1, palette: 4 }).state
    expect(g.songs.find((s) => s.id === 'a')!.cover).toEqual({ style: 2, palette: 3 })
    expect(g.projects[0].cover).toEqual({ style: 1, palette: 4 })
    expect(setCover(g, 'song', 'zzz', { style: 0, palette: 0 }).error).toBeTruthy()
  })
  it('les titres en standby sortent comme inédits', () => {
    let g: GameState = createGame(cfg)
    const a = g.artists[0].id
    g.songs.push(song('a', a), song('b', a), song('c', a))
    g = setStandby(g, 'a', true).state
    g = createProject(g, 'EP', 'EP', a).state
    for (const id of ['a', 'b', 'c']) g = assignSong(g, g.projects[0].id, id).state
    g = releaseProject(g, g.projects[0].id).state
    expect(g.songs.find((s) => s.id === 'a')!.exclusive).toBe(true)
  })
  it('careForTourArtist sans tournée échoue', () => {
    const g = createGame(cfg)
    expect(careForTourArtist(g, 'repos').error).toBeTruthy()
  })
})

describe('sortie d’un projet avec titres inachevés', () => {
  it('production express puis sortie', () => {
    let g: GameState = createGame(cfg)
    const a = g.artists[0].id
    const w = (id: string): Song => ({ ...song(id, a), stage: 'written' })
    g.songs.push(w('a'), w('b'), w('c'))
    g = createProject(g, 'EP', 'EP', a).state
    for (const id of ['a', 'b', 'c']) g = assignSong(g, g.projects[0].id, id).state
    const cash = g.cash
    const r = releaseProject(g, g.projects[0].id)
    expect(r.error).toBeUndefined()
    expect(r.state.cash).toBeLessThan(cash)
    expect(r.state.songs.every((s) => s.stage === 'scheduled' && s.exclusive && (s.quality ?? 0) > 0)).toBe(true)
  })
})
