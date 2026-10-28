import type { GameState, Song } from './types'
import { projectStreams } from './projects'

export type CertLevel = 'or' | 'platine' | 'diamant'
export interface Cert { id: string; kind: 'titre' | 'projet'; level: CertLevel; week: number }

export const CERT_LEVELS: { level: CertLevel; label: string; color: string; rep: number; cash: number }[] = [
  { level: 'or', label: 'Disque d’or', color: '#FFC63D', rep: 0.3, cash: 5_000 },
  { level: 'platine', label: 'Disque de platine', color: '#C9D6F2', rep: 0.8, cash: 20_000 },
  { level: 'diamant', label: 'Disque de diamant', color: '#35D3F0', rep: 2, cash: 100_000 },
]
/**
 * Barème de référence SNEP (France, en vigueur depuis juillet 2024 pour les singles) :
 * singles 15 M / 30 M / 50 M d'écoutes ; albums 50 000 / 100 000 / 500 000 unités.
 * Équivalence streaming d'un album : 1 500 écoutes = 1 unité.
 * L'univers de Bakoma est plus petit : tous les seuils sont multipliés par SNEP_SCALE.
 */
export const SNEP_SCALE = 0.2
export const SNEP_REF = {
  titre: { or: 15_000_000, platine: 30_000_000, diamant: 50_000_000 },
  projetUnites: { or: 50_000, platine: 100_000, diamant: 500_000 },
  ecoutesParUnite: 1_500,
}
const scaled = (kind: 'titre' | 'projet', l: CertLevel) => Math.round((kind === 'titre' ? SNEP_REF.titre[l] : SNEP_REF.projetUnites[l] * SNEP_REF.ecoutesParUnite) * SNEP_SCALE)
/** Seuils d'écoutes cumulées dans le jeu. Les projets (EP, albums) comptent toutes leurs pistes. */
export const CERT_THRESHOLDS: Record<'titre' | 'projet', Record<CertLevel, number>> = {
  titre: { or: scaled('titre', 'or'), platine: scaled('titre', 'platine'), diamant: scaled('titre', 'diamant') },
  projet: { or: scaled('projet', 'or'), platine: scaled('projet', 'platine'), diamant: scaled('projet', 'diamant') },
}
const ORDER: CertLevel[] = ['or', 'platine', 'diamant']
export const levelInfo = (l: CertLevel) => CERT_LEVELS.find((c) => c.level === l)!

export function levelFor(kind: 'titre' | 'projet', streams: number): CertLevel | null {
  let out: CertLevel | null = null
  for (const l of ORDER) if (streams >= CERT_THRESHOLDS[kind][l]) out = l
  return out
}
export const nextLevel = (cur: CertLevel | null): CertLevel | null => (cur === null ? 'or' : ORDER[ORDER.indexOf(cur) + 1] ?? null)
export const certOf = (g: GameState, id: string): Cert | undefined => (g.certs ?? []).find((c) => c.id === id)

/** Disques certifiés pendant la semaine : primes, réputation, notifications. */
export function checkCertifications(s: GameState, notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]) {
  s.certs ??= []
  const grant = (id: string, kind: 'titre' | 'projet', name: string, streams: number) => {
    const lvl = levelFor(kind, streams)
    if (!lvl) return
    const cur = s.certs.find((c) => c.id === id)
    if (cur && ORDER.indexOf(cur.level) >= ORDER.indexOf(lvl)) return
    const info = levelInfo(lvl)
    if (cur) { cur.level = lvl; cur.week = s.week } else s.certs.push({ id, kind, level: lvl, week: s.week })
    s.cash += info.cash
    s.reputation = Math.min(100, s.reputation + info.rep)
    notes.push({ tag: 'Certification', text: `${info.label} pour « ${name} » (+$${info.cash.toLocaleString('fr-FR')}, +${info.rep} de réputation).`, tone: 'g' })
  }
  for (const song of s.songs as Song[]) if (song.stage === 'released') grant(song.id, 'titre', song.title, song.stats.streams)
  for (const p of s.projects) if (p.status === 'sorti') grant(p.id, 'projet', p.name, projectStreams(s, p))
}
