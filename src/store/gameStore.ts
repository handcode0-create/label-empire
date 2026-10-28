import { create } from 'zustand'
import { advanceWeek } from '../engine/advanceWeek'
import { createGame, startingCash, validateConfig } from '../engine/newGame'
import type { GameState, NewGameConfig, Result } from '../engine/types'

const initial: NewGameConfig = {
  labelName: 'Savane Records', logoId: 'anneau', founderName: 'Smith Junior', nationality: 'Ivoirienne',
  mainGenre: 'Afro-pop', startReputation: 15, alsoArtist: true,
  staffSkills: { negociation: 3, reperage: 2, production: 1, marketing: 2, finance: 1, reseau: 1 },
  artistSkills: { voix: 3, ecriture: 2, charisme: 2, scene: 1, creativite: 1, endurance: 1 },
  hqCityId: 'abidjan', currency: 'USD', difficulty: 'normal', seed: Date.now() % 2 ** 31,
}

export const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

const SAVE_KEY = 'label-empire-save-v2'
const readSave = (): GameState | null => { try { const t = localStorage.getItem(SAVE_KEY); return t ? (JSON.parse(t) as GameState) : null } catch { return null } }
const writeSave = (g: GameState | null) => { try { if (g) localStorage.setItem(SAVE_KEY, JSON.stringify(g)); else localStorage.removeItem(SAVE_KEY) } catch { /* stockage indisponible */ } }

export interface Selection { duelId: string | null; candidateId: string | null; artistId: string | null; songId: string | null; cityId: string | null; studioId: string | null; week: number | null; rivalId?: string | null; labelName?: string | null; viewSongId?: string | null; projectId?: string | null }
export interface Toast { id: number; text: string; tone: 'ok' | 'err' }
export type Modal = null | 'options' | 'credits' | 'save'

interface Store {
  config: NewGameConfig
  game: GameState | null
  sel: Selection
  toast: Toast | null
  modal: Modal
  scene: string | null
  options: { sound: boolean; autosave: boolean }
  patch: (p: Partial<NewGameConfig>) => void
  setSkill: (group: 'staffSkills' | 'artistSkills', key: string, delta: number) => void
  errors: () => string[]
  cash: () => number
  start: () => boolean
  select: (p: Partial<Selection>) => void
  say: (text: string, tone?: 'ok' | 'err') => void
  /** Exécute une action du moteur ; renvoie true si elle a réussi. */
  run: (fn: (g: GameState) => Result) => boolean
  nextWeek: () => void
  hasSave: () => boolean
  load: () => boolean
  quit: () => void
  setModal: (m: Modal) => void
  playScene: (id: string) => void
  endScene: () => void
  setOption: (k: 'sound' | 'autosave', v: boolean) => void
  go: (screen: string) => void
  freeMode: () => void
}

let toastId = 0
export const useGame = create<Store>((set, get) => ({
  config: initial,
  game: null,
  sel: { duelId: null, candidateId: null, artistId: null, songId: null, cityId: null, studioId: null, week: null },
  toast: null,
  modal: null,
  scene: null,
  options: { sound: true, autosave: true },
  patch: (p) => set((s) => ({ config: { ...s.config, ...p } })),
  setSkill: (group, key, delta) => set((s) => {
    const cur = s.config[group]
    const next = (cur[key] ?? 0) + delta
    if (next < 0 || (delta > 0 && sum(cur) >= 10)) return s
    return { config: { ...s.config, [group]: { ...cur, [key]: next } } }
  }),
  errors: () => validateConfig(get().config),
  cash: () => startingCash(get().config.startReputation, get().config.difficulty, get().config.capital),
  start: () => {
    if (validateConfig(get().config).length) return false
    const g = createGame({ ...get().config, seed: Date.now() % 2 ** 31 })
    set({ game: g, sel: { duelId: null, candidateId: null, artistId: null, songId: null, cityId: null, studioId: null, week: null } })
    writeSave(g)
    return true
  },
  select: (p) => set((s) => ({ sel: { ...s.sel, ...p } })),
  say: (text, tone = 'ok') => {
    const id = ++toastId
    set({ toast: { id, text, tone } })
    setTimeout(() => { if (get().toast?.id === id) set({ toast: null }) }, 4200)
  },
  run: (fn) => {
    const g = get().game
    if (!g) return false
    const r = fn(g)
    if (r.error) { get().say(r.error, 'err'); if (r.state !== g) { set({ game: r.state }); if (get().options.autosave) writeSave(r.state) } return false }
    set({ game: r.state })
    if (get().options.autosave) writeSave(r.state)
    if (r.info) get().say(r.info, 'ok')
    return true
  },
  nextWeek: () => {
    const g = get().game
    if (!g) return
    const n = advanceWeek(g)
    set({ game: n })
    if (get().options.autosave) writeSave(n)
  },
  hasSave: () => readSave() !== null,
  load: () => {
    const g = readSave()
    if (!g) { get().say('Aucune sauvegarde trouvée.', 'err'); return false }
    set({ game: { ...g, tournament: g.tournament ?? null, seenScenes: g.seenScenes ?? [], projects: g.projects ?? [], objectives: g.objectives ?? [], deal: g.deal ?? null, bailouts: g.bailouts ?? 0, certs: g.certs ?? [] } })
    return true
  },
  quit: () => { set({ game: null }) },
  setModal: (m) => set({ modal: m }),
  playScene: (id) => set({ scene: id }),
  endScene: () => {
    const id = get().scene
    const g = get().game
    set({ scene: null })
    if (!id || !g) return
    const n = { ...g, seenScenes: [...new Set([...(g.seenScenes ?? []), id])] }
    set({ game: n })
    if (get().options.autosave) writeSave(n)
  },
  setOption: (k, v) => set((s) => ({ options: { ...s.options, [k]: v } })),
  go: (screen) => { location.hash = screen },
  freeMode: () => {
    const g = get().game
    if (!g) return
    const n = { ...g, outcome: null, freeMode: true }
    set({ game: n }); writeSave(n)
  },
}))

/** Raccourci pour les boutons : exécute fn ; reste sur l'écran si fn renvoie false. */
export const guard = (fn: () => boolean | void) => (e: { preventDefault: () => void }) => { if (fn() === false) e.preventDefault() }

// Outil de test en développement : permet aux scripts de navigateur de lire/écrire l'état.
if (import.meta.env.DEV) (window as unknown as { __game: typeof useGame }).__game = useGame
