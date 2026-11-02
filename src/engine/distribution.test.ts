import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { SIM_CFG } from './simBot'
import { eligiblePlatforms, isOnPlatform, pitchPlaylist, platformSplit, syncPlatforms, PLATFORMS } from './platforms'
import type { Song } from './types'

const base = () => createGame({ ...SIM_CFG, seed: 11 })
const song = (over: Partial<Song> = {}) => ({ id: 's1', title: 'Hit', artistId: 'a', genre: 'Afro-pop', stage: 'released', release: { week: 1, cityIds: ['abidjan'] }, quality: 70, hype: 0, stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: { abidjan: 1000, paris: 1000 }, lastByCity: {}, prevByCity: {}, peak: {}, hist: [] }, ...over }) as unknown as Song

describe('distribution automatique', () => {
  it('un titre sorti est mis en ligne sur les plateformes accessibles, puis sur les autres quand la réputation monte', () => {
    const g = base(); g.reputation = 8; g.week = 1
    g.songs = [song()]
    const notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[] = []
    syncPlatforms(g, notes)
    expect(g.songs[0].platforms).toEqual(expect.arrayContaining(['tembo', 'vibra']))
    expect(g.songs[0].platforms).not.toContain('sonora') // réputation 10 requise
    expect(g.songs[0].platforms).not.toContain('clipwave') // plateforme vidéo : il faut un clip sorti
    expect(notes.some((n) => n.tag === 'Plateformes' && /en ligne/.test(n.text))).toBe(true)
    g.reputation = 30; g.week = 5
    syncPlatforms(g, notes)
    expect(g.songs[0].platforms).toEqual(expect.arrayContaining(['sonora', 'lotus']))
    expect(notes.some((n) => /arrive aussi/.test(n.text))).toBe(true)
  })
  it('les écoutes ne comptent que sur les plateformes où le titre est en ligne', () => {
    const g = base()
    const s = song({ platforms: ['tembo'] })
    const split = platformSplit(g, [s])
    expect(Object.keys(split)).toEqual(['tembo'])
    expect(split.tembo).toBeCloseTo(2000)
  })
  it('on ne peut pas démarcher une plateforme où le titre n’est pas encore référencé', () => {
    const g = base(); g.reputation = 20; g.cash = 1e6
    g.songs = [song({ platforms: ['tembo'] })]
    expect(pitchPlaylist(g, 's1', 'vibra').error).toMatch(/référencé/)
  })
  it('anciennes sauvegardes : sans liste, le titre est considéré en ligne partout et la mise à jour est silencieuse', () => {
    const g = base(); g.reputation = 12; g.week = 40
    g.songs = [song()]
    expect(PLATFORMS.every((p) => isOnPlatform(g.songs[0], p.id))).toBe(true)
    const notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[] = []
    syncPlatforms(g, notes)
    expect(notes).toHaveLength(0)
    expect(g.songs[0].platforms).toEqual(eligiblePlatforms(g, g.songs[0]))
  })
  it('la semaine suivant la sortie, advanceWeek distribue le titre', () => {
    let g = base(); g.week = 3
    g.songs = [song({ stage: 'scheduled', release: { week: 3, cityIds: ['abidjan'], strategy: 'locale', promo: 0, loc: [] } as never })]
    g = advanceWeek(g)
    expect(g.songs[0].stage).toBe('released')
    expect(g.songs[0].platforms?.length).toBeGreaterThan(0)
  })
})
