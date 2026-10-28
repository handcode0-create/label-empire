import { yearOf } from '../lib'
import { egoOf, loyaltyOf, relKey } from './dynamics'
import { poachOffer } from './events'
import { topRivalLabels } from './rivalLife'
import { hash } from './rng'
import type { Artist, GameState } from './types'
import { clamp, drawRng } from './util'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
const fansOf = (a: Artist) => Object.values(a.fans).reduce((t, v) => t + v, 0)

/* ───────────── Progression des compétences ───────────── */
/** Plafond d'une compétence : le potentiel borne ce que l'artiste peut atteindre. */
export const skillCap = (a: Artist) => Math.min(98, 40 + a.potential * 11)
/** Ajoute de l'expérience dans une compétence ; chaque point entier acquis augmente la compétence (jusqu'au plafond). */
export function train(a: Artist, key: string, xp: number): boolean {
  a.xp ??= {}
  const cap = skillCap(a)
  if ((a.skills[key] ?? 0) >= cap) return false
  a.xp[key] = (a.xp[key] ?? 0) + xp * (0.7 + a.potential * 0.12)
  let gained = false
  while (a.xp[key] >= 1 && a.skills[key] < cap) { a.xp[key] -= 1; a.skills[key]++; gained = true }
  return gained
}

/* ───────────── Ego ───────────── */
/** L'ego grimpe avec les succès et retombe doucement : un artiste vedette devient exigeant. */
function egoTick(a: Artist, hit: boolean) {
  const base = egoOf({ ...a, ego: undefined })
  const cur = a.ego ?? base
  const fame = Math.min(15, fansOf(a) / 400_000)
  a.ego = clamp(cur + (hit ? 0.7 : 0) + (cur > base + fame ? -0.2 : 0.05), 0, 100)
}

/* ───────────── Humeur lisible ───────────── */
/** État d'esprit et souhait de l'artiste, déduits de son état réel (moral, fidélité, ego, fatigue, calendrier, relations). */
export function artistWish(g: GameState, a: Artist): [string, string] {
  const W = g.week
  const mine = g.songs.filter((s) => s.artistId === a.id)
  const last = Math.max(-99, ...mine.filter((s) => s.release && s.release.week <= W).map((s) => s.release!.week))
  const idle = W - last
  const loyal = loyaltyOf(a)
  if (a.departing) return ['Parti', 'Ma décision est prise. Je pars à la fin de la semaine.']
  if (a.offer && a.offer.until >= W) return ['Tenté', `${a.offer.label} m'a fait une proposition. Je veux savoir ce que vous pouvez m'offrir.`]
  if (a.fatigue >= 70) return ['Épuisé', 'Je n’en peux plus. Quelques semaines de repos et je reviens plus fort.']
  if (loyal < 35) return ['Distant', 'Je ne sens plus d’avenir ici. Il faut qu’on parle de mon contrat.']
  if ((a.ego ?? egoOf(a)) > 80 && a.morale < 70) return ['Frustré', 'Je mérite mieux que ça : plus de promo, plus de moyens, et mon nom en grand.']
  if (a.morale < 40) return ['Inquiet', 'Je me sens oublié. J’ai besoin d’un projet, ou d’un geste du label.']
  const rel = Object.entries(g.relations ?? {}).find(([k, v]) => k.split('|').includes(a.id) && v <= -35)
  if (rel) { const other = g.artists.find((x) => rel[0].split('|').includes(x.id) && x.id !== a.id); if (other) return ['Tendu', `Les tensions avec ${other.stageName} pèsent sur moi. Pas de projet commun pour l'instant.`] }
  const mate = Object.entries(g.relations ?? {}).find(([k, v]) => k.split('|').includes(a.id) && v >= 40)
  if (mate) { const other = g.artists.find((x) => mate[0].split('|').includes(x.id) && x.id !== a.id); if (other) return ['Inspiré', `Avec ${other.stageName}, on a des idées. Un feat serait une évidence.`] }
  if (!mine.length) return ['Confiant', 'Je suis prêt à écrire mon premier titre. Donnez-moi une semaine de studio.']
  if (idle > 14) return ['Impatient', `Ça fait ${idle} semaines sans sortie. Mes fans m'oublient : il me faut un titre.`]
  if (!g.tours.some((t) => t.artistId === a.id) && fansOf(a) > 3000) return ['Confiant', 'Mes fans veulent me voir sur scène. Une tournée serait une bonne idée.']
  const hit = mine.some((s) => s.stage === 'released' && (s.stats.hist?.slice(-3).reduce((t, h) => t + h.st, 0) ?? 0) > 150_000)
  if (hit) return ['Euphorique', 'Le titre cartonne ! Profitons de la vague avant qu’elle retombe.']
  return ['Confiant', 'Je veux sortir un nouveau titre avant la fin du trimestre.']
}

/** Âge de l'artiste : il augmente chaque année du jeu. */
export const ageOf = (g: GameState, a: Artist) => 19 + (hash(a.id) % 12) + yearOf(g.week) - 1

/* ───────────── Tick hebdomadaire ───────────── */
export function lifeTick(s: GameState, notes: Notes) {
  const rng = drawRng(s)
  const W = s.week
  const labels = topRivalLabels(s, 3)
  for (const a of s.artists) {
    const hit = s.songs.some((x) => x.artistId === a.id && x.stage === 'released' && (x.stats.hist?.slice(-3).reduce((t, h) => t + h.st, 0) ?? 0) > 150_000)
    egoTick(a, hit)
    // apprentissage de fond : les plus prometteurs progressent même sans séance
    if (rng.chance(0.12)) train(a, rng.pick(['voix', 'ecriture', 'charisme', 'scene', 'creativite', 'endurance']), 0.5)
    // offre concurrente : les artistes en vue, ambitieux et peu liés au label reçoivent des propositions
    if (a.offer && a.offer.until < W) a.offer = undefined
    if (!a.isFounder && !a.offer && labels.length && fansOf(a) > 20_000) {
      const p = 0.012 + Math.max(0, ((a.ego ?? egoOf(a)) - 55) / 1500) + Math.max(0, (60 - loyaltyOf(a)) / 2000)
      if (rng.chance(p)) {
        const label = rng.pick(labels).name
        a.offer = { label, until: W + 6 }
        notes.push({ tag: 'Artiste', text: `${label} fait les yeux doux à ${a.stageName} : une offre est dans l'air.`, tone: 'e' })
        s.echoes ??= []
        s.echoes.push({ id: `of-${W}-${a.id}`, due: W + 1, origin: `Offre de ${label}`, text: '', tone: 'r', artistId: a.id, event: poachOffer(a, label) })
      }
    }
  }
  // relations : les affinités se nouent entre styles voisins, la concurrence les abîme entre styles identiques
  const rel = (s.relations ??= {})
  const roster = s.artists
  for (let i = 0; i < roster.length; i++) for (let j = i + 1; j < roster.length; j++) {
    const x = roster[i], y = roster[j]
    const k = relKey(x.id, y.id)
    const same = x.genre === y.genre
    const recent = (a: Artist) => s.songs.some((z) => z.artistId === a.id && z.release && W - z.release.week < 6)
    if (same && recent(x) && recent(y)) rel[k] = clamp((rel[k] ?? 0) - 0.8, -100, 100)
    else if (!same && x.morale > 60 && y.morale > 60) rel[k] = clamp((rel[k] ?? 0) + 0.5, -100, 100)
    const v = rel[k] ?? 0
    if (v >= 40 && rng.chance(0.05)) {
      // collaboration spontanée
      const cx = Object.entries(y.fans).sort((p, q) => q[1] - p[1])[0]?.[0] ?? y.originCityId
      const cy = Object.entries(x.fans).sort((p, q) => q[1] - p[1])[0]?.[0] ?? x.originCityId
      x.fans[cx] = (x.fans[cx] ?? 0) + 250; y.fans[cy] = (y.fans[cy] ?? 0) + 250
      x.morale = clamp(x.morale + 4, 0, 100); y.morale = clamp(y.morale + 4, 0, 100)
      rel[k] = clamp(v - 15, -100, 100)
      for (const z of [x, y]) { const song = s.songs.filter((q) => q.artistId === z.id && q.stage === 'released').slice(-1)[0]; if (song) song.hype += 0.1 }
      notes.push({ tag: 'Artiste', text: `${x.stageName} et ${y.stageName} improvisent une session ensemble : un extrait fait le tour des réseaux (+250 fans chacun, moral +4).`, tone: 'g' })
    } else if (v <= -40 && rng.chance(0.06)) {
      x.morale = clamp(x.morale - 6, 0, 100); y.morale = clamp(y.morale - 6, 0, 100)
      x.loyalty = clamp(loyaltyOf(x) - 4, 0, 100); y.loyalty = clamp(loyaltyOf(y) - 4, 0, 100)
      rel[k] = clamp(v + 12, -100, 100)
      notes.push({ tag: 'Artiste', text: `${x.stageName} et ${y.stageName} s'accrochent en studio : l'ambiance se dégrade (moral −6, fidélité −4).`, tone: 'r' })
    }
  }
  // vivier : les candidats évoluent (notoriété, exigences selon la réputation du label)
  if (W % 4 === 0) {
    for (const c of s.pool) {
      if (c.status === 'concours') continue
      const grow = 1 + 0.01 * c.potential
      for (const k of Object.keys(c.fans)) c.fans[k] = Math.round(c.fans[k] * grow)
      if (c.asking) {
        const advance = Math.round(((c.potential * c.potential * 1000 + fansOf(c) * 0.03) * (1 + s.reputation / 250)) / 500) * 500
        c.asking = { ...c.asking, advance: Math.max(c.asking.advance, advance) }
      }
    }
  }
}
