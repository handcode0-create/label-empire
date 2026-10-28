import { CITIES, GENRES, cityById } from '../data/world'
import { addBoost, addTrend, loyaltyOf, relKey } from './dynamics'
import { rivalWorld } from './rivals'
import type { Artist, EventChoice, Fx, GameEvent, GameState, Result, Song } from './types'
import { addRep, clamp, clone, drawRng, fail, ok, spend } from './util'
import type { Rng } from './rng'

const usd = (n: number) => '$' + Math.round(n).toLocaleString('fr-FR')

/* ───────────── Génération ───────────── */
interface Gen {
  kind: string
  weight: number
  cooldown: number
  make: (s: GameState, rng: Rng) => Omit<GameEvent, 'id' | 'kind' | 'week'> | null
}

const roster = (s: GameState) => s.artists.filter((a) => !a.isFounder)
const recentHit = (s: GameState) => s.songs.filter((x) => x.stage === 'released' && s.week - (x.release?.week ?? 0) < 5).slice(-1)[0]
const bestArtist = (s: GameState) => [...s.artists].sort((a, b) => Object.values(b.fans).reduce((t, v) => t + v, 0) - Object.values(a.fans).reduce((t, v) => t + v, 0))[0]
const ch = (id: string, label: string, detail: string, cost: number, fx: Fx[]): EventChoice => ({ id, label, detail, cost, fx })

const GENS: Gen[] = [
  {
    kind: 'fx', weight: 5, cooldown: 8,
    make: (s, rng) => {
      const reached = s.stats.countriesReached.map(cityById).filter((c) => !['USD', 'EUR'].includes(c.currency))
      if (!reached.length) return null
      const c = rng.pick(reached)
      return { cityId: c.id, title: `La monnaie locale chute (${c.country})`, text: `Vos revenus en attente de ${c.name} perdent de la valeur cette semaine. Un partenaire local peut couvrir une partie du risque de change.`, tone: 'e', choices: [
        ch('accept', 'Accepter la perte', 'Certain : −9 % sur les revenus en attente', 0, [{ t: 'fxCity', city: c.id, v: 0.09 }]),
        ch('hedge', 'Négocier avec un partenaire local', 'Estimé : la perte tombe à 3 % · coût $1 500', 1500, [{ t: 'fxCity', city: c.id, v: 0.03 }])] }
    },
  },
  {
    kind: 'raise', weight: 7, cooldown: 7,
    make: (s, rng) => {
      const r = roster(s).filter((a) => a.morale < 75 || loyaltyOf(a) < 70)
      if (!r.length) return null
      const a = rng.pick(r)
      return { artistId: a.id, title: `${a.stageName} réclame une revalorisation`, text: `Le manager de ${a.stageName} estime que le label ne reconnaît pas ses efforts. Sa fidélité (${Math.round(loyaltyOf(a))}) et son moral sont en jeu.`, tone: 'e', choices: [
        ch('pay', 'Verser une prime', 'Certain : moral +20, fidélité +8 · coût $2 500', 2500, [{ t: 'morale', v: 20 }, { t: 'loyalty', v: 8 }]),
        ch('negotiate', 'Négocier un geste', 'Incertain : 50 % de réussite (moral +8) sinon vexation (fidélité −10)', 0, [{ t: 'roll', p: 0.5, win: [{ t: 'morale', v: 8 }, { t: 'loyalty', v: 3 }], lose: [{ t: 'morale', v: -10 }, { t: 'loyalty', v: -10 }], winText: 'Un compromis est trouvé.', loseText: 'La négociation tourne court.' }]),
        ch('refuse', 'Refuser', 'Risque : moral −15, fidélité −12', 0, [{ t: 'morale', v: -15 }, { t: 'loyalty', v: -12 }])] }
    },
  },
  {
    kind: 'viral', weight: 7, cooldown: 6,
    make: (s) => {
      const song = recentHit(s)
      if (!song) return null
      return { songId: song.id, title: `« ${song.title} » devient viral`, text: 'Un extrait explose sur les réseaux sociaux. Vous pouvez amplifier le mouvement ou le laisser vivre.', tone: 'g', choices: [
        ch('push', 'Investir dans la promotion', 'Estimé : écoutes +60 % pendant 3 semaines · coût $3 000', 3000, [{ t: 'boost', kind: 'streams', mult: 1.6, weeks: 3, songId: song.id, label: `Viral · ${song.title}` }, { t: 'trend', genre: song.genre, mult: 1.1, weeks: 3, kind: 'viral', cause: `« ${song.title} » fait le buzz` }]),
        ch('wait', 'Laisser faire', 'Estimé : écoutes +25 % pendant 2 semaines', 0, [{ t: 'boost', kind: 'streams', mult: 1.25, weeks: 2, songId: song.id, label: `Viral · ${song.title}` }])] }
    },
  },
  {
    kind: 'gig', weight: 5, cooldown: 6,
    make: (s, rng) => {
      const a = rng.pick(s.artists)
      const c = cityById(a.originCityId)
      return { artistId: a.id, cityId: c.id, title: `Invitation au ${c.festivals[0]}`, text: `${a.stageName} est invité à jouer à ${c.name}. Un cachet, de la visibilité… et de la fatigue en plus.`, tone: 'c', choices: [
        ch('go', 'Accepter', 'Estimé : +$4 000, +300 fans, fatigue +10', 0, [{ t: 'cash', v: 4000 }, { t: 'fans', city: c.id, v: 300 }, { t: 'fatigue', v: 10 }]),
        ch('no', 'Décliner', 'Aucun effet', 0, [])] }
    },
  },
  {
    kind: 'rival', weight: 6, cooldown: 5,
    make: (s) => {
      const m = (s.rivalMoves ?? []).find((x) => x.until >= s.week)
      if (!m) return null
      return { title: `${m.label} vous fait de l'ombre`, text: `« ${m.title} » de ${m.artist} occupe ${m.cityIds.map((id) => cityById(id).name).join(', ')}. Vos titres du même genre y reculent. Une contre-campagne peut limiter la casse.`, tone: 'r', choices: [
        ch('counter', 'Lancer une contre-campagne', 'Estimé : l’impact du rival est divisé par 2 · coût $3 000', 3000, [{ t: 'rivalCut', v: 0.5 }]),
        ch('ignore', 'Laisser passer l’orage', 'Risque : l’impact court jusqu’à la fin de la sortie rivale', 0, [])] }
    },
  },
  {
    kind: 'sponsor', weight: 5, cooldown: 12,
    make: (s, rng) => {
      if (s.reputation < 8) return null
      const a = rng.pick(s.artists)
      const brand = rng.pick(['Soleil Cola', 'Kora Mobile', 'Lagune Sneakers', 'Baobab Télécom', 'Maquis Gold'])
      return { artistId: a.id, title: `${brand} veut s'associer à ${a.stageName}`, text: 'Une marque propose un partenariat. L’argent est bon, mais l’image de l’artiste est en jeu.', tone: 'c', choices: [
        ch('accept', 'Accepter l’offre', 'Estimé : +$7 000 · Incertain : 25 % de bad buzz (réputation −1)', 0, [{ t: 'cash', v: 7000 }, { t: 'roll', p: 0.75, win: [], lose: [{ t: 'rep', v: -1 }, { t: 'morale', v: -6 }], loseText: 'Le public trouve le partenariat opportuniste.' }]),
        ch('negotiate', 'Négocier un meilleur contrat', 'Incertain : 50 % de décrocher +$12 000, sinon la marque se retire', 0, [{ t: 'roll', p: 0.5, win: [{ t: 'cash', v: 12000 }, { t: 'rep', v: 0.2 }], lose: [], winText: 'La marque accepte vos conditions.', loseText: 'La marque se retire.' }]),
        ch('refuse', 'Refuser par principe', 'Certain : fidélité de l’artiste +5', 0, [{ t: 'loyalty', v: 5 }])] }
    },
  },
  {
    kind: 'scandal', weight: 5, cooldown: 14,
    make: (s, rng) => {
      if (s.reputation < 5) return null
      const a = rng.pick(roster(s).concat(s.artists.filter((x) => x.isFounder)))
      if (!a) return null
      return { artistId: a.id, title: `Polémique autour de ${a.stageName}`, text: `Une phrase sortie de son contexte enflamme les réseaux. La presse demande une réaction.`, tone: 'r', choices: [
        ch('statement', 'Publier un communiqué', 'Estimé : réputation −0,3, moral −5 · coût $2 000', 2000, [{ t: 'rep', v: -0.3 }, { t: 'morale', v: -5 }]),
        ch('silence', 'Faire le dos rond', 'Incertain : 50 % que cela passe, sinon réputation −1,5 et fans perdus', 0, [{ t: 'roll', p: 0.5, win: [], lose: [{ t: 'rep', v: -1.5 }, { t: 'fans', v: -400 }], winText: 'L’affaire s’éteint toute seule.', loseText: 'La polémique prend de l’ampleur.' }]),
        ch('support', 'Soutenir publiquement', 'Certain : fidélité +10 · coût $5 000', 5000, [{ t: 'loyalty', v: 10 }, { t: 'rep', v: 0.1 }])] }
    },
  },
  {
    kind: 'burnout', weight: 6, cooldown: 8,
    make: (s) => {
      const a = s.artists.filter((x) => x.fatigue >= 55).sort((x, y) => y.fatigue - x.fatigue)[0]
      if (!a) return null
      return { artistId: a.id, title: `${a.stageName} est à bout de souffle`, text: `Fatigue ${Math.round(a.fatigue)}/100 : le médecin recommande du repos. Mais le calendrier est chargé.`, tone: 'e', choices: [
        ch('rest', 'Imposer du repos', 'Certain : fatigue −35, moral +4', 0, [{ t: 'fatigue', v: -35 }, { t: 'morale', v: 4 }]),
        ch('push', 'Continuer malgré tout', 'Risque : 45 % d’effondrement (fatigue +15, moral −12)', 0, [{ t: 'roll', p: 0.55, win: [{ t: 'morale', v: 2 }], lose: [{ t: 'fatigue', v: 15 }, { t: 'morale', v: -12 }], winText: 'Il tient le coup.', loseText: 'Il craque en plein enregistrement.' }])] }
    },
  },
  {
    kind: 'leak', weight: 4, cooldown: 10,
    make: (s) => {
      const song = s.songs.find((x) => x.stage === 'mixed' && !x.standby && x.readyWeek <= s.week && !s.projects.some((p) => p.status !== 'sorti' && p.songIds.includes(x.id)))
      if (!song) return null
      return { songId: song.id, title: `« ${song.title} » a fuité`, text: 'Des extraits circulent avant la sortie officielle. Les fans réclament le titre.', tone: 'r', choices: [
        ch('now', 'Sortie surprise la semaine prochaine', 'Estimé : buzz fort, sortie en 3 territoires · coût $3 000', 3000, [{ t: 'release', songId: song.id }]),
        ch('sue', 'Porter plainte', 'Incertain : 60 % de stopper la fuite (buzz +), sinon réputation −0,5 · coût $4 000', 4000, [{ t: 'roll', p: 0.6, win: [{ t: 'boost', kind: 'streams', mult: 1.15, weeks: 2, songId: song.id, label: 'Attente des fans' }], lose: [{ t: 'rep', v: -0.5 }] }]),
        ch('ignore', 'Ne rien faire', 'Risque : moral de l’artiste −5', 0, [{ t: 'morale', v: -5 }])] }
    },
  },
  {
    kind: 'playlist', weight: 5, cooldown: 9,
    make: (s, rng) => {
      const song = recentHit(s)
      if (!song || s.reputation < 10) return null
      const a = s.artists.find((x) => x.id === song.artistId)
      const city = cityById(a?.originCityId ?? s.label.hqCityId)
      const cities = [city.id, ...CITIES.filter((c) => c.region === city.region && c.id !== city.id).map((c) => c.id)].slice(0, 3)
      void rng
      return { songId: song.id, cityId: city.id, title: `Une playlist majeure veut « ${song.title} » en exclusivité`, text: `Un éditeur de playlist propose une mise en avant à ${city.name} et dans la région, à condition d’une exclusivité de 4 semaines.`, tone: 'c', choices: [
        ch('accept', 'Accepter l’exclusivité', 'Estimé : écoutes +30 % dans la zone pendant 4 semaines', 0, cities.map((id) => ({ t: 'boost', kind: 'city', mult: 1.3, weeks: 4, songId: song.id, cityId: id, label: `Playlist · ${cityById(id).name}` }) as Fx)),
        ch('decline', 'Décliner', 'Aucun effet', 0, [])] }
    },
  },
  {
    kind: 'festival', weight: 4, cooldown: 12,
    make: (s, rng) => {
      if (s.reputation < 15) return null
      const a = bestArtist(s) ?? rng.pick(s.artists)
      const c = rng.pick(CITIES.filter((x) => x.minRep <= s.reputation && x.festivals.length))
      return { artistId: a.id, cityId: c.id, title: `${a.stageName} en tête d'affiche : ${c.festivals[0]}`, text: `Les organisateurs de ${c.name} proposent une place de tête d'affiche. Gros cachet, grosse fatigue.`, tone: 'g', choices: [
        ch('go', 'Accepter', 'Estimé : +$9 000, +800 fans, fatigue +15, fidélité +4', 0, [{ t: 'cash', v: 9000 }, { t: 'fans', city: c.id, v: 800 }, { t: 'fatigue', v: 15 }, { t: 'loyalty', v: 4 }]),
        ch('no', 'Décliner', 'Aucun effet', 0, [])] }
    },
  },
  {
    kind: 'censure', weight: 3, cooldown: 14,
    make: (s, rng) => {
      const song = s.songs.find((x) => x.stage === 'released' && s.week - (x.release?.week ?? 0) < 4 && x.release!.cityIds.length)
      if (!song) return null
      const c = cityById(rng.pick(song.release!.cityIds))
      return { songId: song.id, cityId: c.id, title: `${c.name} : « ${song.title} » visé par la censure`, text: 'Les autorités jugent certains passages inconvenants. Les radios locales hésitent à le diffuser.', tone: 'r', choices: [
        ch('appeal', 'Faire appel avec un avocat local', 'Incertain : 50 % de lever l’interdiction · coût $2 500', 2500, [{ t: 'roll', p: 0.5, win: [], lose: [{ t: 'boost', kind: 'city', mult: 0.55, weeks: 4, songId: song.id, cityId: c.id, label: `Censure · ${c.name}` }], winText: 'L’interdiction est levée.', loseText: 'L’appel est rejeté.' }]),
        ch('accept', 'Se plier à la décision', 'Certain : écoutes −45 % ici pendant 4 semaines', 0, [{ t: 'boost', kind: 'city', mult: 0.55, weeks: 4, songId: song.id, cityId: c.id, label: `Censure · ${c.name}` }])] }
    },
  },
  {
    kind: 'poach', weight: 6, cooldown: 12,
    make: (s, rng) => {
      const r = roster(s).filter((a) => loyaltyOf(a) < 55 || (s.reputation >= 15 && rng.chance(0.15)))
      if (!r.length) return null
      const a = r.sort((x, y) => loyaltyOf(x) - loyaltyOf(y))[0]
      const rival = rng.pick(rivalWorld().labels).name
      return { artistId: a.id, title: `${rival} courtise ${a.stageName}`, text: `Le label ${rival} a approché ${a.stageName} avec une offre alléchante. Sa fidélité est à ${Math.round(loyaltyOf(a))}. Vous pouvez contre-attaquer ou le laisser partir.`, tone: 'r', choices: [
        ch('counter', 'Faire une contre-offre', 'Certain : fidélité +35, moral +10 · coût $8 000', 8000, [{ t: 'loyalty', v: 35 }, { t: 'morale', v: 10 }]),
        ch('talk', 'Un entretien de confiance', 'Incertain : 55 % de le convaincre (fidélité +20), sinon il part', 0, [{ t: 'roll', p: 0.55, win: [{ t: 'loyalty', v: 20 }], lose: [{ t: 'leave', a: a.id }], winText: 'Il reste, rassuré.', loseText: 'Il a déjà pris sa décision.' }]),
        ch('let', 'Le laisser partir', 'Certain : il quitte le label la semaine suivante', 0, [{ t: 'leave', a: a.id }])] }
    },
  },
  {
    kind: 'meridian', weight: 4, cooldown: 20,
    make: (s) => {
      if (s.reputation < 25 || s.meridian?.phase === 'offensive') return null
      const a = bestArtist(s)
      if (!a || a.isFounder) return null
      const price = Math.round((40_000 + Object.values(a.fans).reduce((t, v) => t + v, 0) * 0.15) / 1000) * 1000
      return { artistId: a.id, title: `Meridian Group veut racheter ${a.stageName}`, text: `Tomás Reyes vous propose ${usd(price)} pour le contrat de ${a.stageName}. Un refus pourrait être mal pris.`, tone: 'r', choices: [
        ch('sell', 'Vendre le contrat', `Certain : +${usd(price)}, l’artiste part, réputation −1`, 0, [{ t: 'cash', v: price }, { t: 'rep', v: -1 }, { t: 'leave', a: a.id }]),
        ch('refuse', 'Refuser', 'Risque : Meridian lance une offensive de 6 semaines · fidélité +10', 0, [{ t: 'loyalty', v: 10 }, { t: 'meridian', phase: 'offensive', weeks: 6 }]),
        ch('counter', 'Surenchérir en contre-proposition', 'Incertain : 35 % d’obtenir un partenariat (+$20 000, pas d’offensive), sinon offensive de 8 semaines', 0, [{ t: 'roll', p: 0.35, win: [{ t: 'cash', v: 20000 }, { t: 'rep', v: 0.3 }], lose: [{ t: 'meridian', phase: 'offensive', weeks: 8 }], winText: 'Meridian signe un partenariat de distribution.', loseText: 'Meridian se braque et passe à l’attaque.' }])] }
    },
  },
  {
    kind: 'clash', weight: 5, cooldown: 12,
    make: (s, rng) => {
      if (s.artists.length < 2) return null
      const [a, b] = [rng.pick(s.artists), rng.pick(s.artists)]
      if (a.id === b.id) return null
      return { artistId: a.id, title: `Tension entre ${a.stageName} et ${b.stageName}`, text: 'Une rivalité de studio tourne à la dispute : qui passe en premier sur la prochaine sortie ?', tone: 'e', choices: [
        ch('mediate', 'Organiser une médiation', 'Certain : relation +12, moral +3 pour les deux · coût $1 500', 1500, [{ t: 'relation', a: a.id, b: b.id, v: 12 }, { t: 'morale', a: a.id, v: 3 }, { t: 'morale', a: b.id, v: 3 }]),
        ch('side', `Donner la priorité à ${a.stageName}`, `Estimé : ${a.stageName} moral +6 · ${b.stageName} moral −10, fidélité −6`, 0, [{ t: 'morale', a: a.id, v: 6 }, { t: 'morale', a: b.id, v: -10 }, { t: 'loyalty', a: b.id, v: -6 }, { t: 'relation', a: a.id, b: b.id, v: -10 }]),
        ch('ignore', 'Ne pas intervenir', 'Risque : relation −8, moral −4 pour les deux', 0, [{ t: 'relation', a: a.id, b: b.id, v: -8 }, { t: 'morale', a: a.id, v: -4 }, { t: 'morale', a: b.id, v: -4 }])] }
    },
  },
  {
    kind: 'audit', weight: 3, cooldown: 24,
    make: (s) => {
      if (s.cash < 20000) return null
      const fine = Math.round(s.cash * 0.04 / 100) * 100
      return { title: 'Contrôle fiscal', text: 'L’administration épluche vos comptes. Vous pouvez régulariser vite ou contester.', tone: 'e', choices: [
        ch('pay', 'Régulariser immédiatement', `Certain : −${usd(fine)}`, 0, [{ t: 'cash', v: -fine }]),
        ch('contest', 'Contester avec un cabinet', `Incertain : 50 % de tout éviter, sinon −${usd(fine * 2)}`, 0, [{ t: 'roll', p: 0.5, win: [], lose: [{ t: 'cash', v: -fine * 2 }], winText: 'Le redressement est annulé.', loseText: 'Le redressement est confirmé, avec pénalités.' }])] }
    },
  },
  {
    kind: 'charity', weight: 3, cooldown: 20,
    make: (s) => {
      if (s.reputation < 12) return null
      return { title: 'Concert caritatif à Abidjan', text: 'Une ONG propose un concert de bienfaisance avec vos artistes.', tone: 'g', choices: [
        ch('go', 'Participer', 'Estimé : réputation +0,4, fidélité +6 pour tous · coût $4 000', 4000, [{ t: 'rep', v: 0.4 }, { t: 'loyalty', a: 'all', v: 6 }, { t: 'morale', a: 'all', v: 4 }]),
        ch('no', 'Décliner poliment', 'Aucun effet', 0, [])] }
    },
  },
  {
    kind: 'wave', weight: 4, cooldown: 10,
    make: (_s, rng) => {
      const g = rng.pick(GENRES as readonly string[])
      return { title: `Le ${g} explose sur les plateformes`, text: `Un titre de ${g} cartonne dans le monde entier. Les éditeurs de playlists cherchent des morceaux du même style.`, tone: 'g', choices: [
        ch('ride', 'Surfer sur la vague (communication ciblée)', `Estimé : ${g} +25 % pendant 6 semaines pour tout le marché · coût $2 500`, 2500, [{ t: 'trend', genre: g, mult: 1.25, weeks: 6, kind: 'hausse', cause: 'Une vague mondiale lancée par un hit' }]),
        ch('watch', 'Observer', `Estimé : ${g} +10 % pendant 3 semaines`, 0, [{ t: 'trend', genre: g, mult: 1.1, weeks: 3, kind: 'hausse', cause: 'Une vague mondiale lancée par un hit' }])] }
    },
  },
]

export function makeEvent(s: GameState): GameEvent | null {
  const rng = drawRng(s)
  if (!rng.chance(0.55)) return null
  s.eventSeen ??= {}
  const eligible = GENS.filter((g) => s.week - (s.eventSeen[g.kind] ?? -99) >= g.cooldown)
  // On tire dans l'ordre pondéré, en passant à la suivante si les conditions ne sont pas réunies.
  const bag = eligible.flatMap((g) => Array(g.weight).fill(g) as Gen[])
  for (let tries = 0; tries < 12 && bag.length; tries++) {
    const g = bag[Math.floor(rng.next() * bag.length)]
    const e = g.make(s, rng)
    if (!e) { for (let i = bag.length - 1; i >= 0; i--) if (bag[i] === g) bag.splice(i, 1); continue }
    return { id: `e-${s.week}`, kind: g.kind, week: s.week, ...e }
  }
  return null
}

/* ───────────── Résolution ───────────── */
function targets(s: GameState, ev: GameEvent, a?: string): Artist[] {
  if (a === 'all') return s.artists.filter((x) => !x.isFounder)
  const id = a ?? ev.artistId
  const f = s.artists.find((x) => x.id === id)
  return f ? [f] : []
}

function applyFx(s: GameState, ev: GameEvent, fx: Fx, rng: Rng, out: string[]) {
  switch (fx.t) {
    case 'cash': s.cash = Math.max(0, s.cash + fx.v); if (fx.v < 0) s.spent += -fx.v; else s.stats.totalRevenue += fx.v; out.push(`${fx.v >= 0 ? '+' : '−'}${usd(Math.abs(fx.v))}`); break
    case 'rep': addRep(s, fx.v); out.push(`réputation ${fx.v >= 0 ? '+' : '−'}${Math.abs(fx.v)}`); break
    case 'morale': for (const a of targets(s, ev, fx.a)) a.morale = clamp(a.morale + fx.v, 0, 100); break
    case 'loyalty': for (const a of targets(s, ev, fx.a)) a.loyalty = clamp(loyaltyOf(a) + fx.v, 0, 100); break
    case 'fatigue': for (const a of targets(s, ev, fx.a)) a.fatigue = clamp(a.fatigue + fx.v, 0, 100); break
    case 'fans': for (const a of targets(s, ev, fx.a)) { const c = fx.city ?? a.originCityId; a.fans[c] = Math.max(0, (a.fans[c] ?? 0) + fx.v) } out.push(`fans ${fx.v >= 0 ? '+' : '−'}${Math.abs(fx.v)}`); break
    case 'boost': addBoost(s, { kind: fx.kind, mult: fx.mult, weeks: fx.weeks, songId: fx.songId ?? ev.songId, cityId: fx.cityId, label: fx.label }); break
    case 'trend': addTrend(s, { genre: fx.genre, mult: fx.mult, start: s.week, until: s.week + fx.weeks, kind: fx.kind, cause: fx.cause }); break
    case 'leave': { const a = s.artists.find((x) => x.id === fx.a); if (a && !a.isFounder) a.departing = true; break }
    case 'relation': { const k = relKey(fx.a, fx.b); s.relations[k] = clamp((s.relations[k] ?? 0) + fx.v, -100, 100); break }
    case 'rivalCut': for (const m of s.rivalMoves ?? []) m.strength = Math.round(m.strength * fx.v * 100) / 100; break
    case 'meridian': s.meridian = { phase: fx.phase, until: s.week + fx.weeks, region: fx.region, since: s.week }; break
    case 'fxCity': for (const p of s.pending) if (p.cityId === fx.city) p.amount = Math.round(p.amount * (1 - fx.v)); break
    case 'release': {
      const song = s.songs.find((x) => x.id === fx.songId)
      if (!song || song.stage !== 'mixed') break
      const a = s.artists.find((x) => x.id === song.artistId)
      const unlocked = CITIES.filter((c) => c.minRep <= s.reputation)
      const ids = [a?.originCityId, ...unlocked.map((c) => c.id)].filter((x, i, arr): x is string => !!x && arr.indexOf(x) === i).slice(0, 3)
      song.release = { week: s.week + 1, strategy: 'regionale', cityIds: ids, promo: 0, loc: [] }; song.stage = 'scheduled'; song.standby = false; song.hype += 0.35
      out.push(`« ${song.title} » sort la semaine prochaine`)
      break
    }
    case 'roll': {
      const win = rng.chance(fx.p)
      if (win && fx.winText) out.push(fx.winText); else if (!win && fx.loseText) out.push(fx.loseText)
      for (const f of win ? fx.win : fx.lose) applyFx(s, ev, f, rng, out)
      break
    }
  }
}

export function resolveEvent(s0: GameState, choiceId: string): Result {
  const s = clone(s0)
  const ev = s.event
  if (!ev || ev.resolved) return fail(s0, 'Aucun événement à traiter.')
  const c = ev.choices.find((x) => x.id === choiceId)
  if (!c) return fail(s0, 'Choix inconnu.')
  if (c.cost > 0) { const e = spend(s, c.cost, ev.title); if (e) return fail(s0, e) }
  const rng = drawRng(s)
  const out: string[] = []
  for (const f of c.fx ?? []) applyFx(s, ev, f, rng, out)
  s.eventSeen ??= {}
  s.eventSeen[ev.kind] = ev.week
  ev.resolved = c.label
  ev.outcome = out.length ? out.join(' · ') : c.detail
  return ok(s, ev.outcome)
}

export type { Song }
