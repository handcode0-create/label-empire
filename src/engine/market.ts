import { mediaById, mediaReaches } from '../data/media'
import { CITIES, affinity, cityById, type City } from '../data/world'
import { songName } from '../lib'
import { boostMult, pressureMult, trendMult } from './dynamics'
import { projectSongs } from './projects'
import { liveCity } from './prices'
import { rivalInfo, rivalProjectIn, rivalSongIn } from './rivalLife'
import type { ChartRow, GameState, Song } from './types'
import { fansInCity, modsOf, staffSkill } from './util'

/** Échelle globale des écoutes (réglage d'équilibrage). */
export const STREAM_SCALE = 0.6
export const STREAM_VALUE = 0.009 // dollars par écoute avant retenues

function locBoost(song: Song, city: City) {
  let b = 0
  const loc = song.release?.loc ?? []
  if (loc.includes('en') && city.lang === 'anglais' && song.lang !== 'anglais') b += 0.25
  if (loc.includes('amapiano') && city.region === 'afrique-australe') b += 0.3
  if (loc.includes('clip')) b += 0.12
  return b
}
function mediaBoost(song: Song, city: City) {
  let b = 0
  const q = (song.quality ?? 50) / 100
  for (const id of song.release?.media ?? []) {
    const m = mediaById(id)
    if (!m || !mediaReaches(m, city)) continue
    b += m.boost * (0.6 + 0.4 * q) * (m.genres.includes(song.genre) ? 1.15 : 1)
  }
  return Math.min(0.7, b)
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
export function weeklyStreams(s: GameState, song: Song, city0: City, week: number): number {
  const city = liveCity(s, city0)
  const r = song.release
  if (!r || !song.quality || week < r.week) return 0
  const t = week - r.week
  const decay = t === 0 ? 0.9 : t === 1 ? 1 : Math.max(0.04, Math.pow(0.86, t - 1))
  const q = song.quality / 100
  const fans = fansInCity(s, city.id) + (song.feat?.fans[city.id] ?? 0) * 0.5
  const fanF = Math.min(1, fans / (city.base * 0.15))
  const promoF = Math.min(0.8, r.promo / r.cityIds.length / (city.base * 0.004)) + staffSkill(s, 'marketing') * 0.02
  const M = promoF + locBoost(song, city) + officeBoost(s, city) + mediaBoost(song, city)
  const direct = r.cityIds.includes(city.id)
  const dyn = trendMult(s, song.genre, week, city) * boostMult(s, song, city.id, week) * pressureMult(s, song, city.id, week)
  const base = city.base * 0.25 * q * q * affinity(song.genre, city) * (1 + M) * (1 + fanF) * decay * (1 + song.hype) * dyn * modsOf(s).streams * STREAM_SCALE
  if (direct) return base
  // diffusion : zone, langue
  let diffusion = 0
  for (const id of r.cityIds) {
    const src = cityById(id)
    const k = src.region === city.region ? 0.08 : src.lang === city.lang ? 0.04 : 0
    if (k) diffusion += k * city.base * 0.25 * q * q * affinity(song.genre, city) * decay
  }
  return diffusion * modsOf(s).streams * STREAM_SCALE * trendMult(s, song.genre, week, city) * pressureMult(s, song, city.id, week)
}

export const royaltyShare = (s: GameState, song: Song) => (s.artists.find((a) => a.id === song.artistId)?.contract?.royalty ?? 0) + (song.feat?.share ?? 0)

// ---------- classements ----------
const charts = (s: GameState, cur: boolean) => (cur ? s.rivals.chart : s.rivals.prev)

type Raw = { key: string; title: string; artist: string; label: string; streams: number; mine: boolean; artistId?: string; songId?: string; projectId?: string }
function rawCity(s: GameState, cityId: string, cur: boolean, kind: ChartKind): Raw[] {
  const val = (song: Song) => (cur ? song.stats.lastByCity[cityId] : song.stats.prevByCity[cityId]) ?? 0
  const myName = (id: string) => s.artists.find((a) => a.id === id)?.stageName ?? ''
  if (kind === 'eps' || kind === 'albums') {
    const pk = kind === 'eps' ? 'EP' : 'Album'
    const rows: Raw[] = (charts(s, cur)[pk][cityId] ?? []).flatMap((r) => {
      const project = rivalProjectIn(s, r.k), artist = rivalInfo(s, r.a)
      return project && artist ? [{ key: project.id, title: project.name, artist: artist.stageName, label: artist.labelName, streams: r.st, mine: false, artistId: artist.id, projectId: project.id }] : []
    })
    for (const p of s.projects) {
      if (p.status !== 'sorti' || p.kind !== pk) continue
      const st = projectSongs(s, p).reduce((t, x) => t + val(x), 0)
      if (st > 0) rows.push({ key: `mine|${p.id}`, title: p.name, artist: myName(p.artistId), label: s.label.name, streams: st, mine: true, artistId: p.artistId, projectId: p.id })
    }
    return rows
  }
  const rows: Raw[] = (charts(s, cur).singles[cityId] ?? []).flatMap((r) => {
    const song = rivalSongIn(s, r.k), artist = rivalInfo(s, r.a)
    return song && artist ? [{ key: song.id, title: song.title, artist: artist.stageName, label: artist.labelName, streams: r.st, mine: false, artistId: artist.id, songId: song.id }] : []
  })
  for (const song of s.songs) {
    const st = val(song)
    if (st > 0) rows.push({ key: `mine|${song.id}`, title: songName(song), artist: myName(song.artistId), label: s.label.name, streams: st, mine: true, artistId: song.artistId, songId: song.id })
  }
  return rows
}
function toChart(rows: Raw[], prev: Raw[]): ChartRow[] {
  const sorted = [...rows].sort((a, b) => b.streams - a.streams)
  const prevRank = new Map([...prev].sort((a, b) => b.streams - a.streams).map((r, i) => [r.key, i + 1]))
  return sorted.map((r, i) => ({ rank: i + 1, title: r.title, artist: r.artist, label: r.label, streams: r.streams, mine: r.mine, artistId: r.artistId, songId: r.songId, projectId: r.projectId, delta: prevRank.has(r.key) ? (prevRank.get(r.key)! - (i + 1)) : null }))
}

export type ChartLevel = 'ville' | 'pays' | 'continent' | 'monde'
export type ChartKind = 'singles' | 'artistes' | 'eps' | 'albums'

/** Classement de la dernière semaine jouée. */
export function chartFor(s: GameState, level: ChartLevel, cityId: string, kind: ChartKind = 'singles'): ChartRow[] {
  const city = cityById(cityId)
  const cities = level === 'continent' ? CITIES.filter((c) => c.continent === city.continent) : level === 'monde' ? CITIES : [city]
  const merge = (cur: boolean): Raw[] => {
    const map = new Map<string, Raw>()
    for (const c of cities) {
      for (const r of rawCity(s, c.id, cur, kind === 'artistes' ? 'singles' : kind)) {
        const key = kind === 'artistes' ? `${r.artistId}|${r.mine}` : r.key
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

/** Rang qu'obtiendraient `streams` écoutes dans le classement (rival) d'une ville cette semaine. */
export function rankInCity(s: GameState, cityId: string, streams: number): number {
  let rank = 1
  for (const r of s.rivals.chart.singles[cityId] ?? []) if (r.st > streams) rank++
  return rank
}
