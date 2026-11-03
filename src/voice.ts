import { useGame } from './store/gameStore'

/** Lecture à voix haute des textes du jeu, avec la synthèse vocale du navigateur (aucun fichier audio). */
export const voiceSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

type Gender = 'f' | 'm' | 'n'
interface Profile { gender: Gender; pitch: number; rate: number; slot: number }
/** Chaque personnage garde sa voix : genre, hauteur, débit et numéro de voix (pour que deux femmes ne se ressemblent pas). */
const PROFILES: Record<string, Profile> = {
  narrateur: { gender: 'n', pitch: 0.9, rate: 0.94, slot: 0 },
  ines: { gender: 'f', pitch: 1.02, rate: 1.0, slot: 0 },
  awa: { gender: 'f', pitch: 1.18, rate: 1.04, slot: 1 },
  kwame: { gender: 'm', pitch: 0.88, rate: 1.06, slot: 0 },
  tomas: { gender: 'm', pitch: 0.68, rate: 0.93, slot: 1 },
  joueur: { gender: 'n', pitch: 1.0, rate: 1.0, slot: 2 },
  artiste: { gender: 'm', pitch: 0.95, rate: 1.03, slot: 3 },
}
const FEMALE = /(denise|eloise|éloïse|julie|hortense|amelie|amélie|marie|claire|audrey|aurelie|aurélie|sylvie|brigitte|charline|vivienne|brigitte|female|femme|lea|léa|celine|céline)/i
const MALE = /(henri|paul|claude|antoine|remy|rémy|thomas|nicolas|mathieu|jerome|jérôme|guillaume|maxime|hugo|male|homme|lucas)/i
const rank = (v: SpeechSynthesisVoice) => (/natural|neural|online/i.test(v.name) ? 0 : v.localService ? 2 : 1) + (/fr[-_]fr/i.test(v.lang) ? 0 : 0.5)

let cache: SpeechSynthesisVoice[] = []
const frVoices = () => {
  if (!voiceSupported()) return []
  if (!cache.length) cache = speechSynthesis.getVoices().filter((v) => /^fr/i.test(v.lang)).sort((a, b) => rank(a) - rank(b))
  return cache
}
if (voiceSupported()) speechSynthesis.addEventListener?.('voiceschanged', () => { cache = [] })

export const hasFrenchVoice = () => frVoices().length > 0

function pickVoice(gender: Gender, slot: number): SpeechSynthesisVoice | undefined {
  const all = frVoices()
  if (!all.length) return undefined
  const pool = gender === 'f' ? all.filter((v) => FEMALE.test(v.name)) : gender === 'm' ? all.filter((v) => MALE.test(v.name) && !FEMALE.test(v.name)) : []
  const list = pool.length ? pool : all
  return list[slot % list.length]
}

/** Nettoie un texte pour la lecture (symboles, montants, puces). */
export function speakable(text: string): string {
  return text
    .replace(/\$\s?(\d(?:[\d\s  ]*\d)?)/g, '$1 dollars')
    .replace(/(\d+)\s?%/g, '$1 pour cent')
    .replace(/n°\s?(\d+)/gi, 'numéro $1')
    .replace(/[·•→▶▼▲★✦◆]/g, ',')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stopSpeaking() { if (voiceSupported()) speechSynthesis.cancel() }

export interface SpeakOpts { who?: string; look?: 'f' | 'm'; force?: boolean; onEnd?: () => void }
/** Lit un texte avec la voix du personnage. Sans effet si la voix est désactivée (sauf `force`). */
export function speak(text: string, o: SpeakOpts = {}) {
  if (!voiceSupported()) return
  const { options } = useGame.getState()
  if (!options.voice && !o.force) return
  const base = PROFILES[o.who ?? 'narrateur'] ?? PROFILES.narrateur
  const gender: Gender = o.who === 'joueur' ? (o.look === 'm' ? 'm' : 'f') : base.gender
  const clean = speakable(text)
  if (!clean) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(clean)
  u.lang = 'fr-FR'
  const v = pickVoice(gender, base.slot)
  if (v) { u.voice = v; u.lang = v.lang }
  u.pitch = Math.min(2, Math.max(0.1, base.pitch * (gender === 'f' && o.who === 'joueur' ? 1.1 : 1)))
  u.rate = Math.min(2, Math.max(0.5, base.rate * (options.voiceRate ?? 1)))
  u.volume = options.voiceVolume ?? 1
  if (o.onEnd) u.onend = o.onEnd
  speechSynthesis.speak(u)
}
