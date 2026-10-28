import { TITLE_THEMES, generateProjectName, generateTitle } from '../data/titles'
import { CITIES, affinity, cityById } from '../data/world'
import { addTrend, trendMult } from './dynamics'
import { liveCity } from './prices'
import { createRng, hash, type Rng } from './rng'
import { rivalWorld, type RivalArtist, type RivalLabel, type RivalProject, type RivalSong } from './rivals'
import type { Artist, GameState } from './types'
import { clamp, drawRng } from './util'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]

/** Vie du monde rival : popularité, sorties, transferts et brouilles évoluent chaque semaine. */
export interface RivalDyn {
  pop: number // popularité du moment (0,15 .. 1)
  base: number // niveau de fond vers lequel la popularité revient
  buzz: number // effet de la dernière sortie ou polémique
  label: string
  rel: { id: string; week: number; q: number }[] // dernières sorties (titres actifs dans les classements)
  last: number // semaine de la dernière sortie
  proj: Record<string, number> // ferveur autour de chaque EP / album
  planned?: number // semaine de la prochaine sortie annoncée
  since?: number // titres sortis depuis le dernier EP / album
}
export interface RivalRow { k: string; a: string; st: number }
export interface RivalCharts { singles: Record<string, RivalRow[]>; EP: Record<string, RivalRow[]>; Album: Record<string, RivalRow[]> }
export interface RivalState {
  dyn: Record<string, RivalDyn>
  extra: RivalArtist[] // artistes signés en cours de partie (vivier ou départs du joueur)
  songs: RivalSong[] // titres sortis en cours de partie
  projects: RivalProject[] // EP et albums sortis en cours de partie
  plays: Record<string, number> // écoutes cumulées gagnées depuis le début
  feud: { a: string; b: string; artistA: string; artistB: string; until: number } | null
  chart: RivalCharts // semaine `week`
  prev: RivalCharts // semaine précédente
  week: number
}

/** Échelle des classements rivaux (réglage d'équilibrage) et croissance du marché au fil des semaines. */
export const RIVAL_K = 0.6
export const RIVAL_PROJ = 2.2
export const RIVAL_GROWTH = 0.0012
const SINGLES_ROWS = 14
const PROJECT_ROWS = 12
const MAX_REL = 6

const empty = (): RivalCharts => ({ singles: {}, EP: {}, Album: {} })
const decay = (t: number) => (t === 0 ? 0.9 : t === 1 ? 1 : Math.max(0.03, Math.pow(0.78, t - 1)))
const growth = (W: number) => 1 + RIVAL_GROWTH * Math.max(0, W - 1)

export const projectsOf = (s: GameState, a: RivalArtist): RivalProject[] => [...a.projects, ...(s.rivals?.projects ?? []).filter((p) => p.artistId === a.id)]
export const allRivalArtists = (s: GameState): RivalArtist[] => [...rivalWorld().artists, ...(s.rivals?.extra ?? [])]

function homeFactor(a: RivalArtist, cityId: string) {
  const c = cityById(cityId), o = cityById(a.originCityId)
  return o.id === c.id ? 1.7 : o.region === c.region ? 1.3 : o.lang === c.lang ? 1.05 : 0.8
}

/** Calcule les classements rivaux de la semaine W et cumule leurs écoutes. */
export function computeCharts(s: GameState, W: number, accumulate = false): RivalCharts {
  const R = s.rivals
  const out = empty()
  const arts = allRivalArtists(s)
  const G = growth(W)
  const projects = arts.flatMap((a) => projectsOf(s, a).map((p) => ({ a, p })))
  for (const c0 of CITIES) {
    const c = liveCity(s, c0)
    const rows: RivalRow[] = []
    for (const a of arts) {
      const d = R.dyn[a.id]
      if (!d) continue
      const m = trendMult(s, a.genre, W, c) * affinity(a.genre, c) * homeFactor(a, c.id) * Math.pow(d.pop, 3.5) * (1 + 0.25 * d.buzz) * G
      for (const r of d.rel.slice(0, 2)) {
        const t = W - r.week
        if (t < 0) continue
        const noise = 0.9 + 0.2 * createRng(hash(`${c.id}|${W}|${r.id}`)).next()
        const st = Math.round(c.base * RIVAL_K * r.q * r.q * decay(t) * m * noise)
        if (accumulate) R.plays[r.id] = (R.plays[r.id] ?? 0) + st
        rows.push({ k: r.id, a: a.id, st })
      }
    }
    out.singles[c.id] = rows.sort((x, y) => y.st - x.st).slice(0, SINGLES_ROWS)
    for (const kind of ['EP', 'Album'] as const) {
      const pr: RivalRow[] = []
      for (const { a, p } of projects) {
        if (p.kind !== kind) continue
        const d = R.dyn[a.id]
        if (!d) continue
        const noise = 0.9 + 0.2 * createRng(hash(`${c.id}|${W}|${p.id}`)).next()
        const st = Math.round(c.base * (kind === 'Album' ? 1.3 : 0.9) * RIVAL_K * RIVAL_PROJ * Math.pow(d.pop, 3.5) * Math.pow(0.3 + 0.7 * (d.proj[p.id] ?? 0.3), 2) * affinity(a.genre, c) * homeFactor(a, c.id) * G * noise)
        pr.push({ k: p.id, a: a.id, st })
      }
      out[kind][c.id] = pr.sort((x, y) => y.st - x.st).slice(0, PROJECT_ROWS)
    }
  }
  return out
}

function seedDyn(a: RivalArtist): RivalDyn {
  const h = hash(a.id)
  const rel = a.songs.slice(0, 3).map((song, i) => ({ id: song.id, week: 1 - (h % 6) - i * (5 + ((h >> 3) % 4)), q: 0.6 + (hash(song.id) % 40) / 100 }))
  return { pop: a.popularity, base: a.popularity, buzz: 0.3, label: a.labelName, rel, last: rel[0]?.week ?? -10, proj: Object.fromEntries(a.projects.map((p) => [p.id, 0.25 + (hash(p.id) % 70) / 100])) }
}

/** Monde rival initial (partie neuve ou ancienne sauvegarde sans monde rival). */
export function makeRivals(s: GameState): RivalState {
  const R: RivalState = { dyn: {}, extra: [], songs: [], projects: [], plays: {}, feud: null, chart: empty(), prev: empty(), week: s.week - 1 }
  for (const a of rivalWorld().artists) R.dyn[a.id] = seedDyn(a)
  const tmp = { ...s, rivals: R } as GameState
  R.chart = computeCharts(tmp, s.week - 1)
  R.prev = R.chart
  return R
}

/* ───────────── Accesseurs (monde statique + évolutions) ───────────── */
const staticIndex = (() => {
  let m: Map<string, RivalArtist> | null = null
  return () => (m ??= new Map(rivalWorld().artists.map((a) => [a.id, a])))
})()
const baseArtist = (s: GameState, id: string) => staticIndex().get(id) ?? s.rivals?.extra.find((x) => x.id === id)
export function rivalArtistIn(s: GameState, id: string): RivalArtist | undefined {
  const a = baseArtist(s, id)
  return a && viewArtist(s, a)
}
/** Version légère (nom, label actuel, ville) pour les classements. */
export function rivalInfo(s: GameState, id: string): { id: string; stageName: string; labelName: string } | undefined {
  const a = baseArtist(s, id)
  return a && { id, stageName: a.stageName, labelName: s.rivals?.dyn[id]?.label ?? a.labelName }
}
export function viewArtist(s: GameState, a: RivalArtist): RivalArtist {
  const R = s.rivals
  const d = R?.dyn[a.id]
  if (!R || !d) return a
  const songs = [...a.songs, ...R.songs.filter((x) => x.artistId === a.id)].map((x) => ({ ...x, plays: x.plays + (R.plays[x.id] ?? 0) }))
  return { ...a, labelName: d.label, popularity: d.pop, songs, projects: projectsOf(s, a) }
}
export function rivalSongIn(s: GameState, id: string): RivalSong | undefined {
  const own = s.rivals?.songs.find((x) => x.id === id)
  if (own) return { ...own, plays: own.plays + (s.rivals.plays[id] ?? 0) }
  const a = staticIndex().get(id.split('s')[0])
  const song = a?.songs.find((x) => x.id === id)
  return song && { ...song, plays: song.plays + (s.rivals?.plays[id] ?? 0) }
}
export function rivalProjectIn(s: GameState, id: string): RivalProject | undefined {
  return staticIndex().get(id.split('p')[0])?.projects.find((p) => p.id === id) ?? s.rivals?.projects?.find((p) => p.id === id)
}
/** Labels rivaux avec l'effectif actuel (les transferts déplacent les artistes). */
export function rivalLabelsIn(s: GameState): (RivalLabel & { prestige: number })[] {
  const R = s.rivals
  return rivalWorld().labels.map((l) => {
    const ids = allRivalArtists(s).filter((a) => (R?.dyn[a.id]?.label ?? a.labelName) === l.name).map((a) => a.id)
    const prestige = ids.length ? ids.reduce((t, id) => t + (R?.dyn[id]?.pop ?? 0.3), 0) / ids.length : 0
    return { ...l, artistIds: ids, prestige }
  })
}
export const rivalLabelIn = (s: GameState, name: string) => rivalLabelsIn(s).find((l) => l.name === name)
/** Labels les plus prestigieux : ce sont eux qui débauchent et signent. */
export const topRivalLabels = (s: GameState, n = 4) => [...rivalLabelsIn(s)].sort((a, b) => b.prestige - a.prestige).slice(0, n)

/* ───────────── Écriture de titres et d'artistes ───────────── */
const LANGS = ['français', 'nouchi', 'anglais']
const MOODS = ['Mélancolique', 'Solaire', 'Intense']
function newTitle(s: GameState, rng: Rng, genre: string) {
  const taken = [...rivalWorld().artists.flatMap((a) => a.songs.map((x) => x.title)), ...s.rivals.songs.map((x) => x.title), ...s.songs.map((x) => x.title)]
  return generateTitle(rng, { theme: rng.pick(TITLE_THEMES), mood: rng.pick(MOODS), lang: rng.pick(LANGS), genre }, taken)
}
function releaseSong(s: GameState, rng: Rng, a: RivalArtist, d: RivalDyn): RivalSong {
  const R = s.rivals
  const n = R.songs.filter((x) => x.artistId === a.id).length
  const song: RivalSong = { id: `${a.id}s${100 + n}`, title: newTitle(s, rng, a.genre), artistId: a.id, genre: a.genre, plays: 0 }
  R.songs.push(song)
  const q = clamp(0.5 + 0.5 * rng.next() + (d.pop > 0.7 ? 0.08 : 0), 0.4, 1.05)
  d.rel.unshift({ id: song.id, week: s.week, q })
  d.rel = d.rel.slice(0, MAX_REL)
  d.last = s.week
  d.buzz = Math.min(1.2, d.buzz + 0.45 + 0.3 * q)
  d.pop = clamp(d.pop + 0.012 * (q - 0.7), 0.15, 1)
  return song
}
function makeExtra(s: GameState, rng: Rng, o: { id: string; stage: string; real: string; city: string; genre: string; label: string; pop: number }): RivalArtist {
  const a: RivalArtist = {
    id: o.id, stageName: o.stage, realName: o.real, originCityId: o.city, genre: o.genre, labelName: o.label, popularity: o.pop, songs: [], projects: [],
    contract: { royalty: Math.round((0.2 + 0.25 * rng.next()) * 100) / 100, yearsLeft: rng.int(2, 4), scope: 'region', since: s.week },
  }
  s.rivals.extra.push(a)
  const d: RivalDyn = { pop: o.pop, base: o.pop, buzz: 0.4, label: o.label, rel: [], last: s.week, proj: {} }
  s.rivals.dyn[a.id] = d
  for (let i = 0; i < 2; i++) { releaseSong(s, rng, a, d); d.rel[0].week = s.week - 2 - i * 5; d.rel[0].q *= 0.9 }
  d.last = s.week - 2
  return a
}

/** Un label rival signe un candidat du vivier : il rejoint le monde rival et sort des titres. */
export function signToRival(s: GameState, cand: Artist, notes: Notes) {
  const rng = drawRng(s)
  const label = rng.pick(topRivalLabels(s, 6)).name
  const pop = clamp(0.18 + 0.12 * cand.potential + rng.next() * 0.05, 0.2, 0.85)
  makeExtra(s, rng, { id: `rx-${cand.id}`, stage: cand.stageName, real: cand.realName, city: cand.originCityId, genre: cand.genre, label, pop })
  notes.push({ tag: 'Rival', text: `${label} a signé ${cand.stageName} (${cityById(cand.originCityId).name}, ${cand.genre}) : un concurrent de plus sur ce créneau.`, tone: 'r' })
}
/** Un artiste quitte votre label pour un concurrent : on le retrouvera dans les classements. */
export function departToRival(s: GameState, a: Artist, label?: string) {
  const rng = drawRng(s)
  const fans = Object.values(a.fans).reduce((t, v) => t + v, 0)
  const name = label ?? rng.pick(topRivalLabels(s, 3)).name
  const pop = clamp(0.2 + a.potential * 0.1 + Math.min(0.2, fans / 4_000_000), 0.2, 0.9)
  makeExtra(s, rng, { id: `rx-${a.id}`, stage: a.stageName, real: a.realName, city: a.originCityId, genre: a.genre, label: name, pop })
  return name
}

/* ───────────── Tick hebdomadaire ───────────── */
export function rivalsTick(s: GameState, notes: Notes) {
  s.rivals ??= makeRivals(s)
  const R = s.rivals
  R.projects ??= []
  const W = s.week
  const rng = drawRng(s)
  const arts = allRivalArtists(s)
  let announced = 0
  R.prev = R.chart
  for (const a of arts) {
    const d = (R.dyn[a.id] ??= seedDyn(a))
    d.buzz *= 0.9
    d.pop = clamp(d.pop + (d.base - d.pop) * 0.02 + (rng.next() - 0.5) * 0.02 + (d.buzz > 0.8 ? 0.004 : 0), 0.15, 1)
    d.base = clamp(d.base + (rng.next() - 0.5) * 0.006, 0.15, 1)
    for (const p of projectsOf(s, a)) {
      d.proj[p.id] = Math.max(0.15, (d.proj[p.id] ?? 0.3) * 0.985)
      if (rng.chance(0.004 + 0.008 * d.pop)) {
        d.proj[p.id] = 1
        if (d.pop >= 0.7 && announced < 2) { announced++; notes.push({ tag: 'Industrie', text: `${p.kind === 'Album' ? 'L’album' : 'L’EP'} « ${p.name} » de ${a.stageName} (${d.label}) repart à la hausse après une réédition augmentée.`, tone: 'i' }) }
      }
    }
    const feuding = R.feud && (R.feud.artistA === a.id || R.feud.artistB === a.id)
    let due = d.planned !== undefined && W >= d.planned
    if (d.planned === undefined && W - d.last >= 4 && rng.chance(0.04 + 0.1 * d.pop + (feuding ? 0.15 : 0))) { d.planned = W + rng.int(0, 3); due = d.planned <= W }
    if (due) {
      d.planned = undefined
      const song = releaseSong(s, rng, a, d)
      const q = d.rel[0].q
      d.since = (d.since ?? 0) + 1
      if ((d.since >= 8 || (d.since >= 4 && rng.chance(0.35))) && announced < 3) {
        const album = d.since >= 8
        const mine = R.songs.filter((x) => x.artistId === a.id).slice(-(album ? 8 : rng.int(3, 5)))
        const taken = [...rivalWorld().artists.flatMap((x) => x.projects.map((p) => p.name)), ...R.projects.map((p) => p.name), ...s.projects.map((p) => p.name)]
        const proj: RivalProject = { id: `${a.id}p${100 + R.projects.filter((p) => p.artistId === a.id).length}`, name: generateProjectName(rng, { kind: album ? 'Album' : 'EP', lang: rng.pick(LANGS), artist: a.stageName }, taken), kind: album ? 'Album' : 'EP', artistId: a.id, songIds: mine.map((x) => x.id), year: Math.ceil(W / 52) }
        R.projects.push(proj)
        for (const x of mine) x.projectId = proj.id
        d.proj[proj.id] = 1; d.since = 0; d.buzz = Math.min(1.2, d.buzz + 0.3)
        if (d.pop >= 0.5) { announced++; notes.push({ tag: 'Industrie', text: `${d.label} : ${a.stageName} publie ${album ? 'l’album' : 'l’EP'} « ${proj.name} ».`, tone: 'i' }) }
      }
      if (d.pop >= 0.6 && announced < 2) { announced++; notes.push({ tag: 'Industrie', text: `${d.label} : ${a.stageName} sort « ${song.title} » (${a.genre}).`, tone: 'i' }) }
      if (d.pop > 0.4 && s.rivalMoves.length < 3 && rng.chance(0.55)) {
        const mine = new Set(s.artists.flatMap((x) => Object.keys(x.fans)))
        const origin = cityById(a.originCityId)
        const cands = CITIES.filter((c) => c.minRep <= s.reputation + 20)
        const scored = cands.map((c) => ({ c, k: (mine.has(c.id) ? 1 : 0) + (c.region === origin.region ? 0.6 : 0) + rng.next() })).sort((x, y) => y.k - x.k)
        const cityIds = scored.slice(0, rng.int(1, 3)).map((x) => x.c.id)
        const strength = Math.round((0.06 + d.pop * 0.2) * 100) / 100
        s.rivalMoves.push({ id: `rm-${W}-${s.rivalMoves.length}`, week: W, until: W + rng.int(3, 5), label: d.label, artist: a.stageName, title: song.title, genre: a.genre, cityIds, strength })
        notes.push({ tag: 'Rival', text: `${d.label} lâche « ${song.title} » (${a.stageName}, ${a.genre}) à ${cityIds.map((id) => cityById(id).name).join(', ')} : vos titres de ce genre y perdent du terrain.`, tone: 'r' })
      }
      if (d.pop >= 0.75 && q > 0.85 && rng.chance(0.25)) {
        addTrend(s, { genre: a.genre, mult: 1 + rng.int(8, 18) / 100, start: W, until: W + 5, kind: 'viral', cause: `« ${song.title} » de ${a.stageName} entraîne le genre` })
        notes.push({ tag: 'Tendance', text: `« ${song.title} » de ${a.stageName} fait grimper le ${a.genre} pendant quelques semaines.`, tone: 'c' })
      }
    }
  }
  // transferts : un artiste rejoint un label plus prestigieux
  if (rng.chance(0.04)) {
    const labels = rivalLabelsIn(s)
    const a = rng.pick(arts)
    const d = R.dyn[a.id]
    const own = labels.find((l) => l.name === d.label)
    const better = labels.filter((l) => l.prestige > (own?.prestige ?? 0) && l.name !== d.label)
    if (d && better.length) {
      const to = rng.pick(better).name
      notes.push({ tag: 'Industrie', text: `Transfert : ${a.stageName} quitte ${d.label} pour ${to}.`, tone: 'i' })
      d.label = to; d.buzz = Math.min(1.2, d.buzz + 0.3)
    }
  }
  // brouilles entre labels
  if (R.feud && R.feud.until < W) {
    notes.push({ tag: 'Industrie', text: `La brouille entre ${R.dyn[R.feud.artistA]?.label ?? '?'} et ${R.dyn[R.feud.artistB]?.label ?? '?'} s'apaise.`, tone: 'i' })
    R.feud = null
  } else if (R.feud) {
    for (const id of [R.feud.artistA, R.feud.artistB]) R.dyn[id].buzz = Math.min(1.2, R.dyn[id].buzz + 0.12)
  } else if (rng.chance(0.03)) {
    const stars = arts.filter((a) => R.dyn[a.id].pop >= 0.45)
    const x = rng.pick(stars), y = rng.pick(stars)
    if (x.id !== y.id && R.dyn[x.id].label !== R.dyn[y.id].label) {
      R.feud = { a: R.dyn[x.id].label, b: R.dyn[y.id].label, artistA: x.id, artistB: y.id, until: W + 5 }
      R.dyn[x.id].buzz = R.dyn[y.id].buzz = 1.1
      notes.push({ tag: 'Industrie', text: `Brouille : ${x.stageName} (${R.dyn[x.id].label}) et ${y.stageName} (${R.dyn[y.id].label}) s'envoient des titres incendiaires.`, tone: 'i' })
    }
  }
  R.chart = computeCharts(s, W, true)
  R.week = W
}

/** Sorties de rivaux annoncées pour une semaine donnée (les stars sont visibles du public à l'avance). */
export function plannedReleases(s: GameState, week: number): { artist: string; label: string; pop: number }[] {
  const R = s.rivals
  return allRivalArtists(s).flatMap((a) => { const d = R?.dyn[a.id]; return d && d.planned === week && d.pop >= 0.55 ? [{ artist: a.stageName, label: d.label, pop: d.pop }] : [] })
}
