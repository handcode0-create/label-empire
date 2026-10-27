export type Currency = 'USD' | 'EUR' | 'XOF'
export type Difficulty = 'facile' | 'normal' | 'difficile'

export interface Skills { [k: string]: number }
export const STAFF_SKILLS = ['negociation', 'reperage', 'production', 'marketing', 'finance', 'reseau'] as const
export const ARTIST_SKILLS = ['voix', 'ecriture', 'charisme', 'scene', 'creativite', 'endurance'] as const

export interface NewGameConfig {
  labelName: string
  logoId: string
  founderPhoto?: string
  founderName: string
  nationality: string
  mainGenre: string
  startReputation: number
  alsoArtist: boolean
  staffSkills: Skills
  artistSkills: Skills
  hqCityId: string
  currency: Currency
  difficulty: Difficulty
  seed: number
}

export interface Contract { royalty: number; advance: number; weeks: number; signedWeek: number; scope: 'local' | 'region' | 'monde' }

export interface Artist {
  id: string
  stageName: string
  realName: string
  originCityId: string
  genre: string
  lang: string
  skills: Skills
  potential: number // 1..5
  fans: Record<string, number> // par ville
  isFounder: boolean
  morale: number
  fatigue: number
  contract: Contract | null
  manager: { name: string; agency: string; email: string }
  traits: string[]
  gradient: string
  demo: { title: string; quality: number }
  // champs de candidat
  asking?: { advance: number; royalty: number; weeks: number }
  status?: 'disponible' | 'concours' | 'courtise'
  contestId?: string
  exclusiveUntil?: number
  rivalInterest?: number
}

export interface SongRelease {
  week: number
  strategy: 'locale' | 'regionale' | 'mondiale' | 'crossover'
  cityIds: string[]
  promo: number
  loc: string[]
}

export interface Song {
  id: string
  title: string
  artistId: string
  genre: string
  theme: string
  lang: string
  mood: string
  lyrics: string
  writer: 'artiste' | 'externe'
  lyricsQ: number
  studioId?: string
  sessionDays?: number
  recQ?: number
  mixId?: string
  mastering: boolean
  mixQ?: number
  quality?: number
  stage: 'written' | 'recorded' | 'mixed' | 'scheduled' | 'released'
  readyWeek: number
  release?: SongRelease
  stats: { streams: number; revenue: number; fans: number; weeks: number; byCity: Record<string, number>; lastByCity: Record<string, number>; prevByCity: Record<string, number>; peak: Record<string, number> }
  hype: number // bonus viral temporaire
}

export interface TourStop { cityId: string; venue: string; capacity: number; week: number; price: number; sold?: number; revenue?: number }
export interface Tour {
  id: string; name: string; artistId: string; stops: TourStop[]; partners: string[]
  status: 'prepared' | 'running' | 'done'
  cost: number; revenue: number
}

export interface Contest {
  id: string; name: string; cityId: string; format: 'ligne' | 'salle' | 'tv'; budget: number; jury: string[]
  startWeek: number; endWeek: number; status: 'ouvert' | 'termine'; finalists: string[]; candidates: number
}

export interface StaffMember { id: string; name: string; role: string; cityId: string; level: number; salary: number; morale: number; skill: string }
export interface Office { cityId: string; kind: 'siege' | 'bureau' | 'partenaire'; since: number }

export interface Pending { week: number; amount: number; cityId: string }
export interface Loan { principal: number; remaining: number; weekly: number; weeksLeft: number }

export interface ChartRow { rank: number; title: string; artist: string; label: string; streams: number; delta: number | null; mine: boolean }

export interface EventChoice { id: string; label: string; detail: string; cost: number }
export interface GameEvent { id: string; kind: string; title: string; text: string; cityId?: string; choices: EventChoice[]; resolved?: string; week: number }

export interface Report {
  week: number
  streams: number
  revenue: number
  expenses: number
  newFans: number
  cashDelta: number
  byContinent: Record<string, number>
  notes: { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
  items: { label: string; amount: number }[]
  nextWeek: string
}

export interface GameState {
  week: number
  ap: number // actions restantes cette semaine
  cash: number
  reputation: number
  label: { name: string; logoId: string; photo?: string; hqCityId: string; currency: Currency; difficulty: Difficulty; founder: string; nationality: string; mainGenre: string }
  staffSkills: Skills
  artists: Artist[] // artistes sous contrat (et fondateur)
  pool: Artist[] // artistes découvrables
  contests: Contest[]
  songs: Song[]
  tours: Tour[]
  staff: StaffMember[]
  offices: Office[]
  pending: Pending[]
  loan: Loan | null
  event: GameEvent | null
  report: Report | null
  cashHistory: number[]
  negWeeks: number
  outcome: 'victoire' | 'defaite' | null
  freeMode: boolean
  rngState: number
  spent: number // dépenses du joueur cette semaine
  log: string[]
  stats: { totalRevenue: number; totalFans: number; countriesReached: string[] }
}

export type Result = { state: GameState; error?: string; info?: string }
