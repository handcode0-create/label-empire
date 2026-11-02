import { staffSkill, clone, fail, ok, spend, useAp, drawRng } from './util'
import type { GameState, Result } from './types'

export type Thread = 'ecoutes' | 'argent' | 'temoins'
export interface Clue { id: string; title: string; text: string; thread: Thread; skill: string; cost: number; x: number; y: number }

export const THREADS: Record<Thread, { name: string; color: string }> = {
  ecoutes: { name: 'Écoutes achetées', color: '#35D3F0' },
  argent: { name: 'Flux d’argent', color: '#FFC63D' },
  temoins: { name: 'Témoins', color: '#3DDC97' },
}

/** Les huit pièces du dossier, placées sur le tableau (x, y en % de la planche). */
export const CLUES: Clue[] = [
  { id: 'pics', title: 'Pics d’écoutes à 3 h du matin', text: 'Les titres Meridian explosent la nuit des sorties, quand personne n’écoute.', thread: 'ecoutes', skill: 'marketing', cost: 1500, x: 6, y: 8 },
  { id: 'bots', title: 'Fermes de comptes automatisés', text: 'Des milliers de comptes sans amis ni historique lisent les mêmes titres en boucle.', thread: 'ecoutes', skill: 'reseau', cost: 2000, x: 36, y: 6 },
  { id: 'playlists', title: 'Playlists « indépendantes » de Meridian', text: 'Des playlists qui paraissent neutres appartiennent à une société du groupe.', thread: 'ecoutes', skill: 'marketing', cost: 1500, x: 68, y: 10 },
  { id: 'virements', title: 'Virements vers des sociétés écrans', text: 'De grosses sommes quittent Meridian pour des sociétés sans salariés.', thread: 'argent', skill: 'finance', cost: 2500, x: 4, y: 42 },
  { id: 'factures', title: 'Factures « campagne d’écoute »', text: 'Chaque sortie est précédée d’une facture au libellé vague, toujours au même montant.', thread: 'argent', skill: 'finance', cost: 3000, x: 36, y: 40 },
  { id: 'contrat', title: 'Contrat type de distribution', text: 'Une clause oblige les artistes à « accepter la stratégie d’écoute du label ».', thread: 'argent', skill: 'negociation', cost: 2000, x: 68, y: 44 },
  { id: 'ancien', title: 'Un ancien employé prêt à parler', text: 'Il a quitté Meridian en claquant la porte et garde des courriels.', thread: 'temoins', skill: 'reseau', cost: 1500, x: 14, y: 70 },
  { id: 'artiste', title: 'Un artiste de Meridian qui doute', text: 'Il sait que ses chiffres ne sont pas les siens, et n’ose pas le dire.', thread: 'temoins', skill: 'reseau', cost: 2000, x: 56, y: 70 },
]
export const clueById = (id: string) => CLUES.find((c) => c.id === id)!

/** Liens qui tiennent debout : relier deux pièces qui s’éclairent mutuellement. */
export const LINKS: { a: string; b: string; text: string }[] = [
  { a: 'pics', b: 'bots', text: 'Les pics nocturnes viennent des fermes de comptes.' },
  { a: 'bots', b: 'virements', text: 'Les fermes sont payées par les sociétés écrans.' },
  { a: 'virements', b: 'factures', text: 'Les virements correspondent aux factures « campagne d’écoute ».' },
  { a: 'factures', b: 'ancien', text: 'L’ancien employé confirme l’origine des factures.' },
  { a: 'playlists', b: 'pics', text: 'Les playlists déclenchent le pic nocturne.' },
  { a: 'contrat', b: 'artiste', text: 'L’artiste est tenu par la clause du contrat type.' },
  { a: 'playlists', b: 'contrat', text: 'Les playlists sont imposées par le contrat de distribution.' },
  { a: 'ancien', b: 'bots', text: 'L’ancien employé a vu la liste des fermes de comptes.' },
]
const key = (a: string, b: string) => [a, b].sort().join('|')
const linkOf = (a: string, b: string) => LINKS.find((l) => key(l.a, l.b) === key(a, b))

export const inquiryOpen = (g: GameState) => (g.seenScenes ?? []).includes('presse-awa')
const state = (s: GameState) => (s.inquiry ??= { clues: {}, links: [], heat: 0 })

export function inquiryStrength(g: Pick<GameState, 'inquiry'>): number {
  const q = g.inquiry
  if (!q) return 0
  return Object.keys(q.clues).length + q.links.length * 2 + Object.values(q.clues).filter((c) => c.verified).length
}
export const MAX_STRENGTH = CLUES.length + LINKS.length * 2 + CLUES.length
export type Tier = 0 | 1 | 2
export const tierOf = (strength: number): Tier => (strength >= 18 ? 2 : strength >= 8 ? 1 : 0)
export const TIER_NAME = ['Dossier fragile', 'Dossier solide', 'Dossier irréfutable'] as const

/** Chance de réussir une démarche : dépend du bon profil dans l’équipe. */
export const successChance = (s: GameState, clue: Clue) => Math.min(0.9, 0.5 + 0.06 * staffSkill(s, clue.skill))

export function investigate(s0: GameState, id: string): Result {
  if (!inquiryOpen(s0)) return fail(s0, 'L’enquête n’est pas encore ouverte : rencontrez Awa Sylla.')
  const clue = CLUES.find((c) => c.id === id)
  if (!clue) return fail(s0, 'Indice inconnu.')
  if (s0.inquiry?.clues[id]) return fail(s0, 'Cet indice est déjà au dossier.')
  const s = clone(s0)
  const e = useAp(s) ?? spend(s, clue.cost, `Enquête : ${clue.title}`)
  if (e) return fail(s0, e)
  const q = state(s)
  const rng = drawRng(s)
  if (rng.chance(successChance(s, clue))) {
    q.clues[id] = { week: s.week }
    return ok(s, `Indice trouvé : « ${clue.title} ».`)
  }
  q.heat += 1
  let msg = 'Votre source reste muette. Rien de neuf cette fois, mais ça se sait.'
  if (q.heat >= 3 && !q.alerted) {
    q.alerted = true
    s.meridian = { phase: 'offensive', until: s.week + 4, since: s.week }
    s.news ??= []
    s.news.unshift({ id: `inq-${s.week}`, week: s.week, tag: 'Coulisses', text: 'Meridian a flairé qu’on fouille dans ses comptes : offensive contre le label pendant 4 semaines.', tone: 'r' })
    msg = 'Trop de questions : Meridian a flairé l’enquête et lance une offensive de 4 semaines.'
  }
  return { state: s, error: msg }
}

export function linkClues(s0: GameState, a: string, b: string): Result {
  const q0 = s0.inquiry
  if (a === b || !q0?.clues[a] || !q0?.clues[b]) return fail(s0, 'Il faut deux indices déjà trouvés.')
  if (q0.links.includes(key(a, b))) return fail(s0, 'Ces deux pièces sont déjà reliées.')
  const l = linkOf(a, b)
  if (!l) return fail(s0, 'Ces deux pièces n’ont pas de lien établi pour l’instant.')
  const s = clone(s0)
  state(s).links.push(key(a, b))
  return ok(s, `Lien établi : ${l.text}`)
}
export const isLinked = (g: GameState, a: string, b: string) => !!g.inquiry?.links.includes(key(a, b))
export const linkText = (a: string, b: string) => linkOf(a, b)?.text

/** Demander à Awa de recouper un indice : prêt dans deux semaines, il compte alors double. */
export function verifyClue(s0: GameState, id: string): Result {
  const c = s0.inquiry?.clues[id]
  if (!c) return fail(s0, 'Indice introuvable.')
  if (c.verified) return fail(s0, 'Cet indice est déjà vérifié.')
  if (c.verifyDue) return fail(s0, 'Awa vérifie déjà cet indice.')
  const s = clone(s0)
  const e = useAp(s) ?? spend(s, 1500, 'Vérification par Awa')
  if (e) return fail(s0, e)
  s.inquiry!.clues[id].verifyDue = s.week + 2
  return ok(s, 'Awa recoupe l’indice : réponse dans deux semaines.')
}

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
/** Chaque semaine : la vérification d’Awa aboutit, et la méfiance de Meridian retombe un peu. */
export function inquiryTick(s: GameState, notes: Notes) {
  const q = s.inquiry
  if (!q) return
  for (const [id, c] of Object.entries(q.clues)) {
    if (c.verifyDue && c.verifyDue <= s.week) {
      c.verifyDue = undefined; c.verified = true
      notes.push({ tag: 'Enquête', text: `Awa a recoupé « ${clueById(id).title} » : l’indice est solide.`, tone: 'g' })
    }
  }
  if (s.week % 4 === 0 && q.heat > 0) q.heat -= 1
}
