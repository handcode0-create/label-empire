import type { Draft, GameState, Result } from './types'
import { clone, ok } from './util'

/** Enregistre (ou met à jour) un brouillon : gratuit, sans action, conservé d'une semaine à l'autre. */
export function saveDraft(s0: GameState, d: Omit<Draft, 'week'>): Result {
  if (!d.title.trim() && !d.lyrics.trim()) return ok(s0)
  const s = clone(s0)
  s.drafts ??= []
  const cur = s.drafts.find((x) => x.id === d.id)
  const next: Draft = { ...d, week: cur?.week ?? s.week }
  if (cur) Object.assign(cur, next); else s.drafts.push(next)
  return ok(s)
}
export function deleteDraft(s0: GameState, id: string): Result {
  const s = clone(s0)
  s.drafts = (s.drafts ?? []).filter((x) => x.id !== id)
  return ok(s)
}
