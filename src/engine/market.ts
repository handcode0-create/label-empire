import { RIVAL_ARTISTS, RIVAL_LABELS, RIVAL_TITLES } from '../data/people'
import { CITIES, affinity, cityById, type City } from '../data/world'
import { createRng, hash } from './rng'
import type { ChartRow, GameState, Song } from './types'
import { fansInCity, staffSkill } from './util'

export const STREAM_VALUE = 0.02 // dollars par écoute avant retenues

function locBoost(song: Song, city: City) {
  let b = 0
  const loc = song.release?.loc ?? []
  if (loc.includes('en') && city.lang === 'anglais' && song.lang !== 'anglais') b += 0.25
  if (loc.includes('amapiano') && city.region === 'afrique-australe') b += 0.3
  if (loc.includes('clip')) b += 0.12
  return b
}
function officeBoost(s: GameState, city: City) {
  let b = 0
  for (const o of s.offices) {
    if (o.since > s.week) continue
    const oc = cityById(o.cityId)
    if (o.cityId === city.id) b += o.kind === 'partenaire' ? 0.05 : 0.1
    else if (oc.region === city.region) b += 0.03
  }
  return b
}

/** E = B · Q · A · (1+M) · D(t) · (1+F) : écoutes d'un titre sur une ville, pour une semaine donnée. */
export function weeklyStreams(s: GameState, song: Song, city: City, week: number): number {
  const r = song.release
  if (!r || !song.quality || week < r.week) return 0
  const t = week - r.week
  const decay = t === 0 ? 0.9 : t === 1 ? 1 : Math.max(0.04, Math.pow(0.86, t - 1))
  const q = song.quality / 100
  const fans = fansInCity(s, city.id)
  const fanF = Math.min(1, fans / (city.base * 0.15))
  const promoF = Math.min(0.8, r.promo / r.cityIds.length / (city.base * 0.004)) + staffSkill(s, 'marketing') * 0.02
  const M = promoF + locBoost(song, city) + officeBoost(s, city)
  const direct = r.cityIds.includes(city.id)
  const base = city.base * 0.25 * q * q * affinity(song.genre, city) * (1 + M) * (1 + fanF) * decay * (1 + song.hype)
  if (direct) return base
  // diffusion : zone, langue
  let diffusion = 0
  for (const id of r.cityIds) {
    const src = cityById(id)
    const k = src.region === city.region ? 0.08 : src.lang === city.lang ? 0.04 : 0
    if (k) diffusion += k * city.base * 0.25 * q * q * affinity(song.genre, city) * decay
  }
  return diffusion
}

export const royaltyShare = (s: GameState, song: Song) => s.artists.find((a) => a.id === song.artistId)?.contract?.royalty ?? 0

// ---------- classements ----------
function rivalRow(cityId: string, week: number, i: number) {
  const city = cityById(cityId)
  const h = hash(cityId)
  const noise = createRng(hash(`${cityId}${week}${i}`)).next()
  return {
    title: RIVAL_TITLES[(h + i * 5) % RIVAL_TITLES.length],
    artist: RIVAL_ARTISTS[(h + i * 3) % RIVAL_ARTISTS.length],
    label: RIVAL_LABELS[(h + i) % RIVAL_LABELS.length],
    streams: Math.round(city.base * 0.6 * Math.pow(0.82, i) * (0.85 + 0.3 * noise)),
  }
}

type Raw = { key: string; title: string; artist: string; label: string; streams: number; mine: boolean }
function rawCity(s: GameState, cityId: string, week: number, mineStreams: (song: Song) => number): Raw[] {
  const rows: Raw[] = Array.from({ length: 14 }, (_, i) => { const r = rivalRow(cityId, week, i); return { key: `${r.title}|${r.artist}`, ...r, mine: false } })
  for (const song of s.songs) {
    const st = mineStreams(song)
    if (st > 0) rows.push({ key: `mine|${song.id}`, title: song.title, artist: s.artists.find((a) => a.id === song.artistId)?.stageName ?? '', label: s.label.name, streams: st, mine: true })
  }
  return rows
}
function toChart(rows: Raw[], prev: Raw[]): ChartRow[] {
  const sorted = [...rows].sort((a, b) => b.streams - a.streams)
  const prevRank = new Map([...prev].sort((a, b) => b.streams - a.streams).map((r, i) => [r.key, i + 1]))
  return sorted.map((r, i) => ({ rank: i + 1, title: r.title, artist: r.artist, label: r.label, streams: r.streams, mine: r.mine, delta: prevRank.has(r.key) ? (prevRank.get(r.key)! - (i + 1)) : null }))
}

export type ChartLevel = 'ville' | 'pays' | 'continent' | 'monde'
export type ChartKind = 'singles' | 'artistes'

/** Classement de la dernière semaine jouée. */
export function chartFor(s: GameState, level: ChartLevel, cityId: string, kind: ChartKind = 'singles'): ChartRow[] {
  const week = s.week - 1
  const city = cityById(cityId)
  const cities = level === 'continent' ? CITIES.filter((c) => c.continent === city.continent) : level === 'monde' ? CITIES : [city]
  const merge = (cur: boolean): Raw[] => {
    const map = new Map<string, Raw>()
    for (const c of cities) {
      for (const r of rawCity(s, c.id, cur ? week : week - 1, (song) => (cur ? song.stats.lastByCity[c.id] : song.stats.prevByCity[c.id]) ?? 0)) {
        const key = kind === 'artistes' ? `${r.artist}|${r.mine}` : r.key
        const ex = map.get(key)
        if (ex) ex.streams += r.streams
        else map.set(key, { ...r, key, title: kind === 'artistes' ? r.artist : r.title })
      }
    }
    return [...map.values()]
  }
  return toChart(merge(true), merge(false))
}

/** Meilleur rang de nos titres sur un marché (ou null). */
export function bestRank(s: GameState, level: ChartLevel, cityId: string): number | null {
  const rows = chartFor(s, level, cityId).filter((r) => r.mine)
  return rows.length ? rows[0].rank : null
}

/** Rang qu'obtiendraient `streams` écoutes dans le classement d'une ville cette semaine. */
export function rankInCity(cityId: string, week: number, streams: number): number {
  let rank = 1
  for (let i = 0; i < 14; i++) if (rivalRow(cityId, week, i).streams > streams) rank++
  return rank
}
