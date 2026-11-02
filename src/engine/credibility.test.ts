import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { addCred, churnFactor, credOf, credTier, signingBonus } from './credibility'
import { acceptMeridianOffer } from './objectives'
import { createGame } from './newGame'
import { resolveEvent } from './events'
import { applyStoryEffect } from './storyEffects'
import { SIM_CFG } from './simBot'
import type { GameEvent } from './types'

const fresh = () => createGame({ ...SIM_CFG, seed: 11 })

describe('crédibilité', () => {
  it('démarre à 50, est bornée et se range en paliers', () => {
    const g = fresh()
    expect(credOf(g)).toBe(50)
    addCred(g, 80); expect(credOf(g)).toBe(100)
    addCred(g, -300); expect(credOf(g)).toBe(0)
    expect(credTier(80).id).toBe('culte'); expect(credTier(60).id).toBe('respecte'); expect(credTier(45).id).toBe('equilibre'); expect(credTier(30).id).toBe('commercial'); expect(credTier(10).id).toBe('vendu')
  })
  it('accepter l\'offre de Meridian coûte de la crédibilité, qui s\'use encore pendant l\'accord', () => {
    const g = fresh()
    const r = acceptMeridianOffer(g)
    expect(credOf(r.state)).toBe(40)
    let s = r.state
    for (let i = 0; i < 10; i++) s = advanceWeek(s)
    expect(credOf(s)).toBeLessThan(40)
  })
  it('la crédibilité retient les fans et facilite les signatures', () => {
    const hi = { credibility: 80 }, lo = { credibility: 10 }
    expect(churnFactor(hi)).toBeLessThan(1); expect(churnFactor(lo)).toBeGreaterThan(1)
    expect(signingBonus(hi)).toBeGreaterThan(0); expect(signingBonus(lo)).toBeLessThan(0)
  })
  it('un choix d\'événement peut la modifier (fx cred) et les choix par défaut sont prudents', () => {
    const g = fresh()
    const ev: GameEvent = { id: 'e', kind: 'brand', week: 1, title: 't', text: 't', choices: [{ id: 'no', label: 'Refuser', detail: '', cost: 0, fx: [{ t: 'cred', v: 3 }] }, { id: 'yes', label: 'Accepter', detail: '', cost: 0, fx: [{ t: 'cred', v: -6 }] }] }
    g.event = ev
    const r = resolveEvent(g, 'yes')
    expect(credOf(r.state)).toBe(44)
  })
  it('les choix de l\'histoire pèsent sur l\'image du label', () => {
    const g = fresh()
    expect(credOf(applyStoryEffect(g, 'dossier-publier').state)).toBeGreaterThan(50)
    expect(credOf(applyStoryEffect(g, 'dossier-negocier').state)).toBeLessThan(50)
  })
})
