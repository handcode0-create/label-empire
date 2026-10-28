import { cityById } from '../data/world'
import { RECRUITS, STARTERS } from '../data/people'
import { generateCandidate, signatureCandidates } from './scouting'
import { createRng } from './rng'
import { ARTIST_SKILLS, STAFF_SKILLS, type Artist, type GameState, type NewGameConfig, type Skills } from './types'
import { sum } from './util'

export function validateConfig(c: NewGameConfig): string[] {
  const e: string[] = []
  if (!c.labelName.trim()) e.push('Nom du label requis')
  if (!c.founderName.trim()) e.push('Nom du fondateur requis')
  if (c.startReputation < 0 || c.startReputation > 100) e.push('Réputation hors limites')
  if (sum(c.staffSkills) !== 10) e.push('Répartir exactement 10 points de staff')
  if (c.alsoArtist && sum(c.artistSkills) !== 10) e.push("Répartir exactement 10 points d'artiste")
  return e
}

/** Capital de départ au choix : 500 000 $ en standard, puis 3 tranches (5 M, 10 M, 1 Md). Chaque tranche fixe aussi la réputation de départ (donc le palier et les marchés débloqués). */
export const CAPITALS = {
  standard: { label: 'Standard', cash: 500_000, reputation: 15 },
  riche: { label: 'Riche', cash: 5_000_000, reputation: 25 },
  majeur: { label: 'Majeur', cash: 10_000_000, reputation: 50 },
  milliardaire: { label: 'Milliardaire', cash: 1_000_000_000, reputation: 75 },
} as const
export const startingReputation = (capital: keyof typeof CAPITALS = 'standard') => CAPITALS[capital].reputation
export function startingCash(_reputation: number, _difficulty: NewGameConfig['difficulty'], capital: keyof typeof CAPITALS = 'standard'): number {
  return CAPITALS[capital].cash
}

export function createGame(c: NewGameConfig): GameState {
  const errors = validateConfig(c)
  if (errors.length) throw new Error(errors.join(' ; '))
  const full = (keys: readonly string[], s: Skills): Skills => Object.fromEntries(keys.map((k) => [k, s[k] ?? 0]))
  const rng = createRng(c.seed)
  const artists: Artist[] = c.alsoArtist
    ? [{
        id: 'founder', stageName: c.founderName, realName: c.founderName, originCityId: c.hqCityId, genre: c.mainGenre, lang: cityById(c.hqCityId).lang,
        skills: Object.fromEntries(ARTIST_SKILLS.map((k) => [k, (c.artistSkills[k] ?? 0) * 10])), potential: 3,
        fans: { [c.hqCityId]: 1200 }, isFounder: true, morale: 80, fatigue: 0, contract: null,
        manager: { name: c.founderName, agency: c.labelName, email: 'direction@label' }, traits: ['Fondateur'],
        gradient: '#FF3D9A,#8B5CF6', demo: { title: 'Premier titre', quality: 40 },
      }]
    : []
  const staff = STARTERS.map((id) => {
    const r = RECRUITS.find((x) => x.id === id)!
    return { id: r.id, name: r.name, role: r.role, cityId: r.cityId, level: r.level, salary: r.salary, morale: 75, skill: r.skill }
  })
  const state: GameState = {
    week: 1, ap: 6,
    cash: startingCash(c.startReputation, c.difficulty, c.capital),
    reputation: c.capital ? startingReputation(c.capital) : c.startReputation,
    label: { name: c.labelName, logoId: c.logoId, photo: c.founderPhoto, founderLook: c.founderLook ?? 'f', hqCityId: c.hqCityId, currency: c.currency, difficulty: c.difficulty, founder: c.founderName, nationality: c.nationality, mainGenre: c.mainGenre },
    staffSkills: full(STAFF_SKILLS, c.staffSkills),
    artists, pool: [], contests: [], tournament: null, seenScenes: [], objectives: [], deal: null, bailouts: 0, songs: [], projects: [], tours: [], staff,
    offices: [{ cityId: c.hqCityId, kind: 'siege', since: 1 }],
    pending: [], loan: null, event: null, report: null, cashHistory: [startingCash(c.startReputation, c.difficulty, c.capital)], negWeeks: 0,
    outcome: null, freeMode: false, rngState: c.seed >>> 0, spent: 0, log: [],
    stats: { totalRevenue: 0, totalFans: 0, countriesReached: [c.hqCityId] },
  }
  state.pool = [...signatureCandidates(rng), ...Array.from({ length: 22 }, () => generateCandidate(rng, state))]
  return state
}
