import { CITIES, cityById } from '../data/world'
import { bestRank, chartFor } from './market'
import { totalFans, drawRng } from './util'
import type { GameState, Mission, NewsItem } from './types'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
const MAX_ACTIVE = 3
const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
const released = (s: GameState) => s.songs.filter((x) => x.stage === 'released')
const scale = (s: GameState) => 1 + s.reputation / 25

/** Valeur actuelle de la mission (pour la jauge) et état atteint ou non. */
export function missionProgress(s: GameState, m: Mission): { now: number; goal: number; done: boolean; label: string } {
  switch (m.kind) {
    case 'rank': { const r = bestRank(s, 'pays', m.cityId ?? s.label.hqCityId); return { now: r ?? 0, goal: m.target, done: r !== null && r <= m.target, label: r ? `Meilleur rang : n°${r}` : 'Pas encore classé' } }
    case 'release': { const n = released(s).filter((x) => (x.release?.week ?? 0) >= m.startWeek).length; return { now: n, goal: m.target, done: n >= m.target, label: `${n} / ${m.target} sorties` } }
    case 'fans': { const n = Math.max(0, totalFans(s) - m.base); return { now: n, goal: m.target, done: n >= m.target, label: `+${fmt(n)} / ${fmt(m.target)} fans` } }
    case 'revenue': { const n = Math.max(0, s.stats.totalRevenue - m.base); return { now: n, goal: m.target, done: n >= m.target, label: `$${fmt(n)} / $${fmt(m.target)}` } }
    case 'streams': { const n = Math.max(0, ...released(s).map((x) => x.stats.streams)); return { now: n, goal: m.target, done: n >= m.target, label: `${fmt(n)} / ${fmt(m.target)} écoutes` } }
  }
}

function spawn(s: GameState, rng: ReturnType<typeof drawRng>): Mission | null {
  const active = new Set(s.missions.filter((m) => m.status === 'actif').map((m) => m.kind))
  const hasSongs = released(s).length > 0
  const kinds = (['release', 'fans', 'revenue', ...(hasSongs ? ['rank', 'streams'] : [])] as Mission['kind'][]).filter((k) => !active.has(k))
  if (!kinds.length) return null
  const kind = rng.pick(kinds)
  const sc = scale(s)
  const id = `m-${s.week}-${rng.int(100, 999)}`
  const base: Pick<Mission, 'id' | 'kind' | 'startWeek' | 'status' | 'base'> = { id, kind, startWeek: s.week, status: 'actif', base: 0 }
  const round = (n: number, step: number) => Math.max(step, Math.round(n / step) * step)
  switch (kind) {
    case 'rank': {
      const cities = CITIES.filter((c) => c.minRep <= s.reputation)
      const city = rng.pick(cities.length ? cities : [cityById(s.label.hqCityId)])
      const target = s.reputation < 30 ? 5 : s.reputation < 60 ? 3 : 1
      return { ...base, title: `Top ${target} à ${city.name}`, desc: `Placez un titre dans le top ${target} du classement de ${city.name}.`, deadline: s.week + 8, target, cityId: city.id, reward: { cash: round(25_000 * sc, 1000), rep: 0.6 }, penalty: 0.3 }
    }
    case 'release': {
      const target = s.reputation < 40 ? 2 : 3
      return { ...base, title: `${target} sorties`, desc: `Sortez ${target} titres dans les 6 semaines.`, deadline: s.week + 6, target, reward: { cash: round(12_000 * sc, 1000), rep: 0.3 }, penalty: 0.2 }
    }
    case 'fans': {
      const fans = totalFans(s)
      const target = round(Math.max(2_000, fans * 0.15), 500)
      return { ...base, base: fans, title: `+${fmt(target)} fans`, desc: `Gagnez ${fmt(target)} nouveaux fans en 8 semaines.`, deadline: s.week + 8, target, reward: { cash: round(15_000 * sc, 1000), rep: 0.4 }, penalty: 0.25 }
    }
    case 'revenue': {
      const target = round(35_000 * sc, 5000)
      return { ...base, base: s.stats.totalRevenue, title: `$${fmt(target)} de recettes`, desc: `Encaissez $${fmt(target)} de recettes en 6 semaines.`, deadline: s.week + 6, target, reward: { cash: round(target * 0.25, 1000), rep: 0.3 }, penalty: 0.2 }
    }
    case 'streams': {
      const top = Math.max(100_000, ...released(s).map((x) => x.stats.streams))
      const target = round(top * 1.4, 50_000)
      return { ...base, title: `Un titre à ${fmt(target)} écoutes`, desc: `Un de vos titres doit atteindre ${fmt(target)} écoutes cumulées en 10 semaines.`, deadline: s.week + 10, target, reward: { cash: round(20_000 * sc, 1000), rep: 0.5 }, penalty: 0.3 }
    }
  }
}

/** Fin de semaine : valide ou échoue les missions échues, en propose de nouvelles. */
export function updateMissions(s: GameState, notes: Notes) {
  s.missions ??= []
  for (const m of s.missions) {
    if (m.status !== 'actif') continue
    const p = missionProgress(s, m)
    if (p.done) {
      m.status = 'reussi'; m.endWeek = s.week
      s.cash += m.reward.cash; s.reputation = Math.min(100, s.reputation + m.reward.rep)
      notes.push({ tag: 'Mission', text: `Mission réussie : ${m.title} (+$${fmt(m.reward.cash)}, +${m.reward.rep} de réputation).`, tone: 'g' })
    } else if (s.week > m.deadline) {
      m.status = 'echoue'; m.endWeek = s.week
      s.reputation = Math.max(0, s.reputation - m.penalty)
      notes.push({ tag: 'Mission', text: `Mission manquée : ${m.title} (−${m.penalty} de réputation).`, tone: 'r' })
    }
  }
  const rng = drawRng(s)
  const actives = s.missions.filter((m) => m.status === 'actif').length
  if (actives < MAX_ACTIVE && (actives === 0 || s.week % 2 === 0)) { const m = spawn(s, rng); if (m) s.missions.push(m) }
  const done = s.missions.filter((m) => m.status !== 'actif')
  if (done.length > 12) s.missions = [...s.missions.filter((m) => m.status === 'actif'), ...done.slice(-12)]
}

const INDUSTRY = [
  (r: { title: string; artist: string; label: string; streams: number }) => `« ${r.title} » de ${r.artist} (${r.label}) domine le classement mondial avec ${fmt(r.streams / 1000)} k écoutes.`,
  (r: { title: string; artist: string; label: string }) => `${r.label} fête le succès de ${r.artist} : « ${r.title} » ne quitte plus le top 10.`,
  (r: { artist: string; label: string }) => `Rumeur : ${r.artist} préparerait une tournée mondiale avec ${r.label}.`,
  (r: { artist: string }) => `Les fans réclament un featuring avec ${r.artist} : le titre est en tête des recherches.`,
]
const MERIDIAN = [
  'Meridian Group rachète un label indépendant à Londres. Tomás Reyes : « Nous construisons un seul son pour le monde. »',
  'Le « plan Horizon » de Meridian intrigue les analystes : plusieurs catalogues auraient changé de mains cette semaine.',
  'Meridian Group promet des cachets records aux artistes qui rejoindront son label.',
  'Tomás Reyes sur les indépendants : « Ils finiront tous par vendre. » Le milieu s’indigne.',
]

/** Fil d'actualités : événements du label (depuis le rapport) et vie de l'industrie. */
export function updateNews(s: GameState, notes: Notes) {
  s.news ??= []
  const rng = drawRng(s)
  const add = (tag: string, text: string, tone: NewsItem['tone']) => s.news.unshift({ id: `n-${s.week}-${s.news.length}-${rng.int(0, 9999)}`, week: s.week, tag, text, tone })
  const mine = new Set(['Sortie', 'Classement', 'Certification', 'Objectif', 'Palier', 'Concours', 'Mission', 'Meridian', 'Clip', 'Plateforme', 'Bureau', 'Tournée', 'Contrat', 'Tendance', 'Rival', 'Artiste', 'Événement'])
  for (const n of notes) if (mine.has(n.tag)) add(n.tag, n.text, n.tone)
  const rows = chartFor(s, 'monde', s.label.hqCityId).filter((r) => !r.mine).slice(0, 8)
  if (rows.length) {
    const r = rng.pick(rows)
    add('Industrie', rng.pick(INDUSTRY)(r), 'i')
    if (rng.chance(0.4)) { const r2 = rng.pick(rows); add('Industrie', rng.pick(INDUSTRY.slice(1))(r2), 'i') }
  }
  if (s.week % 5 === 0) add('Meridian', rng.pick(MERIDIAN), 'r')
  s.news = s.news.slice(0, 80)
}
