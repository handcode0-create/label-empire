import { AGENCIES, FIRST, GRADIENTS, LAST, SIGNATURE, STAGE_WORDS, TRAITS } from '../data/people'
import { CITIES, GENRES, cityById, type City } from '../data/world'
import type { Rng } from './rng'
import type { Artist, Contest, GameState, Result } from './types'
import { ARTIST_SKILLS } from './types'
import { clamp, clone, drawRng, fail, money, ok, spend, staffSkill, sum, useAp } from './util'

const slugify = (t: string) => t.normalize('NFKD').replace(/[^\w\s-]/g, '').toLowerCase().replace(/\s+/g, '-')

function buildArtist(rng: Rng, o: { city: City; stage: string; real: string; genre: string; lang: string; potential: number; id?: string }): Artist {
  const { city, potential } = o
  const skills = Object.fromEntries(ARTIST_SKILLS.map((k) => [k, clamp(Math.round(30 + potential * 9 + rng.int(-10, 12)), 15, 98)]))
  const fans = Math.round(city.base * 0.02 * Math.pow(potential, 1.7) * (0.6 + rng.next() * 0.8))
  const advance = Math.round((potential * potential * 700 + fans * 0.02) / 500) * 500
  const mgrFirst = rng.pick(FIRST[city.continent] ?? FIRST.Afrique)
  const mgrLast = rng.pick(LAST[city.continent] ?? LAST.Afrique)
  const agency = rng.pick(AGENCIES)
  const rival = rng.chance(0.25 + potential * 0.05)
  return {
    id: o.id ?? `c-${rng.int(100000, 999999)}`, stageName: o.stage, realName: o.real, originCityId: city.id, genre: o.genre, lang: o.lang,
    skills, potential, fans: { [city.id]: fans }, isFounder: false, morale: 70, fatigue: 0, contract: null,
    manager: { name: `${mgrFirst} ${mgrLast}`, agency, email: `${slugify(mgrFirst)}@${slugify(agency)}.example` },
    traits: [rng.pick(TRAITS), rng.pick(TRAITS)].filter((t, i, a) => a.indexOf(t) === i),
    gradient: rng.pick(GRADIENTS),
    demo: { title: `${rng.pick(['Nuit', 'Soleil', 'Fièvre', 'Cité', 'Rêve', 'Marée', 'Ubuntu'])} ${rng.pick(["d'or", 'de minuit', 'sauvage', 'éternel(le)', 'Nights'])}`.replace('éternel(le)', 'éternelle'), quality: clamp(Math.round(skills.voix * 0.45 + skills.ecriture * 0.35 + 10), 20, 95) },
    asking: { advance, royalty: Math.round((0.2 + potential * 0.04) * 100) / 100, weeks: 104 },
    status: 'disponible', rivalInterest: rival ? 1 : 0,
  }
}

export function generateCandidate(rng: Rng, s: GameState, cityId?: string, bonus = 0): Artist {
  const eligible = CITIES.filter((c) => c.minRep <= s.reputation + 30)
  const city = cityId ? cityById(cityId) : rng.pick(eligible)
  const first = rng.pick(FIRST[city.continent] ?? FIRST.Afrique)
  const last = rng.pick(LAST[city.continent] ?? LAST.Afrique)
  let stage = `${first} ${rng.pick(STAGE_WORDS)}`
  let guard = 0
  const all = () => [...s.pool, ...s.artists]
  while (all().some((a) => a.stageName === stage) && guard++ < 20) stage = `${first} ${rng.pick(STAGE_WORDS)}`
  const roll = rng.next() + bonus
  const potential = roll > 0.97 ? 5 : roll > 0.8 ? 4 : roll > 0.45 ? 3 : roll > 0.15 ? 2 : 1
  const genre = rng.chance(0.7) ? rng.pick(city.strong) : rng.pick(GENRES)
  return buildArtist(rng, { city, stage, real: `${first} ${last}`, genre, lang: city.lang, potential: clamp(potential, 1, 5) })
}

export function signatureCandidates(rng: Rng): Artist[] {
  return SIGNATURE.map((x, i) => {
    const potential = [4, 3, 4, 5, 3, 3][i]
    const a = buildArtist(rng, { city: cityById(x.cityId), stage: x.stage, real: x.real, genre: x.genre, lang: x.lang, potential, id: `sig-${i}` })
    if (x.stage === 'Zola Gold') { a.manager = { name: 'Thando Mokoena', agency: 'Joburg Talents', email: 'zola@joburgtalents.example' }; a.rivalInterest = 1 }
    if (x.stage === 'Boa Kwame') { a.status = 'concours' }
    return a
  })
}

/** Nombre d'artistes visibles : dépend du repérage du staff et des bureaux. */
export function visibleLimit(s: GameState) {
  return 6 + 2 * staffSkill(s, 'reperage') + s.offices.length * 2
}
export function visibleCandidates(s: GameState): Artist[] {
  const list = s.pool.filter((a) => cityById(a.originCityId).minRep <= s.reputation + 25 + 3 * staffSkill(s, 'reperage'))
  return list.sort((a, b) => (b.status === 'concours' ? 1 : 0) - (a.status === 'concours' ? 1 : 0) || b.potential - a.potential).slice(0, visibleLimit(s))
}

// ---------- négociation ----------
export interface Offer { advance: number; royalty: number; weeks: number; scope: 'local' | 'region' | 'monde' }
export interface Evaluation { score: number; chance: 'Probable' | 'Incertain' | 'Improbable'; need: number; tags: { tag: 'Certain' | 'Estimé' | 'Incertain' | 'Risque'; text: string }[] }

export function evaluateOffer(s: GameState, c: Artist, o: Offer): Evaluation {
  const ask = c.asking!
  const repF = 0.65 + (s.reputation / 100) * 0.9 + staffSkill(s, 'negociation') * 0.03
  const scopeF = o.scope === 'monde' ? 1.08 : o.scope === 'region' ? 1.02 : 0.96
  const score = (0.5 * (o.advance / Math.max(ask.advance, 1)) + 0.5 * (o.royalty / ask.royalty)) * Math.min(1.3, repF) * scopeF * (o.weeks >= 104 ? 1.02 : 0.98)
  const need = c.rivalInterest ? 0.95 : 0.8
  const chance = score >= need + 0.15 ? 'Probable' : score >= need ? 'Incertain' : 'Improbable'
  const labelShare = Math.round((1 - o.royalty) * 100)
  return {
    score, chance, need,
    tags: [
      { tag: 'Certain', text: `Avance : ${money(o.advance)} versée à la signature` },
      { tag: 'Certain', text: `Part du label : ${labelShare} % des revenus` },
      { tag: 'Estimé', text: `Contrat de ${o.weeks} semaines (${(o.weeks / 52).toFixed(1).replace('.', ',')} an)` },
      { tag: 'Incertain', text: c.rivalInterest ? 'Un autre label est intéressé' : 'Réponse de son manager' },
      { tag: 'Risque', text: c.traits.includes('Exigeant en négociation') ? 'Négociateur dur' : o.advance > s.cash * 0.5 ? 'Trésorerie serrée après la signature' : 'Faible' },
    ],
  }
}

export function signArtist(s0: GameState, id: string, o: Offer): Result {
  const s = clone(s0)
  const i = s.pool.findIndex((a) => a.id === id)
  if (i < 0) return fail(s0, 'Artiste introuvable.')
  const c = s.pool[i]
  if (s.artists.some((a) => a.id === id)) return fail(s0, 'Déjà sous contrat.')
  const ev = evaluateOffer(s, c, o)
  if (o.advance > s.cash) return fail(s0, `Trésorerie insuffisante : avance de ${money(o.advance)}.`)
  const e = useAp(s)
  if (e) return fail(s0, e)
  const rng = drawRng(s)
  const accepted = ev.score + (rng.next() - 0.5) * 0.12 >= ev.need
  if (!accepted) {
    s.log.push(`${c.stageName} a refusé votre offre.`)
    c.morale = Math.max(40, c.morale - 5)
    return { state: s, error: `${c.stageName} refuse l'offre. Son manager attendait mieux (avance, part ou durée).` }
  }
  spend(s, o.advance, `Avance à ${c.stageName}`)
  const { asking: _a, status: _s, contestId: _c, exclusiveUntil: _e, rivalInterest: _r, ...rest } = c
  void [_a, _s, _c, _e, _r]
  s.artists.push({ ...rest, contract: { royalty: o.royalty, advance: o.advance, weeks: o.weeks, signedWeek: s.week, scope: o.scope }, morale: 75 })
  s.pool.splice(i, 1)
  s.reputation += 0.5
  s.log.push(`Signature : ${c.stageName}`)
  return ok(s, `${c.stageName} rejoint le label.`)
}

export function renegotiate(s0: GameState, artistId: string, o: Offer): Result {
  const s = clone(s0)
  const a = s.artists.find((x) => x.id === artistId)
  if (!a || !a.contract) return fail(s0, 'Aucun contrat à renégocier.')
  const e = useAp(s)
  if (e) return fail(s0, e)
  const fake: Artist = { ...a, asking: { advance: Math.max(2000, a.contract.advance), royalty: a.contract.royalty, weeks: 104 }, rivalInterest: 0 }
  const ev = evaluateOffer(s, fake, o)
  if (o.advance > s.cash) return fail(s0, 'Trésorerie insuffisante pour la prime.')
  if (ev.score < 0.9) return fail(s0, 'Le manager refuse ces conditions.')
  s.cash -= o.advance
  a.contract = { ...a.contract, royalty: o.royalty, weeks: o.weeks, scope: o.scope, signedWeek: s.week }
  a.morale = clamp(a.morale + 10, 0, 100)
  return ok(s, 'Contrat renégocié.')
}

// ---------- concours ----------
export const CONTEST_FORMATS = { ligne: { label: 'Audition en ligne', min: 3000, per: 400 }, salle: { label: 'Audition en salle', min: 6000, per: 140 }, tv: { label: 'Show télévisé', min: 20000, per: 60 } } as const

export function startContest(s0: GameState, c: { name: string; cityId: string; format: Contest['format']; budget: number; jury: string[] }): Result {
  const s = clone(s0)
  const city = cityById(c.cityId)
  const f = CONTEST_FORMATS[c.format]
  if (!c.name.trim()) return fail(s0, 'Donnez un nom au concours.')
  if (c.budget < f.min) return fail(s0, `Budget minimum pour ce format : ${money(f.min)}.`)
  if (city.minRep > s.reputation + 10) return fail(s0, `Réputation insuffisante pour ${city.name} (${city.minRep} requis).`)
  if (s.contests.some((x) => x.status === 'ouvert' && x.cityId === c.cityId)) return fail(s0, 'Un concours est déjà ouvert dans cette ville.')
  const e = useAp(s)
  if (e) return fail(s0, e)
  const e2 = spend(s, c.budget, `Concours ${c.name}`)
  if (e2) return fail(s0, e2)
  const rng = drawRng(s)
  s.contests.push({ id: `k-${s.week}-${rng.int(1000, 9999)}`, name: c.name, cityId: c.cityId, format: c.format, budget: c.budget, jury: c.jury, startWeek: s.week, endWeek: s.week + 2, status: 'ouvert', finalists: [], candidates: Math.round(c.budget / f.per * (0.8 + rng.next() * 0.4)) })
  return ok(s, `Concours « ${c.name} » lancé : finale dans 2 semaines.`)
}

export function resolveContests(s: GameState, notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]) {
  for (const k of s.contests) {
    if (k.status !== 'ouvert' || k.endWeek > s.week) continue
    const rng = drawRng(s)
    const bonus = k.budget / 40000 + k.jury.length * 0.08 + staffSkill(s, 'reperage') * 0.03
    const ids: string[] = []
    for (let i = 0; i < 4; i++) {
      const a = generateCandidate(rng, s, k.cityId, bonus - i * 0.05)
      a.status = 'concours'; a.contestId = k.id; a.exclusiveUntil = s.week + 2; a.rivalInterest = 0
      s.pool.unshift(a); ids.push(a.id)
    }
    k.finalists = ids; k.status = 'termine'
    notes.push({ tag: 'Concours', text: `La finale de « ${k.name} » a eu lieu : 4 finalistes à découvrir.`, tone: 'c' })
  }
}

/** Les rivaux signent des artistes disponibles ; le vivier se renouvelle. */
export function rivalsAndRefresh(s: GameState, notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]) {
  const rng = drawRng(s)
  for (const a of [...s.pool]) {
    if (a.exclusiveUntil && a.exclusiveUntil > s.week) continue
    if (a.status === 'concours' && a.exclusiveUntil) { a.status = 'disponible'; a.exclusiveUntil = undefined }
    if (a.rivalInterest && rng.chance(0.07)) {
      s.pool.splice(s.pool.indexOf(a), 1)
      notes.push({ tag: 'Rival', text: `Un label rival a signé ${a.stageName} (${cityById(a.originCityId).name}).`, tone: 'r' })
    }
  }
  if (s.week % 3 === 0 && s.pool.length < 40) for (let i = 0; i < 3; i++) s.pool.push(generateCandidate(rng, s))
  void sum
}
