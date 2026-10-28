import type { Media } from '../data/media'
import type { Studio } from '../data/people'
import { CITIES, cityById, type City } from '../data/world'
import { seasonOf } from './dynamics'
import { hash } from './rng'
import type { Platform } from './platforms'
import type { GameState } from './types'
import { clamp, drawRng } from './util'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]

/** Inflation lente des prix (cachets, studios, promo, loyers). */
export const INFLATION_PER_WEEK = 0.0008
export const inflation = (week: number) => 1 + INFLATION_PER_WEEK * Math.max(0, week - 1)

/** Bruit lisse déterministe propre à une clé (un studio, une ville) : varie lentement d'une semaine à l'autre. */
const wave = (key: string, week: number, period: number, amp: number) => 1 + amp * Math.sin((2 * Math.PI * (week + (hash(key) % period))) / period)

/** Demande saisonnière en studio et en promotion : forte pendant les festivals et les fêtes, faible en janvier. */
export function seasonDemand(week: number): number {
  const id = seasonOf(week)?.id
  return id === 'ete' ? 1.12 : id === 'rentree' ? 1.05 : id === 'fetes' ? 1.15 : id === 'hiver' ? 0.88 : 1
}
/** Valeur d'une écoute selon le marché publicitaire de la saison. */
export function streamValueMult(week: number): number {
  const id = seasonOf(week)?.id
  return id === 'fetes' ? 1.06 : id === 'hiver' ? 0.95 : id === 'rentree' ? 1.02 : 1
}

/** Tarif journalier d'un studio : saison, inflation, popularité du studio et notoriété du label (les grands studios facturent plus cher les labels connus). */
export function studioPrice(s: GameState, st: Studio): number {
  const fame = 1 + s.reputation / 400 + (st.stars >= 4 ? s.reputation / 500 : 0)
  return Math.round((st.pricePerDay * inflation(s.week) * seasonDemand(s.week) * wave(st.id, s.week, 17, 0.07) * fame) / 10) * 10
}
/** Variation (en %) du tarif par rapport au tarif de base. */
export const priceDelta = (now: number, base: number) => Math.round((now / base - 1) * 100)

export function mediaCost(s: GameState, m: Media): number {
  return Math.round((m.cost * inflation(s.week) * (0.92 + 0.16 * seasonDemand(s.week)) * (1 + s.reputation / 300)) / 50) * 50
}
export function pitchCost(s: GameState, p: Platform): number {
  return Math.round((p.pitchCost * inflation(s.week) * (1 + s.reputation / 300)) / 50) * 50
}
/** Loyer mensuel d'un bureau : cycle immobilier propre à chaque ville, plus l'inflation. */
export function rentFor(s: GameState, cityId: string): number {
  return Math.round((cityById(cityId).rent * inflation(s.week) * wave('rent' + cityId, s.week, 60, 0.08)) / 10) * 10
}

/* ───────────── Change ───────────── */
/** Taux de change d'une devise face au dollar (1 = parité). Les revenus de la ville sont convertis à ce taux. */
export const fxRate = (s: GameState, currency: string): number => (currency === 'USD' ? 1 : s.fx?.[currency] ?? 1)
export function fxShock(s: GameState, currency: string, pct: number) {
  s.fx ??= {}
  s.fx[currency] = clamp((s.fx[currency] ?? 1) * (1 - pct), 0.55, 1.5)
}
const CURRENCIES = ['EUR', 'XOF', 'NGN', 'ZAR', 'GBP', 'KRW', 'AUD', 'BRL', 'JPY', 'INR', 'AED', 'MXN', 'EGP', 'GHS', 'KES', 'AOA']
/** Marche aléatoire avec retour vers la parité. */
export function fxTick(s: GameState, notes: Notes) {
  s.fx ??= {}
  const rng = drawRng(s)
  for (const c of CURRENCIES) {
    const vol = c === 'EUR' || c === 'XOF' || c === 'GBP' || c === 'AED' ? 0.006 : 0.016
    const prev = s.fx[c] ?? 1
    const next = clamp(prev + (1 - prev) * 0.03 + (rng.next() - 0.5) * 2 * vol, 0.55, 1.5)
    s.fx[c] = Math.round(next * 1000) / 1000
    if (prev >= 0.85 && next < 0.85) notes.push({ tag: 'Change', text: `Le ${c} décroche face au dollar (−${Math.round((1 - next) * 100)} %) : vos revenus de la zone fondent.`, tone: 'r' })
    else if (prev <= 1.15 && next > 1.15) notes.push({ tag: 'Change', text: `Le ${c} s'apprécie (+${Math.round((next - 1) * 100)} %) : vos revenus de la zone valent plus de dollars.`, tone: 'g' })
  }
}

/** Coût d'une prestation (clip, mixage, tournée) : inflation et légère tension saisonnière. */
export function opCost(s: GameState, base: number): number {
  return Math.round((base * inflation(s.week) * (0.95 + 0.05 * seasonDemand(s.week))) / 10) * 10
}

/* ───────────── Marchés vivants ───────────── */
/** Ville avec ses caractéristiques du moment (taille du marché, taxes, piratage évoluent au fil des semaines). */
export function liveCity(s: GameState, c: City): City {
  const m = s.markets?.[c.id]
  return m ? { ...c, base: m.base, tax: m.tax, piracy: m.piracy } : c
}
const GROWTH = { A: 0.0004, B: 0.0007, C: 0.0012, D: 0.0015 }
/** Croissance du streaming (plus rapide dans les marchés émergents), recul du piratage, réformes fiscales, négociations avec les plateformes. */
export function marketTick(s: GameState, notes: Notes) {
  s.markets ??= {}
  const rng = drawRng(s)
  for (const c0 of CITIES) {
    const m = (s.markets[c0.id] ??= { base: c0.base, tax: c0.tax, piracy: c0.piracy })
    m.base = Math.round(m.base * (1 + GROWTH[c0.tier] + (rng.next() - 0.5) * 0.004))
    m.piracy = clamp(m.piracy - 0.0002 + (rng.next() - 0.5) * 0.002, 0.03, 0.5)
    if (rng.chance(0.004)) {
      const up = rng.chance(0.5)
      const next = clamp(m.tax + (up ? 0.02 : -0.02), 0.03, 0.3)
      if (next !== m.tax) {
        m.tax = Math.round(next * 100) / 100
        notes.push({ tag: 'Change', text: up ? `${c0.country} relève la taxe sur les revenus musicaux (${Math.round(m.tax * 100)} %) : vos droits y reculent.` : `${c0.country} allège la fiscalité de la musique (${Math.round(m.tax * 100)} %) : vos droits y progressent.`, tone: up ? 'r' : 'g' })
      }
    }
  }
  const before = s.payout ?? 1
  s.payout = Math.round(clamp(before + (1 - before) * 0.01 - 0.0002 + (rng.next() - 0.5) * 0.012, 0.8, 1.15) * 1000) / 1000
  if (before >= 0.92 && s.payout < 0.92) notes.push({ tag: 'Change', text: 'Les plateformes révisent leurs barèmes à la baisse : chaque écoute rapporte moins.', tone: 'r' })
  else if (before <= 1.08 && s.payout > 1.08) notes.push({ tag: 'Change', text: 'De nouveaux accords avec les plateformes revalorisent la rémunération des écoutes.', tone: 'g' })
}
