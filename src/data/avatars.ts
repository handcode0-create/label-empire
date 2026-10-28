import { hash } from '../engine/rng'
import { cityById } from './world'

/** Régions de la bibliothèque d'avatars (2 femmes + 2 hommes par région = 36 portraits). */
export const AVATAR_REGIONS = [
  { id: 'afrique-ouest', label: "Afrique de l'Ouest", look: "West African, deep brown skin" },
  { id: 'afrique-est-sud', label: 'Afrique australe et orientale', look: 'Southern or East African, rich brown skin' },
  { id: 'afrique-nord', label: 'Afrique du Nord', look: 'North African, olive to tan skin' },
  { id: 'europe', label: 'Europe', look: 'European, light to medium skin, mixed backgrounds' },
  { id: 'amerique-nord', label: 'Amérique du Nord', look: 'North American, diverse backgrounds' },
  { id: 'amerique-latine', label: 'Amérique latine', look: 'Latin American, warm tan skin' },
  { id: 'asie-est', label: "Asie de l'Est", look: 'East Asian' },
  { id: 'asie-sud-ouest', label: 'Asie du Sud et Moyen-Orient', look: 'South Asian or Middle Eastern' },
  { id: 'oceanie', label: 'Océanie', look: 'Oceanian, Pacific Islander or Australian' },
] as const
export type AvatarRegion = (typeof AVATAR_REGIONS)[number]['id']

const FEMALE = new Set(['Ama', 'Awa', 'Fatou', 'Efua', 'Sika', 'Bintou', 'Mariam', 'Aïcha', 'Ngozi', 'Tiwa', 'Léa', 'Inès', 'Chloé', 'Jana', 'Elena', 'Maya', 'Skye', 'Imani', 'Yara', 'Bia', 'Camila', 'Hana', 'Mei', 'Priya', 'Mia'])
export const genderOf = (name: string): 'f' | 'm' => (FEMALE.has(name.trim().split(/\s+/)[0]) ? 'f' : 'm')

export function regionOfCity(cityId: string): AvatarRegion {
  const c = cityById(cityId)
  switch (c.region) {
    case 'afrique-ouest': return 'afrique-ouest'
    case 'afrique-australe': case 'afrique-est': return 'afrique-est-sud'
    case 'afrique-nord': return 'afrique-nord'
    case 'europe-ouest': return 'europe'
    case 'amerique-nord': return 'amerique-nord'
    case 'amerique-latine': return 'amerique-latine'
    case 'asie-est': return 'asie-est'
    case 'asie-sud': case 'asie-ouest': return 'asie-sud-ouest'
    default: return 'oceanie'
  }
}

/** Clé de portrait, ex. « afrique-ouest-f2 » : région, genre déduit du prénom, variante choisie selon l'identifiant. */
export function avatarKey(a: { id: string; stageName: string; realName?: string; originCityId: string }): string {
  const g = genderOf(a.realName ?? a.stageName)
  // Les portraits d'Afrique de l'Ouest servent pour tout le continent africain.
  const r = regionOfCity(a.originCityId)
  return `${r.startsWith('afrique') ? 'afrique-ouest' : r}-${g}${1 + (hash(a.id) % 2)}`
}
export const ALL_AVATAR_KEYS = AVATAR_REGIONS.flatMap((r) => ['f1', 'f2', 'm1', 'm2'].map((v) => `${r.id}-${v}`))
