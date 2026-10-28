import { describe, it, expect } from 'vitest'
import { createGame } from './newGame'
import { advanceWeek } from './advanceWeek'
import { commissionClip } from './clips'
import { pitchPlaylist } from './platforms'
import type { GameState, NewGameConfig, Song } from './types'

const cfg = {
  labelName: 'S', logoId: 'ring', founderName: 'F', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 20, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 5,
} as unknown as NewGameConfig
const song = (artistId: string): Song => ({ id: 's1', title: 'Hit', artistId, genre: 'Afro-pop', theme: 'x', lang: 'français', mood: 'x', lyrics: '', writer: 'artiste', lyricsQ: 70, mastering: true, quality: 80, stage: 'scheduled', readyWeek: 1, release: { week: 1, strategy: 'mondiale', cityIds: ['abidjan', 'lagos', 'paris'], promo: 0, loc: [] }, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} }, hype: 0 })

describe('clips et plateformes', () => {
  it('un clip se tourne puis sort et rapporte des vues', () => {
    let g: GameState = createGame(cfg)
    g.songs.push(song(g.artists[0].id))
    const cash0 = g.cash
    const r = commissionClip(g, 's1', 'standard'); expect(r.error).toBeUndefined(); g = r.state
    expect(g.cash).toBeLessThan(cash0)
    expect(commissionClip(g, 's1', 'lofi').error).toMatch(/déjà/)
    for (let i = 0; i < 6; i++) g = advanceWeek(g)
    const c = g.songs[0].clip!
    expect(c.status).toBe('sorti'); expect(c.views).toBeGreaterThan(0)
  })
  it('le démarchage de playlist coûte et se verrouille 8 semaines', () => {
    let g: GameState = createGame(cfg)
    g.songs.push(song(g.artists[0].id))
    g = advanceWeek(g); g = advanceWeek(g)
    const r = pitchPlaylist(g, 's1', 'tembo'); expect(r.error).toBeUndefined(); g = r.state
    expect(g.pitches.length).toBe(1)
    expect(pitchPlaylist(g, 's1', 'tembo').error).toMatch(/Déjà démarché|Plus d|action/i)
  })
})
