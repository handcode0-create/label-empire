import { describe, expect, it } from 'vitest'
import { generateTitle } from '../data/titles'
import { MEDIA } from '../data/media'
import { releaseCost } from './production'
import { createRng } from './rng'

describe('titres automatiques', () => {
  it('génère des titres non vides, différents des existants', () => {
    const rng = createRng(42)
    const taken: string[] = []
    for (let i = 0; i < 20; i++) {
      const t = generateTitle(rng, { theme: 'Ambition', mood: 'Confiant', lang: 'Français', genre: 'Hip-hop' }, taken)
      expect(t.length).toBeGreaterThan(2)
      expect(taken).not.toContain(t)
      taken.push(t)
    }
  })
})

describe('médias', () => {
  it('ont un id unique et un coût compté dans la sortie', () => {
    expect(new Set(MEDIA.map((m) => m.id)).size).toBe(MEDIA.length)
    const m = MEDIA[0]
    expect(releaseCost({ promo: 1000, loc: [], media: [m.id] })).toBe(1000 + m.cost)
  })
})

import { createGame } from './newGame'
import type { NewGameConfig } from './types'
const cfg: NewGameConfig = { labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true, staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 }, artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 }, hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42 }
import { assignSong, createProject, projectKindFor, releaseProject } from './projects'
describe('EP & albums', () => {
  it('refuse la publication sans assez de titres et assigne un titre une seule fois', () => {
    const g0 = createGame(cfg)
    const a = g0.artists[0].id
    const r = createProject(g0, 'Premier', 'EP', a)
    expect(r.error).toBeUndefined()
    expect(releaseProject(r.state, r.state.projects[0].id).error).toMatch(/au moins 3/)
    expect(assignSong(r.state, r.state.projects[0].id, 'nope').error).toBeTruthy()
    expect(projectKindFor(7)).toBe('Album')
  })
})

import { rivalWorld } from './rivals'
import { chartFor } from './market'
describe('monde rival', () => {
  it('est déterministe, avec des ids sur les lignes de classement', () => {
    const w = rivalWorld()
    expect(w.artists.length).toBeGreaterThanOrEqual(60)
    expect(new Set(w.artists.map((a) => a.stageName)).size).toBe(w.artists.length)
    const g = createGame(cfg)
    for (const kind of ['singles', 'artistes', 'eps', 'albums'] as const) {
      const rows = chartFor(g, 'monde', 'abidjan', kind)
      expect(rows.length).toBeGreaterThan(5)
      expect(rows.every((r) => r.artistId)).toBe(true)
    }
    expect(chartFor(g, 'monde', 'abidjan', 'singles').every((r) => r.songId)).toBe(true)
  })
})

import { startingReputation } from './newGame'
describe('capital de départ', () => {
  it('fixe aussi la réputation de départ', () => {
    expect([startingReputation('standard'), startingReputation('riche'), startingReputation('majeur'), startingReputation('milliardaire')]).toEqual([15, 25, 50, 75])
    const g = createGame({ ...cfg, capital: 'majeur' })
    expect(g.cash).toBe(10_000_000)
    expect(g.reputation).toBe(50)
  })
})
