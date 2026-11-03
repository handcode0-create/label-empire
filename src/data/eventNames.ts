import type { Rng } from '../engine/rng'

const key = (t: string) => t.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿœ0-9]+/g, ' ').trim()

const CONTEST_FR = [
  'Révélation {v}', 'Nouvelles Voix de {v}', 'Le Grand Tremplin de {v}', 'Talents de {v}', '{v} Rising Stars', '{v} Talent Show', 'Coup de projecteur {v}',
  'La Relève de {v}', 'Les Étoiles de {v}', 'Scène Ouverte {v}', '{v} Open Mic', 'Premier Cri · {v}', 'Les Découvertes de {v}', 'Prochaine Voix de {v}', 'Défi {v}', 'Le Sacre de {v}',
]
const CONTEST_EN = ['{v} Rising Stars', '{v} Talent Show', 'The Next Voice of {v}', '{v} Open Mic', '{v} Breakout', 'Spotlight {v}', '{v} Fresh Faces', 'The {v} Showdown']
const FORMAT_TAG: Record<string, string[]> = { ligne: ['Online', 'Live Session', 'Digital Cup'], salle: ['en Salle', 'Live', 'Sound Night'], tv: ['TV', 'Prime Time', 'Grand Show'] }
const TOUR_THEMES = ['Neon Nights', 'Racines', 'Horizons', 'Sous les projecteurs', 'Rue Libre', 'Feu Sacré', 'Golden Hour', 'Lumière Noire', 'Cap sur le monde', 'Sans Frontières', 'Après Minuit', 'Soleil Levant', 'Éclats', 'Vertige', 'Ouragan', 'Terre Promise', 'Hors Limites', 'Mille Lumières', 'Fièvre du Samedi', 'Les Grandes Marées']
const TOUR_EN = ['Neon Nights', 'Golden Hour', 'Roots & Wings', 'No Borders', 'After Midnight', 'Rising Sun', 'Wildfire', 'Full Circle', 'Out of Bounds', 'Thousand Lights', 'Highway Dreams', 'Midnight Sun']

/** Nom de concours : ville + format, jamais deux fois le même (`taken`). */
export function generateContestName(rng: Rng, o: { city: string; format?: string; lang?: string }, taken: Iterable<string> = []): string {
  const used = new Set([...taken].map(key))
  const bank = o.lang === 'anglais' ? CONTEST_EN : CONTEST_FR
  for (let i = 0; i < 60; i++) {
    let t = rng.pick(bank).replace('{v}', o.city)
    if (rng.chance(0.2) && o.format && FORMAT_TAG[o.format]) t += ' · ' + rng.pick(FORMAT_TAG[o.format])
    if (!used.has(key(t))) return t
  }
  return `${rng.pick(bank).replace('{v}', o.city)} ${rng.int(2, 9)}`
}

/** Nom de tournée : artiste, première ville, nombre d'étapes, année. */
export function generateTourName(rng: Rng, o: { artist: string; cities?: string[]; year?: number; lang?: string }, taken: Iterable<string> = []): string {
  const used = new Set([...taken].map(key))
  const en = o.lang === 'anglais'
  const themes = en ? TOUR_EN : TOUR_THEMES
  const first = o.cities?.[0]
  const yr = o.year ? ` ${o.year}` : ''
  for (let i = 0; i < 60; i++) {
    const r = rng.next()
    let t: string
    if (r < 0.3) t = `${rng.pick(themes)} Tour${yr}`
    else if (r < 0.5) t = `${o.artist} · ${rng.pick(themes)}`
    else if (r < 0.65) t = en ? `${o.artist} Live` : `${o.artist} en Live`
    else if (r < 0.8 && first) t = (o.cities?.length ?? 0) > 3 ? (en ? `${first} & Beyond` : `De ${first} au monde`) : (en ? `${first} Nights` : `Nuits de ${first}`)
    else if (r < 0.9) t = en ? `The ${o.artist} World Tour` : `${o.artist} World Tour`
    else t = `${rng.pick(themes)}${yr}`
    if (!used.has(key(t))) return t
  }
  return `${o.artist} Tour ${rng.int(2, 9)}`
}
