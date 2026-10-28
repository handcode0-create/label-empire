import type { City } from './world'

export interface Studio { id: string; name: string; cityId: string; pricePerDay: number; quality: number; producer: string; stars: number; genres: string[] }
export const STUDIOS: Studio[] = [
  { id: 'ebene', name: 'Studio Ébène', cityId: 'abidjan', pricePerDay: 590, quality: 62, producer: 'Yao Séka', stars: 2, genres: ['Coupé-décalé', 'Afro-pop'] },
  { id: 'dakar', name: 'Mix Lab Dakar', cityId: 'dakar', pricePerDay: 730, quality: 66, producer: 'Ibou Faye', stars: 2, genres: ['Mbalax', 'Hip-hop'] },
  { id: 'accra', name: 'Accra Tape House', cityId: 'accra', pricePerDay: 910, quality: 68, producer: 'Nana Owusu', stars: 3, genres: ['Hip-hop', 'Afro-pop'] },
  { id: 'eko', name: 'Eko Sound Lab', cityId: 'lagos', pricePerDay: 1260, quality: 74, producer: 'Tayo Bello', stars: 4, genres: ['Afro-pop', 'R&B'] },
  { id: 'luanda', name: 'Luanda Beat', cityId: 'luanda', pricePerDay: 770, quality: 64, producer: 'Zeca Neto', stars: 2, genres: ['Kuduro'] },
  { id: 'joburg', name: 'Joburg Tapes', cityId: 'johannesburg', pricePerDay: 1540, quality: 78, producer: 'Lwazi Khumalo', stars: 3, genres: ['Amapiano', 'Hip-hop'] },
  { id: 'nairobi', name: 'Nairobi Tapes', cityId: 'nairobi', pricePerDay: 840, quality: 67, producer: 'Amani Otieno', stars: 2, genres: ['Afro-pop'] },
  { id: 'cairo', name: 'Cairo Vox', cityId: 'cairo', pricePerDay: 980, quality: 70, producer: 'Karim Fouad', stars: 3, genres: ['Pop', 'Électro'] },
  { id: 'rivoli', name: 'Maison Rivoli', cityId: 'paris', pricePerDay: 2520, quality: 83, producer: 'Marc Lefèvre', stars: 4, genres: ['Hip-hop', 'Pop', 'Électro'] },
  { id: 'abbey', name: 'Abbey Row Studios', cityId: 'london', pricePerDay: 3640, quality: 86, producer: 'Oliver Pryce', stars: 4, genres: ['Pop', 'R&B', 'Rock'] },
  { id: 'kontrol', name: 'Berlin Kontrol', cityId: 'berlin', pricePerDay: 2100, quality: 80, producer: 'Jana Weiss', stars: 3, genres: ['Électro', 'Rock'] },
  { id: 'brooklyn', name: 'Brooklyn Basement', cityId: 'newyork', pricePerDay: 3920, quality: 89, producer: 'Dre Hollis', stars: 5, genres: ['Hip-hop', 'R&B'] },
  { id: 'sunset', name: 'Sunset Rec', cityId: 'losangeles', pricePerDay: 4480, quality: 92, producer: 'Skye Ramirez', stars: 5, genres: ['Pop', 'Hip-hop', 'R&B'] },
  { id: 'mexico', name: 'Estudio Sonora', cityId: 'mexico', pricePerDay: 1400, quality: 73, producer: 'Diego Salas', stars: 3, genres: ['Pop', 'Hip-hop'] },
  { id: 'sampa', name: 'Sampa Sound', cityId: 'saopaulo', pricePerDay: 1820, quality: 76, producer: 'Bia Carvalho', stars: 3, genres: ['Pop', 'Électro'] },
  { id: 'dubai', name: 'Dubai Gold Studio', cityId: 'dubai', pricePerDay: 2800, quality: 84, producer: 'Rami Haddad', stars: 4, genres: ['Pop', 'Électro'] },
  { id: 'mumbai', name: 'Mumbai Wave', cityId: 'mumbai', pricePerDay: 1260, quality: 72, producer: 'Rohan Mehta', stars: 3, genres: ['Pop', 'Électro'] },
  { id: 'hanriver', name: 'Han River Studio', cityId: 'seoul', pricePerDay: 3360, quality: 88, producer: 'Ji-woo Park', stars: 4, genres: ['Pop', 'Hip-hop', 'R&B'] },
  { id: 'neon', name: 'Tokyo Neon', cityId: 'tokyo', pricePerDay: 3780, quality: 90, producer: 'Ren Sato', stars: 5, genres: ['Pop', 'Électro', 'Rock'] },
  { id: 'harbour', name: 'Harbour Rec', cityId: 'sydney', pricePerDay: 3080, quality: 85, producer: 'Jack Moreau', stars: 4, genres: ['Pop', 'Rock', 'Électro'] },
]
export const studioById = (id: string) => STUDIOS.find((s) => s.id === id)!

export const SESSION_OPTIONS = [{ days: 2, label: '2 jours', weeks: 1, q: -2 }, { days: 4, label: '4 jours', weeks: 1, q: 0 }, { days: 7, label: '1 semaine', weeks: 2, q: 3 }]

export interface MixOption { id: string; name: string; desc: string; cost: number; weeks: number; bonus: number; risk: 'Faible' | 'Moyen'; label: string }
export const MIX_OPTIONS: MixOption[] = [
  { id: 'interne', name: 'Mix interne', desc: 'Votre équipe mixe sur place.', cost: 0, weeks: 1, bonus: 0, risk: 'Moyen', label: '1 semaine' },
  { id: 'local', name: 'Ingénieur local', desc: 'Un ingénieur du son reconnu dans la ville du studio.', cost: 2700, weeks: 2, bonus: 6, risk: 'Faible', label: '10 jours' },
  { id: 'international', name: 'Mix international', desc: 'Studio de renom, master inclus.', cost: 9500, weeks: 3, bonus: 12, risk: 'Faible', label: '3 semaines' },
]
export const MASTERING = { cost: 900, bonus: 3 }

export interface LocOption { id: string; name: string; desc: string; cost: number; weeks: number }
export const LOC_OPTIONS: LocOption[] = [
  { id: 'en', name: 'Version anglaise', desc: 'Pour les marchés anglophones', cost: 5500, weeks: 1 },
  { id: 'amapiano', name: 'Remix amapiano', desc: "Pour l'Afrique australe", cost: 3500, weeks: 1 },
  { id: 'clip', name: 'Clip adapté', desc: 'Image et réseaux sociaux', cost: 12000, weeks: 3 },
]

export interface Partner { id: string; name: string; kind: 'Promoteur' | 'Sponsor' | 'Billetterie' | 'Transport'; desc: string; share: number; guarantee: number; sold: number; fatigue: number; risk: number; minRep: number }
export const PARTNERS: Partner[] = [
  { id: 'nova', name: 'Nova Live', kind: 'Promoteur', desc: 'Réduit les risques, prend 12 % de la billetterie.', share: 0.12, guarantee: 0, sold: 0.1, fatigue: 0, risk: 0.5, minRep: 0 },
  { id: 'kola', name: 'Kola Fizz', kind: 'Sponsor', desc: '$15 000 garantis, logo sur scène.', share: 0, guarantee: 15000, sold: 0, fatigue: 0, risk: 0, minRep: 0 },
  { id: 'streambox', name: 'StreamBox', kind: 'Sponsor', desc: '$30 000 garantis, exige une réputation de 35.', share: 0, guarantee: 30000, sold: 0, fatigue: 0, risk: 0, minRep: 35 },
  { id: 'ticketafrik', name: 'TicketAfrik', kind: 'Billetterie', desc: 'Vente en ligne dans 3 pays, frais 5 %.', share: 0.05, guarantee: 0, sold: 0.12, fatigue: 0, risk: 0, minRep: 0 },
  { id: 'airsavane', name: 'AirSavane', kind: 'Transport', desc: 'Jets régionaux, −2 de fatigue par étape.', share: 0, guarantee: 0, sold: 0, fatigue: 2, risk: 0, minRep: 10 },
]

export const TOUR_VENUE_NAMES: Record<string, [string, number][]> = {
  lagos: [['Terra Kulture', 600], ['Muson Centre', 1500], ['Eko Convention Hall', 8000]],
  paris: [['Le Trabendo', 700], ['La Cigale', 1900], ['Accor Arena', 15000]],
  london: [['Jazz Café', 500], ['Roundhouse', 3300], ['Wembley Hall', 12000]],
  berlin: [['Astra Kulturhaus', 1500], ['Columbiahalle', 3500], ['Velodrom', 11000]],
}
export type VenueKind = 'club' | 'theatre' | 'salle' | 'arene' | 'stade'
export interface VenueKindInfo { id: VenueKind; label: string; cap: number; fee: number; minRep: number; ambiance: number; priceMult: number; desc: string }
export const VENUE_KINDS: VenueKindInfo[] = [
  { id: 'club', label: 'Club', cap: 400, fee: 0, minRep: 0, ambiance: 1.12, priceMult: 0.8, desc: 'Intime et électrique : se remplit vite, petites recettes.' },
  { id: 'theatre', label: 'Théâtre', cap: 1200, fee: 600, minRep: 0, ambiance: 1.06, priceMult: 1, desc: 'Assis, bonne acoustique, public fidèle.' },
  { id: 'salle', label: 'Salle de concert', cap: 3000, fee: 1800, minRep: 12, ambiance: 1, priceMult: 1.25, desc: 'La référence des tournées : bon équilibre capacité / coût.' },
  { id: 'arene', label: 'Arène', cap: 9000, fee: 6000, minRep: 30, ambiance: 0.94, priceMult: 1.6, desc: 'Grosse production : il faut des fans pour la remplir.' },
  { id: 'stade', label: 'Stade', cap: 28000, fee: 18000, minRep: 55, ambiance: 0.88, priceMult: 2.2, desc: 'Événement : énormes recettes, énorme risque.' },
]
export const venueKind = (id?: string) => VENUE_KINDS.find((k) => k.id === id) ?? VENUE_KINDS[1]
export interface Venue { name: string; capacity: number; kind: VenueKind; fee: number; minRep: number; ambiance: number; priceMult: number }
export function venuesFor(c: City): Venue[] {
  const k = { A: 1, B: 0.7, C: 0.45, D: 0.3 }[c.tier]
  const named = TOUR_VENUE_NAMES[c.id]
  const call = (kind: VenueKindInfo): { name: string; capacity: number } => {
    const idx = { club: 0, salle: 1, arene: 2 }[kind.id as 'club' | 'salle' | 'arene']
    if (named && idx !== undefined) return { name: named[idx][0], capacity: named[idx][1] }
    const cap = Math.max(50, Math.round((kind.cap * k) / 50) * 50)
    const name = { club: `${c.name} Club`, theatre: `Théâtre de ${c.name}`, salle: `Palais des Sons de ${c.name}`, arene: `Grande Arène de ${c.name}`, stade: `Stade de ${c.name}` }[kind.id]
    return { name, capacity: cap }
  }
  return VENUE_KINDS.map((kind) => {
    let v = call(kind)
    if (named && kind.id === 'theatre') v = { name: `Théâtre de ${c.name}`, capacity: Math.round(Math.sqrt(named[0][1] * named[1][1]) / 50) * 50 }
    if (named && kind.id === 'stade') v = { name: `Stade de ${c.name}`, capacity: Math.round((named[2][1] * 2.5) / 500) * 500 }
    return { ...v, kind: kind.id, fee: kind.fee, minRep: kind.minRep, ambiance: kind.ambiance, priceMult: kind.priceMult }
  })
}

export interface Recruit { id: string; name: string; role: string; cityId: string; level: number; salary: number; skill: 'negociation' | 'reperage' | 'production' | 'marketing' | 'finance' | 'reseau' }
export const ROLE_SKILL: Record<string, Recruit['skill']> = {
  Producteur: 'production', Booker: 'reseau', 'Directeur artistique': 'negociation', Éclaireuse: 'reperage', Marketing: 'marketing', 'Réalisateur de clips': 'marketing', Comptable: 'finance',
}
export const RECRUITS: Recruit[] = [
  { id: 'r1', name: 'Tayo Bello', role: 'Producteur', cityId: 'lagos', level: 4, salary: 1750, skill: 'production' },
  { id: 'r2', name: 'Zainab Yusuf', role: 'Booker', cityId: 'lagos', level: 3, salary: 1380, skill: 'reseau' },
  { id: 'r3', name: 'Marc Lefèvre', role: 'Directeur artistique', cityId: 'paris', level: 3, salary: 2380, skill: 'negociation' },
  { id: 'r4', name: 'Adjoua Koffi', role: 'Éclaireuse', cityId: 'abidjan', level: 2, salary: 880, skill: 'reperage' },
  { id: 'r5', name: 'Samuel Ndiaye', role: 'Marketing', cityId: 'dakar', level: 2, salary: 1120, skill: 'marketing' },
  { id: 'r6', name: 'Nadège Aka', role: 'Réalisateur de clips', cityId: 'abidjan', level: 2, salary: 1000, skill: 'marketing' },
  { id: 'r7', name: 'Fatim Cissé', role: 'Comptable', cityId: 'abidjan', level: 2, salary: 810, skill: 'finance' },
  { id: 'r8', name: 'Kelvin Okoro', role: 'Éclaireuse', cityId: 'lagos', level: 3, salary: 1250, skill: 'reperage' },
  { id: 'r9', name: 'Chloé Dubreuil', role: 'Marketing', cityId: 'paris', level: 4, salary: 2500, skill: 'marketing' },
  { id: 'r10', name: 'Thabo Mokoena', role: 'Directeur artistique', cityId: 'johannesburg', level: 3, salary: 1880, skill: 'negociation' },
]

/** Équipe de départ : 3 personnes (cf. création de partie). */
export const STARTERS = ['r4', 'r5', 'r2']

// ---------- noms (tous fictifs) ----------
export const FIRST: Record<string, string[]> = {
  Afrique: ['Kofi', 'Ama', 'Yao', 'Awa', 'Fatou', 'Moussa', 'Kwame', 'Efua', 'Sika', 'Brice', 'Bintou', 'Seydou', 'Mariam', 'Amadou', 'Aïcha', 'Chidi', 'Ngozi', 'Emeka', 'Zola', 'Thando', 'Amani', 'Zeca'],
  Europe: ['Léa', 'Hugo', 'Inès', 'Mathis', 'Chloé', 'Noah', 'Jana', 'Luca', 'Elena'],
  'Amérique du Nord': ['Jordan', 'Maya', 'Devon', 'Skye', 'Marcus', 'Imani'],
  'Amérique latine': ['Yara', 'Diego', 'Bia', 'Camila', 'Mateo'],
  Asie: ['Min-jun', 'Hana', 'Aarav', 'Mei', 'Ren', 'Priya', 'Rami'],
  Océanie: ['Jack', 'Tane', 'Mia', 'Kai'],
}
export const LAST: Record<string, string[]> = {
  Afrique: ['Traoré', 'Diallo', 'Koné', 'Mensah', 'Boateng', 'Adebayo', 'Okafor', 'Ndiaye', 'Kassi', 'Soro', 'Bamba', 'Quaye', 'Dube', 'Khumalo', 'Costa'],
  Europe: ['Marchetti', 'Lefèvre', 'Bernard', 'Müller', 'Rossi', 'Moreau'],
  'Amérique du Nord': ['Carter', 'Reyes', 'Brooks', 'Hollis'],
  'Amérique latine': ['Costa', 'Salas', 'Carvalho', 'Silva'],
  Asie: ['Park', 'Sato', 'Mehta', 'Tanaka', 'Haddad'],
  Océanie: ['Moreau', 'Walker', 'Rangi'],
}
export const STAGE_WORDS = ['Nova', 'Gold', 'Flow', 'Luna', 'Fogo', 'Sun', 'Flame', 'Diamant', 'Onyx', 'Zen', 'Blaze', 'Echo', 'Ivoire', 'Cobalt', 'Mirage', 'Saphir', 'Vibe', 'Marée']
export const TRAITS = ['Travailleur', 'Ambitieux', 'Exigeant en négociation', 'Créatif', 'Indépendant', 'Loyal', 'Perfectionniste', 'Fêtard']
export const AGENCIES = ['Joburg Talents', 'Plateau Agency', 'Lagune Management', 'Sahel Artists', 'Atlas Booking', 'Harbour Mgmt', 'Delta Représentation']
export const GRADIENTS = ['#35D3F0,#8B5CF6', '#FF3D9A,#FFC63D', '#8B5CF6,#FF5470', '#FFC63D,#FF3D9A', '#3DDC97,#35D3F0', '#FF5470,#8B5CF6']
/** Artistes de la maquette (pseudos fictifs), toujours présents au départ. */
export const SIGNATURE: { stage: string; real: string; cityId: string; genre: string; lang: string }[] = [
  { stage: 'Zola Gold', real: 'Zola Dube', cityId: 'johannesburg', genre: 'Amapiano', lang: 'zoulou, anglais' },
  { stage: 'Aïcha Nova', real: 'Aïcha Traoré', cityId: 'dakar', genre: 'Afro-pop', lang: 'français' },
  { stage: 'Boa Kwame', real: 'Kwame Boateng', cityId: 'accra', genre: 'Hip-hop', lang: 'anglais' },
  { stage: 'Adé Luna', real: 'Tiwa Adebayo', cityId: 'lagos', genre: 'R&B', lang: 'anglais' },
  { stage: 'Mouss Diamant', real: 'Moussa Diallo', cityId: 'dakar', genre: 'Mbalax', lang: 'français, wolof' },
  { stage: 'Yara Fogo', real: 'Yara Costa', cityId: 'luanda', genre: 'Kuduro', lang: 'portugais' },
]

