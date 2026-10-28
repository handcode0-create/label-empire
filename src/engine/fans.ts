import { CITIES, cityById } from '../data/world'
import { liveCity } from './prices'
import type { Artist, GameState, Song } from './types'
import { clamp, fansInCity } from './util'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
const total = (a: Artist) => Object.values(a.fans).reduce((t, v) => t + v, 0)

/** Ferveur du public d'un artiste (0..100) : elle ralentit ou accélère l'érosion de sa base de fans. */
export const heatOf = (a: Artist) => a.heat ?? 50

/** Une ville ne peut accueillir qu'un nombre fini de fans : au-delà, le recrutement ralentit (saturation du marché). */
export const FAN_CAP_MULT = 6
export function saturation(s: GameState, cityId: string): number {
  const c = liveCity(s, cityById(cityId))
  return clamp(1 - fansInCity(s, cityId) / (c.base * FAN_CAP_MULT), 0, 1)
}

/** Perte (négative) ou gain en pourcentage de la base de fans, répartie sur toutes les villes. */
export function fanPct(a: Artist, pct: number) {
  for (const k of Object.keys(a.fans)) a.fans[k] = Math.max(0, Math.round(a.fans[k] * (1 + pct)))
}
export function addHeat(a: Artist, v: number) { a.heat = clamp(heatOf(a) + v, 0, 100) }

/** Réaction du public le jour d'une sortie : un bon titre fidélise, un titre raté déçoit dans les villes ciblées. */
export function releaseReaction(s: GameState, song: Song, notes: Notes) {
  const a = s.artists.find((x) => x.id === song.artistId)
  if (!a || !song.release) return
  const q = song.quality ?? 50
  if (q >= 75) { addHeat(a, 6); notes.push({ tag: 'Public', text: `Le public accueille « ${song.title} » avec ferveur : les fans de ${a.stageName} se rallient (ferveur +6).`, tone: 'g' }) }
  else if (q < 45) {
    addHeat(a, -9)
    for (const id of song.release.cityIds) if (a.fans[id]) a.fans[id] = Math.max(0, Math.round(a.fans[id] * 0.985))
    notes.push({ tag: 'Public', text: `« ${song.title} » déçoit : une partie des fans de ${a.stageName} décroche dans ${song.release.cityIds.length} territoire(s) (ferveur −9).`, tone: 'r' })
  } else addHeat(a, 1.5)
}

/** Érosion et migration hebdomadaires des fans. */
export function fanTick(s: GameState, notes: Notes) {
  const W = s.week
  for (const a of s.artists) {
    const last = Math.max(-99, ...s.songs.filter((x) => x.artistId === a.id && x.release && x.release.week <= W).map((x) => x.release!.week))
    const idle = W - last
    const hit = s.songs.some((x) => x.artistId === a.id && x.stage === 'released' && (x.stats.hist?.slice(-3).reduce((t, h) => t + h.st, 0) ?? 0) > 150_000)
    // la ferveur revient vers 50, baisse sans sortie, monte avec un succès
    a.heat = clamp(heatOf(a) + (50 - heatOf(a)) * 0.03 - (idle > 12 ? 0.5 : 0) + (hit ? 1 : 0), 0, 100)
    const base = idle < 6 ? 0.001 : idle < 12 ? 0.006 : 0.015
    const churn = base * (1.5 - heatOf(a) / 100)
    for (const k of Object.keys(a.fans)) a.fans[k] = Math.floor(a.fans[k] * (1 - churn))
    // migration : une fraction des fans suit l'artiste dans les villes voisines (même zone) où il n'est pas encore installé
    if (hit && total(a) > 5000) {
      const [homeId, homeFans] = Object.entries(a.fans).sort((x, y) => y[1] - x[1])[0]
      const home = cityById(homeId)
      for (const c of CITIES) {
        if (c.id === homeId || c.region !== home.region) continue
        const moved = Math.round(homeFans * 0.002 * saturation(s, c.id))
        if (moved > 0) a.fans[c.id] = (a.fans[c.id] ?? 0) + moved
      }
    }
    if (heatOf(a) < 25 && W % 8 === 0) notes.push({ tag: 'Public', text: `Les fans de ${a.stageName} se lassent (ferveur ${Math.round(heatOf(a))}). Une sortie ou un concert les ferait revenir.`, tone: 'e' })
  }
}
