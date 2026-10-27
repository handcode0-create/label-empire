export type Currency = 'USD' | 'EUR' | 'XOF'
export type Difficulty = 'facile' | 'normal' | 'difficile'

export interface Skills { [k: string]: number }
export const STAFF_SKILLS = ['negociation', 'reperage', 'production', 'marketing', 'finance', 'reseau'] as const
export const ARTIST_SKILLS = ['voix', 'ecriture', 'charisme', 'scene', 'creativite', 'endurance'] as const

export interface NewGameConfig {
  labelName: string
  logoId: string
  founderName: string
  nationality: string
  mainGenre: string
  startReputation: number // 0..100
  alsoArtist: boolean
  staffSkills: Skills // 10 points
  artistSkills: Skills // 10 points si alsoArtist
  hqCityId: string
  currency: Currency
  difficulty: Difficulty
  seed: number
}

export interface Artist {
  id: string
  stageName: string
  realName: string
  originCityId: string
  genre: string
  skills: Skills
  fans: Record<string, number> // par pays
  isFounder: boolean
}

export interface Song {
  id: string; title: string; artistId: string; genre: string
  lyricsQuality: number; recordingQuality: number; mixBonus: number
  releaseWeek: number | null
}

export interface GameState {
  week: number
  cash: number
  reputation: number
  label: { name: string; logoId: string; hqCityId: string; currency: Currency; difficulty: Difficulty }
  staffSkills: Skills
  artists: Artist[]
  songs: Song[]
  rngState: number
  log: string[]
}

export type Action =
  | { type: 'release'; songId: string; week: number }
  | { type: 'spend'; label: string; amount: number }

export interface WeekPlan { actions: Action[] }
