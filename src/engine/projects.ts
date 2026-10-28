import { songName, wk } from '../lib'
import { expressCost, expressProduce } from './production'
import { CITIES } from '../data/world'
import type { GameState, Project, ProjectKind, Result, Song, SongRelease } from './types'
import { addRep, clone, fail, ok, spend, useAp } from './util'

export const PROJECT_RULES: Record<ProjectKind, { min: number; max: number; cost: number; hype: number; label: string }> = {
  EP: { min: 3, max: 6, cost: 3000, hype: 0.15, label: 'EP' },
  Album: { min: 7, max: 20, cost: 9000, hype: 0.3, label: 'Album' },
}

export const projectSongs = (g: GameState, p: Project): Song[] => p.songIds.map((id) => g.songs.find((s) => s.id === id)).filter((s): s is Song => !!s)
export const projectOf = (g: GameState, songId: string) => g.projects.find((p) => p.songIds.includes(songId))
/** Écoutes cumulées d'un projet (somme de ses titres). */
export const projectStreams = (g: GameState, p: Project) => projectSongs(g, p).reduce((t, s) => t + s.stats.streams, 0)
export const projectWeekly = (g: GameState, p: Project) => projectSongs(g, p).reduce((t, s) => t + Object.values(s.stats.lastByCity).reduce((a, b) => a + b, 0), 0)
export const projectQuality = (g: GameState, p: Project) => { const l = projectSongs(g, p); return l.length ? Math.round(l.reduce((t, s) => t + (s.quality ?? 0), 0) / l.length) : 0 }
export const projectKindFor = (n: number): ProjectKind => (n >= PROJECT_RULES.Album.min ? 'Album' : 'EP')

export function createProject(s0: GameState, name: string, kind: ProjectKind, artistId: string): Result {
  const s = clone(s0)
  const n = name.trim()
  if (!n) return fail(s0, 'Donnez un nom au projet.')
  if (!s.artists.some((a) => a.id === artistId)) return fail(s0, 'Choisissez un artiste du label.')
  if (s.projects.some((p) => p.name.toLowerCase() === n.toLowerCase() && p.artistId === artistId)) return fail(s0, 'Ce projet existe déjà.')
  s.projects.push({ id: `pj${s.projects.length + 1}-${s.week}`, name: n, kind, artistId, songIds: [], status: 'brouillon' })
  return ok(s, `${kind} « ${n} » créé.`)
}

/** Met un titre mixé en réserve (standby) : il n'est plus proposé comme single et attend d'être placé dans un EP / album. */
export function setStandby(s0: GameState, songId: string, on: boolean): Result {
  const s = clone(s0)
  const song = s.songs.find((x) => x.id === songId)
  if (!song) return fail(s0, 'Titre introuvable.')
  if (song.stage !== 'mixed') return fail(s0, 'Seul un titre mixé, pas encore programmé, peut être mis en standby.')
  if (!on && projectOf(s, songId)) return fail(s0, 'Ce titre est réservé à un projet : retirez-le du projet d’abord.')
  song.standby = on
  return ok(s, on ? `« ${song.title} » est en standby.` : `« ${song.title} » peut de nouveau sortir en single.`)
}

/** Pochette d'un titre ou d'un projet (style et palette). Gratuit. */
export function setCover(s0: GameState, target: 'song' | 'project', id: string, cover: { style: number; palette: number }): Result {
  const s = clone(s0)
  const t = target === 'song' ? s.songs.find((x) => x.id === id) : s.projects.find((x) => x.id === id)
  if (!t) return fail(s0, 'Introuvable.')
  t.cover = cover
  return ok(s)
}

export function assignSong(s0: GameState, projectId: string, songId: string): Result {
  const s = clone(s0)
  const p = s.projects.find((x) => x.id === projectId)
  const song = s.songs.find((x) => x.id === songId)
  if (!p || !song) return fail(s0, 'Projet ou titre introuvable.')
  if (p.status === 'sorti') return fail(s0, 'Ce projet est déjà sorti.')
  if (song.artistId !== p.artistId) return fail(s0, 'Le titre doit être du même artiste que le projet.')
  if (s.projects.some((x) => x.songIds.includes(songId))) return fail(s0, 'Ce titre est déjà dans un projet.')
  if (p.songIds.length >= PROJECT_RULES[p.kind].max) return fail(s0, `Un ${p.kind} contient au plus ${PROJECT_RULES[p.kind].max} titres.`)
  p.songIds.push(songId)
  if (song.stage === 'mixed') song.standby = true
  return ok(s, `${songName(song)} ajouté à « ${p.name} ».`)
}

export function removeSong(s0: GameState, projectId: string, songId: string): Result {
  const s = clone(s0)
  const p = s.projects.find((x) => x.id === projectId)
  if (!p) return fail(s0, 'Projet introuvable.')
  if (p.status === 'sorti') return fail(s0, 'Ce projet est déjà sorti.')
  p.songIds = p.songIds.filter((id) => id !== songId)
  return ok(s)
}

export function deleteProject(s0: GameState, projectId: string): Result {
  const s = clone(s0)
  const p = s.projects.find((x) => x.id === projectId)
  if (!p) return fail(s0, 'Projet introuvable.')
  if (p.status === 'sorti') return fail(s0, 'Un projet sorti reste dans la discographie.')
  s.projects = s.projects.filter((x) => x.id !== projectId)
  return ok(s)
}

/** Publie le projet. Les titres déjà sortis gardent leur date ; les titres mixés (standby) sortent avec le projet, la semaine suivante. */
export function releaseProject(s0: GameState, projectId: string, plan?: { cityIds?: string[]; promo?: number }): Result {
  const s = clone(s0)
  const p = s.projects.find((x) => x.id === projectId)
  if (!p) return fail(s0, 'Projet introuvable.')
  if (p.status === 'sorti') return fail(s0, 'Déjà sorti.')
  const rule = PROJECT_RULES[p.kind]
  if (p.songIds.length < rule.min) return fail(s0, `Un ${p.kind} demande au moins ${rule.min} titres (${p.songIds.length} actuellement).`)
  const songs = projectSongs(s, p)
  const ready = (x: Song) => x.stage === 'released' || (x.stage === 'mixed' && x.readyWeek <= s.week)
  const pending = songs.filter((x) => !ready(x))
  if (pending.some((x) => x.stage === 'scheduled')) return fail(s0, 'Un titre est déjà programmé en single : retirez-le du projet ou attendez sa sortie.')
  const express = pending.reduce((t, x) => t + expressCost(s, x), 0)
  if (express) { const ee = spend(s, express, `Production express (${pending.length} titre${pending.length > 1 ? 's' : ''})`); if (ee) return fail(s0, ee) }
  for (const x of pending) expressProduce(s, x)
  const toRelease = songs.filter((x) => x.stage === 'mixed')
  const unlocked = CITIES.filter((c) => c.minRep <= s.reputation)
  const cityIds = (plan?.cityIds?.length ? plan.cityIds : unlocked.slice(0, 6).map((c) => c.id)).slice(0, 6)
  const promo = toRelease.length ? Math.max(0, plan?.promo ?? 0) : 0
  const e = useAp(s); if (e) return fail(s0, e)
  const e2 = spend(s, rule.cost + promo, `${p.kind} « ${p.name} »`); if (e2) return fail(s0, e2)
  const when = s.week + 1
  for (const x of toRelease) {
    const r: SongRelease = { week: when, strategy: 'regionale', cityIds, promo: Math.round(promo / toRelease.length), loc: [] }
    x.release = r; x.stage = 'scheduled'; x.standby = false; x.exclusive = true; x.hype += 0.1
  }
  p.status = 'sorti'; p.releaseWeek = toRelease.length ? when : s.week
  for (const x of songs) x.hype += rule.hype
  addRep(s, p.kind === 'Album' ? 1 : 0.5)
  return ok(s, `${p.kind} « ${p.name} » ${toRelease.length ? `sortira en ${wk(when)} avec ${toRelease.length} inédit(s)` : 'est sorti'}${express ? ` (production express : $${express.toLocaleString('fr-FR')})` : ''} : +${Math.round(rule.hype * 100)} % de buzz.`)
}
