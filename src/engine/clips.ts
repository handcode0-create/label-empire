import { wk } from '../lib'
import type { Clip, GameState, Result } from './types'
import { addRep, clamp, clone, drawRng, fail, ok, spend, useAp } from './util'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
export const CLIP_TIERS: Record<Clip['tier'], { label: string; desc: string; cost: number; weeks: number; q: [number, number]; rep: number }> = {
  lofi: { label: 'Clip lo-fi', desc: 'Tourné au smartphone dans le quartier, monté en interne.', cost: 4_000, weeks: 1, q: [40, 62], rep: 0.1 },
  standard: { label: 'Clip studio', desc: 'Réalisateur indépendant, décors et figurants.', cost: 15_000, weeks: 2, q: [58, 82], rep: 0.25 },
  cine: { label: 'Clip cinématographique', desc: 'Grande production, équipe de cinéma, effets visuels.', cost: 45_000, weeks: 4, q: [78, 98], rep: 0.6 },
}
export const clipCandidates = (s: GameState) => s.songs.filter((x) => !x.clip && (x.stage === 'mixed' || x.stage === 'scheduled' || x.stage === 'released'))

export function commissionClip(s0: GameState, songId: string, tier: Clip['tier']): Result {
  const s = clone(s0)
  const song = s.songs.find((x) => x.id === songId)
  if (!song) return fail(s0, 'Choisissez un titre.')
  if (song.clip) return fail(s0, 'Ce titre a déjà un clip.')
  if (!['mixed', 'scheduled', 'released'].includes(song.stage)) return fail(s0, 'Le titre doit être mixé avant de tourner un clip.')
  const t = CLIP_TIERS[tier]
  const e = useAp(s); if (e) return fail(s0, e)
  const e2 = spend(s, t.cost, `${t.label} « ${song.title} »`); if (e2) return fail(s0, e2)
  const rng = drawRng(s)
  const prod = Math.max(0, ...[s.staffSkills.production ?? 0]) // le savoir-faire de production aide un peu
  const quality = clamp(rng.int(t.q[0], t.q[1]) + Math.round(prod / 20), 10, 100)
  song.clip = { tier, cost: t.cost, quality, startWeek: s.week, readyWeek: s.week + t.weeks, status: 'tournage', views: 0, revenue: 0 }
  return ok(s, `${t.label} lancé pour « ${song.title} » : prêt en ${wk(s.week + t.weeks)}.`)
}

/** Fin de semaine : les clips sortent, les vues s'accumulent et rapportent des revenus publicitaires. Renvoie les recettes. */
export function updateClips(s: GameState, W: number, weekStreams: Record<string, number>, notes: Notes): number {
  let receipts = 0
  for (const song of s.songs) {
    const c = song.clip
    if (!c) continue
    if (c.status === 'tournage' && c.readyWeek <= W) {
      c.status = 'sorti'
      song.hype += (c.quality / 100) * 0.4
      addRep(s, CLIP_TIERS[c.tier].rep)
      notes.push({ tag: 'Clip', text: `Le clip de « ${song.title} » est en ligne (qualité ${c.quality}).`, tone: 'g' })
    } else if (c.status === 'sorti' && song.stage === 'released') {
      const v = Math.round((weekStreams[song.id] ?? 0) * (0.1 + c.quality / 250))
      c.views += v
      const rev = v * 0.0012
      c.revenue += rev
      receipts += rev
    }
  }
  return receipts
}
