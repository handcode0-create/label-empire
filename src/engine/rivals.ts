import { FIRST, LAST, STAGE_WORDS } from '../data/people'
import { LABEL_LOGOS } from '../data/labelLogos'
import { TITLE_THEMES, generateProjectName, generateTitle } from '../data/titles'
import { CITIES, GENRES, type City } from '../data/world'
import { createRng, hash } from './rng'

/** Monde rival 100 % déterministe : mêmes labels, artistes, titres et projets à chaque partie. */
export interface RivalSong { id: string; title: string; artistId: string; projectId?: string; genre: string; plays: number }
export interface RivalProject { id: string; name: string; kind: 'EP' | 'Album'; artistId: string; songIds: string[]; year: number }
export interface RivalArtist {
  id: string; stageName: string; realName: string; originCityId: string; genre: string; labelName: string
  popularity: number // 0.2 .. 1
  songs: RivalSong[]; projects: RivalProject[]
  contract: { royalty: number; yearsLeft: number; scope: 'local' | 'region' | 'monde'; since: number }
}
export interface RivalLabel { name: string; hqCityId: string; artistIds: string[] }

const PLAYER_DEFAULT = 'Savane Records'
const THEMES = TITLE_THEMES
const MOODS = ['Mélancolique', 'Solaire', 'Intense']
const LANGS = ['français', 'nouchi', 'anglais']

function build() {
  const labelNames = Object.keys(LABEL_LOGOS).filter((n) => n !== PLAYER_DEFAULT)
  const artists: RivalArtist[] = []
  const labels: RivalLabel[] = labelNames.map((name) => ({ name, hqCityId: CITIES[hash('hq' + name) % CITIES.length].id, artistIds: [] }))
  const usedNames = new Set<string>()
  const taken: string[] = []
  const takenProjects: string[] = []
  let n = 0
  for (const label of labels) {
    for (let k = 0; k < 3; k++, n++) {
      const rng = createRng(hash(`rv${label.name}${k}`))
      const city = k === 0 ? CITIES.find((c) => c.id === label.hqCityId)! : CITIES[rng.int(0, CITIES.length - 1)]
      const first = rng.pick(FIRST[city.continent] ?? FIRST.Afrique)
      const last = rng.pick(LAST[city.continent] ?? LAST.Afrique)
      let stage = rng.chance(0.5) ? `${first} ${rng.pick(STAGE_WORDS)}` : `${first} ${last}`
      let guard = 0
      while (usedNames.has(stage) && guard++ < 30) stage = `${rng.pick(FIRST[city.continent] ?? FIRST.Afrique)} ${rng.pick(STAGE_WORDS)}`
      usedNames.add(stage)
      const genre = rng.chance(0.65) ? rng.pick(city.strong) : rng.pick(GENRES as readonly string[])
      const id = `ra${n + 1}`
      const popularity = 0.2 + 0.8 * Math.pow(rng.next(), 1.6)
      const count = rng.int(5, 12)
      const songs: RivalSong[] = []
      for (let i = 0; i < count; i++) {
        const title = generateTitle(rng, { theme: rng.pick(THEMES), mood: rng.pick(MOODS), lang: rng.pick(LANGS), genre }, taken)
        taken.push(title)
        songs.push({ id: `${id}s${i + 1}`, title, artistId: id, genre, plays: Math.round(9_000_000 * popularity * Math.pow(0.82, i) * (0.7 + 0.6 * rng.next())) })
      }
      const projects: RivalProject[] = []
      if (count >= 8) {
        const ids = songs.slice(0, rng.int(7, Math.min(10, count))).map((s) => s.id)
        projects.push({ id: `${id}p1`, name: generateProjectName(rng, { kind: 'Album', lang: rng.pick(LANGS), artist: stage }, takenProjects), kind: 'Album', artistId: id, songIds: ids, year: rng.int(1, 3) })
      }
      const epSize = rng.int(3, 5)
      const start = projects[0] ? projects[0].songIds.length : 0
      if (count - start >= epSize) projects.push({ id: `${id}p${projects.length + 1}`, name: generateProjectName(rng, { kind: 'EP', lang: rng.pick(LANGS), artist: stage }, takenProjects), kind: 'EP', artistId: id, songIds: songs.slice(start, start + epSize).map((s) => s.id), year: rng.int(1, 3) })
      for (const p of projects) takenProjects.push(p.name)
      for (const p of projects) for (const sid of p.songIds) songs.find((s) => s.id === sid)!.projectId = p.id
      artists.push({ id, stageName: stage, realName: `${first} ${last}`, originCityId: city.id, genre, labelName: label.name, popularity, songs, projects, contract: { royalty: Math.round((0.18 + 0.3 * rng.next()) * 100) / 100, yearsLeft: rng.int(1, 5), scope: rng.pick(['local', 'region', 'monde'] as const), since: rng.int(1, 4) } })
      label.artistIds.push(id)
    }
  }
  return { artists, labels }
}

let cache: ReturnType<typeof build> | null = null
export const rivalWorld = () => (cache ??= build())
export const rivalArtist = (id: string) => rivalWorld().artists.find((a) => a.id === id)
export const rivalLabel = (name: string) => rivalWorld().labels.find((l) => l.name === name)
export const rivalSong = (id: string) => { const a = rivalArtist(id.split('s')[0]); return a?.songs.find((s) => s.id === id) }
export const rivalProject = (id: string) => { const a = rivalArtist(id.split('p')[0]); return a?.projects.find((p) => p.id === id) }
export const rivalOrigin = (a: RivalArtist): City => CITIES.find((c) => c.id === a.originCityId)!
/** Écoutes cumulées estimées d'un artiste rival. */
export const rivalTotalPlays = (a: RivalArtist) => a.songs.reduce((t, s) => t + s.plays, 0)

/** Tous les titres et noms de projets déjà pris par les labels rivaux : le joueur ne peut pas les réutiliser par hasard. */
export const rivalTitles = () => rivalWorld().artists.flatMap((a) => a.songs.map((x) => x.title))
export const rivalProjectNames = () => rivalWorld().artists.flatMap((a) => a.projects.map((x) => x.name))
