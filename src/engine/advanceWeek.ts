import { createRng } from './rng'
import type { GameState, WeekPlan } from './types'

export const WEEKLY_STAFF_COST = 1_500 // provisoire, centralisé ici

/** Fonction pure : renvoie le nouvel état sans muter l'ancien. */
export function advanceWeek(state: GameState, plan: WeekPlan): GameState {
  const rng = createRng(state.rngState + state.week)
  let cash = state.cash
  const log: string[] = []
  const songs = state.songs.map((s) => ({ ...s }))

  for (const a of plan.actions) {
    if (a.type === 'spend') {
      if (cash - a.amount < 0) { log.push(`Refusé : ${a.label} (trésorerie insuffisante)`); continue }
      cash -= a.amount; log.push(`${a.label} : -${a.amount}`)
    } else if (a.type === 'release') {
      const s = songs.find((x) => x.id === a.songId)
      if (s && s.releaseWeek === null) { s.releaseWeek = a.week; log.push(`Sortie programmée : ${s.title} (S${a.week})`) }
    }
  }

  let revenue = 0
  for (const s of songs) {
    if (s.releaseWeek !== null && s.releaseWeek <= state.week) {
      const q = (s.lyricsQuality + s.recordingQuality + s.mixBonus) / 3
      const streams = Math.round(q * 1000 * (0.8 + rng.next() * 0.4))
      revenue += Math.round(streams * 0.004 * 100) / 100
    }
  }
  cash = Math.round(cash + revenue - WEEKLY_STAFF_COST)
  if (revenue > 0) log.push(`Revenus : +${Math.round(revenue)}`)

  return { ...state, week: state.week + 1, cash, songs, log }
}
