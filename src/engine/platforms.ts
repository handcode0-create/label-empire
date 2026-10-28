import { CITIES, type Continent } from '../data/world'
import type { GameState, Result } from './types'
import { clone, drawRng, fail, ok, spend, useAp } from './util'

export interface Platform {
  id: string; name: string; kind: 'streaming' | 'video'; desc: string; rate: number; minRep: number; pitchCost: number; hype: number
  share: Record<Continent, number> // part de marché par continent
}
export const PLATFORMS: Platform[] = [
  { id: 'sonora', name: 'Sonora', kind: 'streaming', desc: 'Le géant mondial du streaming audio. Playlists éditoriales très puissantes.', rate: 1, minRep: 10, pitchCost: 3_500, hype: 0.45, share: { 'Afrique': 0.2, 'Europe': 0.42, 'Amérique du Nord': 0.5, 'Amérique latine': 0.38, 'Asie': 0.25, 'Océanie': 0.48 } },
  { id: 'vibra', name: 'Vibra', kind: 'streaming', desc: 'Application sociale de playlists virales, reine des jeunes publics.', rate: 0.82, minRep: 5, pitchCost: 2_000, hype: 0.35, share: { 'Afrique': 0.18, 'Europe': 0.26, 'Amérique du Nord': 0.28, 'Amérique latine': 0.32, 'Asie': 0.2, 'Océanie': 0.26 } },
  { id: 'tembo', name: 'Tembo Music', kind: 'streaming', desc: 'La plateforme panafricaine : forte en Afrique, abonnements mobiles à bas prix.', rate: 0.62, minRep: 0, pitchCost: 800, hype: 0.3, share: { 'Afrique': 0.42, 'Europe': 0.06, 'Amérique du Nord': 0.04, 'Amérique latine': 0.04, 'Asie': 0.05, 'Océanie': 0.03 } },
  { id: 'lotus', name: 'Lotus Sound', kind: 'streaming', desc: 'Leader asiatique du streaming, avec une scène pop très exigeante.', rate: 0.9, minRep: 25, pitchCost: 4_500, hype: 0.4, share: { 'Afrique': 0.05, 'Europe': 0.08, 'Amérique du Nord': 0.06, 'Amérique latine': 0.08, 'Asie': 0.4, 'Océanie': 0.1 } },
  { id: 'clipwave', name: 'ClipWave', kind: 'video', desc: 'Plateforme vidéo : clips, courts formats et défis dansés.', rate: 0.4, minRep: 0, pitchCost: 1_500, hype: 0.3, share: { 'Afrique': 0.15, 'Europe': 0.18, 'Amérique du Nord': 0.12, 'Amérique latine': 0.18, 'Asie': 0.1, 'Océanie': 0.13 } },
]
export const platformById = (id: string) => PLATFORMS.find((p) => p.id === id)!
export const PITCH_COOLDOWN = 8

/** Écoutes d'un titre ou du label par plateforme, d'après la répartition des écoutes par continent. */
export function platformSplit(s: GameState, songs = s.songs): Record<string, number> {
  const byCont: Record<string, number> = {}
  for (const song of songs) for (const [cid, v] of Object.entries(song.stats.byCity)) { const c = CITIES.find((x) => x.id === cid); if (c) byCont[c.continent] = (byCont[c.continent] ?? 0) + v }
  const out: Record<string, number> = {}
  for (const [cont, v] of Object.entries(byCont)) {
    const shares = PLATFORMS.map((p) => p.share[cont as Continent] ?? 0)
    const tot = shares.reduce((a, b) => a + b, 0) || 1
    PLATFORMS.forEach((p, i) => { out[p.id] = (out[p.id] ?? 0) + v * (shares[i] / tot) })
  }
  return out
}

export function pitchChance(s: GameState, songId: string, platformId: string): number {
  const song = s.songs.find((x) => x.id === songId); const p = platformById(platformId)
  if (!song) return 0
  const q = (song.quality ?? 0) / 100
  const rep = s.reputation / 100
  const pr = p.minRep / 100
  return Math.max(0.05, Math.min(0.9, 0.15 + q * 0.5 + rep * 0.3 - pr * 0.3 + (song.clip?.status === 'sorti' ? 0.08 : 0)))
}
export const lastPitch = (s: GameState, songId: string, platformId: string) => [...s.pitches].reverse().find((x) => x.songId === songId && x.platformId === platformId)

/** Démarche l'équipe éditoriale d'une plateforme pour placer un titre en playlist : coût fixe, succès incertain. */
export function pitchPlaylist(s0: GameState, songId: string, platformId: string): Result {
  const s = clone(s0)
  const song = s.songs.find((x) => x.id === songId)
  const p = PLATFORMS.find((x) => x.id === platformId)
  if (!song || !p) return fail(s0, 'Titre ou plateforme introuvable.')
  if (song.stage !== 'released') return fail(s0, 'Le titre doit être sorti pour être proposé aux playlists.')
  if (s.reputation < p.minRep) return fail(s0, `${p.name} exige ${p.minRep} de réputation.`)
  const prev = lastPitch(s, songId, platformId)
  if (prev && s.week - prev.week < PITCH_COOLDOWN) return fail(s0, `Déjà démarché : réessayez dans ${PITCH_COOLDOWN - (s.week - prev.week)} semaine(s).`)
  const e = useAp(s); if (e) return fail(s0, e)
  const e2 = spend(s, p.pitchCost, `Démarchage ${p.name}`); if (e2) return fail(s0, e2)
  const accepted = drawRng(s).chance(pitchChance(s, songId, platformId))
  s.pitches.push({ songId, platformId, week: s.week, accepted })
  if (accepted) { song.hype += p.hype; s.reputation = Math.min(100, s.reputation + 0.15) }
  return ok(s, accepted ? `${p.name} place « ${song.title} » en playlist : +${Math.round(p.hype * 100)} % de buzz.` : `${p.name} décline « ${song.title} » pour cette fois.`)
}
