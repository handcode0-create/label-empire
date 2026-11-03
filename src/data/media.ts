import { CITIES, cityById, type City } from './world'
const CITIES_BY_REGION = (r: string) => CITIES.find((c) => c.region === r)?.continent

export type MediaKind = 'Radio' | 'TV' | 'Presse' | 'Web' | 'Streaming'
export type MediaScope = { type: 'pays'; cityId: string } | { type: 'region'; region: string } | { type: 'continent'; continent: string } | { type: 'monde' }
export interface Media {
  id: string; name: string; kind: MediaKind; scope: MediaScope
  cost: number // coût d'une campagne
  boost: number // bonus d'écoutes dans la zone couverte
  minRep: number
  genres: string[] // genres mis en avant (petit bonus supplémentaire)
}

/** Médias fictifs. Le logo de chacun est dans public/media/<id>.svg (voir tools/logo_gen/media_logos.py). */
export const MEDIA: Media[] = [
  { id: 'radio-lagune', name: 'Radio Lagune FM', kind: 'Radio', scope: { type: 'pays', cityId: 'abidjan' }, cost: 1800, boost: 0.18, minRep: 0, genres: ['Coupé-décalé', 'Afro-pop'] },
  { id: 'dakar-waves', name: 'Dakar Waves FM', kind: 'Radio', scope: { type: 'pays', cityId: 'dakar' }, cost: 1800, boost: 0.18, minRep: 5, genres: ['Mbalax', 'Hip-hop'] },
  { id: 'accra-pulse', name: 'Accra Pulse Radio', kind: 'Radio', scope: { type: 'pays', cityId: 'accra' }, cost: 2000, boost: 0.2, minRep: 8, genres: ['Hip-hop', 'Afro-pop'] },
  { id: 'lagos-metro', name: 'Lagos Metro Radio', kind: 'Radio', scope: { type: 'pays', cityId: 'lagos' }, cost: 3500, boost: 0.26, minRep: 10, genres: ['Afro-pop', 'R&B'] },
  { id: 'joburg-beat', name: 'Joburg Beat Radio', kind: 'Radio', scope: { type: 'pays', cityId: 'johannesburg' }, cost: 3200, boost: 0.24, minRep: 20, genres: ['Amapiano', 'Hip-hop'] },
  { id: 'paris-nuit', name: 'Paris Nuit FM', kind: 'Radio', scope: { type: 'pays', cityId: 'paris' }, cost: 5000, boost: 0.28, minRep: 25, genres: ['Hip-hop', 'Électro'] },
  { id: 'london-wave', name: 'London Wave Radio', kind: 'Radio', scope: { type: 'pays', cityId: 'london' }, cost: 5500, boost: 0.28, minRep: 30, genres: ['R&B', 'Hip-hop'] },
  { id: 'nyc-skyline', name: 'Skyline Radio NYC', kind: 'Radio', scope: { type: 'pays', cityId: 'newyork' }, cost: 8000, boost: 0.3, minRep: 40, genres: ['Hip-hop', 'R&B'] },
  { id: 'sampa-radio', name: 'Sampa Rádio Vibe', kind: 'Radio', scope: { type: 'pays', cityId: 'saopaulo' }, cost: 4500, boost: 0.24, minRep: 45, genres: ['Pop', 'Kuduro'] },
  { id: 'tokyo-neon', name: 'Tokyo Neon FM', kind: 'Radio', scope: { type: 'pays', cityId: 'tokyo' }, cost: 7000, boost: 0.26, minRep: 55, genres: ['Pop', 'Électro'] },
  { id: 'canal-soleil', name: 'Canal Soleil TV', kind: 'TV', scope: { type: 'region', region: 'afrique-ouest' }, cost: 6500, boost: 0.3, minRep: 10, genres: ['Afro-pop', 'Coupé-décalé'] },
  { id: 'pan-afrik-show', name: 'Pan-Afrik Show', kind: 'TV', scope: { type: 'continent', continent: 'Afrique' }, cost: 12000, boost: 0.34, minRep: 20, genres: ['Afro-pop', 'Amapiano'] },
  { id: 'continental-music', name: 'Continental Music TV', kind: 'TV', scope: { type: 'monde' }, cost: 22000, boost: 0.4, minRep: 40, genres: ['Pop', 'Hip-hop'] },
  { id: 'rythmes-mag', name: 'Rythmes Magazine', kind: 'Presse', scope: { type: 'region', region: 'afrique-ouest' }, cost: 2500, boost: 0.12, minRep: 0, genres: ['Afro-pop', 'Mbalax'] },
  { id: 'afrobeat-daily', name: 'Afrobeat Daily', kind: 'Web', scope: { type: 'continent', continent: 'Afrique' }, cost: 3500, boost: 0.16, minRep: 5, genres: ['Afro-pop', 'Amapiano', 'Kuduro'] },
  { id: 'urban-pulse', name: 'Urban Pulse Blog', kind: 'Web', scope: { type: 'monde' }, cost: 4500, boost: 0.14, minRep: 15, genres: ['Hip-hop', 'R&B'] },
  { id: 'streamwave', name: 'StreamWave Playlists', kind: 'Streaming', scope: { type: 'monde' }, cost: 9000, boost: 0.22, minRep: 25, genres: ['Pop', 'Afro-pop', 'Électro'] },
  // ---- Europe ----
  { id: 'berlin-bass', name: 'Berlin Bass Radio', kind: 'Radio', scope: { type: 'pays', cityId: 'berlin' }, cost: 6000, boost: 0.26, minRep: 35, genres: ['Électro', 'Hip-hop'] },
  { id: 'berliner-beat', name: 'Berliner Beat Blog', kind: 'Web', scope: { type: 'pays', cityId: 'berlin' }, cost: 3500, boost: 0.15, minRep: 30, genres: ['Électro', 'Pop'] },
  { id: 'rive-gauche', name: 'Rive Gauche Magazine', kind: 'Presse', scope: { type: 'pays', cityId: 'paris' }, cost: 4500, boost: 0.14, minRep: 25, genres: ['Hip-hop', 'Pop'] },
  { id: 'tele-lumiere', name: 'Télé Lumière Paris', kind: 'TV', scope: { type: 'pays', cityId: 'paris' }, cost: 14000, boost: 0.32, minRep: 40, genres: ['Pop', 'Hip-hop', 'Afro-pop'] },
  { id: 'thames-live', name: 'Thames Live TV', kind: 'TV', scope: { type: 'pays', cityId: 'london' }, cost: 16000, boost: 0.32, minRep: 45, genres: ['R&B', 'Pop'] },
  { id: 'europa-fm', name: 'Europa FM Network', kind: 'Radio', scope: { type: 'region', region: 'europe-ouest' }, cost: 9000, boost: 0.3, minRep: 30, genres: ['Pop', 'Électro', 'Hip-hop'] },
  { id: 'continental-press', name: 'Continental Press Europe', kind: 'Presse', scope: { type: 'continent', continent: 'Europe' }, cost: 9000, boost: 0.2, minRep: 45, genres: ['Pop', 'Hip-hop'] },
  { id: 'euro-hits', name: 'Euro Hits TV', kind: 'TV', scope: { type: 'continent', continent: 'Europe' }, cost: 30000, boost: 0.38, minRep: 50, genres: ['Pop', 'Électro'] },
  // ---- Amérique du Nord ----
  { id: 'hot-block-la', name: 'Hot Block Radio LA', kind: 'Radio', scope: { type: 'pays', cityId: 'losangeles' }, cost: 9000, boost: 0.3, minRep: 45, genres: ['Hip-hop', 'Pop'] },
  { id: 'sunset-strip', name: 'Sunset Strip Blog', kind: 'Web', scope: { type: 'pays', cityId: 'losangeles' }, cost: 6000, boost: 0.16, minRep: 40, genres: ['Pop', 'R&B'] },
  { id: 'late-night', name: 'Late Night Showcase', kind: 'TV', scope: { type: 'pays', cityId: 'newyork' }, cost: 38000, boost: 0.36, minRep: 55, genres: ['Hip-hop', 'R&B', 'Pop'] },
  { id: 'chartbook', name: 'Chartbook Weekly', kind: 'Presse', scope: { type: 'continent', continent: 'Amérique du Nord' }, cost: 12000, boost: 0.2, minRep: 50, genres: ['Hip-hop', 'Pop'] },
  { id: 'coast-to-coast', name: 'Coast to Coast Radio', kind: 'Radio', scope: { type: 'continent', continent: 'Amérique du Nord' }, cost: 20000, boost: 0.34, minRep: 55, genres: ['Hip-hop', 'R&B', 'Pop'] },
  { id: 'prime-stage', name: 'Prime Stage TV', kind: 'TV', scope: { type: 'continent', continent: 'Amérique du Nord' }, cost: 45000, boost: 0.4, minRep: 60, genres: ['Pop', 'Hip-hop'] },
  // ---- Amérique latine ----
  { id: 'ritmo-mexico', name: 'Ritmo México FM', kind: 'Radio', scope: { type: 'pays', cityId: 'mexico' }, cost: 5500, boost: 0.24, minRep: 40, genres: ['Pop', 'Hip-hop'] },
  { id: 'carnaval-web', name: 'Carnaval Web', kind: 'Web', scope: { type: 'pays', cityId: 'saopaulo' }, cost: 3500, boost: 0.16, minRep: 40, genres: ['Kuduro', 'Pop'] },
  { id: 'latina-vibra', name: 'Latina Vibra TV', kind: 'TV', scope: { type: 'continent', continent: 'Amérique latine' }, cost: 18000, boost: 0.3, minRep: 45, genres: ['Pop', 'Kuduro'] },
  // ---- Asie, Moyen-Orient, Océanie ----
  { id: 'bollywave', name: 'Bollywave Radio', kind: 'Radio', scope: { type: 'pays', cityId: 'mumbai' }, cost: 6000, boost: 0.24, minRep: 45, genres: ['Pop', 'Électro'] },
  { id: 'gulf-lounge', name: 'Gulf Lounge FM', kind: 'Radio', scope: { type: 'pays', cityId: 'dubai' }, cost: 9000, boost: 0.24, minRep: 50, genres: ['R&B', 'Pop'] },
  { id: 'harbour-fm', name: 'Harbour FM Sydney', kind: 'Radio', scope: { type: 'pays', cityId: 'sydney' }, cost: 6500, boost: 0.24, minRep: 50, genres: ['Pop', 'Électro'] },
  { id: 'seoul-stage', name: 'Seoul Stage Radio', kind: 'Radio', scope: { type: 'pays', cityId: 'seoul' }, cost: 8000, boost: 0.26, minRep: 55, genres: ['Pop', 'Hip-hop'] },
  { id: 'k-wave-tv', name: 'K-Wave TV', kind: 'TV', scope: { type: 'pays', cityId: 'seoul' }, cost: 24000, boost: 0.32, minRep: 60, genres: ['Pop', 'Hip-hop'] },
  { id: 'asia-pop', name: 'Asia Pop Network', kind: 'TV', scope: { type: 'continent', continent: 'Asie' }, cost: 40000, boost: 0.36, minRep: 65, genres: ['Pop', 'Électro'] },
  // ---- Monde (médias premium, très chers) ----
  { id: 'headliner-pod', name: 'Headliner Podcast Network', kind: 'Web', scope: { type: 'monde' }, cost: 15000, boost: 0.2, minRep: 35, genres: ['Hip-hop', 'R&B', 'Pop'] },
  { id: 'planet-playlists', name: 'Planet Playlists Premium', kind: 'Streaming', scope: { type: 'monde' }, cost: 45000, boost: 0.34, minRep: 55, genres: ['Pop', 'Hip-hop', 'Afro-pop'] },
  { id: 'global-cover', name: 'Global Cover Magazine', kind: 'Presse', scope: { type: 'monde' }, cost: 30000, boost: 0.24, minRep: 60, genres: ['Pop', 'Hip-hop', 'R&B'] },
  { id: 'globe-premiere', name: 'Globe Premiere TV', kind: 'TV', scope: { type: 'monde' }, cost: 80000, boost: 0.5, minRep: 65, genres: ['Pop', 'Hip-hop', 'R&B'] },
  { id: 'worldwide-one', name: 'Worldwide Radio One', kind: 'Radio', scope: { type: 'monde' }, cost: 120000, boost: 0.55, minRep: 75, genres: ['Pop', 'Hip-hop', 'Afro-pop'] },
]
export const mediaById = (id: string) => MEDIA.find((m) => m.id === id)
export const mediaLogo = (id: string) => `/media/${id}.svg`

export function mediaReaches(m: Media, city: City): boolean {
  const sc = m.scope
  if (sc.type === 'monde') return true
  if (sc.type === 'pays') return cityById(sc.cityId).country === city.country
  if (sc.type === 'region') return city.region === sc.region
  return city.continent === sc.continent
}
const REGION_LABEL: Record<string, string> = { 'afrique-ouest': "Afrique de l'Ouest", 'europe-ouest': "Europe de l'Ouest", 'amerique-nord': 'Amérique du Nord', 'amerique-latine': 'Amérique latine', 'asie-est': "Asie de l'Est", 'afrique-est': "Afrique de l'Est", 'afrique-australe': 'Afrique australe', 'afrique-nord': 'Afrique du Nord' }
/** Zone d'un média pour le filtre de l'interface. */
export type MediaZone = 'Afrique' | 'Europe' | 'Amériques' | 'Asie & Océanie' | 'Monde'
export function mediaZone(m: Media): MediaZone {
  const sc = m.scope
  if (sc.type === 'monde') return 'Monde'
  const c = sc.type === 'pays' ? cityById(sc.cityId).continent : sc.type === 'continent' ? sc.continent : (CITIES_BY_REGION(sc.region) ?? 'Afrique')
  return c === 'Afrique' ? 'Afrique' : c === 'Europe' ? 'Europe' : c.startsWith('Amérique') ? 'Amériques' : 'Asie & Océanie'
}
export function mediaScopeLabel(m: Media): string {
  const sc = m.scope
  if (sc.type === 'monde') return 'Monde entier'
  if (sc.type === 'pays') return cityById(sc.cityId).country
  if (sc.type === 'region') return REGION_LABEL[sc.region] ?? sc.region
  return sc.continent
}
