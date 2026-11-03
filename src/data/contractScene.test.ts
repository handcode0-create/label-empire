import { describe, expect, it } from 'vitest'
import { contractScene } from './story'
import { createGame } from '../engine/newGame'
import type { NewGameConfig } from '../engine/types'

const cfg = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42,
} as NewGameConfig
const g = createGame(cfg)
const a = { id: 'x1', stageName: 'Zéphyr', originCityId: 'abidjan', gradient: '#fff,#000' }
const o = { advance: 6000, royalty: 0.4, weeks: 104, scope: 'region' }

describe('scènes de contrat', () => {
  it('signature acceptée : un tampon et un contrat à l’écran', () => {
    const s = contractScene(g, a, o, 'sign', true)
    expect(s.lines.some((l) => l.stamp)).toBe(true)
    expect(s.paper?.artist).toBe('Zéphyr')
    expect(s.lines.some((l) => l.who === 'artiste')).toBe(true)
  })
  it('offre refusée : pas de tampon', () => {
    const s = contractScene(g, a, o, 'sign', false)
    expect(s.lines.some((l) => l.stamp)).toBe(false)
    expect(s.paper).toBeUndefined()
  })
  it('renégociation : scène dédiée, avenant tamponné', () => {
    const s = contractScene(g, a, o, 'renew', true)
    expect(s.title).toBe('Renégociation')
    expect(s.paper?.kind).toBe('renew')
    expect(s.lines.some((l) => l.stamp)).toBe(true)
  })
})
