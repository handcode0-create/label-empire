export type Continent = 'Afrique' | 'Europe' | 'Amérique du Nord' | 'Amérique latine' | 'Asie' | 'Océanie'
export const CONTINENTS: Continent[] = ['Afrique', 'Europe', 'Amérique du Nord', 'Amérique latine', 'Asie', 'Océanie']

export const GENRES = ['Afro-pop', 'Coupé-décalé', 'Hip-hop', 'R&B', 'Amapiano', 'Pop', 'Électro', 'Rock', 'Mbalax', 'Kuduro'] as const
export const NATIONALITIES = ['Ivoirienne', 'Nigériane', 'Ghanéenne', 'Sénégalaise', 'Française', 'Sud-africaine', 'Américaine', 'Autre']

export interface City {
  id: string; name: string; country: string; continent: Continent
  x: number; y: number // position en % sur la carte
  region: string // zone de diffusion
  tier: 'A' | 'B' | 'C' | 'D'
  base: number // écoutes hebdomadaires de référence
  rent: number // loyer mensuel d'un bureau
  tax: number // retenue sur les revenus
  piracy: number
  delay: number // semaines avant paiement des revenus
  lang: string
  strong: string[] // genres porteurs
  currency: 'USD' | 'EUR' | 'XOF' | 'NGN' | 'ZAR' | 'GBP' | 'KRW' | 'AUD' | 'BRL' | 'JPY' | 'INR' | 'AED' | 'MXN' | 'EGP' | 'GHS' | 'KES' | 'AOA'
  minRep: number // réputation requise pour sortir ou ouvrir un bureau
  visa: boolean // visa à prévoir pour une tournée
  festivals: string[]
}

const C = (c: City) => c
export const CITIES: City[] = [
  C({ id: 'abidjan', name: 'Abidjan', country: "Côte d'Ivoire", continent: 'Afrique', x: 48.9, y: 47.1, region: 'afrique-ouest', tier: 'B', base: 1_000_000, rent: 2600, tax: 0.15, piracy: 0.22, delay: 2, lang: 'français', strong: ['Coupé-décalé', 'Afro-pop'], currency: 'XOF', minRep: 0, visa: false, festivals: ['Festival des Lagunes'] }),
  C({ id: 'dakar', name: 'Dakar', country: 'Sénégal', continent: 'Afrique', x: 44.8, y: 40.5, region: 'afrique-ouest', tier: 'C', base: 600_000, rent: 2200, tax: 0.14, piracy: 0.25, delay: 3, lang: 'français', strong: ['Mbalax', 'Hip-hop', 'Afro-pop'], currency: 'XOF', minRep: 5, visa: false, festivals: ['Dakar Live'] }),
  C({ id: 'accra', name: 'Accra', country: 'Ghana', continent: 'Afrique', x: 50.2, y: 46.9, region: 'afrique-ouest', tier: 'C', base: 700_000, rent: 2400, tax: 0.13, piracy: 0.3, delay: 4, lang: 'anglais', strong: ['Hip-hop', 'Afro-pop'], currency: 'GHS', minRep: 8, visa: false, festivals: ['Accra Sunset'] }),
  C({ id: 'lagos', name: 'Lagos', country: 'Nigeria', continent: 'Afrique', x: 50.9, y: 46.4, region: 'afrique-ouest', tier: 'A', base: 3_000_000, rent: 4200, tax: 0.12, piracy: 0.38, delay: 6, lang: 'anglais', strong: ['Afro-pop', 'R&B', 'Hip-hop'], currency: 'NGN', minRep: 10, visa: false, festivals: ['Lagos Carnival'] }),
  C({ id: 'luanda', name: 'Luanda', country: 'Angola', continent: 'Afrique', x: 54.2, y: 60, region: 'afrique-australe', tier: 'C', base: 500_000, rent: 2300, tax: 0.15, piracy: 0.3, delay: 5, lang: 'portugais', strong: ['Kuduro', 'Afro-pop'], currency: 'AOA', minRep: 15, visa: true, festivals: ['Nuit de Luanda'] }),
  C({ id: 'johannesburg', name: 'Johannesburg', country: 'Afrique du Sud', continent: 'Afrique', x: 57.8, y: 64.4, region: 'afrique-australe', tier: 'A', base: 2_200_000, rent: 3800, tax: 0.15, piracy: 0.12, delay: 3, lang: 'anglais', strong: ['Amapiano', 'Hip-hop', 'Pop'], currency: 'ZAR', minRep: 20, visa: false, festivals: ['Joburg Beats'] }),
  C({ id: 'nairobi', name: 'Nairobi', country: 'Kenya', continent: 'Afrique', x: 60.5, y: 54, region: 'afrique-est', tier: 'C', base: 650_000, rent: 2500, tax: 0.14, piracy: 0.28, delay: 4, lang: 'anglais', strong: ['Afro-pop', 'Hip-hop'], currency: 'KES', minRep: 15, visa: false, festivals: ['Nairobi Sound'] }),
  C({ id: 'cairo', name: 'Le Caire', country: 'Égypte', continent: 'Afrique', x: 56, y: 33.5, region: 'afrique-nord', tier: 'B', base: 1_100_000, rent: 2700, tax: 0.15, piracy: 0.35, delay: 4, lang: 'arabe', strong: ['Pop', 'Électro'], currency: 'EGP', minRep: 25, visa: true, festivals: ['Cairo Nights'] }),
  C({ id: 'paris', name: 'Paris', country: 'France', continent: 'Europe', x: 50.6, y: 22.8, region: 'europe-ouest', tier: 'A', base: 3_200_000, rent: 8000, tax: 0.2, piracy: 0.08, delay: 3, lang: 'français', strong: ['Hip-hop', 'Afro-pop', 'Électro', 'Pop'], currency: 'EUR', minRep: 25, visa: false, festivals: ['Paris Open Air'] }),
  C({ id: 'london', name: 'Londres', country: 'Royaume-Uni', continent: 'Europe', x: 49.4, y: 21.2, region: 'europe-ouest', tier: 'A', base: 3_800_000, rent: 9500, tax: 0.2, piracy: 0.07, delay: 3, lang: 'anglais', strong: ['Hip-hop', 'R&B', 'Électro', 'Afro-pop'], currency: 'GBP', minRep: 30, visa: true, festivals: ['London Summer Fest'] }),
  C({ id: 'berlin', name: 'Berlin', country: 'Allemagne', continent: 'Europe', x: 53.7, y: 20.8, region: 'europe-ouest', tier: 'A', base: 2_600_000, rent: 6500, tax: 0.19, piracy: 0.06, delay: 3, lang: 'allemand', strong: ['Électro', 'Hip-hop', 'Rock'], currency: 'EUR', minRep: 30, visa: false, festivals: ['Berlin Electro Days'] }),
  C({ id: 'newyork', name: 'New York', country: 'États-Unis', continent: 'Amérique du Nord', x: 29.4, y: 27.4, region: 'amerique-nord', tier: 'A', base: 5_500_000, rent: 12000, tax: 0.22, piracy: 0.05, delay: 3, lang: 'anglais', strong: ['Hip-hop', 'R&B', 'Pop'], currency: 'USD', minRep: 40, visa: true, festivals: ['NYC Summer Stage'] }),
  C({ id: 'losangeles', name: 'Los Angeles', country: 'États-Unis', continent: 'Amérique du Nord', x: 17.2, y: 31.1, region: 'amerique-nord', tier: 'A', base: 5_000_000, rent: 11000, tax: 0.22, piracy: 0.05, delay: 3, lang: 'anglais', strong: ['Pop', 'Hip-hop', 'R&B', 'Rock'], currency: 'USD', minRep: 40, visa: true, festivals: ['Sunset Strip Live'] }),
  C({ id: 'mexico', name: 'Mexico', country: 'Mexique', continent: 'Amérique du Nord', x: 22.5, y: 39.2, region: 'amerique-latine', tier: 'B', base: 1_800_000, rent: 3600, tax: 0.18, piracy: 0.2, delay: 5, lang: 'espagnol', strong: ['Pop', 'Hip-hop'], currency: 'MXN', minRep: 40, visa: true, festivals: ['Ciudad Sonora'] }),
  C({ id: 'saopaulo', name: 'São Paulo', country: 'Brésil', continent: 'Amérique latine', x: 37.1, y: 63.1, region: 'amerique-latine', tier: 'A', base: 3_000_000, rent: 4800, tax: 0.18, piracy: 0.25, delay: 5, lang: 'portugais', strong: ['Pop', 'Électro', 'Kuduro'], currency: 'BRL', minRep: 45, visa: true, festivals: ['Sampa Festival'] }),
  C({ id: 'dubai', name: 'Dubaï', country: 'Émirats arabes unis', continent: 'Asie', x: 65.4, y: 36, region: 'asie-ouest', tier: 'B', base: 1_300_000, rent: 7000, tax: 0.05, piracy: 0.15, delay: 3, lang: 'arabe', strong: ['Pop', 'Électro'], currency: 'AED', minRep: 35, visa: true, festivals: ['Desert Beats'] }),
  C({ id: 'mumbai', name: 'Mumbai', country: 'Inde', continent: 'Asie', x: 70.2, y: 39.4, region: 'asie-sud', tier: 'A', base: 3_400_000, rent: 3200, tax: 0.18, piracy: 0.3, delay: 6, lang: 'hindi', strong: ['Pop', 'Électro'], currency: 'INR', minRep: 50, visa: true, festivals: ['Mumbai Mela'] }),
  C({ id: 'seoul', name: 'Séoul', country: 'Corée du Sud', continent: 'Asie', x: 85.3, y: 29.2, region: 'asie-est', tier: 'A', base: 3_300_000, rent: 7000, tax: 0.2, piracy: 0.06, delay: 4, lang: 'coréen', strong: ['Pop', 'Hip-hop', 'R&B'], currency: 'KRW', minRep: 50, visa: true, festivals: ['Han River Fest'] }),
  C({ id: 'tokyo', name: 'Tokyo', country: 'Japon', continent: 'Asie', x: 88.8, y: 30.2, region: 'asie-est', tier: 'A', base: 4_200_000, rent: 9000, tax: 0.2, piracy: 0.05, delay: 4, lang: 'japonais', strong: ['Pop', 'Électro', 'Rock'], currency: 'JPY', minRep: 55, visa: true, festivals: ['Tokyo Neon Live'] }),
  C({ id: 'sydney', name: 'Sydney', country: 'Australie', continent: 'Océanie', x: 91.9, y: 68.8, region: 'oceanie', tier: 'B', base: 1_900_000, rent: 8000, tax: 0.2, piracy: 0.06, delay: 4, lang: 'anglais', strong: ['Pop', 'Électro', 'Rock'], currency: 'AUD', minRep: 55, visa: true, festivals: ['Harbour Sounds'] }),
]

export const cityById = (id: string): City => {
  const c = CITIES.find((x) => x.id === id)
  if (!c) throw new Error(`Ville inconnue : ${id}`)
  return c
}

/** Affinité d'un genre avec un marché : 1,0 = neutre. */
export function affinity(genre: string, city: City): number {
  if (city.strong.includes(genre)) return 1.35 - 0.1 * city.strong.indexOf(genre)
  return genre === 'Pop' ? 1 : 0.8
}

export const TIER_LABEL: Record<City['tier'], string> = { A: 'Marché majeur', B: 'Marché solide', C: 'Marché émergent', D: 'Marché naissant' }

export const PALIERS = [
  { n: 1, name: 'Label local', min: 0 },
  { n: 2, name: 'Label national', min: 25 },
  { n: 3, name: 'Label régional', min: 50 },
  { n: 4, name: 'Label continental', min: 75 },
  { n: 5, name: 'Label mondial', min: 100 },
]
export const palierFor = (rep: number) => [...PALIERS].reverse().find((p) => rep >= p.min)!

export const LOGOS = ['diamant', 'anneau', 'hexagone', 'triangle', 'losange', 'monogramme', 'blason'] as const

export const STAFF_LABELS: Record<string, string> = {
  negociation: 'Négociation', reperage: 'Repérage', production: 'Production',
  marketing: 'Marketing', finance: 'Finance', reseau: 'Réseau',
}
export const ARTIST_LABELS: Record<string, string> = {
  voix: 'Voix', ecriture: 'Écriture', charisme: 'Charisme',
  scene: 'Scène', creativite: 'Créativité', endurance: 'Endurance',
}
