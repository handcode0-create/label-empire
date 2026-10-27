import { ARTIST_SKILLS, STAFF_SKILLS, type Artist, type GameState, type NewGameConfig, type Skills } from './types'

const sum = (s: Skills) => Object.values(s).reduce((a, b) => a + b, 0)

export function validateConfig(c: NewGameConfig): string[] {
  const e: string[] = []
  if (!c.labelName.trim()) e.push('Nom du label requis')
  if (!c.founderName.trim()) e.push('Nom du fondateur requis')
  if (c.startReputation < 0 || c.startReputation > 100) e.push('Réputation hors limites')
  if (sum(c.staffSkills) !== 10) e.push('Répartir exactement 10 points de staff')
  if (c.alsoArtist && sum(c.artistSkills) !== 10) e.push("Répartir exactement 10 points d'artiste")
  return e
}

/** Plus la réputation de départ est haute, moins il y a de cash. */
export function startingCash(reputation: number, difficulty: NewGameConfig['difficulty']): number {
  const base = 150_000 - reputation * 2_000
  const k = difficulty === 'facile' ? 1.25 : difficulty === 'difficile' ? 0.8 : 1
  return Math.round((base * k) / 1000) * 1000
}

export function createGame(c: NewGameConfig): GameState {
  const errors = validateConfig(c)
  if (errors.length) throw new Error(errors.join(' ; '))
  const full = (keys: readonly string[], s: Skills): Skills => Object.fromEntries(keys.map((k) => [k, s[k] ?? 0]))
  const artists: Artist[] = c.alsoArtist
    ? [{ id: 'founder', stageName: c.founderName, realName: c.founderName, originCityId: c.hqCityId,
        genre: c.mainGenre, skills: full(ARTIST_SKILLS, c.artistSkills), fans: { [c.hqCityId]: 1200 }, isFounder: true }]
    : []
  return {
    week: 1,
    cash: startingCash(c.startReputation, c.difficulty),
    reputation: c.startReputation,
    label: { name: c.labelName, logoId: c.logoId, hqCityId: c.hqCityId, currency: c.currency, difficulty: c.difficulty },
    staffSkills: full(STAFF_SKILLS, c.staffSkills),
    artists, songs: [], rngState: c.seed, log: [],
  }
}
