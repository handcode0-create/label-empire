import { loyaltyOf } from './dynamics'
import type { Rng } from './rng'
import type { Artist, EchoEvent, EventChoice, Fx, GameEvent, GameState } from './types'
import { sum } from './util'


const ch = (id: string, label: string, detail: string, cost: number, fx: Fx[]): EventChoice => ({ id, label, detail, cost, fx })
const later = (after: number, text: string, o: { fx?: Fx[]; event?: EchoEvent; tone?: 'g' | 'c' | 'e' | 'r' | 'i' } = {}): Fx => ({ t: 'later', after, text, ...o })
const fansOf = (a: Artist) => sum(a.fans)
const weeksSigned = (s: GameState, a: Artist) => (a.contract ? s.week - a.contract.signedWeek : 0)
const avgSkill = (a: Artist) => { const v = Object.values(a.skills); return v.length ? v.reduce((t, x) => t + x, 0) / v.length : 0 }
type Ev = Omit<GameEvent, 'id' | 'kind' | 'week'>

export interface ArcDef {
  id: string
  title: string
  /** Peut-on ouvrir cet arc pour cet artiste ? */
  eligible: (s: GameState, a: Artist) => boolean
  open: (s: GameState, a: Artist, rng: Rng) => Ev
}

export const ARCS: ArcDef[] = [
  {
    id: 'polemique', title: 'Polémique sur les réseaux',
    eligible: (_s, a) => fansOf(a) >= 15_000,
    open: (_s, a) => {
      const who = a.stageName
      const second = (tone: string): EchoEvent => ({ artistId: a.id, title: `${who} : la polémique enfle`, text: `${tone} Les journalistes réclament une réaction. Une prise de parole bien préparée peut clore l'affaire ; le silence la laisse pourrir.`, tone: 'r', choices: [
        ch('com', 'Publier un communiqué mesuré', 'Certain : coût $3 000 · crédibilité +2 · l\'affaire se tasse', 3000, [{ t: 'cred', v: 2 }, { t: 'arc', id: 'polemique', text: 'Un communiqué met fin à la polémique.', end: true }]),
        ch('wait', 'Attendre que ça passe', 'Incertain : 50 % que ça s\'éteigne, sinon fans −3 %', 0, [{ t: 'roll', p: 0.5, win: [{ t: 'arc', id: 'polemique', text: 'La polémique s\'éteint d\'elle-même.', end: true }], lose: [{ t: 'fanPct', v: -3 }, { t: 'rep', v: -0.5 }, { t: 'arc', id: 'polemique', text: 'La polémique laisse des traces.', end: true }] }]),
      ] })
      return { artistId: a.id, title: `D'anciens messages de ${who} ressortent`, text: `Des publications vieilles de plusieurs années circulent à nouveau et choquent une partie du public. ${who} attend votre position. Ce que vous choisirez sera retenu.`, tone: 'r', choices: [
        ch('excuses', 'Présenter des excuses publiques', 'Certain : crédibilité +2, moral de l\'artiste −6 · l\'affaire se calme', 0, [{ t: 'cred', v: 2 }, { t: 'morale', v: -6 }, { t: 'arc', id: 'polemique', text: 'Des excuses publiques calment le jeu.', end: true }]),
        ch('defend', 'Défendre l\'artiste', 'Incertain : 50 % de buzz (fans +), sinon réputation −1 · crédibilité −2', 0, [{ t: 'cred', v: -2 }, { t: 'arc', id: 'polemique', text: 'Vous avez pris la défense de l\'artiste.', end: true }, { t: 'roll', p: 0.5, win: [{ t: 'heat', v: 15 }, { t: 'fanPct', v: 4 }], lose: [{ t: 'rep', v: -1 }, { t: 'fanPct', v: -3 }], winText: 'Le public se range derrière lui.', loseText: 'Le procès en direct tourne mal.' }]),
        ch('silence', 'Ne rien dire', 'Incertain : l\'affaire peut enfler dans 3 semaines', 0, [{ t: 'arc', id: 'polemique', text: 'Vous avez choisi le silence.' }, later(3, 'La polémique reprend de plus belle.', { tone: 'r', event: second('Votre silence est commenté.') })]),
      ] }
    },
  },
  {
    id: 'repos', title: 'Épuisement et retour',
    eligible: (_s, a) => a.fatigue >= 55 || a.morale < 50,
    open: (_s, a) => {
      const who = a.stageName
      return { artistId: a.id, title: `${who} n'en peut plus`, text: `${who} confie à son manager qu'il est à bout : les concerts, les studios, les réseaux. Il demande une pause avant que tout casse.`, tone: 'e', choices: [
        ch('pause', 'Accorder une vraie pause', 'Certain : fatigue −45, moral +10, fidélité +8 · retour à prévoir dans 4 semaines', 0, [{ t: 'fatigue', v: -45 }, { t: 'morale', v: 10 }, { t: 'loyalty', v: 8 }, { t: 'arc', id: 'repos', text: 'Une pause accordée.' }, later(4, `${who} est de retour, reposé.`, { tone: 'g', event: { artistId: a.id, title: `Le retour de ${who}`, text: `Après sa pause, ${who} revient avec des idées neuves et l'envie de marquer le coup.`, tone: 'g', choices: [
          ch('tour', 'Organiser une apparition surprise', 'Estimé : coût $4 000 · fans +1 200, ferveur +25', 4000, [{ t: 'fans', v: 1200 }, { t: 'heat', v: 25 }, { t: 'arc', id: 'repos', text: 'Un retour surprise très remarqué.', end: true }]),
          ch('calm', 'Reprendre en douceur', 'Certain : moral +5, fidélité +5', 0, [{ t: 'morale', v: 5 }, { t: 'loyalty', v: 5 }, { t: 'arc', id: 'repos', text: 'Une reprise en douceur.', end: true }])] } })]),
        ch('push', 'Lui demander de tenir encore un peu', 'Incertain : 35 % de craquer (moral −20, fidélité −15) · fatigue +10', 0, [{ t: 'fatigue', v: 10 }, { t: 'arc', id: 'repos', text: 'Vous lui avez demandé de tenir.', end: true }, { t: 'roll', p: 0.35, win: [{ t: 'morale', v: -20 }, { t: 'loyalty', v: -15 }], lose: [], winText: 'Il craque : il s\'éloigne du label.', loseText: 'Il serre les dents.' }]),
      ] }
    },
  },
  {
    id: 'famille', title: 'Mariage et famille',
    eligible: (s, a) => !!a.contract && weeksSigned(s, a) >= 20 && a.morale >= 40,
    open: (_s, a) => {
      const who = a.stageName
      return { artistId: a.id, title: `${who} annonce un grand jour`, text: `${who} se marie dans quelques semaines et vous invite. Pour lui, c'est plus qu'un événement : c'est savoir si le label est une famille ou une entreprise.`, tone: 'g', choices: [
        ch('fete', 'Offrir la fête et un cadeau', 'Certain : coût $3 000 · fidélité +12, moral +10 · des photos feront le tour des réseaux', 3000, [{ t: 'loyalty', v: 12 }, { t: 'morale', v: 10 }, { t: 'arc', id: 'famille', text: 'Vous avez offert la fête de mariage.' }, later(3, `Les photos du mariage de ${who} font le tour des réseaux.`, { tone: 'g', fx: [{ t: 'fans', v: 600 }, { t: 'heat', v: 12 }, { t: 'arc', id: 'famille', text: 'Le mariage a fait le buzz.', end: true }] })]),
        ch('sobre', 'Venir avec un cadeau simple', 'Certain : fidélité +4, moral +3', 0, [{ t: 'loyalty', v: 4 }, { t: 'morale', v: 3 }, { t: 'arc', id: 'famille', text: 'Vous êtes venu avec un cadeau simple.', end: true }]),
        ch('planning', 'Garder le planning de studio', 'Certain : fidélité −10, moral −8 · il s\'en souviendra', 0, [{ t: 'loyalty', v: -10 }, { t: 'morale', v: -8 }, { t: 'arc', id: 'famille', text: 'Vous avez maintenu le planning ce week-end-là.', end: true }]),
      ] }
    },
  },
  {
    id: 'label', title: 'Envie de fonder son label',
    eligible: (s, a) => !a.isFounder && !!a.contract && weeksSigned(s, a) >= 40 && avgSkill(a) >= 45 && loyaltyOf(a) >= 50 && fansOf(a) >= 50_000,
    open: (_s, a) => {
      const who = a.stageName
      const final = (): EchoEvent => ({ artistId: a.id, title: `${who} insiste pour son propre label`, text: `${who} ne lâchera plus l'idée. Il partira avec ou sans votre bénédiction : à vous de choisir comment.`, tone: 'r', choices: [
        ch('sous', 'Co-fonder un sous-label avec lui', 'Certain : coût $10 000 · fidélité +25 · il reste sous contrat et vous partagez le succès', 10000, [{ t: 'loyalty', v: 25 }, { t: 'cred', v: 2 }, { t: 'arc', id: 'label', text: 'Vous avez co-fondé son sous-label.' }, later(8, `Le premier titre du sous-label de ${who} sort : le public applaudit l'initiative.`, { tone: 'g', fx: [{ t: 'cash', v: 9000 }, { t: 'rep', v: 1 }, { t: 'arc', id: 'label', text: 'Le sous-label a sorti son premier titre.', end: true }] })]),
        ch('benir', 'Le laisser partir avec votre bénédiction', 'Certain : +$12 000 de compensation · crédibilité +3 · il fonde son label et devient un concurrent amical', 0, [{ t: 'cash', v: 12000 }, { t: 'cred', v: 3 }, { t: 'found' }, { t: 'arc', id: 'label', text: 'Vous l\'avez laissé fonder son propre label.', end: true }]),
      ] })
      return { artistId: a.id, title: `${who} veut produire ses propres artistes`, text: `Formé au sein du label, ${who} maîtrise désormais le métier. Il vous confie son rêve : monter son label, signer des jeunes de son quartier. Qu'en pensez-vous ?`, tone: 'c', choices: [
        ch('sous', 'Co-fonder un sous-label avec lui', 'Certain : coût $10 000 · fidélité +25 · il reste sous contrat et vous partagez le succès', 10000, [{ t: 'loyalty', v: 25 }, { t: 'cred', v: 2 }, { t: 'arc', id: 'label', text: 'Vous avez co-fondé son sous-label.' }, later(8, `Le premier titre du sous-label de ${who} sort : le public applaudit l'initiative.`, { tone: 'g', fx: [{ t: 'cash', v: 9000 }, { t: 'rep', v: 1 }, { t: 'arc', id: 'label', text: 'Le sous-label a sorti son premier titre.', end: true }] })]),
        ch('retenir', 'Lui demander de patienter', 'Incertain : fidélité −8 · il reviendra à la charge dans 10 semaines', 0, [{ t: 'loyalty', v: -8 }, { t: 'arc', id: 'label', text: 'Vous lui avez demandé de patienter.' }, later(10, `${who} revient avec son projet de label.`, { tone: 'r', event: final() })]),
        ch('benir', 'Le soutenir et le laisser partir', 'Certain : +$12 000 de compensation · crédibilité +3 · il fonde son label et devient un concurrent amical', 0, [{ t: 'cash', v: 12000 }, { t: 'cred', v: 3 }, { t: 'found' }, { t: 'arc', id: 'label', text: 'Vous l\'avez laissé fonder son propre label.', end: true }]),
      ] }
    },
  },
]

export const arcTitle = (id: string) => ARCS.find((a) => a.id === id)?.title ?? id

/** Choisit un artiste et un arc à ouvrir cette semaine (un seul arc actif par artiste, jamais deux fois le même). */
export function arcEvent(s: GameState, rng: Rng): Ev | null {
  const pool: { a: Artist; arc: ArcDef }[] = []
  for (const a of s.artists) {
    if (a.arcActive && (s.echoes ?? []).some((e) => e.artistId === a.id)) continue // une suite est encore programmée
    if (a.departing || s.event?.artistId === a.id) continue
    a.arcActive = undefined // arc resté sans suite : on le considère clos
    for (const arc of ARCS) {
      if (a.arcs?.some((x) => x.id === arc.id && x.end) && arc.id !== 'repos' && arc.id !== 'polemique') continue
      if (a.arcs?.some((x) => x.id === arc.id && s.week - x.week < 40)) continue
      if (arc.eligible(s, a)) pool.push({ a, arc })
    }
  }
  if (!pool.length) return null
  const { a, arc } = rng.pick(pool)
  a.arcActive = arc.id
  return arc.open(s, a, rng)
}


