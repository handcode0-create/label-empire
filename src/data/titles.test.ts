import { describe, it, expect } from 'vitest'
import { TITLE_THEMES, generateProjectName, generateTitle, titleCapacity } from './titles'
import { createRng } from '../engine/rng'
import { rivalProjectNames, rivalTitles } from '../engine/rivals'

describe('banque de titres', () => {
  it('huit thèmes, chacun très riche', () => {
    expect(TITLE_THEMES.length).toBe(8)
    for (const t of TITLE_THEMES) { expect(titleCapacity(t)).toBeGreaterThan(400); expect(titleCapacity(t, 'anglais')).toBeGreaterThan(400) }
  })
  it('500 titres de suite sans doublon', () => {
    const rng = createRng(11); const taken: string[] = []
    for (let i = 0; i < 500; i++) { const t = generateTitle(rng, { theme: TITLE_THEMES[i % 8], mood: ['Mélancolique', 'Solaire', 'Intense'][i % 3], lang: ['français', 'anglais', 'nouchi'][i % 3] }, taken); expect(taken.map((x) => x.toLowerCase())).not.toContain(t.toLowerCase()); taken.push(t) }
  })
  it('200 noms de projets sans doublon', () => {
    const rng = createRng(3); const taken: string[] = []
    for (let i = 0; i < 200; i++) { const t = generateProjectName(rng, { kind: i % 2 ? 'EP' : 'Album', artist: 'Kofi Star' }, taken); expect(taken).not.toContain(t); taken.push(t) }
  })
  it('les rivaux n’ont pas de titres ni de projets en double', () => {
    const t = rivalTitles().map((x) => x.toLowerCase()); expect(new Set(t).size).toBe(t.length)
    const p = rivalProjectNames().map((x) => x.toLowerCase()); expect(new Set(p).size).toBe(p.length)
  })
})
