import { rivalWorld } from './rivals'
import type { GameState, Result } from './types'
import { clone, fail, ok, spend } from './util'

export const REBRAND_COST = 2000

export interface IdentityPatch {
  founder?: string
  labelName?: string
  logoId?: string
  avatar?: string
  look?: 'f' | 'm'
  photo?: string | null // null = retirer la photo importée
  mainGenre?: string
  nationality?: string
}

const clean = (t: string) => t.replace(/\s+/g, ' ').trim()

/** Modifie l'identité du joueur : nom, avatar, nationalité, genre, nom et logo du label. Renommer le label coûte un changement d'image. */
export function editIdentity(s0: GameState, p: IdentityPatch): Result {
  const s = clone(s0)
  const L = s.label
  if (p.founder !== undefined) {
    const n = clean(p.founder)
    if (n.length < 2 || n.length > 28) return fail(s0, 'Le nom du fondateur doit faire entre 2 et 28 caractères.')
    L.founder = n
    const me = s.artists.find((a) => a.isFounder)
    if (me) { me.stageName = n; me.realName = n; me.manager.name = n }
  }
  if (p.labelName !== undefined) {
    const n = clean(p.labelName)
    if (n !== L.name) {
      if (n.length < 2 || n.length > 24) return fail(s0, 'Le nom du label doit faire entre 2 et 24 caractères.')
      if (rivalWorld().labels.some((l) => l.name.toLowerCase() === n.toLowerCase())) return fail(s0, `« ${n} » est déjà le nom d'un label rival.`)
      const e = spend(s, REBRAND_COST, 'Changement de nom du label')
      if (e) return fail(s0, `Changer de nom coûte $${REBRAND_COST.toLocaleString('fr-FR')} (nouvelle identité, papeterie, annonces). ${e}`)
      L.name = n
      for (const a of s.artists) a.manager.agency = n
      s.news.unshift({ id: `rebrand-${s.week}`, week: s.week, tag: 'Industrie', text: `Le label change d'identité : il s'appelle désormais « ${n} ».`, tone: 'c' })
    }
  }
  if (p.logoId !== undefined) L.logoId = p.logoId
  if (p.avatar !== undefined) { L.founderAvatar = p.avatar; L.photo = undefined; if (p.look) L.founderLook = p.look }
  if (p.photo !== undefined) L.photo = p.photo ?? undefined
  if (p.mainGenre !== undefined) { L.mainGenre = p.mainGenre; const me = s.artists.find((a) => a.isFounder); if (me) me.genre = p.mainGenre }
  if (p.nationality !== undefined) { const n = clean(p.nationality); if (n.length < 2 || n.length > 24) return fail(s0, 'La nationalité doit faire entre 2 et 24 caractères.'); L.nationality = n }
  return ok(s, 'Profil mis à jour.')
}
