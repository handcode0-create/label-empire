import { wk } from '../lib'
import { RECRUITS } from '../data/people'
import { cityById } from '../data/world'
import type { EventChoice, GameEvent, GameState, Result } from './types'
import { clamp, clone, drawRng, fail, fansInCity, money, ok, spend, staffSkill, useAp } from './util'

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
export function officeRequirement(cityId: string, kind: 'bureau' | 'partenaire') {
  const c = cityById(cityId)
  return { cost: kind === 'bureau' ? c.rent * 4 : Math.round(c.rent * 1.2), fans: Math.round((c.base * (kind === 'bureau' ? 0.1 : 0.04)) / 10000) * 10000, weeks: kind === 'bureau' ? 6 : 3, rep: c.minRep }
}
export function openOffice(s0: GameState, cityId: string, kind: 'bureau' | 'partenaire'): Result {
  const s = clone(s0)
  if (s.offices.some((o) => o.cityId === cityId)) return fail(s0, 'Vous êtes déjà présent dans cette ville.')
  const req = officeRequirement(cityId, kind)
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
  const rent = s.offices.filter((o) => o.since <= s.week).reduce((t, o) => t + (o.kind === 'partenaire' ? 0 : cityById(o.cityId).rent / 4.33), 0)
  const overhead = Math.round(s.reputation * 30) // frais de structure : un label plus gros coûte plus cher
  return { salaries, rent: Math.round(rent), overhead, loan: s.loan?.weekly ?? 0, total: salaries + Math.round(rent) + overhead + (s.loan?.weekly ?? 0) }
}

// ---------- événements ----------
export function makeEvent(s: GameState): GameEvent | null {
  const rng = drawRng(s)
  if (!rng.chance(0.4)) return null
  const id = `e-${s.week}`
  const reached = s.stats.countriesReached.map(cityById).filter((c) => !['USD', 'EUR'].includes(c.currency))
  const kinds: string[] = ['rival']
  if (reached.length) kinds.push('fx')
  if (s.artists.some((a) => !a.isFounder)) kinds.push('raise')
  if (s.songs.some((x) => x.stage === 'released' && s.week - (x.release?.week ?? 0) < 4)) kinds.push('viral')
  if (s.artists.length) kinds.push('gig')
  const kind = rng.pick(kinds)
  if (kind === 'fx') {
    const c = rng.pick(reached)
    return { id, kind, week: s.week, cityId: c.id, title: `La monnaie locale chute (${c.country})`, text: `Vos revenus en attente de ${c.name} perdent 9 % cette semaine. Un partenaire local peut couvrir une partie du risque de change.`, choices: [
      { id: 'accept', label: 'Accepter la perte', detail: 'Certain : −9 % sur les revenus en attente', cost: 0 },
      { id: 'hedge', label: 'Négocier avec un partenaire local', detail: 'Estimé : la perte tombe à 3 %', cost: 1500 }] }
  }
  if (kind === 'raise') {
    const a = rng.pick(s.artists.filter((x) => !x.isFounder))
    return { id, kind, week: s.week, title: `${a.stageName} demande une revalorisation`, text: `Le manager de ${a.stageName} réclame une prime. Son moral est en jeu.`, choices: [
      { id: 'pay', label: 'Verser une prime', detail: 'Certain : moral +20', cost: 2500 },
      { id: 'refuse', label: 'Refuser', detail: 'Risque : moral −15', cost: 0 }] }
  }
  if (kind === 'viral') {
    const song = s.songs.filter((x) => x.stage === 'released').slice(-1)[0]
    return { id, kind, week: s.week, title: `« ${song.title} » devient viral`, text: 'Un extrait explose sur les réseaux sociaux. Vous pouvez amplifier le mouvement.', choices: [
      { id: 'push', label: 'Investir dans la promotion', detail: 'Estimé : écoutes +60 % pendant 2 semaines', cost: 3000 },
      { id: 'wait', label: 'Laisser faire', detail: 'Estimé : écoutes +25 %', cost: 0 }] }
  }
  if (kind === 'gig') {
    const a = rng.pick(s.artists)
    const c = cityById(a.originCityId)
    return { id, kind, week: s.week, cityId: c.id, title: `Invitation au ${c.festivals[0]}`, text: `${a.stageName} est invité à jouer à ${c.name}. Cachet à la clé, mais de la fatigue en plus.`, choices: [
      { id: 'go', label: 'Accepter', detail: 'Estimé : +$4 000, +300 fans, fatigue +10', cost: 0 },
      { id: 'no', label: 'Décliner', detail: 'Aucun effet', cost: 0 }] }
  }
  const c = rng.pick(['Paris', 'Lagos', 'Londres', 'Johannesburg'])
  return { id, kind: 'rival', week: s.week, title: `Un rival sort un titre à ${c}`, text: `Un label concurrent sort un single à ${c} cette semaine. Surveillez vos classements.`, choices: [{ id: 'ok', label: 'Noté', detail: 'Information', cost: 0 }] }
}

export function resolveEvent(s0: GameState, choiceId: string): Result {
  const s = clone(s0)
  const ev = s.event
  if (!ev || ev.resolved) return fail(s0, 'Aucun événement à traiter.')
  const ch: EventChoice | undefined = ev.choices.find((c) => c.id === choiceId)
  if (!ch) return fail(s0, 'Choix inconnu.')
  if (ch.cost > 0) { const e = spend(s, ch.cost, ev.title); if (e) return fail(s0, e) }
  const rng = drawRng(s)
  if (ev.kind === 'fx') {
    const loss = choiceId === 'hedge' ? 0.03 : 0.09
    for (const p of s.pending) if (p.cityId === ev.cityId) p.amount = Math.round(p.amount * (1 - loss))
  } else if (ev.kind === 'raise') {
    const a = s.artists.find((x) => ev.title.startsWith(x.stageName))
    if (a) a.morale = clamp(a.morale + (choiceId === 'pay' ? 20 : -15), 0, 100)
  } else if (ev.kind === 'viral') {
    for (const x of s.songs) if (x.stage === 'released') x.hype = Math.max(x.hype, choiceId === 'push' ? 0.6 : 0.25)
  } else if (ev.kind === 'gig' && choiceId === 'go') {
    const a = s.artists.find((x) => ev.title && x.originCityId === ev.cityId) ?? s.artists[0]
    s.cash += 4000
    a.fans[ev.cityId!] = (a.fans[ev.cityId!] ?? 0) + 300
    a.fatigue = clamp(a.fatigue + 10, 0, 100)
  }
  void rng
  ev.resolved = ch.label
  return ok(s, ch.detail)
}
export { staffSkill }
