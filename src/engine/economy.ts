import { wk } from '../lib'
import { RECRUITS } from '../data/people'
import { cityById } from '../data/world'
import type { GameState, Result } from './types'
import { rentFor } from './prices'
import { clamp, clone, fail, modsOf, fansInCity, money, ok, spend, staffSkill, useAp } from './util'

// ---------- équipe ----------
export function hireStaff(s0: GameState, id: string): Result {
  const s = clone(s0)
  const r = RECRUITS.find((x) => x.id === id)
  if (!r) return fail(s0, 'Candidat introuvable.')
  if (s.staff.some((m) => m.id === id)) return fail(s0, 'Déjà dans l’équipe.')
  const e = useAp(s)
  if (e) return fail(s0, e)
  const e2 = spend(s, r.salary * 4, `Embauche de ${r.name}`)
  if (e2) return fail(s0, e2)
  s.staff.push({ id: r.id, name: r.name, role: r.role, cityId: r.cityId, level: r.level, salary: r.salary, morale: 80, skill: r.skill })
  return ok(s, `${r.name} rejoint l'équipe (prime d'embauche ${money(r.salary * 4)}).`)
}
export function fireStaff(s0: GameState, id: string): Result {
  const s = clone(s0)
  const m = s.staff.find((x) => x.id === id)
  if (!m) return fail(s0, 'Membre introuvable.')
  const e2 = spend(s, m.salary * 2, `Indemnité ${m.name}`)
  if (e2) return fail(s0, e2)
  s.staff = s.staff.filter((x) => x.id !== id)
  return ok(s, `${m.name} a quitté l'équipe.`)
}
export function raiseSalary(s0: GameState, id: string): Result {
  const s = clone(s0)
  const m = s.staff.find((x) => x.id === id)
  if (!m) return fail(s0, 'Membre introuvable.')
  m.salary = Math.round(m.salary * 1.15 / 10) * 10
  m.morale = clamp(m.morale + 25, 0, 100)
  return ok(s, `${m.name} est revalorisé : ${money(m.salary)} par semaine.`)
}

// ---------- bureaux ----------
export function officeRequirement(s: GameState, cityId: string, kind: 'bureau' | 'partenaire') {
  const c = { ...cityById(cityId), rent: rentFor(s, cityId) }
  return { cost: kind === 'bureau' ? c.rent * 4 : Math.round(c.rent * 1.2), fans: Math.round((c.base * (kind === 'bureau' ? 0.1 : 0.04)) / 10000) * 10000, weeks: kind === 'bureau' ? 6 : 3, rep: c.minRep }
}
export function openOffice(s0: GameState, cityId: string, kind: 'bureau' | 'partenaire'): Result {
  const s = clone(s0)
  if (s.offices.some((o) => o.cityId === cityId)) return fail(s0, 'Vous êtes déjà présent dans cette ville.')
  const req = officeRequirement(s, cityId, kind)
  const c = cityById(cityId)
  if (s.reputation < req.rep) return fail(s0, `Réputation ${req.rep} requise pour ${c.name}.`)
  const fans = fansInCity(s, cityId)
  if (fans < req.fans) return fail(s0, `Fans insuffisants à ${c.name} : ${fans.toLocaleString('fr-FR')} sur ${req.fans.toLocaleString('fr-FR')} requis.`)
  const e = useAp(s)
  if (e) return fail(s0, e)
  const e2 = spend(s, req.cost, `Bureau de ${c.name}`)
  if (e2) return fail(s0, e2)
  s.offices.push({ cityId, kind, since: s.week + req.weeks })
  return ok(s, `${kind === 'bureau' ? 'Bureau' : 'Partenaire'} à ${c.name} : opérationnel en ${wk(s.week + req.weeks)}.`)
}

// ---------- prêt ----------
export const loanLimit = (s: GameState) => Math.round((20000 + s.reputation * 1200) / 1000) * 1000
export function takeLoan(s0: GameState): Result {
  const s = clone(s0)
  if (s.loan) return fail(s0, 'Un prêt est déjà en cours.')
  const p = loanLimit(s)
  const total = Math.round(p * 1.09)
  s.cash += p
  s.loan = { principal: p, remaining: total, weekly: Math.ceil(total / 26), weeksLeft: 26 }
  return ok(s, `Prêt de ${money(p)} accordé, remboursé sur 26 semaines (${money(total - p)} d'intérêts).`)
}
export function repayLoan(s0: GameState): Result {
  const s = clone(s0)
  if (!s.loan) return fail(s0, 'Aucun prêt en cours.')
  if (s.cash < s.loan.remaining) return fail(s0, `Trésorerie insuffisante : ${money(s.loan.remaining)} à rembourser.`)
  s.cash -= s.loan.remaining; s.spent += s.loan.remaining
  s.loan = null
  return ok(s, 'Prêt remboursé.')
}

export function weeklyFixedCosts(s: GameState) {
  const salaries = s.staff.reduce((t, m) => t + m.salary, 0)
  const rent = s.offices.filter((o) => o.since <= s.week).reduce((t, o) => t + (o.kind === 'partenaire' ? 0 : rentFor(s, o.cityId) / 4.33), 0)
  const overhead = Math.round(s.reputation * 30 + s.reputation * s.reputation * 1.2) // frais de structure : croissent plus vite que la réputation (50 → 4 500 $/sem, 100 → 15 000 $/sem)
  const k = modsOf(s).costs
  const sal = Math.round(salaries * k), rt = Math.round(rent * k), ov = Math.round(overhead * k)
  return { salaries: sal, rent: rt, overhead: ov, loan: s.loan?.weekly ?? 0, total: sal + rt + ov + (s.loan?.weekly ?? 0) }
}

// ---------- événements : voir events.ts ----------
export { makeEvent, resolveEvent } from './events'
export { staffSkill }
