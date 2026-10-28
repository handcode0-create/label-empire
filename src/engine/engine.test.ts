import { describe, expect, it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame, startingCash, validateConfig } from './newGame'
import { songQuality } from './quality'
import { bookStudio, chooseMix, scheduleRelease, writeSong } from './production'
import { evaluateOffer, signArtist, startContest, visibleCandidates } from './scouting'
import { planTour, newStop } from './tour'
import { chartFor } from './market'
import { openOffice, takeLoan } from './economy'
import type { GameState, NewGameConfig } from './types'

const cfg: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'ring', founderName: 'Smith Junior', nationality: 'Ivoirienne',
  mainGenre: 'afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 42,
}
const must = (r: { state: GameState; error?: string }) => { if (r.error) throw new Error(r.error); return r.state }

describe('nouvelle partie', () => {
  it('crée le fondateur comme artiste et un vivier de candidats', () => {
    const g = createGame(cfg)
    expect(g.artists).toHaveLength(1)
    expect(g.cash).toBe(500_000)
    expect(g.staff).toHaveLength(3)
    expect(visibleCandidates(g).length).toBeGreaterThan(5)
  })
  it('refuse une répartition de points invalide', () => {
    expect(validateConfig({ ...cfg, staffSkills: { negociation: 9 } })).toContain('Répartir exactement 10 points de staff')
  })
  it('capital de départ : 500 000 $ puis 3 tranches', () => {
    expect(startingCash(10, 'normal')).toBe(500_000)
    expect(startingCash(10, 'normal', 'riche')).toBe(5_000_000)
    expect(startingCash(10, 'normal', 'majeur')).toBe(10_000_000)
    expect(startingCash(10, 'normal', 'milliardaire')).toBe(1_000_000_000)
  })
})

describe('déterminisme', () => {
  it('advanceWeek est pure et reproductible', () => {
    const g = createGame(cfg)
    expect(advanceWeek(g)).toEqual(advanceWeek(g))
    expect(g.week).toBe(1)
  })
})

describe('qualité', () => {
  it('reste entre 0 et 100', () => {
    expect(songQuality({ voix: 100, ecriture: 100, production: 100, studio: 100, arrangement: 100, luck: 100 }, 50)).toBe(100)
  })
})

describe('parcours complet', () => {
  it('signer, écrire, enregistrer, mixer, sortir, encaisser', () => {
    let g = createGame(cfg)
    const cand = visibleCandidates(g).find((c) => c.stageName === 'Aïcha Nova')!
    const offer = { advance: cand.asking!.advance * 1.3, royalty: cand.asking!.royalty + 0.05, weeks: 104, scope: 'region' as const }
    expect(evaluateOffer(g, cand, offer).score).toBeGreaterThan(1)
    g = must(signArtist(g, cand.id, offer))
    expect(g.artists.some((a) => a.id === cand.id)).toBe(true)
    g = must(writeSong(g, { title: 'Soleil d’Abidjan', artistId: cand.id, genre: 'Afro-pop', theme: 'Amour', lang: 'français', mood: 'Solaire', lyrics: 'Sous le ciel d’Abidjan le soir se lève doux\n[Refrain]\nChante avec moi chante le monde va danser', writer: 'artiste' })) 
    const song = g.songs[0]
    g = must(bookStudio(g, song.id, 'ebene', 4))
    g = must(chooseMix(g, song.id, 'local', true))
    const ready = g.songs[0].readyWeek
    g = must(scheduleRelease(g, song.id, { week: ready, strategy: 'regionale', cityIds: ['abidjan', 'dakar'], promo: 6000, loc: [] }))
    while (g.week <= ready + 8) g = advanceWeek(g)
    const s = g.songs[0]
    expect(s.stage).toBe('released')
    expect(s.stats.streams).toBeGreaterThan(100_000)
    expect(s.stats.revenue).toBeGreaterThan(0)
    expect(Number.isFinite(g.cash)).toBe(true)
    expect(chartFor(g, 'pays', 'abidjan').length).toBeGreaterThan(10)
  })
  it("refuse une action si la trésorerie ou les actions manquent", () => {
    let g = createGame(cfg)
    g.cash = 100
    expect(startContest(g, { name: 'X', cityId: 'abidjan', format: 'ligne', budget: 5000, jury: [] }).error).toMatch(/Trésorerie/)
    g.cash = 100000; g.ap = 0
    expect(startContest(g, { name: 'X', cityId: 'abidjan', format: 'ligne', budget: 5000, jury: [] }).error).toMatch(/actions/)
    g = createGame(cfg)
    g = must(startContest(g, { name: 'Révélation', cityId: 'abidjan', format: 'salle', budget: 12000, jury: ['a'] }))
    while (g.week < 4) g = advanceWeek(g)
    expect(g.pool.filter((a) => a.status === 'concours').length).toBeGreaterThanOrEqual(4)
  })
  it('tournée, bureau et prêt', () => {
    let g = createGame({ ...cfg, startReputation: 40 })
    g = must(takeLoan(g))
    expect(g.loan).not.toBeNull()
    expect(planTour(g, { name: '', artistId: 'founder', stops: [newStop('lagos', 3)], partners: [] }).error).toMatch(/nom/)
    g = must(planTour(g, { name: 'Soleil Tour', artistId: 'founder', stops: [newStop('lagos', 3), newStop('paris', 5)], partners: ['nova'] }))
    expect(openOffice(g, 'paris', 'bureau').error).toMatch(/Fans insuffisants/)
    while (g.week < 7) g = advanceWeek(g)
    expect(g.tours[0].status).toBe('done')
  })
  it("4 semaines de trésorerie négative déclenchent le sauvetage Meridian, pas la défaite", () => {
    let g = createGame(cfg)
    g.cash = -50000
    for (let i = 0; i < 5; i++) g = advanceWeek(g)
    expect(g.outcome).toBeFalsy()
    expect(g.bailouts).toBe(1)
  })
})
