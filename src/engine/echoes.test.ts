import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { resolveEvent } from './events'
import { createGame } from './newGame'
import { SIM_CFG } from './simBot'
import type { Fx, GameEvent, GameState } from './types'

const NO_EVENTS = Object.fromEntries(['fx', 'raise', 'viral', 'gig', 'rival', 'sponsor', 'scandal', 'burnout', 'leak', 'playlist', 'festival', 'censure', 'poach', 'meridian', 'clash', 'audit', 'charity', 'wave'].map((k) => [k, 99999]))
const game = () => { const g = createGame({ ...SIM_CFG, seed: 9 }); g.eventSeen = { ...NO_EVENTS }; g.cash = 200_000; return g }
const withEvent = (g: GameState, fx: Fx[]): GameState => {
  g.event = { id: 'e-t', kind: 'test', week: g.week, title: 'Test', text: '', choices: [{ id: 'go', label: 'Go', detail: '', cost: 0, fx }] } as GameEvent
  return resolveEvent(g, 'go').state
}

describe('suites des choix (événements enchaînés)', () => {
  it('une suite à effets s’applique à l’échéance, avec une trace dans le rapport', () => {
    let g = withEvent(game(), [{ t: 'later', after: 2, text: 'Les retombées arrivent.', fx: [{ t: 'rep', v: 10 }, { t: 'cash', v: 5000 }], tone: 'g' }])
    expect(g.echoes).toHaveLength(1)
    const rep0 = g.reputation
    g = advanceWeek(g)
    g = advanceWeek(g)
    expect(g.echoes).toHaveLength(1)
    g = advanceWeek(g) // semaine 3 : l'échéance (1 + 2) tombe
    expect(g.echoes).toHaveLength(0)
    expect(g.reputation).toBeGreaterThan(rep0 + 1)
    expect(g.report!.notes.some((n) => n.tag === 'Événement' && n.text.includes('Les retombées arrivent.'))).toBe(true)
  })
  it('une suite à événement devient l’événement de la semaine, avec ses propres choix', () => {
    let g = withEvent(game(), [{ t: 'later', after: 1, text: 'x', event: { title: 'Suite : la presse revient', text: 't', tone: 'r', choices: [{ id: 'a', label: 'Répondre', detail: '', cost: 0, fx: [{ t: 'rep', v: 1 }] }] } }])
    g = advanceWeek(g)
    expect(g.event?.title).toBe('Suite : la presse revient')
    expect(g.echoes).toHaveLength(0)
    const rep = g.reputation
    g = resolveEvent(g, 'a').state
    expect(g.reputation).toBeGreaterThan(rep)
  })
  it('la décision est mémorisée (historique et actualités)', () => {
    const g = withEvent(game(), [])
    expect(g.history.at(-1)).toMatchObject({ title: 'Test', choice: 'Go' })
    expect(g.news[0].tag).toBe('Événement')
  })
  it('150 semaines de jeu : des suites se produisent réellement', () => {
    let g = createGame({ ...SIM_CFG, seed: 21 })
    g.cash = 400_000
    let chained = 0, applied = 0
    for (let i = 0; i < 150; i++) {
      g = advanceWeek(g)
      if (g.event && !g.event.resolved) {
        if (g.event.kind === 'suite') chained++
        const r = resolveEvent(g, g.event.choices[i % g.event.choices.length].id)
        if (!r.error) g = r.state
      }
      applied += g.report!.notes.filter((n) => n.text.startsWith('Suite ·')).length
    }
    expect(chained + applied).toBeGreaterThan(3)
  }, 60_000)
})
