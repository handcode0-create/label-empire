import { addRep } from './util'
import type { GameState, Song } from './types'
import { projectSongs } from './projects'

export type CertLevel = 'or' | 'platine' | 'platine2' | 'platine3' | 'diamant'
export type CertKind = 'titre' | 'projet'
export interface Cert { id: string; kind: CertKind; level: CertLevel; week: number }

export const CERT_LEVELS: { level: CertLevel; label: string; color: string; rep: number; cash: number }[] = [
  { level: 'or', label: 'Disque d’or', color: '#FFC63D', rep: 0.3, cash: 5_000 },
  { level: 'platine', label: 'Disque de platine', color: '#C9D6F2', rep: 0.8, cash: 20_000 },
  { level: 'platine2', label: 'Double disque de platine', color: '#DCE6FF', rep: 1.1, cash: 40_000 },
  { level: 'platine3', label: 'Triple disque de platine', color: '#EAF0FF', rep: 1.5, cash: 65_000 },
  { level: 'diamant', label: 'Disque de diamant', color: '#35D3F0', rep: 2, cash: 100_000 },
]
/**
 * Barème de référence SNEP (France, depuis le 27 avril 2018) :
 *  - singles : or 15 M, platine 30 M, diamant 50 M d'écoutes (streams payants) ;
 *  - albums/EP : or 50 000, platine 100 000, double 200 000, triple 300 000, diamant 500 000 unités.
 * Conversion streaming → unités d'album : on additionne les écoutes de toutes les pistes,
 * la plus écoutée comptant pour moitié, puis on divise par 1 000.
 * Les seuils du jeu sont ceux de la SNEP (SNEP_SCALE = 1) ; on peut les réduire avec SNEP_SCALE < 1.
 */
export const SNEP_SCALE = 1
export const SNEP_REF = {
  titre: { or: 15_000_000, platine: 30_000_000, diamant: 50_000_000 } as Partial<Record<CertLevel, number>>,
  projetUnites: { or: 50_000, platine: 100_000, platine2: 200_000, platine3: 300_000, diamant: 500_000 } as Partial<Record<CertLevel, number>>,
  ecoutesParUnite: 1_000,
}
const ORDER: CertLevel[] = ['or', 'platine', 'platine2', 'platine3', 'diamant']
const scaled = (kind: CertKind, l: CertLevel): number | undefined => {
  const v = kind === 'titre' ? SNEP_REF.titre[l] : (SNEP_REF.projetUnites[l] ?? 0) * SNEP_REF.ecoutesParUnite || undefined
  return v === undefined ? undefined : Math.round(v * SNEP_SCALE)
}
/** Seuils d'écoutes dans le jeu (les niveaux absents du barème d'un type sont omis). */
export const CERT_THRESHOLDS: Record<CertKind, Partial<Record<CertLevel, number>>> = {
  titre: Object.fromEntries(ORDER.flatMap((l) => (scaled('titre', l) ? [[l, scaled('titre', l)]] : []))),
  projet: Object.fromEntries(ORDER.flatMap((l) => (scaled('projet', l) ? [[l, scaled('projet', l)]] : []))),
}
export const ladder = (kind: CertKind) => ORDER.filter((l) => CERT_THRESHOLDS[kind][l] !== undefined)
export const levelInfo = (l: CertLevel) => CERT_LEVELS.find((c) => c.level === l)!
/** Écoutes « équivalent album » : la piste la plus écoutée compte pour moitié. */
export const albumEquivalent = (trackStreams: number[]) => trackStreams.reduce((a, b) => a + b, 0) - (trackStreams.length ? Math.max(...trackStreams) / 2 : 0)

export function levelFor(kind: CertKind, streams: number): CertLevel | null {
  let out: CertLevel | null = null
  for (const l of ladder(kind)) if (streams >= CERT_THRESHOLDS[kind][l]!) out = l
  return out
}
export const nextLevel = (kind: CertKind, cur: CertLevel | null): CertLevel | null => { const l = ladder(kind); return cur === null ? l[0] : l[l.indexOf(cur) + 1] ?? null }
export const certOf = (g: GameState, id: string): Cert | undefined => (g.certs ?? []).find((c) => c.id === id)

/** Disques certifiés pendant la semaine : primes, réputation, notifications. */
export function checkCertifications(s: GameState, notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]) {
  s.certs ??= []
  revalidateCerts(s)
  const grant = (id: string, kind: CertKind, name: string, streams: number) => {
    const lvl = levelFor(kind, streams)
    if (!lvl) return
    const cur = s.certs.find((c) => c.id === id)
    if (cur && ORDER.indexOf(cur.level) >= ORDER.indexOf(lvl)) return
    const info = levelInfo(lvl)
    if (cur) { cur.level = lvl; cur.week = s.week } else s.certs.push({ id, kind, level: lvl, week: s.week })
    s.cash += info.cash
    addRep(s, info.rep)
    notes.push({ tag: 'Certification', text: `${info.label} pour « ${name} » (+$${info.cash.toLocaleString('fr-FR')}, +${info.rep} de réputation).`, tone: 'g' })
  }
  for (const song of s.songs as Song[]) if (song.stage === 'released') grant(song.id, 'titre', song.title, song.stats.streams)
  for (const p of s.projects) if (p.status === 'sorti') grant(p.id, 'projet', p.name, albumEquivalent(projectSongs(s, p).map((x) => x.stats.streams)))
}

/** Après un changement de barème : ramène les certifications au niveau que les écoutes justifient (les primes déjà versées restent acquises). */
export function revalidateCerts(s: GameState) {
  s.certs = (s.certs ?? []).flatMap((c) => {
    const streams = c.kind === 'titre'
      ? (s.songs.find((x) => x.id === c.id)?.stats.streams ?? 0)
      : (() => { const p = s.projects.find((x) => x.id === c.id); return p ? albumEquivalent(projectSongs(s, p).map((x) => x.stats.streams)) : 0 })()
    const lvl = levelFor(c.kind, streams)
    return lvl ? [{ ...c, level: ORDER.indexOf(lvl) < ORDER.indexOf(c.level) ? lvl : c.level }] : []
  })
}
