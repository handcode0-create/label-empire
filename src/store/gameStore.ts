import { create } from 'zustand'
import { advanceWeek } from '../engine/advanceWeek'
import { createGame, startingCash, validateConfig } from '../engine/newGame'
import type { GameState, NewGameConfig } from '../engine/types'

const initial: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'anneau', founderName: 'Smith Junior', nationality: 'Ivoirienne',
  mainGenre: 'Afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: Date.now() % 2 ** 31,
}

export const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

interface Store {
  config: NewGameConfig
  game: GameState | null
  patch: (p: Partial<NewGameConfig>) => void
  setSkill: (group: 'staffSkills' | 'artistSkills', key: string, delta: number) => void
  errors: () => string[]
  cash: () => number
  start: () => boolean
  nextWeek: () => void
}

export const useGame = create<Store>((set, get) => ({
  config: initial,
  game: null,
  patch: (p) => set((s) => ({ config: { ...s.config, ...p } })),
  setSkill: (group, key, delta) => set((s) => {
    const cur = s.config[group]
    const next = (cur[key] ?? 0) + delta
    if (next < 0 || (delta > 0 && sum(cur) >= 10)) return s
    return { config: { ...s.config, [group]: { ...cur, [key]: next } } }
  }),
  errors: () => validateConfig(get().config),
  cash: () => startingCash(get().config.startReputation, get().config.difficulty),
  start: () => {
    if (validateConfig(get().config).length) return false
    set({ game: createGame(get().config) })
    return true
  },
  nextWeek: () => { const g = get().game; if (g) set({ game: advanceWeek(g, { actions: [] }) }) },
}))
