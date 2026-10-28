import { CITIES, cityById, palierFor } from '../data/world'
import { updateClips } from './clips'
import { runAwards } from './awards'
import { updateMissions, updateNews } from './missions'
import { checkCertifications } from './certifications'
import { OBJECTIVES, applyBailout, applyDealLevy, checkObjectives } from './objectives'
import { createRng } from './rng'
import { STREAM_VALUE, rankInCity, royaltyShare, weeklyStreams } from './market'
import { makeEvent, resolveEvent, weeklyFixedCosts } from './economy'
import { rivalsAndRefresh, resolveContests } from './scouting'
import { runTourStops } from './tour'
import type { GameState, Report } from './types'
import { clamp, clone, drawRng, money, totalFans } from './util'

type Note = Report['notes'][number]

/** Fait avancer la partie d'une semaine. Fonction pure : l'état reçu n'est pas modifié. */
export function advanceWeek(s0: GameState): GameState {
  let s = clone(s0)
  if (s.outcome === 'defaite') return s
  const notes: Note[] = []
  const items: Report['items'] = []
  const W = s.week
  const fansBefore = totalFans(s)

  // 0. événement non traité : le premier choix s'applique par défaut
  if (s.event && !s.event.resolved) {
    const r = resolveEvent(s, s.event.choices[0].id)
    s = r.error ? { ...s, event: { ...s.event, resolved: s.event.choices[0].label } } : r.state
  }

  // 1. sorties du jour
  for (const song of s.songs) {
    if (song.stage === 'scheduled' && song.release && song.release.week <= W) {
      song.stage = 'released'
      s.reputation += 0.1
      for (const id of song.release.cityIds) if (!s.stats.countriesReached.includes(id)) s.stats.countriesReached.push(id)
      notes.push({ tag: 'Sortie', text: `« ${song.title} » est disponible dans ${song.release.cityIds.length} territoire(s).`, tone: 'g' })
    }
  }

  // 2. écoutes, revenus, fans
  const rng = drawRng(s)
  let streams = 0
  let receipts = 0
  const weekStreams: Record<string, number> = {}
  const byContinent: Record<string, number> = {}
  let repGain = 0
  for (const song of s.songs) {
    if (song.stage !== 'released') continue
    const artist = s.artists.find((a) => a.id === song.artistId)
    const share = 1 - royaltyShare(s, song)
    let counted = false
    let weekSt = 0
    let weekRk = 99
    for (const c of CITIES) {
      const st = Math.round(weeklyStreams(s, song, c, W) * (0.93 + rng.next() * 0.14))
      song.stats.prevByCity[c.id] = song.stats.lastByCity[c.id] ?? 0
      song.stats.lastByCity[c.id] = st
      if (st <= 0) continue
      counted = true
      song.stats.byCity[c.id] = (song.stats.byCity[c.id] ?? 0) + st
      song.stats.streams += st
      weekSt += st
      streams += st
      const gross = st * STREAM_VALUE * (1 - c.piracy) * (1 - c.tax) * share
      const office = s.offices.find((o) => o.cityId === c.id && o.since <= W)
      const delay = Math.max(1, c.delay - (office?.kind === 'bureau' ? 1 : 0))
      s.pending.push({ week: W + delay, amount: gross, cityId: c.id })
      song.stats.revenue += gross
      byContinent[c.continent] = (byContinent[c.continent] ?? 0) + gross
      if (artist) {
        const nf = Math.round(st * 0.02 * (0.7 + artist.skills.charisme / 150))
        artist.fans[c.id] = (artist.fans[c.id] ?? 0) + nf
        song.stats.fans += nf
      }
      const rank = rankInCity(c.id, W, st)
      const w = { A: 1.2, B: 1, C: 0.8, D: 0.6 }[c.tier]
      repGain += (rank <= 3 ? 0.12 : rank <= 10 ? 0.045 : rank <= 30 ? 0.01 : 0) * w
      if (rank <= 3 && (song.stats.peak[c.id] ?? 99) > 3) notes.push({ tag: 'Classement', text: `« ${song.title} » entre dans le top 3 à ${c.name}.`, tone: 'c' })
      song.stats.peak[c.id] = Math.min(song.stats.peak[c.id] ?? 99, rank)
      weekRk = Math.min(weekRk, rank)
    }
    if (counted) song.stats.weeks++
    weekStreams[song.id] = weekSt
    song.stats.hist = [...(song.stats.hist ?? []), { w: W, st: weekSt, rk: weekRk }].slice(-52)
    song.hype = song.hype < 0.05 ? 0 : song.hype * 0.55
  }
  s.reputation += Math.min(0.5, repGain)
  receipts += updateClips(s, W, weekStreams, notes)

  // 3. tournées, concours, rivaux
  receipts += runTourStops(s, notes)
  resolveContests(s, notes)
  rivalsAndRefresh(s, notes)

  // 4. paiements reçus
  const due = s.pending.filter((p) => p.week <= W)
  const arrived = due.reduce((t, p) => t + p.amount, 0)
  s.pending = s.pending.filter((p) => p.week > W)
  s.cash += arrived
  receipts += arrived
  if (arrived > 0) items.push({ label: 'Droits reçus (écoutes)', amount: Math.round(arrived) })

  // 5. charges fixes et prêt
  const fixed = weeklyFixedCosts(s)
  s.cash -= fixed.total
  if (fixed.salaries) items.push({ label: 'Salaires', amount: -fixed.salaries })
  if (fixed.rent) items.push({ label: 'Loyers des bureaux', amount: -fixed.rent })
  if (fixed.overhead) items.push({ label: 'Frais de structure', amount: -fixed.overhead })
  if (s.loan) {
    s.loan.remaining -= s.loan.weekly; s.loan.weeksLeft--
    items.push({ label: 'Remboursement du prêt', amount: -s.loan.weekly })
    if (s.loan.remaining <= 0 || s.loan.weeksLeft <= 0) { s.loan = null; notes.push({ tag: 'Prêt', text: 'Votre prêt est entièrement remboursé.', tone: 'g' }) }
  }
  if (s.spent) items.push({ label: 'Dépenses de la semaine', amount: -s.spent })

  // 6. vie du label : moral, fatigue, contrats, bureaux
  const recent = s.songs.some((x) => x.release && W - x.release.week < 8 && x.stage !== 'mixed')
  for (const a of s.artists) {
    a.fatigue = clamp(a.fatigue - 8, 0, 100)
    if (!a.isFounder) a.morale = clamp(a.morale + (recent ? 1 : -1.5), 0, 100)
    if (a.contract) {
      const left = a.contract.signedWeek + a.contract.weeks - W
      if (left <= 0) { notes.push({ tag: 'Contrat', text: `Le contrat de ${a.stageName} est arrivé à terme : il quitte le label.`, tone: 'r' }); a.contract = null; a.status = 'disponible'; s.pool.push({ ...a, asking: { advance: 5000, royalty: 0.35, weeks: 104 }, rivalInterest: 1 }) }
      else if (left === 8) notes.push({ tag: 'Contrat', text: `Le contrat de ${a.stageName} expire dans 8 semaines.`, tone: 'e' })
    }
  }
  s.artists = s.artists.filter((a) => a.isFounder || a.contract)
  const r2 = createRng(W * 977 + s.rngState)
  for (const m of s.staff) m.morale = clamp(m.morale + r2.int(-3, 2), 0, 100)
  for (const o of s.offices) if (o.since === W) notes.push({ tag: 'Bureau', text: `Le bureau de ${cityById(o.cityId).name} est opérationnel.`, tone: 'c' })
  if (!s.songs.some((x) => x.release && W - x.release.week < 12)) s.reputation = Math.max(0, s.reputation - 0.15)
  receipts = applyDealLevy(s, receipts, (t) => notes.push({ tag: 'Meridian', text: t, tone: 'r' }))
  s.stats.totalRevenue += receipts

  // 7. réputation, paliers, fin de partie
  const before = palierFor(s0.reputation)
  s.reputation = clamp(s.reputation, 0, 100)
  const after = palierFor(s.reputation)
  if (after.n > before.n) notes.push({ tag: 'Palier', text: `Nouveau palier : ${after.name} !`, tone: 'g' })
  s.negWeeks = s.cash < 0 ? s.negWeeks + 1 : 0
  if (s.negWeeks >= 4 && !s.freeMode) {
    if ((s.bailouts ?? 0) < 1) { applyBailout(s); notes.push({ tag: 'Meridian', text: 'Meridian Group rachète vos dettes : +$250 000, mais 30 % de vos recettes pendant 2 ans et −8 de réputation.', tone: 'r' }) }
    else if (s.negWeeks >= 6) s.outcome = 'defaite'
  }
  checkCertifications(s, notes)
  for (const o of checkObjectives(s)) notes.push({ tag: 'Objectif', text: `Objectif accompli : ${o.title}${o.reward.cash ? ` (+$${o.reward.cash.toLocaleString('fr-FR')})` : ''}`, tone: 'g' })
  if (OBJECTIVES.every((o) => s.objectives.includes(o.id)) && !s.freeMode && !s.outcome) s.outcome = 'victoire'
  if (s.cash < 0) notes.push({ tag: 'Alerte', text: `Trésorerie négative depuis ${s.negWeeks} semaine(s)${(s.bailouts ?? 0) < 1 ? ' : à 4 semaines, Meridian proposera un sauvetage à vos dépens.' : ' : à 6 semaines, c’est la faillite.'}`, tone: 'r' })
  for (const a of s.artists) if (!a.isFounder && a.morale < 35) notes.push({ tag: 'Moral', text: `Le moral de ${a.stageName} est bas (${Math.round(a.morale)}).`, tone: 'r' })

  // 8. semaine suivante
  const next: string[] = []
  for (const song of s.songs) if (song.release?.week === W + 1 && song.stage === 'scheduled') next.push(`sortie « ${song.title} »`)
  for (const t of s.tours) for (const st of t.stops) if (st.week === W + 1 && st.sold === undefined) next.push(`concert à ${cityById(st.cityId).name}`)
  s.event = s.outcome ? null : makeEvent({ ...s, week: W + 1 })
  const revenue = Math.round(receipts)
  const expenses = Math.round(fixed.total + s.spent)
  s.report = {
    week: W, streams: Math.round(streams), revenue, expenses, newFans: totalFans(s) - fansBefore, cashDelta: revenue - expenses,
    byContinent, notes, items,
    nextWeek: next.length ? `Prochaine semaine : ${next.join(', ')}.` : 'Aucune sortie ni concert prévu la semaine prochaine.',
  }
  s.cashHistory = [...s.cashHistory, Math.round(s.cash)].slice(-60)
  s.week = W + 1
  s.ap = 6
  runAwards(s, notes)
  updateMissions(s, notes)
  updateNews(s, notes)
  s.spent = 0
  s.log = [`Semaine ${W} : ${money(revenue)} de recettes`]
  return s
}
