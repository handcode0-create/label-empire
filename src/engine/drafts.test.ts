import { describe, it, expect } from 'vitest'
import { createGame } from './newGame'
import { advanceWeek } from './advanceWeek'
import { deleteDraft, saveDraft } from './drafts'
import { agenda } from './selectors'
import type { NewGameConfig } from './types'

const cfg = {
  labelName: 'S', logoId: 'ring', founderName: 'F', nationality: 'Ivoirienne', mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 3,
} as unknown as NewGameConfig
const d = { id: 'd1', title: 'Ma nuit', artistId: 'x', genre: 'Zouk', theme: 'Amour', lang: 'français', mood: 'Solaire', lyrics: 'un deux trois', writer: 'artiste' as const }

describe('brouillons', () => {
  it('survivent au passage de semaine et se mettent à jour', () => {
    let g = createGame(cfg)
    g = saveDraft(g, d).state
    g = advanceWeek(advanceWeek(g))
    expect(g.drafts).toHaveLength(1)
    g = saveDraft(g, { ...d, lyrics: 'un deux trois quatre' }).state
    expect(g.drafts).toHaveLength(1)
    expect(g.drafts[0].lyrics).toMatch(/quatre/)
    expect(g.drafts[0].week).toBe(1)
    expect(agenda(g).some((a) => a.title === 'Brouillon à finir')).toBe(true)
    g = deleteDraft(g, 'd1').state
    expect(g.drafts).toHaveLength(0)
  })
  it('un brouillon vide n’est pas enregistré', () => {
    expect(saveDraft(createGame(cfg), { ...d, title: '', lyrics: '' }).state.drafts).toHaveLength(0)
  })
})
