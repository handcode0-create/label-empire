import { create } from 'zustand'
import { createGame, startingCash, validateConfig } from '../engine/newGame'
import type { GameState, NewGameConfig } from '../engine/types'

export type Screen = 'menu' | 'new1' | 'new2' | 'hub'

const draft: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'anneau', founderName: '', nationality: 'Ivoirienne',
  mainGenre: 'Afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 0, reperage: 0, production: 0, marketing: 0, finance: 0, reseau: 0 },
  artistSkills: { voix: 0, ecriture: 0, charisme: 0, scene: 0, creativite: 0, endurance: 0 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: Date.now() % 2 ** 31,
}

interface Store {
  screen: Screen
  config: NewGameConfig
  game: GameState | null
  go: (s: Screen) => void
  patch: (p: Partial<NewGameConfig>) => void
  setSkill: (group: 'staffSkills' | 'artistSkills', key: string, delta: number) => void
  errors: () => string[]
  cash: () => number
  start: () => void
}

const total = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

export const useGame = create<Store>((set, get) => ({
  screen: 'menu', config: draft, game: null,
  go: (screen) => set({ screen }),
  patch: (p) => set((s) => ({ config: { ...s.config, ...p } })),
  setSkill: (group, key, delta) => set((s) => {
    const cur = s.config[group]
    const next = (cur[key] ?? 0) + delta
    if (next < 0 || (delta > 0 && total(cur) >= 10)) return s
    return { config: { ...s.config, [group]: { ...cur, [key]: next } } }
  }),
  errors: () => validateConfig(get().config),
  cash: () => startingCash(get().config.startReputation, get().config.difficulty),
  start: () => { if (!validateConfig(get().config).length) set({ game: createGame(get().config), screen: 'hub' }) },
}))
