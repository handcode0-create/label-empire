import { GENRES } from '../data/world'
import { addTrend } from './dynamics'
import { poachOffer } from './events'
import { allRivalArtists, rivalLabelsIn, topRivalLabels } from './rivalLife'
import type { Rng } from './rng'
import type { GameState, Rumor } from './types'
import { drawRng } from './util'
import { chartFor } from './market'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
const MAX_OPEN = 3

/** Rumeurs de la presse : chacune porte sur un fait réel du monde, décidé à l'avance, qui se confirme (ou non) quelques semaines plus tard. */
export function rumorsTick(s: GameState, notes: Notes) {
  s.rumors ??= []
  const W = s.week
  const rng = drawRng(s)
  const R = s.rivals
  // 1. échéances
  for (const r of s.rumors) {
    if (r.status !== 'ouverte' || r.due > W) continue
    r.status = r.truth ? 'confirmee' : 'dementie'
    if (r.truth) apply(s, r)
    notes.push({ tag: 'Rumeur', text: r.truth ? `Confirmé : ${r.text}` : `Démenti : ${r.text}`, tone: r.truth ? 'c' : 'i' })
  }
  s.rumors = [...s.rumors.filter((r) => r.status === 'ouverte'), ...s.rumors.filter((r) => r.status !== 'ouverte').slice(-8)]
  // 2. nouvelles rumeurs
  if (s.rumors.filter((r) => r.status === 'ouverte').length >= MAX_OPEN || !rng.chance(0.22)) return
  const base = { id: `ru-${W}-${s.rumors.length}`, week: W, status: 'ouverte' as const }
  const kind = rng.pick(['sortie', 'sortie', 'transfert', 'meridian', 'offre', 'tendance'] as const)
  if (kind === 'sortie') {
    const a = rng.pick(allRivalArtists(s).filter((x) => (R.dyn[x.id]?.pop ?? 0) >= 0.45 && R.dyn[x.id].planned === undefined))
    if (!a) return
    const d = R.dyn[a.id]
    const truth = rng.chance(0.65), due = W + rng.int(2, 5)
    if (truth) d.planned = due
    s.rumors.push({ ...base, kind, due, truth, text: `${d.label} préparerait un nouveau titre de ${a.stageName} (${a.genre}).`, ref: a.id })
    notes.push({ tag: 'Rumeur', text: `On murmure que ${d.label} prépare un nouveau titre de ${a.stageName}.`, tone: 'i' })
  } else if (kind === 'transfert') {
    const a = rng.pick(allRivalArtists(s).filter((x) => (R.dyn[x.id]?.pop ?? 0) >= 0.4))
    const d = a && R.dyn[a.id]
    const to = d && topRivalLabels(s, 4).find((l) => l.name !== d.label)
    if (!a || !to) return
    s.rumors.push({ ...base, kind, due: W + rng.int(3, 6), truth: rng.chance(0.5), text: `${a.stageName} quitterait ${d.label} pour ${to.name}.`, ref: a.id, to: to.name })
    notes.push({ tag: 'Rumeur', text: `Rumeur de transfert : ${a.stageName} pourrait quitter ${d.label} pour ${to.name}.`, tone: 'i' })
  } else if (kind === 'meridian') {
    if (s.reputation < 20 || s.meridian.phase === 'offensive') return
    s.rumors.push({ ...base, kind, due: W + rng.int(4, 8), truth: rng.chance(0.5), text: 'Meridian Group lancerait une nouvelle offensive commerciale.' })
    notes.push({ tag: 'Rumeur', text: 'Des sources évoquent une offensive imminente de Meridian Group.', tone: 'r' })
  } else if (kind === 'offre') {
    const a = rng.pick(s.artists.filter((x) => !x.isFounder && !x.offer))
    if (!a) return
    const label = rng.pick(topRivalLabels(s, 3)).name
    s.rumors.push({ ...base, kind, due: W + rng.int(3, 6), truth: rng.chance(0.5), text: `${label} courtiserait ${a.stageName}.`, ref: a.id, to: label })
    notes.push({ tag: 'Rumeur', text: `Rumeur : ${label} s'intéresserait de près à ${a.stageName}. Mieux vaut soigner votre artiste.`, tone: 'e' })
  } else {
    const genre = rng.pick(GENRES as readonly string[])
    s.rumors.push({ ...base, kind, due: W + rng.int(3, 6), truth: rng.chance(0.5), text: `le ${genre} serait sur le point d'exploser.`, genre })
    notes.push({ tag: 'Rumeur', text: `Dans les couloirs de l'industrie : le ${genre} serait sur le point d'exploser.`, tone: 'i' })
  }
}

function apply(s: GameState, r: Rumor) {
  const R = s.rivals
  if (r.kind === 'transfert' && r.ref && r.to && R.dyn[r.ref]) { R.dyn[r.ref].label = r.to; R.dyn[r.ref].buzz = Math.min(1.2, R.dyn[r.ref].buzz + 0.3) }
  else if (r.kind === 'meridian') s.meridian = { phase: 'offensive', until: s.week + 6, since: s.week }
  else if (r.kind === 'offre' && r.ref && r.to) {
    const a = s.artists.find((x) => x.id === r.ref)
    if (a) { a.offer = { label: r.to, until: s.week + 6 }; s.echoes.push({ id: `ru-of-${s.week}-${a.id}`, due: s.week + 1, origin: `Offre de ${r.to}`, text: '', tone: 'r', artistId: a.id, event: poachOffer(a, r.to) }) }
  } else if (r.kind === 'tendance' && r.genre) addTrend(s, { genre: r.genre, mult: 1.2, start: s.week, until: s.week + 6, kind: 'hausse', cause: 'Une rumeur qui se confirme dans les playlists' })
}

/** Titres d'actualité tirés de l'état réel du monde (classements, tendances, brouilles, concurrence). */
export function pressItems(s: GameState, rng: Rng): { text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i'; tag: string }[] {
  const out: { text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i'; tag: string }[] = []
  const rows = chartFor(s, 'monde', s.label.hqCityId).slice(0, 10)
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(r.label, (counts.get(r.label) ?? 0) + 1)
  const [lead, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['', 0]
  if (lead && n >= 2) out.push({ tag: lead === s.label.name ? 'Industrie' : lead === 'Meridian Group' ? 'Meridian' : 'Industrie', tone: lead === s.label.name ? 'g' : 'i', text: lead === s.label.name ? `Votre label place ${n} titres dans le top 10 mondial.` : `${lead} place ${n} titres dans le top 10 mondial cette semaine.` })
  const best = [...rivalLabelsIn(s)].sort((a, b) => b.prestige - a.prestige)[0]
  if (best && rng.chance(0.4)) out.push({ tag: best.name === 'Meridian Group' ? 'Meridian' : 'Industrie', tone: 'i', text: `${best.name} reste le label le plus influent du moment (${best.artistIds.length} artistes sous contrat).` })
  const t = [...(s.trends ?? [])].filter((x) => x.until >= s.week && x.kind !== 'viral').sort((a, b) => Math.abs(b.mult - 1) - Math.abs(a.mult - 1))[0]
  if (t && rng.chance(0.35)) out.push({ tag: 'Tendance', tone: 'c', text: `Les analystes confirment : le ${t.genre} ${t.mult >= 1 ? 'domine' : 'perd du terrain'} jusqu'à la semaine ${((t.until - 1) % 52) + 1}.` })
  if (s.rivals.feud && rng.chance(0.5)) out.push({ tag: 'Industrie', tone: 'i', text: `La brouille ${s.rivals.feud.a} / ${s.rivals.feud.b} continue de faire la une des réseaux.` })
  if (s.meridian.phase === 'offensive') out.push({ tag: 'Meridian', tone: 'r', text: `Meridian Group maintient la pression${s.meridian.region ? ` en ${s.meridian.region.replace('-', ' ')}` : ''} jusqu'à la semaine ${((s.meridian.until - 1) % 52) + 1}.` })
  return out
}
