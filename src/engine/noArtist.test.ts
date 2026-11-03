import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { SIM_CFG } from './simBot'

describe('label sans aucun artiste', () => {
  it('traverse 150 semaines sans erreur (événements, arcs, enquête, rivaux)', () => {
    for (const seed of [1, 2, 3]) {
      let g = createGame({ ...SIM_CFG, seed, alsoArtist: false })
      g.artists = []
      g.seenScenes = ['presse-awa']
      for (let i = 0; i < 150; i++) { g.ap = 6; g = advanceWeek(g); if (g.outcome === 'defaite') break }
      expect(g.week).toBeGreaterThan(5)
    }
  }, 60_000)
  it('et avec un seul artiste qui part en cours de route', () => {
    let g = createGame({ ...SIM_CFG, seed: 9 })
    for (let i = 0; i < 100; i++) { g.ap = 6; if (i === 20) g.artists = []; g = advanceWeek(g); if (g.outcome === 'defaite') break }
    expect(g.week).toBeGreaterThan(5)
  })
})
