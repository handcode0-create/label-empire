import { CITIES, GENRES, cityById } from '../data/world'
import { weekNo } from '../lib'
import { rivalWorld } from './rivals'
import type { Artist, Boost, GameState, Song, Trend } from './types'
import { clamp, drawRng } from './util'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]

/* ───────────── Saisons ───────────── */
export interface Season { id: string; label: string; weeks: [number, number]; genres: Record<string, number>; text: string }
export const SEASONS: Season[] = [
  { id: 'ete', label: 'Saison des festivals', weeks: [22, 36], genres: { 'Afro-pop': 1.08, Amapiano: 1.1, Dancehall: 1.1, 'Coupé-décalé': 1.06, Électro: 1.06 }, text: 'Les festivals tournent : les rythmes dansants dominent.' },
  { id: 'rentree', label: 'Rentrée', weeks: [37, 44], genres: { 'Hip-hop': 1.06, Drill: 1.08, Rock: 1.04, 'R&B': 1.04 }, text: 'La rentrée relance le hip-hop et les sorties ambitieuses.' },
  { id: 'fetes', label: 'Fêtes de fin d’année', weeks: [45, 52], genres: { Gospel: 1.16, Pop: 1.08, Zouk: 1.08, Rumba: 1.06, Zouk_: 1 }, text: 'Les fêtes favorisent le gospel, la pop et les slows.' },
  { id: 'hiver', label: 'Creux de janvier', weeks: [1, 6], genres: { Pop: 0.96, Électro: 0.95 }, text: 'Janvier est calme : le public écoute moins.' },
]
export const seasonOf = (week: number): Season | undefined => SEASONS.find((x) => weekNo(week) >= x.weeks[0] && weekNo(week) <= x.weeks[1])
export const seasonMult = (genre: string, week: number) => seasonOf(week)?.genres[genre] ?? 1

/* ───────────── Tendances ───────────── */
export const trendMult = (s: GameState, genre: string, week: number) =>
  (s.trends ?? []).filter((t) => t.genre === genre && t.start <= week && t.until >= week).reduce((m, t) => m * t.mult, 1) * seasonMult(genre, week)

export function addTrend(s: GameState, t: Omit<Trend, 'id'>) {
  s.trends ??= []
  const ex = s.trends.find((x) => x.genre === t.genre && x.kind === t.kind)
  if (ex) { ex.until = Math.max(ex.until, t.until); ex.mult = Math.max(ex.mult, t.mult); return }
  s.trends.push({ ...t, id: `t-${s.week}-${s.trends.length}-${t.genre}` })
}

function updateTrends(s: GameState, notes: Notes) {
  s.trends = (s.trends ?? []).filter((t) => t.until >= s.week)
  const rng = drawRng(s)
  const active = s.trends.filter((t) => t.kind !== 'viral')
  if (s.week % 3 === 0 && active.length < 3 && rng.chance(0.65)) {
    const genre = rng.pick(GENRES as readonly string[])
    if (!active.some((t) => t.genre === genre)) {
      const up = rng.chance(0.62)
      const weeks = rng.int(6, 11)
      const t: Omit<Trend, 'id'> = up
        ? { genre, mult: 1 + rng.int(14, 32) / 100, start: s.week, until: s.week + weeks, kind: 'hausse', cause: rng.pick(['Une playlist mondiale le met en avant', 'Un artiste international le popularise', 'Il envahit les réseaux sociaux', 'Les radios le programment massivement']) }
        : { genre, mult: 1 - rng.int(10, 24) / 100, start: s.week, until: s.week + weeks, kind: 'baisse', cause: rng.pick(['Le public se lasse du genre', 'Une overdose de sorties sature le marché', 'Les plateformes le délaissent']) }
      addTrend(s, t)
      notes.push({ tag: 'Tendance', text: `${genre} ${up ? 'monte' : 'baisse'} (${up ? '+' : '−'}${Math.round(Math.abs(t.mult - 1) * 100)} %) pendant ${weeks} semaines : ${t.cause.toLowerCase()}.`, tone: up ? 'g' : 'e' })
    }
  }
}

/* ───────────── Coups de pouce temporaires ───────────── */
export function addBoost(s: GameState, b: Omit<Boost, 'id' | 'until'> & { weeks: number }) {
  s.boosts ??= []
  s.boosts.push({ id: `b-${s.week}-${s.boosts.length}`, kind: b.kind, mult: b.mult, until: s.week + b.weeks, songId: b.songId, cityId: b.cityId, label: b.label })
}
/** Multiplicateur d'écoutes dû aux événements en cours (viralité, censure, exclusivités…). */
export function boostMult(s: GameState, song: Song, cityId: string, week: number): number {
  let m = 1
  for (const b of s.boosts ?? []) {
    if (b.until < week) continue
    if (b.kind === 'streams' && (!b.songId || b.songId === song.id)) m *= b.mult
    else if (b.kind === 'city' && b.cityId === cityId && (!b.songId || b.songId === song.id)) m *= b.mult
  }
  return m
}

/* ───────────── Rivaux ───────────── */
export const RIVAL_VERBS = ['dévoile', 'lâche', 'sort', 'balance']
function rivalMoves(s: GameState, notes: Notes) {
  s.rivalMoves = (s.rivalMoves ?? []).filter((m) => m.until >= s.week)
  const rng = drawRng(s)
  const rate = 0.22 + Math.min(0.25, s.reputation / 300)
  if (s.rivalMoves.length >= 3 || !rng.chance(rate)) return
  const world = rivalWorld()
  const pool = world.artists.filter((a) => a.popularity > 0.35)
  const a = rng.pick(pool)
  const song = rng.pick(a.songs.slice(0, 4))
  // le rival vise de préférence les marchés où le joueur est fort
  const mine = new Set(s.artists.flatMap((x) => Object.keys(x.fans)))
  const cands = CITIES.filter((c) => c.minRep <= s.reputation + 20)
  const scored = cands.map((c) => ({ c, k: (mine.has(c.id) ? 1 : 0) + rng.next() })).sort((x, y) => y.k - x.k)
  const cityIds = scored.slice(0, rng.int(1, 3)).map((x) => x.c.id)
  const strength = Math.round((0.06 + a.popularity * 0.2) * 100) / 100
  s.rivalMoves.push({ id: `rm-${s.week}-${s.rivalMoves.length}`, week: s.week, until: s.week + rng.int(3, 5), label: a.labelName, artist: a.stageName, title: song.title, genre: a.genre, cityIds, strength })
  const names = cityIds.map((id) => cityById(id).name).join(', ')
  notes.push({ tag: 'Rival', text: `${a.labelName} ${rng.pick(RIVAL_VERBS)} « ${song.title} » (${a.stageName}, ${a.genre}) à ${names} : vos titres de ce genre y perdent du terrain.`, tone: 'r' })
}
/** Part des écoutes perdue face aux sorties rivales et à l'offensive Meridian. */
export function pressureMult(s: GameState, song: Song, cityId: string, week: number): number {
  let loss = 0
  for (const m of s.rivalMoves ?? []) {
    if (m.until < week || !m.cityIds.includes(cityId)) continue
    loss += m.strength * (m.genre === song.genre ? 1 : 0.35)
  }
  const mer = s.meridian
  if (mer && mer.phase === 'offensive' && mer.until >= week) {
    const c = cityById(cityId)
    if (!mer.region || mer.region === c.region) loss += 0.1
  }
  return 1 - Math.min(0.4, loss)
}

/* ───────────── Meridian ───────────── */
function meridianTick(s: GameState, notes: Notes) {
  const m = (s.meridian ??= { phase: 'calme', until: 0, since: 0 })
  if (m.phase === 'offensive' && m.until < s.week) {
    s.meridian = { phase: 'calme', until: 0, since: s.week }
    notes.push({ tag: 'Meridian', text: 'Meridian Group relâche la pression : son offensive s’essouffle.', tone: 'g' })
    return
  }
  if (m.phase === 'calme' && s.reputation >= 25 && s.week - m.since >= 14) {
    const rng = drawRng(s)
    if (rng.chance(0.12)) {
      const regions = [...new Set(s.artists.flatMap((a) => Object.keys(a.fans)).map((id) => cityById(id).region))]
      const region = regions.length ? rng.pick(regions) : undefined
      s.meridian = { phase: 'offensive', until: s.week + rng.int(6, 9), region, since: s.week }
      notes.push({ tag: 'Meridian', text: `Meridian Group lance une offensive${region ? ` en ${region.replace('-', ' ')}` : ''} : campagnes agressives, vos écoutes reculent là-bas pendant plusieurs semaines.`, tone: 'r' })
    }
  }
}

/* ───────────── Vie des artistes ───────────── */
export const egoOf = (a: Artist) => (a.traits.some((t) => /Ambitieux|Exigeant/.test(t)) ? 72 : a.traits.some((t) => /Loyal/.test(t)) ? 25 : 45) + (a.potential >= 4 ? 8 : 0)
export const loyaltyOf = (a: Artist) => a.loyalty ?? (a.traits.includes('Loyal') ? 75 : 60)
export const relKey = (a: string, b: string) => [a, b].sort().join('|')

function artistLife(s: GameState, notes: Notes) {
  const rng = drawRng(s)
  const W = s.week
  for (const a of [...s.artists]) {
    if (a.isFounder) continue
    let l = loyaltyOf(a)
    const hit = s.songs.some((x) => x.artistId === a.id && x.stage === 'released' && (x.stats.hist?.slice(-3).reduce((t, h) => t + h.st, 0) ?? 0) > 150_000)
    const recent = s.songs.some((x) => x.artistId === a.id && x.release && W - x.release.week < 10)
    l += a.morale > 70 ? 1.2 : a.morale < 40 ? -2.2 : -0.2
    l += hit ? 1 : 0
    l += recent ? 0.4 : -0.6
    l -= (egoOf(a) - 50) / 120
    if (a.traits.includes('Loyal')) l += 0.3
    a.loyalty = clamp(l, 0, 100)
    if (a.loyalty < 25 && a.morale < 40 && rng.chance(0.06)) notes.push({ tag: 'Artiste', text: `${a.stageName} envisage de quitter le label : fidélité au plus bas (${Math.round(a.loyalty)}).`, tone: 'r' })
    if (a.departing) {
      notes.push({ tag: 'Contrat', text: `${a.stageName} quitte le label${a.contract ? ' et rejoint un concurrent' : ''}.`, tone: 'r' })
      s.artists = s.artists.filter((x) => x.id !== a.id)
    }
  }
  // relations : dérive lente vers 0, conflit si trop bas
  const rel = (s.relations ??= {})
  for (const k of Object.keys(rel)) { rel[k] = Math.round(rel[k] * 0.97 * 10) / 10; if (Math.abs(rel[k]) < 1) delete rel[k] }
}

/* ───────────── Passage de semaine ───────────── */
/** Évolutions du monde : tendances, rivaux, Meridian, artistes. Appelé à chaque semaine. */
export function worldTick(s: GameState, notes: Notes) {
  s.boosts = (s.boosts ?? []).filter((b) => b.until >= s.week)
  updateTrends(s, notes)
  rivalMoves(s, notes)
  meridianTick(s, notes)
  artistLife(s, notes)
}

export const activeTrends = (s: GameState) => (s.trends ?? []).filter((t) => t.until >= s.week).sort((a, b) => b.mult - a.mult)
