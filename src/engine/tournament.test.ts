import { describe, expect, it } from 'vitest'
import { createGame } from './newGame'
import { abandonTournament, applyCoaching, chooseWinner, currentRound, openTournament, playRound, recruitEntrant, startTournament } from './tournament'
import type { GameState, NewGameConfig } from './types'

const cfg: NewGameConfig = { labelName: 'Test', logoId: 'anneau', founderName: 'T', nationality: 'Ivoirienne', mainGenre: 'Afro-pop', startReputation: 15, alsoArtist: true, staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 }, artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 }, hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 7 }
const refill = (g: GameState): GameState => ({ ...g, ap: 6, cash: 500_000 })
const CITIES = ['abidjan', 'dakar', 'accra', 'lagos', 'luanda', 'johannesburg', 'nairobi', 'cairo', 'paris']

function ready(n: number) {
  let g = refill(createGame(cfg))
  g = openTournament(g, { name: 'Test Cup', cityId: 'abidjan' }).state
  for (let i = 0; i < n; i++) { g = refill(g); const r = recruitEntrant(g, CITIES[i % CITIES.length]); expect(r.error).toBeUndefined(); g = r.state }
  return g
}

describe('tournoi', () => {
  it('plafonne à 10 candidats et 2 par pays', () => {
    let g = ready(9)
    expect(recruitEntrant(refill(g), 'abidjan').error).toBeUndefined()
    g = recruitEntrant(refill(g), 'abidjan').state
    expect(g.tournament!.entrants).toHaveLength(10)
    expect(recruitEntrant(refill(g), 'dakar').error).toMatch(/Maximum/)
    const h = ready(3)
    const a = recruitEntrant(refill(h), 'abidjan').state
    expect(recruitEntrant(refill(a), 'abidjan').error).toMatch(/Déjà/)
  })
  it('refuse de démarrer avec moins de 4 candidats', () => {
    expect(startTournament(ready(3)).error).toMatch(/au moins/)
  })
  for (const n of [4, 5, 6, 7, 8, 9]) {
    it(`mène ${n} candidats jusqu'à un vainqueur`, () => {
      let g = startTournament(ready(n)).state
      let guard = 0
      while (g.tournament!.status === 'en_cours' && guard++ < 10) {
        const r = currentRound(g.tournament!)!
        const players = r.duels.length * 2
        expect(players + r.byes.length).toBeGreaterThanOrEqual(2)
        g = playRound(refill(g)).state
      }
      expect(g.tournament!.status).toBe('choix')
      const f = currentRound(g.tournament!)!.duels[0]
      const res = chooseWinner(g, f.a)
      expect(res.error).toBeUndefined()
      expect(res.state.tournament!.winnerId).toBe(f.a)
      expect(res.state.pool.filter((a) => a.contestId === g.tournament!.id)).toHaveLength(n)
    })
  }
  it('applique les points de coaching au score', () => {
    let g = startTournament(ready(4)).state
    const d = currentRound(g.tournament!)!.duels[0]
    g = applyCoaching(g, d.id, d.a, 15).state
    expect(currentRound(g.tournament!)!.duels[0].coachPoints).toBe(15)
    g = playRound(refill(g)).state
    expect(g.tournament!.rounds[0].duels[0].winner).toBeDefined()
  })
  it('permet d’abandonner', () => {
    expect(abandonTournament(ready(2)).state.tournament).toBeNull()
  })
})

import { buildBattle, coachPoints, counterOf, scoreManche } from './battle'
import { createRng } from './rng'

describe('battle de punchlines', () => {
  const g = ready(4)
  const [me, opp] = g.tournament!.entrants
  it('prépare 3 manches avec 3 réponses de styles différents', () => {
    const ms = buildBattle(createRng(3), me, opp, 'Ghana', 'Sénégal')
    expect(ms).toHaveLength(3)
    for (const m of ms) { expect(m.options).toHaveLength(3); expect(new Set(m.options.map((o) => o.style)).size).toBe(3) }
  })
  it('applique le triangle des styles', () => {
    expect(counterOf('technique', 'impact')).toBe('gagne')
    expect(counterOf('impact', 'technique')).toBe('perd')
    expect(counterOf('flow', 'humour')).toBe('neutre')
  })
  it('récompense le bon contre et punit le temps écoulé', () => {
    const m = buildBattle(createRng(5), me, opp, 'Ghana', 'Sénégal')[0]
    const win = m.options.find((o) => counterOf(o.style, m.opp.style) === 'gagne')!
    const good = scoreManche(win, m, me, opp, 1)
    const none = scoreManche(null, m, me, opp, 0)
    expect(good.me).toBeGreaterThan(none.me)
    expect(coachPoints([good, good, good])).toBeGreaterThan(coachPoints([none, none, none]))
  })
})
