export const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
export const usd = (n: number) => (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString('fr-FR')
export const compact = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)))
export const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)
export const initials = (name: string) => name.split(/[\s'’-]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
import type { GameState, Song } from './engine/types'
/** Chanson courante : la sélection si elle a le bon statut, sinon la plus récente à ce statut. */
export function currentSong(g: GameState, id: string | null, stages: Song['stage'][]): Song | undefined {
  const s = g.songs.find((x) => x.id === id)
  if (s && stages.includes(s.stage)) return s
  return [...g.songs].reverse().find((x) => stages.includes(x.stage))
}
/** Titre affiché, avec le partenaire d'un feat. */
export const songName = (s: { title: string; feat?: { name: string } }) => (s.feat ? `${s.title} (feat. ${s.feat.name})` : s.title)

/** Semaine du calendrier : le jeu compte les semaines de façon cumulée (91 = semaine 39 de l'An 2). */
export const weekNo = (w: number) => ((Math.max(1, Math.round(w)) - 1) % 52) + 1
export const yearOf = (w: number) => Math.floor((Math.max(1, Math.round(w)) - 1) / 52) + 1
/** « semaine 39 (An 2) » — l'année n'est précisée qu'à partir de l'An 2. */
export const wk = (w: number) => `semaine ${weekNo(w)}${yearOf(w) > 1 ? ` (An ${yearOf(w)})` : ''}`
