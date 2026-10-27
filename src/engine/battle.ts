import type { Rng } from './rng'
import type { Artist } from './types'
import { battlePower } from './tournament'
import { clamp } from './util'

export type Style = 'technique' | 'humour' | 'impact' | 'flow'
/** Pierre-feuille-ciseaux : la technique bat l'impact, l'impact bat l'humour, l'humour bat la technique. Le flow est neutre. */
export const STYLES: Record<Style, { label: string; color: string; beats: Style | null; hint: string }> = {
  technique: { label: 'Technique', color: '#35D3F0', beats: 'impact', hint: 'Bat Impact' },
  humour: { label: 'Humour', color: '#FFC63D', beats: 'technique', hint: 'Bat Technique' },
  impact: { label: 'Impact', color: '#FF3D9A', beats: 'humour', hint: 'Bat Humour' },
  flow: { label: 'Flow', color: '#3DDC97', beats: null, hint: 'Sans faiblesse' },
}

export interface Punch { id: string; style: Style; text: string; power: number }
export interface Manche { opp: Punch; options: Punch[] }

const BANK: Record<Style, string[]> = {
  technique: [
    'Mes rimes sont des équations, ton couplet n’a même pas de résultat.',
    'Je pose trois allitérations avant que ton beat finisse de charger.',
    'Ma métrique est au millimètre, ton flow est au hasard.',
    'Je conjugue ton talent à l’imparfait, mon avenir est au futur antérieur.',
    'Tu rimes en deux dimensions, moi j’écris en relief.',
    'Mon vocabulaire t’a dépassé avant ton deuxième vers.',
    'Ton refrain est un brouillon, le mien est un contrat.',
    'Je découpe chaque syllabe comme un horloger de Genève.',
  ],
  humour: [
    '{opp}, ton flow est si lent qu’il lui faut un visa pour traverser la mesure.',
    'Tu viens de {pays} ? Ton rythme est resté en transit.',
    'Ta punchline a fait moins de bruit qu’un micro débranché.',
    'Si ta voix était une appli, elle serait en mode économie d’énergie.',
    'Tu veux me battre ? Tu n’as même pas battu la mesure.',
    'Ta rime arrive en retard, comme le réseau dans les coulisses.',
    'On t’a vendu du charisme, mais le colis est bloqué en douane.',
    'Ton public applaudit pour ne pas te vexer.',
  ],
  impact: [
    'Je rentre dans le couplet, je ressors avec la salle entière.',
    'Un seul vers, et ton micro cherche la sortie.',
    'Je ne chante pas, je fais trembler les murs.',
    'Ta scène est trop petite pour mon ombre.',
    'La salle ne crie pas ton nom, elle crie le mien.',
    'Mon refrain entre sans frapper, et il ne repart pas.',
    'Coup de basse, coup de grâce, la salle est à moi.',
    'Je pose le premier mot, tu cherches déjà le dernier.',
  ],
  flow: [
    'Je glisse sur le beat comme un surfeur sur la lagune.',
    'Mon flow ne s’arrête pas, il change juste de rue.',
    'Je danse entre les temps, tu cours après la mesure.',
    'Un souffle, un swing, et le refrain est déjà passé.',
    'Mon rythme est une rivière, ton couplet est un caillou.',
    'Je respire en rythme, tu respires en retard.',
    'Sur ce beat je voyage, toi tu fais la queue au guichet.',
    'Je change de tempo, et toute la salle me suit.',
  ],
}
const STYLE_KEYS = Object.keys(BANK) as Style[]

const fill = (t: string, me: Artist, opp: Artist, country: string) => t.replace('{opp}', opp.stageName).replace('{me}', me.stageName).replace('{pays}', country)

function punch(rng: Rng, style: Style, me: Artist, opp: Artist, country: string, id: string, bonus = 0): Punch {
  return { id, style, text: fill(rng.pick(BANK[style]), me, opp, country), power: clamp(rng.int(4, 9) + bonus, 1, 10) }
}

export const MANCHES = 3
/** Prépare les manches : une réplique adverse, puis trois répliques au choix, de styles différents. */
export function buildBattle(rng: Rng, me: Artist, opp: Artist, oppCountry: string, myCountry: string): Manche[] {
  const out: Manche[] = []
  for (let m = 0; m < MANCHES; m++) {
    const oppStyle = rng.pick(STYLE_KEYS)
    const styles = [...STYLE_KEYS].sort(() => rng.next() - 0.5).slice(0, 3)
    // au moins une réponse qui contre le style adverse, pour que le choix reste lisible
    const counter = STYLE_KEYS.find((s) => STYLES[s].beats === oppStyle)
    if (counter && !styles.includes(counter)) styles[0] = counter
    out.push({
      opp: punch(rng, oppStyle, opp, me, myCountry, `m${m}-o`, oppPowerBonus(opp)),
      options: styles.sort(() => rng.next() - 0.5).map((s, i) => punch(rng, s, me, opp, oppCountry, `m${m}-p${i}`)),
    })
  }
  return out
}
const oppPowerBonus = (o: Artist) => (battlePower(o) > 70 ? 1 : 0)

export type Counter = 'gagne' | 'perd' | 'neutre'
export interface MancheResult { me: number; opp: number; counter: Counter }

export function counterOf(mine: Style, theirs: Style): Counter {
  if (STYLES[mine].beats === theirs) return 'gagne'
  if (STYLES[theirs].beats === mine) return 'perd'
  return 'neutre'
}

/** Points d'une manche. timeRatio : part du temps restant (0 à 1) au moment du choix ; pick null = temps écoulé. */
export function scoreManche(pick: Punch | null, m: Manche, me: Artist, opp: Artist, timeRatio: number): MancheResult {
  const base = (a: Artist) => battlePower(a) * 0.25
  if (!pick) return { me: Math.round(base(me) * 0.4), opp: Math.round(base(opp) + m.opp.power * 2.4 + 6), counter: 'perd' }
  const counter = counterOf(pick.style, m.opp.style)
  const swing = counter === 'gagne' ? 12 : counter === 'perd' ? -8 : 0
  const mine = base(me) + pick.power * 2.4 + swing + timeRatio * 5
  const theirs = base(opp) + m.opp.power * 2.4 + (counter === 'perd' ? 6 : 0)
  return { me: Math.max(0, Math.round(mine)), opp: Math.max(0, Math.round(theirs)), counter }
}

/** Écart total des manches transformé en points de préparation pour le duel du tournoi. */
export function coachPoints(results: MancheResult[]): number {
  const diff = results.reduce((t, r) => t + r.me - r.opp, 0)
  return clamp(Math.round(diff / 3), -12, 18)
}
