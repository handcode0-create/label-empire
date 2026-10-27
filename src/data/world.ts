export const CITIES = [
  { id: 'abidjan', name: 'Abidjan', country: "Côte d'Ivoire", rent: 2600, tier: 'B' },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', rent: 4200, tier: 'A' },
  { id: 'paris', name: 'Paris', country: 'France', rent: 8000, tier: 'A' },
  { id: 'newyork', name: 'New York', country: 'États-Unis', rent: 12000, tier: 'A' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'Afrique du Sud', rent: 3800, tier: 'B' },
  { id: 'seoul', name: 'Séoul', country: 'Corée du Sud', rent: 7000, tier: 'A' },
] as const

export const GENRES = ['Afro-pop', 'Coupé-décalé', 'Hip-hop', 'R&B', 'Amapiano', 'Pop', 'Électro', 'Rock']
export const NATIONALITIES = ['Ivoirienne', 'Nigériane', 'Ghanéenne', 'Sénégalaise', 'Française', 'Sud-africaine', 'Américaine', 'Autre']

export const LOGOS = ['diamant', 'anneau', 'hexagone', 'triangle', 'losange', 'monogramme', 'blason'] as const
export type LogoId = (typeof LOGOS)[number]

export const STAFF_LABELS: Record<string, string> = {
  negociation: 'Négociation', reperage: 'Repérage', production: 'Production',
  marketing: 'Marketing', finance: 'Finance', reseau: 'Réseau',
}
export const ARTIST_LABELS: Record<string, string> = {
  voix: 'Voix', ecriture: 'Écriture', charisme: 'Charisme',
  scene: 'Scène', creativite: 'Créativité', endurance: 'Endurance',
}
