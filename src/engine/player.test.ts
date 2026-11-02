import { describe, it, expect } from 'vitest'
import { createGame } from './newGame'
import { REBRAND_COST, editIdentity } from './player'
import { SIM_CFG } from './simBot'

const game = () => { const g = createGame({ ...SIM_CFG, seed: 3 }); g.cash = 50_000; return g }

describe('profil du joueur', () => {
  it('renomme le fondateur partout (label, artiste fondateur, manager)', () => {
    const r = editIdentity(game(), { founder: '  Ama   Koné ' })
    expect(r.error).toBeUndefined()
    expect(r.state.label.founder).toBe('Ama Koné')
    const me = r.state.artists.find((a) => a.isFounder)!
    expect([me.stageName, me.realName, me.manager.name]).toEqual(['Ama Koné', 'Ama Koné', 'Ama Koné'])
  })
  it('refuse les noms vides ou trop longs', () => {
    expect(editIdentity(game(), { founder: 'A' }).error).toBeTruthy()
    expect(editIdentity(game(), { labelName: 'x'.repeat(30) }).error).toBeTruthy()
    expect(editIdentity(game(), { nationality: ' ' }).error).toBeTruthy()
  })
  it('changer le nom du label est facturé et annoncé ; refus si un rival porte déjà ce nom ou si la caisse est vide', () => {
    const g = game()
    const r = editIdentity(g, { labelName: 'Nouvelle Aube' })
    expect(r.state.label.name).toBe('Nouvelle Aube')
    expect(r.state.cash).toBe(g.cash - REBRAND_COST)
    expect(r.state.news[0].text).toContain('Nouvelle Aube')
    expect(editIdentity(g, { labelName: 'meridian group' }).error).toMatch(/rival/)
    const poor = { ...g, cash: 100 }
    const e = editIdentity(poor, { labelName: 'Nouvelle Aube' })
    expect(e.error).toBeTruthy(); expect(e.state.label.name).toBe(g.label.name)
  })
  it('avatar, photo, logo et genre sont gratuits', () => {
    const g = game()
    const r = editIdentity(editIdentity(g, { avatar: 'europe-m1', look: 'm', logoId: '/logos/02-harmattan-music.svg', mainGenre: 'Drill' }).state, { photo: 'data:image/png;base64,AA' })
    expect(r.state.cash).toBe(g.cash)
    expect(r.state.label).toMatchObject({ founderAvatar: 'europe-m1', founderLook: 'm', logoId: '/logos/02-harmattan-music.svg', mainGenre: 'Drill', photo: 'data:image/png;base64,AA' })
    expect(editIdentity(r.state, { avatar: 'afrique-ouest-f1' }).state.label.photo).toBeUndefined()
    expect(editIdentity(r.state, { photo: null }).state.label.photo).toBeUndefined()
  })
})
