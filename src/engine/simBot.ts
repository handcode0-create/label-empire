import { STUDIOS } from '../data/people'
import { CITIES } from '../data/world'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { bookStudio, chooseMix, scheduleRelease, writeSong } from './production'
import { resolveEvent } from './events'
import { signArtist, visibleCandidates } from './scouting'
import { newStop, planTour } from './tour'
import type { GameState, NewGameConfig, Result } from './types'
import { artistSlots, signedCount } from './util'

/** Joueur automatique « actif » : sert à calibrer la durée d'une partie (voir sim.test.ts). */
export const SIM_CFG = {
  labelName: 'Sim', logoId: 'anneau', founderName: 'Bot', nationality: 'Ivoirienne', mainGenre: 'Afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: 1,
} as unknown as NewGameConfig

let counter = 0
const act = (g: GameState, r: Result): GameState => (r.error ? g : r.state)

export function botTurn(g0: GameState): GameState {
  let g = g0
  // événement : premier choix abordable (< 10 % de la trésorerie)
  if (g.event && !g.event.resolved) {
    const c = g.event.choices.find((x) => x.cost <= g.cash * 0.1) ?? g.event.choices[g.event.choices.length - 1]
    g = act(g, resolveEvent(g, c.id))
  }
  // signature
  if (signedCount(g) < artistSlots(g) && g.cash > 80_000) {
    const cand = visibleCandidates(g).filter((a) => a.status !== 'concours').sort((a, b) => b.potential - a.potential)[0]
    if (cand?.asking) g = act(g, signArtist(g, cand.id, { advance: Math.round(cand.asking.advance * 1.15), royalty: cand.asking.royalty, weeks: 104, scope: 'monde' }))
  }
  for (const a of g.artists) {
    if (g.ap <= 0) break
    const songs = g.songs.filter((s) => s.artistId === a.id)
    const budget = Math.max(1000, g.cash * 0.04)
    // sortie
    const ready = songs.find((s) => s.stage === 'mixed' && !s.standby && s.readyWeek <= g.week)
    if (ready) {
      const open = CITIES.filter((c) => c.minRep <= g.reputation).sort((x, y) => y.base - x.base).slice(0, 6).map((c) => c.id)
      const promo = Math.round(Math.min(25_000, g.cash * 0.06))
      g = act(g, scheduleRelease(g, ready.id, { week: g.week + 1, strategy: 'regionale', cityIds: open, promo, loc: [], media: [] }))
      continue
    }
    const rec = songs.find((s) => s.stage === 'recorded' && s.readyWeek <= g.week)
    if (rec) { g = act(g, chooseMix(g, rec.id, g.cash > 60_000 ? 'local' : 'interne', false)); continue }
    const written = songs.find((s) => s.stage === 'written')
    if (written) {
      const st = [...STUDIOS].filter((x) => x.pricePerDay * 4 <= budget).sort((x, y) => y.quality - x.quality)[0] ?? STUDIOS[0]
      g = act(g, bookStudio(g, written.id, st.id, 4))
      continue
    }
    const inPipe = songs.filter((s) => ['written', 'recorded', 'mixed', 'scheduled'].includes(s.stage)).length
    if (inPipe < 2) {
      counter++
      g = act(g, writeSong(g, { title: `Titre bot ${counter}`, artistId: a.id, genre: a.genre, theme: 'Amour', lang: a.lang, mood: 'Solaire', lyrics: 'je chante la nuit je chante le jour pour toi mon amour toujours', writer: 'artiste' }))
    }
  }
  // tournée : un concert dans la meilleure ville de fans, toutes les 10 semaines
  if (g.week % 10 === 0 && g.ap > 0) {
    const a = [...g.artists].sort((x, y) => Object.values(y.fans).reduce((t, v) => t + v, 0) - Object.values(x.fans).reduce((t, v) => t + v, 0))[0]
    const city = a && Object.entries(a.fans).sort((x, y) => y[1] - x[1])[0]?.[0]
    if (a && city && a.fatigue < 50 && !g.tours.some((t) => t.status !== 'done')) {
      g = act(g, planTour(g, { name: `Tournée ${g.week}`, artistId: a.id, stops: [newStop(city, g.week + 2, 1)], partners: [] }))
    }
  }
  return g
}

export interface SimResult { repAt: Record<number, number>; hit100: number | null; cash: number; outcome: GameState['outcome']; fans: number; songs: number }

export function runSim(seed: number, weeks = 260, turn: (g: GameState) => GameState = botTurn): SimResult {
  let g = createGame({ ...SIM_CFG, seed })
  g.freeMode = true // ne s'arrête pas sur la défaite : on mesure la trajectoire
  const repAt: Record<number, number> = {}
  let hit100: number | null = null
  for (let i = 0; i < weeks; i++) {
    g = turn(g)
    g = advanceWeek(g)
    if (g.reputation >= 99.95 && hit100 === null) hit100 = g.week
    if ((g.week - 1) % 26 === 0) repAt[g.week - 1] = Math.round(g.reputation * 10) / 10
  }
  const fans = g.artists.reduce((t, a) => t + Object.values(a.fans).reduce((x, y) => x + y, 0), 0)
  return { repAt, hit100, cash: Math.round(g.cash), outcome: g.outcome, fans, songs: g.songs.length }
}
