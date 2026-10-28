import { CITIES, affinity, cityById } from '../data/world'
import type { Rng } from './rng'
import { generateCandidate } from './scouting'
import type { Artist, Duel, GameState, Result, Tournament, TournamentRound } from './types'
import { addRep, clamp, clone, drawRng, fail, money, ok, spend, staffSkill, useAp } from './util'

export const TOURNAMENT = { openCost: 12_000, maxEntrants: 10, minEntrants: 4, maxPerCountry: 2 } as const
const TIER_COST = { A: 2800, B: 2200, C: 1800, D: 1500 } as const
export const recruitCost = (cityId: string) => TIER_COST[cityById(cityId).tier]

/** Villes où l'on peut recruter : réputation suffisante. */
export const recruitableCities = (s: GameState) => CITIES.filter((c) => c.minRep <= s.reputation + 10)

export const entrantOf = (t: Tournament, id: string): Artist => t.entrants.find((a) => a.id === id)!
export const currentRound = (t: Tournament): TournamentRound | undefined => t.rounds[t.rounds.length - 1]
export const countryOf = (a: Artist) => cityById(a.originCityId).country

export function roundName(size: number): string {
  return size === 2 ? 'Finale' : size === 4 ? 'Demi-finales' : size === 8 ? 'Quarts de finale' : size === 16 ? 'Huitièmes de finale' : 'Barrage'
}

export function openTournament(s0: GameState, o: { name: string; cityId: string }): Result {
  const s = clone(s0)
  if (s.tournament && s.tournament.status !== 'termine') return fail(s0, 'Un tournoi est déjà en cours.')
  if (!o.name.trim()) return fail(s0, 'Donnez un nom au tournoi.')
  const city = cityById(o.cityId)
  if (city.minRep > s.reputation + 10) return fail(s0, `Réputation insuffisante pour ${city.name} (${city.minRep} requis).`)
  const e = useAp(s)
  if (e) return fail(s0, e)
  const e2 = spend(s, TOURNAMENT.openCost, `Tournoi ${o.name}`)
  if (e2) return fail(s0, e2)
  const rng = drawRng(s)
  s.tournament = { id: `t-${s.week}-${rng.int(1000, 9999)}`, name: o.name.trim(), cityId: o.cityId, startWeek: s.week, status: 'recrutement', entrants: [], rounds: [], eliminated: [] }
  return ok(s, `Tournoi « ${o.name.trim()} » ouvert : partez recruter vos candidats.`)
}

export function recruitEntrant(s0: GameState, cityId: string): Result {
  const s = clone(s0)
  const t = s.tournament
  if (!t || t.status !== 'recrutement') return fail(s0, 'Aucun tournoi en phase de recrutement.')
  if (t.entrants.length >= TOURNAMENT.maxEntrants) return fail(s0, `Maximum ${TOURNAMENT.maxEntrants} candidats.`)
  const city = cityById(cityId)
  if (city.minRep > s.reputation + 10) return fail(s0, `Réputation insuffisante pour ${city.name} (${city.minRep} requis).`)
  if (t.entrants.filter((a) => countryOf(a) === city.country).length >= TOURNAMENT.maxPerCountry) return fail(s0, `Déjà ${TOURNAMENT.maxPerCountry} candidats venus de ${city.country}.`)
  const e = useAp(s)
  if (e) return fail(s0, e)
  const e2 = spend(s, recruitCost(cityId), `Repérage à ${city.name}`)
  if (e2) return fail(s0, e2)
  const rng = drawRng(s)
  // les candidats déjà dans le tournoi comptent comme pris pour éviter les doublons de pseudo
  const tmp = { ...s, pool: [...s.pool, ...t.entrants] }
  const a = generateCandidate(rng, tmp, cityId, 0.12 + staffSkill(s, 'reperage') * 0.03)
  a.status = 'concours'; a.contestId = t.id; a.rivalInterest = 0
  t.entrants.push(a)
  return ok(s, `${a.stageName} (${city.country}) rejoint le tournoi.`)
}

/** Tirage au sort : on cherche l'arrangement qui évite le plus de duels entre compatriotes. */
export function drawDuels(rng: Rng, ids: string[], country: (id: string) => string, prefix: string): Duel[] {
  let best: string[] = []
  let bestScore = Infinity
  for (let k = 0; k < 40; k++) {
    const arr = [...ids]
    for (let i = arr.length - 1; i > 0; i--) { const j = rng.int(0, i); [arr[i], arr[j]] = [arr[j], arr[i]] }
    let same = 0
    for (let i = 0; i < arr.length; i += 2) if (country(arr[i]) === country(arr[i + 1])) same++
    if (same < bestScore) { bestScore = same; best = arr }
    if (same === 0) break
  }
  const duels: Duel[] = []
  for (let i = 0; i < best.length; i += 2) duels.push({ id: `${prefix}-${i / 2}`, a: best[i], b: best[i + 1] })
  return duels
}

function firstRound(rng: Rng, t: Tournament): TournamentRound {
  const ids = t.entrants.map((a) => a.id)
  const n = ids.length
  const p = 2 ** Math.floor(Math.log2(n))
  const country = (id: string) => countryOf(entrantOf(t, id))
  if (n === p) return { name: roundName(p), duels: drawDuels(rng, ids, country, 'r0'), byes: [] }
  const extra = n - p // nombre de duels de barrage
  const shuffled = [...ids].sort(() => rng.next() - 0.5)
  const playing = shuffled.slice(0, extra * 2)
  return { name: 'Barrage', duels: drawDuels(rng, playing, country, 'r0'), byes: shuffled.slice(extra * 2) }
}

export function startTournament(s0: GameState): Result {
  const s = clone(s0)
  const t = s.tournament
  if (!t || t.status !== 'recrutement') return fail(s0, 'Aucun tournoi à démarrer.')
  if (t.entrants.length < TOURNAMENT.minEntrants) return fail(s0, `Il faut au moins ${TOURNAMENT.minEntrants} candidats.`)
  const rng = drawRng(s)
  t.rounds = [firstRound(rng, t)]
  t.status = 'en_cours'
  return ok(s, `Tirage au sort effectué : ${t.rounds[0].name}.`)
}

/** Force d'un candidat dans un battle : écriture, charisme, créativité, scène, voix. */
export function battlePower(a: Artist): number {
  const k = a.skills
  return (k.ecriture ?? 0) * 0.35 + (k.charisme ?? 0) * 0.25 + (k.creativite ?? 0) * 0.2 + (k.scene ?? 0) * 0.1 + (k.voix ?? 0) * 0.1
}

export function duelScore(a: Artist, hostCityId: string, rng: Rng, coachPoints = 0): number {
  const home = (affinity(a.genre, cityById(hostCityId)) - 1) * 10
  return Math.round((battlePower(a) + home + (a.morale - 70) * 0.1 + coachPoints + rng.int(-9, 9)) * 10) / 10
}

function resolve(t: Tournament, d: Duel, rng: Rng) {
  const a = entrantOf(t, d.a), b = entrantOf(t, d.b)
  const ca = d.coached === d.a ? d.coachPoints ?? 0 : 0
  const cb = d.coached === d.b ? d.coachPoints ?? 0 : 0
  d.scoreA = duelScore(a, t.cityId, rng, ca)
  d.scoreB = duelScore(b, t.cityId, rng, cb)
  d.winner = d.scoreA === d.scoreB ? (rng.chance(0.5) ? d.a : d.b) : d.scoreA > d.scoreB ? d.a : d.b
}

/** Un duel coaché : les points gagnés au battle s'ajoutent au score du candidat suivi. */
export function applyCoaching(s0: GameState, duelId: string, coachedId: string, points: number): Result {
  const s = clone(s0)
  const t = s.tournament
  const d = t && currentRound(t)?.duels.find((x) => x.id === duelId)
  if (!t || !d) return fail(s0, 'Duel introuvable.')
  if (d.winner) return fail(s0, 'Ce duel est déjà joué.')
  if (coachedId !== d.a && coachedId !== d.b) return fail(s0, 'Candidat inconnu.')
  d.coached = coachedId
  d.coachPoints = clamp(Math.round(points * 10) / 10, -12, 18)
  return ok(s, `Préparation enregistrée : ${d.coachPoints >= 0 ? '+' : ''}${d.coachPoints} points pour ${entrantOf(t, coachedId).stageName}.`)
}

/** Joue tous les duels de la phase, élimine les perdants et tire la phase suivante. */
export function playRound(s0: GameState): Result {
  const s = clone(s0)
  const t = s.tournament
  if (!t || t.status !== 'en_cours') return fail(s0, 'Aucune phase à jouer.')
  const r = currentRound(t)!
  const e = useAp(s)
  if (e) return fail(s0, e)
  const rng = drawRng(s)
  for (const d of r.duels) if (!d.winner) resolve(t, d, rng)
  const winners = [...r.byes, ...r.duels.map((d) => d.winner!)]
  for (const d of r.duels) t.eliminated.push(d.winner === d.a ? d.b : d.a)
  if (r.name === 'Finale') {
    t.status = 'choix'
    t.favoriteId = r.duels[0].winner
    return ok(s, 'La finale est terminée : à vous de couronner le vainqueur.')
  }
  const country = (id: string) => countryOf(entrantOf(t, id))
  t.rounds.push({ name: roundName(winners.length), duels: drawDuels(rng, winners, country, `r${t.rounds.length}`), byes: [] })
  return ok(s, `${r.name} terminée : ${winners.length} candidats restent.`)
}

export function finalists(t: Tournament): [Artist, Artist] | null {
  const r = currentRound(t)
  if (!r || r.name !== 'Finale') return null
  return [entrantOf(t, r.duels[0].a), entrantOf(t, r.duels[0].b)]
}

export function chooseWinner(s0: GameState, artistId: string): Result {
  const s = clone(s0)
  const t = s.tournament
  if (!t || t.status !== 'choix') return fail(s0, 'Le choix du vainqueur n’est pas ouvert.')
  const f = finalists(t)!
  if (!f.some((a) => a.id === artistId)) return fail(s0, 'Seuls les finalistes peuvent être couronnés.')
  const rng = drawRng(s)
  const favorite = artistId === t.favoriteId
  t.winnerId = artistId
  t.status = 'termine'
  for (const a of t.entrants) {
    const w = a.id === artistId
    a.status = w ? 'concours' : 'disponible'
    a.exclusiveUntil = w ? s.week + 4 : undefined
    if (w) { a.demo.quality = clamp(a.demo.quality + 8, 0, 100); a.fans[t.cityId] = (a.fans[t.cityId] ?? 0) + Math.round(cityById(t.cityId).base * 0.01) }
    a.contestId = t.id
    s.pool.unshift(a)
  }
  addRep(s, favorite ? 0.5 : 0.2)
  s.log.push(`Tournoi ${t.name} : ${entrantOf(t, artistId).stageName} couronné${favorite ? '' : ' contre le vote du public'}`)
  void rng; void money
  return ok(s, `${entrantOf(t, artistId).stageName} remporte « ${t.name} ». Vous avez l’exclusivité pendant 4 semaines.`)
}

export function abandonTournament(s0: GameState): Result {
  const s = clone(s0)
  if (!s.tournament || s.tournament.status === 'termine') return fail(s0, 'Aucun tournoi à abandonner.')
  s.tournament = null
  return ok(s, 'Tournoi abandonné. Les frais engagés sont perdus.')
}
