import { cityById } from '../data/world'
import { advanceWeek } from './advanceWeek'
import { weeklyFixedCosts } from './economy'
import type { GameState } from './types'

export interface AgendaItem { day: string; title: string; detail: string; tag: string; tone: 'g' | 'e' | 'c' | 'r'; link?: string }

/** Événements de la semaine en cours (Hub). */
export type ArtistStatus = 'tournee' | 'enregistrement' | 'promo' | 'inactif'
export const STATUS_LABELS: Record<ArtistStatus, string> = { tournee: 'En tournée', enregistrement: 'Enregistrement', promo: 'Promo', inactif: 'Inactif' }
export function artistStatus(s: GameState, artistId: string): ArtistStatus {
  if (s.tours.some((t) => t.artistId === artistId && t.status !== 'done' && t.stops.some((x) => x.sold === undefined))) return 'tournee'
  const mine = s.songs.filter((x) => x.artistId === artistId)
  if (mine.some((x) => x.stage === 'written' || x.stage === 'recorded' || x.stage === 'mixed')) return 'enregistrement'
  if (mine.some((x) => x.stage === 'scheduled' || (x.stage === 'released' && (x.release?.week ?? 0) >= s.week - 4))) return 'promo'
  return 'inactif'
}

export function agenda(s: GameState): AgendaItem[] {
  const out: AgendaItem[] = []
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  let d = 0
  const day = () => days[d++ % days.length]
  for (const song of s.songs) {
    if (song.release?.week === s.week && song.stage === 'scheduled') out.push({ day: day(), title: 'Sortie du single', detail: `« ${song.title} » · ${song.release.cityIds.length} territoire(s)`, tag: 'Prêt', tone: 'g', link: 'Sortie' })
    if (song.stage === 'recorded' && song.readyWeek <= s.week) out.push({ day: day(), title: 'Enregistrement terminé', detail: `« ${song.title} » attend son mixage`, tag: 'À faire', tone: 'e', link: 'Mixage' })
    if (song.stage === 'mixed' && !song.standby && song.readyWeek <= s.week) out.push({ day: day(), title: 'Titre prêt à sortir', detail: `« ${song.title} » attend une date de sortie`, tag: 'À faire', tone: 'e', link: 'Mixage' })
  }
  for (const d of s.drafts ?? []) if (s.week - d.week >= 1) out.push({ day: day(), title: 'Brouillon à finir', detail: `« ${d.title || 'Sans titre'} » · ${d.lyrics.trim().split(/\s+/).filter(Boolean).length} mots`, tag: 'Reprendre', tone: 'c', link: 'Ecriture' })
  for (const t of s.tours) for (const st of t.stops) if (st.week === s.week && st.sold === undefined) out.push({ day: day(), title: `Concert à ${cityById(st.cityId).name}`, detail: `${s.artists.find((a) => a.id === t.artistId)?.stageName} · ${st.venue}`, tag: cityById(st.cityId).visa ? 'Visa OK' : 'Prévu', tone: 'c', link: 'Tournee' })
  for (const k of s.contests) if (k.status === 'ouvert') out.push({ day: day(), title: `Concours ${k.name}`, detail: k.endWeek <= s.week ? 'Finale cette semaine' : `Finale en semaine ${k.endWeek}`, tag: 'En cours', tone: 'e', link: 'Concours' })
  for (const m of s.missions ?? []) if (m.status === 'actif' && m.deadline - s.week <= 1) out.push({ day: day(), title: `Mission : ${m.title}`, detail: m.deadline < s.week ? 'Échéance cette semaine' : `Échéance en semaine ${m.deadline}`, tag: 'Urgent', tone: 'r', link: 'Actualites' })
  const exclusive = s.pool.find((a) => a.status === 'concours' && a.exclusiveUntil && a.exclusiveUntil >= s.week)
  if (exclusive) out.push({ day: day(), title: 'Contrat à négocier', detail: `${exclusive.stageName} · ${cityById(exclusive.originCityId).name}`, tag: 'Ouvrir', tone: 'c', link: 'Profil' })
  return out.slice(0, 5)
}

export function alerts(s: GameState): { tag: string; text: string; tone: 'r' | 'e' | 'i' }[] {
  const out: { tag: string; text: string; tone: 'r' | 'e' | 'i' }[] = []
  for (const a of s.artists) if (!a.isFounder && a.morale < 40) out.push({ tag: 'Risque', text: `Moral de ${a.stageName} à ${Math.round(a.morale)}`, tone: 'r' })
  if (s.cash < weeklyFixedCosts(s).total * 4) out.push({ tag: 'Risque', text: 'Trésorerie : moins de 4 semaines de charges', tone: 'r' })
  if (s.event) out.push({ tag: 'Info', text: s.event.title, tone: 'i' })
  if (!s.songs.length) out.push({ tag: 'Info', text: 'Écrivez votre premier titre dans Studio', tone: 'i' })
  if (!s.artists.length) out.push({ tag: 'Info', text: 'Signez un artiste via « Découvrir un artiste »', tone: 'i' })
  return out.slice(0, 3)
}

/** Projection sur n semaines : on rejoue le moteur sans nouvelle action. */
export function projection(s: GameState, n = 8) {
  let cur = s
  const rows: { week: number; revenue: number; expenses: number; cash: number }[] = []
  for (let i = 0; i < n; i++) {
    cur = advanceWeek({ ...cur, event: null })
    const r = cur.report!
    rows.push({ week: r.week, revenue: r.revenue, expenses: r.expenses, cash: Math.round(cur.cash) })
  }
  return rows
}

export function fansByContinent(s: GameState): Record<string, number> {
  const out: Record<string, number> = {}
  for (const a of s.artists) for (const [id, f] of Object.entries(a.fans)) { const c = cityById(id).continent; out[c] = (out[c] ?? 0) + f }
  return out
}
export function fansByCity(s: GameState): Record<string, number> {
  const out: Record<string, number> = {}
  for (const a of s.artists) for (const [id, f] of Object.entries(a.fans)) out[id] = (out[id] ?? 0) + f
  return out
}
