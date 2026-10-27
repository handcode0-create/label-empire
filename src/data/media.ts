import { cityById, type City } from './world'

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
export function mediaScopeLabel(m: Media): string {
  const sc = m.scope
  if (sc.type === 'monde') return 'Monde entier'
  if (sc.type === 'pays') return cityById(sc.cityId).country
  if (sc.type === 'region') return "Afrique de l'Ouest"
  return sc.continent
}
