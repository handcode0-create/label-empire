import { PARTNERS, venueKind, venuesFor } from '../data/people'
import { cityById } from '../data/world'
import type { Artist, GameState, Result, Tour, TourStop } from './types'
import { addRep, clamp, clone, drawRng, fail, fansInCity, money, ok, spend, useAp } from './util'

const REF_PRICE = { A: 40, B: 28, C: 18, D: 12 }

export function partnerEffects(ids: string[]) {
  const ps = PARTNERS.filter((p) => ids.includes(p.id))
  return {
    share: ps.reduce((t, p) => t + p.share, 0), guarantee: ps.reduce((t, p) => t + p.guarantee, 0),
    sold: ps.reduce((t, p) => t + p.sold, 0), fatigue: ps.reduce((t, p) => t + p.fatigue, 0), risk: ps.reduce((t, p) => t + p.risk, 0),
  }
}

/** Billets vendus attendus pour une étape (hors aléa). */
export const suggestedPrice = (cityId: string, kind?: string) => Math.max(3, Math.round(REF_PRICE[cityById(cityId).tier] * venueKind(kind).priceMult))

export function estimateStop(s: GameState, a: Artist, stop: Pick<TourStop, 'cityId' | 'capacity' | 'price' | 'kind'>, partners: string[]) {
  const city = cityById(stop.cityId)
  const fans = fansInCity(s, stop.cityId) + (a.fans[stop.cityId] ?? 0) * 0
  const demandBase = (fans * 0.08 + city.base * 0.0015 * a.potential) * (0.7 + a.skills.scene / 150 + a.skills.charisme / 300)
  const price = Math.max(stop.price, 1)
  let demand = demandBase * Math.pow(suggestedPrice(stop.cityId, stop.kind) / price, 1.4) * venueKind(stop.kind).ambiance
  const eff = partnerEffects(partners)
  demand *= 1 + eff.sold
  if (a.fatigue > 70) demand *= 0.8
  const sold = Math.round(Math.min(stop.capacity, demand))
  return { sold, fill: sold / stop.capacity, gross: sold * price }
}

export function stopCost(stop: Pick<TourStop, 'capacity' | 'cityId' | 'kind'>, prevCityId: string | null) {
  const c = cityById(stop.cityId)
  const dist = prevCityId ? Math.hypot(cityById(prevCityId).x - c.x, cityById(prevCityId).y - c.y) : 0
  return Math.round(stop.capacity * 3 + 2500 + (stop.kind ? venueKind(stop.kind).fee : 0) + dist * 14 + (c.visa ? 600 : 0))
}

export function tourSummary(s: GameState, artist: Artist, stops: TourStop[], partners: string[]) {
  const eff = partnerEffects(partners)
  let cost = 0, revenue = 0, prev: string | null = null
  for (const st of stops) {
    cost += stopCost(st, prev); prev = st.cityId
    const e = estimateStop(s, artist, st, partners)
    revenue += e.gross * (1 - eff.share)
  }
  revenue += eff.guarantee
  return { cost, revenue, profit: revenue - cost }
}

export function planTour(s0: GameState, t: { name: string; artistId: string; stops: TourStop[]; partners: string[] }): Result {
  const s = clone(s0)
  const a = s.artists.find((x) => x.id === t.artistId)
  if (!t.name.trim()) return fail(s0, 'Donnez un nom à la tournée.')
  if (!a) return fail(s0, 'Choisissez un artiste.')
  if (!t.stops.length) return fail(s0, 'Ajoutez au moins une étape.')
  let last = s.week
  for (const st of t.stops) {
    const c = cityById(st.cityId)
    if (c.minRep > s.reputation) return fail(s0, `${c.name} est verrouillé (réputation ${c.minRep} requise).`)
    if (st.week <= s.week) return fail(s0, `L'étape de ${c.name} doit être programmée après la semaine en cours.`)
    if (st.week < last) return fail(s0, 'Les étapes doivent suivre l’ordre des semaines.')
    if (c.visa && st.week - s.week < 2) return fail(s0, `Un visa est nécessaire pour ${c.name} : prévoyez au moins 2 semaines.`)
    if (st.price <= 0) return fail(s0, 'Prix de billet invalide.')
    if (st.kind && venueKind(st.kind).minRep > s.reputation) return fail(s0, `${venueKind(st.kind).label} : réputation ${venueKind(st.kind).minRep} requise.`)
    last = st.week
  }
  for (const id of t.partners) {
    const p = PARTNERS.find((x) => x.id === id)
    if (p && p.minRep > s.reputation) return fail(s0, `${p.name} exige une réputation de ${p.minRep}.`)
  }
  const sum = tourSummary(s, a, t.stops, t.partners)
  const deposit = Math.round(sum.cost * 0.3)
  const e = useAp(s)
  if (e) return fail(s0, e)
  const e2 = spend(s, deposit, `Acompte tournée ${t.name}`)
  if (e2) return fail(s0, e2)
  s.tours.push({ id: `t-${s.week}-${drawRng(s).int(100, 999)}`, name: t.name.trim(), artistId: t.artistId, stops: t.stops.map((x) => ({ ...x })), partners: t.partners, status: 'prepared', cost: sum.cost, revenue: 0 })
  return ok(s, `Tournée « ${t.name} » programmée (acompte ${money(deposit)}).`)
}

/** Joue les étapes de la semaine. */
export function runTourStops(s: GameState, notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]): number {
  let receipts = 0
  const rng = drawRng(s)
  for (const t of s.tours) {
    if (t.status === 'done') continue
    const a = s.artists.find((x) => x.id === t.artistId)
    if (!a) continue
    const eff = partnerEffects(t.partners)
    let prev: string | null = t.stops.find((x) => x.sold !== undefined) ? t.stops.filter((x) => x.sold !== undefined).slice(-1)[0].cityId : null
    for (const st of t.stops) {
      if (st.week !== s.week || st.sold !== undefined) continue
      const est = estimateStop(s, a, st, t.partners)
      const sold = Math.round(clamp(est.sold * (0.92 + rng.next() * 0.16), 0, st.capacity))
      const gross = sold * st.price
      const rev = gross * (1 - eff.share) + eff.guarantee / t.stops.length
      const cost = Math.round(stopCost(st, prev) * 0.7)
      prev = st.cityId
      st.sold = sold; st.revenue = Math.round(rev)
      s.cash += Math.round(rev); receipts += Math.round(rev)
      s.cash -= cost; s.spent += cost
      t.revenue += Math.round(rev)
      a.fans[st.cityId] = (a.fans[st.cityId] ?? 0) + Math.round(sold * 0.3)
      a.fatigue = clamp(a.fatigue + 8 - eff.fatigue, 0, 100)
      a.morale = clamp(a.morale + (sold / st.capacity > 0.7 ? 4 : -3), 0, 100)
      addRep(s, sold / st.capacity > 0.85 ? 0.3 : 0.1)
      notes.push({ tag: 'Concert', text: `${a.stageName} à ${cityById(st.cityId).name} : ${sold.toLocaleString('fr-FR')} / ${st.capacity.toLocaleString('fr-FR')} billets (${Math.round((sold / st.capacity) * 100)} %).`, tone: sold / st.capacity > 0.7 ? 'g' : 'e' })
    }
    t.status = t.stops.every((x) => x.sold !== undefined) ? 'done' : 'running'
    if (t.status === 'done') notes.push({ tag: 'Tournée', text: `« ${t.name} » est terminée : ${money(t.revenue)} de recettes.`, tone: 'c' })
  }
  return receipts
}

export const newStop = (cityId: string, week: number, venueIndex = 1, price?: number): TourStop => {
  const c = cityById(cityId)
  const v = venuesFor(c)[venueIndex] ?? venuesFor(c)[0]
  return { cityId, venue: v.name, kind: v.kind, capacity: v.capacity, week, price: price ?? suggestedPrice(cityId, v.kind) }
}
export type { Tour }

/** Dernier concert joué (tournée, étape) : sert aux scènes et aux choix de fin de concert. */
export function lastPlayed(g: GameState): { tour: Tour; stop: TourStop } | undefined {
  let best: { tour: Tour; stop: TourStop } | undefined
  for (const tour of g.tours) for (const stop of tour.stops) if (stop.sold !== undefined && (!best || stop.week >= best.stop.week)) best = { tour, stop }
  return best
}
export type TourCare = 'repos' | 'prime'
/** Choix de scène : repos pour l'artiste de la dernière tournée, ou prime d'encouragement. */
export function careForTourArtist(s0: GameState, kind: TourCare): Result {
  const s = clone(s0)
  const t = [...s.tours].reverse().find((x) => x.status !== 'prepared') ?? s.tours[s.tours.length - 1]
  const a = t && s.artists.find((x) => x.id === t.artistId)
  if (!a) return fail(s0, 'Aucun artiste en tournée.')
  if (kind === 'prime') { const e = spend(s, 2000, 'Prime de tournée'); if (e) return fail(s0, e); a.morale = clamp(a.morale + 10, 0, 100); a.fatigue = clamp(a.fatigue - 5, 0, 100); return ok(s, `${a.stageName} touche une prime de 2 000 $ : le moral remonte.`) }
  a.fatigue = clamp(a.fatigue - 25, 0, 100); a.morale = clamp(a.morale + 4, 0, 100)
  return ok(s, `${a.stageName} se repose : fatigue en baisse.`)
}
