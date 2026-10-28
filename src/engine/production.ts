import { wk } from '../lib'
import { mediaById } from '../data/media'
import { LOC_OPTIONS, MASTERING, MIX_OPTIONS, SESSION_OPTIONS, studioById, STUDIOS, type Studio } from '../data/people'
import { CITIES, cityById } from '../data/world'
import { hash } from './rng'
import { songQuality } from './quality'
import type { Artist, Feat, GameState, Result, Song, SongRelease } from './types'
import { clamp, clone, drawRng, fail, money, ok, spend, staffSkill, useAp } from './util'

export interface SongDraft { title: string; artistId: string; genre: string; theme: string; lang: string; mood: string; lyrics: string; writer: 'artiste' | 'externe'; feat?: { kind: 'label' | 'externe'; id: string } }
export const EXTERNAL_WRITER_COST = 2000
/** Cachet d'un artiste externe pour un feat : selon le potentiel et la notoriété. */
export const featFee = (a: Artist) => Math.max(1500, Math.round((a.potential * a.potential * 500 + Object.values(a.fans).reduce((t, v) => t + v, 0) * 0.02) / 100) * 100)
export const featBonus = (a: Artist) => clamp(Math.round(((a.skills.voix ?? 0) + (a.skills.charisme ?? 0)) / 2 * 0.1 + a.potential * 0.8 - 3), 0, 9)
export function makeFeat(a: Artist, external: boolean): Feat {
  return { name: a.stageName, artistId: external ? undefined : a.id, poolId: external ? a.id : undefined, cityId: a.originCityId, fee: external ? featFee(a) : 0, share: external ? 0.12 : 0, bonus: featBonus(a), fans: { ...a.fans } }
}
export const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length

export function lyricsEstimate(s: GameState, d: Pick<SongDraft, 'artistId' | 'lyrics' | 'writer' | 'theme'>) {
  const a = s.artists.find((x) => x.id === d.artistId)
  const ecr = a?.skills.ecriture ?? 40
  const cre = a?.skills.creativite ?? 40
  const lenBonus = Math.min(14, words(d.lyrics) / 8)
  const ecriture = clamp(Math.round(0.55 * ecr + 0.2 * cre + lenBonus + (d.writer === 'externe' ? 8 : 0)), 10, 98)
  const lines = d.lyrics.split('\n').filter((l) => l.trim())
  const unique = new Set(lines.map((l) => l.trim().toLowerCase())).size
  return {
    ecriture,
    originalite: clamp(Math.round(30 + cre * 0.5 + (unique / Math.max(lines.length, 1)) * 15), 10, 98),
    coherence: clamp(Math.round(45 + Math.min(lines.length, 12) * 3 + ecr * 0.15), 10, 98),
    refrain: clamp(Math.round(40 + (d.lyrics.toLowerCase().includes('[refrain]') ? 25 : 0) + ecr * 0.2), 10, 98),
  }
}

export function writeSong(s0: GameState, d: SongDraft): Result {
  const s = clone(s0)
  if (!d.title.trim()) return fail(s0, 'Donnez un titre à la chanson.')
  const a = s.artists.find((x) => x.id === d.artistId)
  if (!a) return fail(s0, 'Choisissez un artiste (signez-en un ou cochez « artiste » à la création).')
  if (s.songs.some((x) => x.title.trim().toLowerCase() === d.title.trim().toLowerCase())) return fail(s0, 'Un de vos titres porte déjà ce nom : choisissez-en un autre (le bouton dé en propose).')
  if (words(d.lyrics) < 8) return fail(s0, 'Écrivez au moins quelques lignes de paroles (8 mots minimum).')
  const e = useAp(s)
  if (e) return fail(s0, e)
  let feat: Feat | undefined
  if (d.feat) {
    const partner = d.feat.kind === 'label' ? s.artists.find((x) => x.id === d.feat!.id) : s.pool.find((x) => x.id === d.feat!.id)
    if (!partner) return fail(s0, 'Partenaire du feat introuvable.')
    if (partner.id === d.artistId) return fail(s0, 'Un artiste ne peut pas faire un feat avec lui-même.')
    feat = makeFeat(partner, d.feat.kind === 'externe')
    if (d.feat.kind === 'label') { const k = [d.artistId, partner.id].sort().join('|'); s.relations ??= {}; s.relations[k] = Math.min(100, (s.relations[k] ?? 0) + 6) }
  }
  if (d.writer === 'externe') { const e2 = spend(s, EXTERNAL_WRITER_COST, 'Auteur externe'); if (e2) return fail(s0, e2) }
  if (feat && feat.fee > 0) { const e3 = spend(s, feat.fee, `Feat avec ${feat.name}`); if (e3) return fail(s0, e3) }
  const rng = drawRng(s)
  const est = lyricsEstimate(s, d)
  const song: Song = {
    id: `s-${s.week}-${rng.int(1000, 9999)}`, title: d.title.trim(), artistId: d.artistId, genre: d.genre, theme: d.theme, lang: d.lang, mood: d.mood, lyrics: d.lyrics, writer: d.writer,
    lyricsQ: clamp(est.ecriture + rng.int(-4, 4) + (feat?.bonus ?? 0), 10, 98), mastering: false, stage: 'written', readyWeek: s.week + 1, hype: 0, feat,
    stats: { streams: 0, revenue: 0, fans: 0, weeks: 0, byCity: {}, lastByCity: {}, prevByCity: {}, peak: {} },
  }
  s.songs.push(song)
  return { state: s, info: `« ${song.title} » est écrit${feat ? ` en feat avec ${feat.name}` : ''}.` }
}

// ---------- studios ----------
export function studioAvailability(st: Studio, week: number): { label: string; wait: number; open: boolean } {
  const p = (hash(st.id) + week) % 8
  if (p === 7) return { label: 'Complet', wait: 0, open: false }
  if (p >= 5) return { label: `Dans ${p - 3} sem.`, wait: p - 3, open: true }
  return { label: 'Disponible', wait: 0, open: true }
}
const dist = (a: string, b: string) => { const x = cityById(a), y = cityById(b); return Math.hypot(x.x - y.x, x.y - y.y) }
export function travelCost(artistCity: string, st: Studio) {
  const d = dist(artistCity, st.cityId)
  const c = cityById(st.cityId)
  return { travel: d < 1 ? 0 : Math.round((150 + d * 12) / 10) * 10, visa: d >= 1 && c.visa ? 400 : 0, fatigue: Math.round(d * 0.4) }
}
export function recordingEstimate(s: GameState, song: Song, st: Studio, days: number) {
  const a = s.artists.find((x) => x.id === song.artistId)!
  const opt = SESSION_OPTIONS.find((o) => o.days === days) ?? SESSION_OPTIONS[1]
  const match = st.genres.includes(song.genre) ? 4 : 0
  const base = st.quality * 0.55 + a.skills.voix * 0.25 + staffSkill(s, 'production') * 2 + match + opt.q
  const fatigue = travelCost(a.originCityId, st).fatigue
  const q = clamp(Math.round(base - fatigue * 0.2), 10, 98)
  return { low: q - 2, high: q + 2, q, fatigue, weeks: opt.weeks }
}

export function bookStudio(s0: GameState, songId: string, studioId: string, days: number): Result {
  const s = clone(s0)
  const song = s.songs.find((x) => x.id === songId)
  if (!song) return fail(s0, 'Choisissez d’abord une chanson écrite.')
  if (song.stage !== 'written') return fail(s0, 'Cette chanson est déjà enregistrée.')
  const st = studioById(studioId)
  const av = studioAvailability(st, s.week)
  if (!av.open) return fail(s0, `${st.name} est complet cette semaine.`)
  const a = s.artists.find((x) => x.id === song.artistId)!
  const t = travelCost(a.originCityId, st)
  const total = st.pricePerDay * days + t.travel + t.visa
  const e = useAp(s)
  if (e) return fail(s0, e)
  const e2 = spend(s, total, `Studio ${st.name}`)
  if (e2) return fail(s0, e2)
  const est = recordingEstimate(s, song, st, days)
  const rng = drawRng(s)
  song.studioId = studioId; song.sessionDays = days
  song.recQ = clamp(est.q + rng.int(-2, 2), 10, 98)
  song.stage = 'recorded'
  song.readyWeek = Math.max(song.readyWeek, s.week) + av.wait + est.weeks
  a.fatigue = clamp(a.fatigue + est.fatigue + 5, 0, 100)
  return ok(s, `Enregistrement réservé chez ${st.name} (${money(total)}).`)
}

/** Production express d'un titre inédit non terminé (enregistrement + mixage en studio local, majoré de 25 %). */
export function expressCost(s: GameState, song: Song): number {
  if (song.stage === 'mixed') return song.readyWeek > s.week ? 1500 : 0
  const a = s.artists.find((x) => x.id === song.artistId)
  const local = STUDIOS.filter((x) => a && x.cityId === a.originCityId).sort((x, y) => x.pricePerDay - y.pricePerDay)[0] ?? STUDIOS[0]
  const rec = song.stage === 'written' ? Math.round((local.pricePerDay * 4) * 1.25) : 0
  return rec + Math.round(MIX_OPTIONS[0].cost * 1.25) + (song.stage === 'recorded' ? 400 : 0)
}
/** Termine d'un coup l'enregistrement et le mixage (appelé à la sortie d'un EP / album). */
export function expressProduce(s: GameState, song: Song) {
  if (song.stage === 'mixed') { song.readyWeek = s.week; return }
  const a = s.artists.find((x) => x.id === song.artistId)!
  if (song.stage === 'written') {
    const local = STUDIOS.filter((x) => x.cityId === a.originCityId).sort((x, y) => x.pricePerDay - y.pricePerDay)[0] ?? STUDIOS[0]
    const est = recordingEstimate(s, song, local, 4)
    song.studioId = local.id; song.sessionDays = 4; song.recQ = clamp(est.q, 10, 98)
  }
  const mix = MIX_OPTIONS[0]
  song.mixId = mix.id; song.mastering = false; song.mixQ = mix.bonus
  song.quality = clamp(qualityPreview(s, song, song.mixQ), 5, 100)
  song.stage = 'mixed'; song.readyWeek = s.week
}

export function qualityPreview(s: GameState, song: Song, mixBonus: number) {
  const a = s.artists.find((x) => x.id === song.artistId)!
  const st = song.studioId ? studioById(song.studioId) : STUDIOS[0]
  const base = songQuality({ voix: a.skills.voix, ecriture: song.lyricsQ, production: song.recQ ?? 50, studio: st.quality, arrangement: 50 + staffSkill(s, 'production') * 3, luck: 50 })
  return Math.round(clamp(base + mixBonus, 0, 100))
}

export function chooseMix(s0: GameState, songId: string, mixId: string, mastering: boolean): Result {
  const s = clone(s0)
  const song = s.songs.find((x) => x.id === songId)
  if (!song) return fail(s0, 'Aucune chanson à mixer.')
  if (song.stage !== 'recorded') return fail(s0, 'La chanson doit d’abord être enregistrée.')
  const mix = MIX_OPTIONS.find((m) => m.id === mixId)!
  const cost = mix.cost + (mastering ? MASTERING.cost : 0)
  const e = useAp(s)
  if (e) return fail(s0, e)
  if (cost > 0) { const e2 = spend(s, cost, `Mixage ${mix.name}`); if (e2) return fail(s0, e2) }
  const rng = drawRng(s)
  const noise = mix.risk === 'Moyen' ? rng.int(-4, 3) : rng.int(-2, 2)
  song.mixId = mixId; song.mastering = mastering
  song.mixQ = mix.bonus + (mastering ? MASTERING.bonus : 0) + noise
  song.quality = clamp(qualityPreview(s, song, song.mixQ) + rng.int(-2, 2), 5, 100)
  song.stage = 'mixed'
  song.readyWeek += mix.weeks
  return ok(s, `Mixage lancé : qualité finale estimée ${song.quality}.`)
}

// ---------- sortie ----------
export const STRATEGIES = {
  locale: { label: 'Locale', desc: 'Un pays, diffusion lente', risk: 'Risque faible', maxCities: 1 },
  regionale: { label: 'Régionale', desc: 'Un continent ou une zone', risk: 'Risque moyen', maxCities: 6 },
  mondiale: { label: 'Mondiale', desc: 'Sortie simultanée', risk: 'Risque élevé', maxCities: 99 },
  crossover: { label: 'Crossover', desc: 'Duo avec un autre pays', risk: 'Incertain', maxCities: 3 },
} as const

export function releaseCost(r: Pick<SongRelease, 'promo' | 'loc' | 'media'>) {
  return r.promo + r.loc.reduce((t, id) => t + (LOC_OPTIONS.find((l) => l.id === id)?.cost ?? 0), 0) + (r.media ?? []).reduce((t, id) => t + (mediaById(id)?.cost ?? 0), 0)
}

export function scheduleRelease(s0: GameState, songId: string, r: SongRelease): Result {
  const s = clone(s0)
  const song = s.songs.find((x) => x.id === songId)
  if (!song) return fail(s0, 'Choisissez une chanson mixée.')
  if (song.stage !== 'mixed') return fail(s0, song.stage === 'scheduled' || song.stage === 'released' ? 'Cette chanson est déjà programmée.' : 'La chanson doit être mixée avant la sortie.')
  if (s.projects.some((pj) => pj.status === 'brouillon' && pj.songIds.includes(songId))) return fail(s0, 'Ce titre est réservé à un EP / album : retirez-le du projet pour le sortir en single.')
  if (r.week < song.readyWeek) return fail(s0, `Le mixage ne sera prêt qu'en ${wk(song.readyWeek)}.`)
  if (r.week < s.week) return fail(s0, 'La date de sortie est passée.')
  if (!r.cityIds.length) return fail(s0, 'Choisissez au moins un territoire.')
  const strat = STRATEGIES[r.strategy]
  if (r.cityIds.length > strat.maxCities) return fail(s0, `La stratégie ${strat.label.toLowerCase()} limite à ${strat.maxCities} territoire(s).`)
  for (const id of r.cityIds) if (cityById(id).minRep > s.reputation) return fail(s0, `${cityById(id).name} est verrouillé (réputation ${cityById(id).minRep} requise).`)
  for (const id of r.media ?? []) { const m = mediaById(id); if (!m) return fail(s0, 'Média inconnu.'); if (m.minRep > s.reputation) return fail(s0, `${m.name} exige ${m.minRep} de réputation.`) }
  const locWeeks = Math.max(0, ...r.loc.map((id) => LOC_OPTIONS.find((l) => l.id === id)?.weeks ?? 0))
  if (r.week - s.week < locWeeks) return fail(s0, `Les adaptations demandent ${locWeeks} semaine(s) : choisissez une date plus tardive.`)
  const e = useAp(s)
  if (e) return fail(s0, e)
  const cost = releaseCost(r)
  if (cost > 0) { const e2 = spend(s, cost, `Sortie « ${song.title} »`); if (e2) return fail(s0, e2) }
  song.release = r; song.stage = 'scheduled'; song.standby = false
  return ok(s, `« ${song.title} » sortira en ${wk(r.week)}.`)
}

export function releaseCalendar(s: GameState, from: number, n = 6): { week: number; tag: string; tone: 'free' | 'fest' | 'rival' }[] {
  return Array.from({ length: n }, (_, i) => {
    const w = from + i
    const h = hash(`cal${w}${s.label.name}`) % 10
    if (h === 0 || h === 1) return { week: w, tag: 'Sortie rivale', tone: 'rival' as const }
    if (h === 2 || h === 3) return { week: w, tag: 'Fête nationale', tone: 'fest' as const }
    return { week: w, tag: 'Libre', tone: 'free' as const }
  })
}

export const unlockedCities = (s: GameState) => CITIES.filter((c) => c.minRep <= s.reputation)
