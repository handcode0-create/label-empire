import { describe, it, expect } from 'vitest'
import { createGame } from './newGame'
import { advanceWeek } from './advanceWeek'
import { assignSong, createProject, releaseProject, setStandby } from './projects'
import { scheduleRelease } from './production'
import type { GameState, NewGameConfig, Song } from './types'

const cfg = {
  labelName: 'S', logoId: 'ring', founderName: 'F', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 3,
} as unknown as NewGameConfig
const song = (id: string, artistId: string): Song => ({ id, title: id, artistId, genre: 'Afro-pop', theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste', lyricsQ: 70, mastering: true, quality: 70, stage: 'mixed', readyWeek: 1, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} }, hype: 0 })

describe('standby et projets', () => {
  it('sortent avec le projet', () => {
    let g: GameState = createGame(cfg)
    const a = g.artists[0].id
    g.songs.push(song('a', a), song('b', a), song('c', a))
    let r = setStandby(g, 'a', true); expect(r.error).toBeUndefined(); g = r.state
    g = createProject(g, 'Mon EP', 'EP', a).state
    const pid = g.projects[0].id
    for (const id of ['a', 'b', 'c']) { r = assignSong(g, pid, id); expect(r.error).toBeUndefined(); g = r.state }
    expect(g.songs.every((s) => s.standby)).toBe(true)
    expect(scheduleRelease(g, 'b', { week: g.week + 1, strategy: 'locale', cityIds: ['abidjan'], promo: 0, loc: [] }).error).toMatch(/réservé/)
    r = releaseProject(g, pid); expect(r.error).toBeUndefined(); g = r.state
    expect(g.projects[0].status).toBe('sorti')
    expect(g.songs.every((s) => s.stage === 'scheduled' && !s.standby)).toBe(true)
    g = advanceWeek(advanceWeek(g))
    expect(g.songs.every((s) => s.stage === 'released')).toBe(true)
  })
})
