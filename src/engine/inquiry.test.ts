import { describe, it, expect } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { CLUES, LINKS, MAX_STRENGTH, inquiryStrength, inquiryTick, investigate, linkClues, tierOf, verifyClue } from './inquiry'
import { createGame } from './newGame'
import { SIM_CFG } from './simBot'
import { applyStoryEffect } from './storyEffects'
import { SCENES } from '../data/story'
import type { GameState } from './types'

const game = (): GameState => { const g = createGame({ ...SIM_CFG, seed: 5 }); g.cash = 100_000; g.seenScenes = ['presse-awa']; return g }
const withClues = (g: GameState, ids: string[]) => { g.inquiry = { clues: Object.fromEntries(ids.map((i) => [i, { week: 1 }])), links: [], heat: 0 }; return g }

describe('enquête Horizon', () => {
  it('reste fermée tant qu\'Awa n\'a pas été rencontrée', () => {
    const g = game(); g.seenScenes = []
    expect(investigate(g, 'pics').error).toMatch(/pas encore ouverte/)
  })
  it('enquêter coûte une action et de l\'argent ; un échec augmente la méfiance, jamais plus de 3 sans offensive', () => {
    let g = game(); let tries = 0
    while (!g.inquiry?.clues['pics'] && tries++ < 40) { g.ap = 6; const r = investigate(g, 'pics'); g = r.state }
    expect(g.inquiry?.clues['pics']).toBeTruthy()
    expect(g.cash).toBeLessThan(100_000)
    const g2 = game(); g2.staffSkills = {}; g2.staff = []
    let h = g2
    for (let i = 0; i < 40 && h.meridian.phase !== 'offensive'; i++) { h.ap = 6; const r = investigate(h, CLUES[i % 8].id); h = r.state; if (h.inquiry!.clues[CLUES[i % 8].id]) continue }
    expect(['offensive', 'calme']).toContain(h.meridian.phase)
  })
  it('refuse sans action ou sans argent', () => {
    const g = game(); g.ap = 0
    expect(investigate(g, 'pics').error).toBeTruthy()
    const p = game(); p.cash = 10
    expect(investigate(p, 'pics').error).toBeTruthy()
  })
  it('relier deux indices valides compte double ; une fausse piste est refusée', () => {
    const g = withClues(game(), ['pics', 'bots', 'contrat'])
    expect(linkClues(g, 'pics', 'contrat').error).toMatch(/pas de lien/)
    const r = linkClues(g, 'bots', 'pics')
    expect(r.error).toBeUndefined()
    expect(inquiryStrength(r.state)).toBe(3 + 2)
    expect(linkClues(r.state, 'pics', 'bots').error).toMatch(/déjà/)
    expect(linkClues(g, 'pics', 'ancien').error).toBeTruthy()
  })
  it('la vérification d\'Awa aboutit deux semaines plus tard', () => {
    let g = withClues(game(), ['pics'])
    g = verifyClue(g, 'pics').state
    expect(g.inquiry!.clues.pics.verifyDue).toBe(g.week + 2)
    expect(verifyClue(g, 'pics').error).toMatch(/déjà/)
    const notes: { tag: string; text: string; tone: 'g' }[] = []
    g.week += 2; inquiryTick(g, notes)
    expect(g.inquiry!.clues.pics.verified).toBe(true); expect(notes).toHaveLength(1)
    expect(inquiryStrength(g)).toBe(2)
  })
  it('seuils de solidité et maximum atteignable', () => {
    expect(tierOf(7)).toBe(0); expect(tierOf(8)).toBe(1); expect(tierOf(18)).toBe(2)
    expect(MAX_STRENGTH).toBe(CLUES.length * 2 + LINKS.length * 2)
  })
  it('publier un dossier solide rapporte plus qu\'un dossier fragile', () => {
    const weak = applyStoryEffect(game(), 'dossier-publier').state
    const strong = withClues(game(), CLUES.map((c) => c.id))
    strong.inquiry!.links = LINKS.map((l) => [l.a, l.b].sort().join('|'))
    const hi = applyStoryEffect(strong, 'dossier-publier').state
    expect(tierOf(inquiryStrength(strong))).toBe(2)
    expect(hi.reputation - strong.reputation).toBeGreaterThan(weak.reputation - game().reputation)
    expect(weak.cash).toBeLessThan(100_000)
    expect(hi.meridian.until - hi.week).toBeLessThan(weak.meridian.until - weak.week)
  })
  it('négocier avec un dossier irréfutable rapporte de l\'argent', () => {
    const g = withClues(game(), CLUES.map((c) => c.id)); g.inquiry!.links = LINKS.map((l) => [l.a, l.b].sort().join('|'))
    const r = applyStoryEffect(g, 'dossier-negocier').state
    expect(r.cash).toBe(g.cash + 25000)
  })
  it('« attendre » ne clôt pas le dossier ; la scène « dossier prêt » arrive quand il est solide', () => {
    let g = game(); g.reputation = 70
    g = applyStoryEffect(g, 'dossier-attendre').state
    expect(g.eventSeen['dossier']).toBeUndefined()
    expect(applyStoryEffect(g, 'dossier-attendre').error).toBeTruthy()
    const pret = SCENES.find((x) => x.id === 'dossier-pret')!
    expect(pret.when(g)).toBe(false)
    withClues(g, CLUES.map((c) => c.id))
    expect(pret.when(g)).toBe(true)
    expect(applyStoryEffect(g, 'dossier-publier').state.eventSeen['dossier']).toBeDefined()
  })
  it('la semaine avance sans erreur avec une enquête en cours', () => {
    let g = withClues(game(), ['pics']); g = verifyClue(g, 'pics').state
    for (let i = 0; i < 4; i++) g = advanceWeek(g)
    expect(g.inquiry!.clues.pics.verified).toBe(true)
  })
})
