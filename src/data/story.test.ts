import { describe, it, expect } from 'vitest'
import { SCENES, CHARS, nextStoryScene } from './story'
import { OBJECTIVES } from '../engine/objectives'
import { applyStoryEffect } from '../engine/storyEffects'
import { createGame } from '../engine/newGame'
import { SIM_CFG } from '../engine/simBot'

const fresh = () => createGame({ ...SIM_CFG, seed: 3 })

describe('histoire', () => {
  it('chaque scène est unique et ne référence que des personnages connus', () => {
    expect(new Set(SCENES.map((s) => s.id)).size).toBe(SCENES.length)
    for (const s of SCENES) for (const l of s.lines) expect(l.who === 'narrateur' || l.who in CHARS).toBe(true)
  })
  it('la partie commence par l’introduction puis rien tant que rien n’est accompli', () => {
    const g = fresh()
    expect(nextStoryScene(g)?.id).toBe('intro')
    g.seenScenes = ['intro']
    expect(nextStoryScene(g)).toBeUndefined()
  })
  it('les scènes liées aux objectifs se déclenchent quand l’objectif est accompli', () => {
    const g = fresh(); g.seenScenes = ['intro']
    g.objectives = ['deux-artistes']
    expect(nextStoryScene(g)?.id).toBe('duo-artistes')
    g.seenScenes.push('duo-artistes'); g.objectives.push('fans-100k')
    expect(nextStoryScene(g)?.id).toBe('presse-awa')
  })
  it('le dossier Horizon apparaît à 62 de réputation avec un album ou le podium national', () => {
    const g = fresh(); g.seenScenes = SCENES.map((s) => s.id).filter((id) => id !== 'dossier-horizon')
    g.reputation = 63
    expect(nextStoryScene(g)).toBeUndefined()
    g.objectives = ['album']
    expect(nextStoryScene(g)?.id).toBe('dossier-horizon')
  })
  it('publier le dossier augmente la réputation et déclenche une offensive ; négocier suspend Meridian', () => {
    const g = fresh(); g.reputation = 63
    const p = applyStoryEffect(g, 'dossier-publier')
    expect(p.error).toBeUndefined()
    expect(p.state.reputation).toBeGreaterThan(63)
    expect(p.state.meridian.phase).toBe('offensive')
    expect(applyStoryEffect(p.state, 'dossier-negocier').error).toBeTruthy() // un seul choix possible
    const n = applyStoryEffect(g, 'dossier-negocier')
    expect(n.state.reputation).toBe(62)
    expect(n.state.meridian.phase).toBe('calme')
    expect(n.state.meridian.since).toBeGreaterThan(g.week)
  })
  it('les objectifs sont rangés par acte croissant et leurs seuils de réputation sont cohérents avec le récit', () => {
    const acts = OBJECTIVES.map((o) => o.act)
    expect([...acts].sort()).toEqual(acts)
    expect(OBJECTIVES.find((o) => o.id === 'rep-100')?.act).toBe(4)
    expect(OBJECTIVES.filter((o) => o.id.startsWith('rep-')).map((o) => o.id)).toEqual(['rep-25', 'rep-50', 'rep-65', 'rep-75', 'rep-90', 'rep-100'])
  })
})
