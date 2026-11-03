import { addRep } from './util'
import { chartFor } from './market'
import type { Award, AwardCategory, ChartRow, GameState, Nominee, Nomination } from './types'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
/** Dotation par catégorie (pour un trophée remporté par un de vos artistes ou titres). */
export const AWARD_PRIZE = { cash: 60_000, rep: 2 }
export const AWARD_PRIZES: Record<AwardCategory, { cash: number; rep: number }> = {
  titre: AWARD_PRIZE, artiste: AWARD_PRIZE, album: AWARD_PRIZE, revelation: { cash: 30_000, rep: 1 },
}
export const AWARD_LABEL: Record<AwardCategory, string> = { titre: 'Titre de l’année', artiste: 'Artiste de l’année', album: 'Album de l’année', revelation: 'Révélation de l’année' }
export const AWARD_CATEGORIES: AwardCategory[] = ['titre', 'artiste', 'album', 'revelation']
/** Calendrier : les nominations sont annoncées 8 semaines avant la cérémonie, qui a lieu à la dernière semaine de l'année. */
export const AWARD_WEEKS = { nominationsBefore: 8, ceremonyEvery: 52 }

export interface AwardCalendar { year: number; nominationsWeek: number; ceremonyWeek: number; nominationsIn: number; ceremonyIn: number; announced: boolean }
export function awardCalendar(week: number): AwardCalendar {
  const E = AWARD_WEEKS.ceremonyEvery
  const ceremonyWeek = week % E === 0 ? week + E : Math.ceil(week / E) * E
  const nominationsWeek = ceremonyWeek - AWARD_WEEKS.nominationsBefore
  return { year: ceremonyWeek / E, nominationsWeek, ceremonyWeek, nominationsIn: nominationsWeek - week, ceremonyIn: ceremonyWeek - week, announced: week >= nominationsWeek }
}

function rowsFor(s: GameState, category: AwardCategory): ChartRow[] {
  if (category === 'titre') return chartFor(s, 'monde', s.label.hqCityId, 'singles')
  if (category === 'album') return chartFor(s, 'monde', s.label.hqCityId, 'albums')
  return chartFor(s, 'monde', s.label.hqCityId, 'artistes')
}
const nameOf = (category: AwardCategory, r: ChartRow) => (category === 'titre' || category === 'album' ? (r.title ?? r.artist) : r.artist)

/** Les 5 nominés d'une catégorie d'après les classements mondiaux ; la révélation vient du 4e au 8e rang des artistes. */
export function nomineesFor(s: GameState, category: AwardCategory): Nominee[] {
  const mineIds = new Set(s.artists.map((a) => a.id))
  const rows = rowsFor(s, category)
  const pick = category === 'revelation' ? rows.slice(3, 8) : rows.slice(0, 5)
  return pick.map((r, i) => ({ name: nameOf(category, r), artist: r.artist, artistId: r.artistId, mine: mineIds.has(r.artistId ?? ''), rank: i + 1 }))
}

export function announceNominations(s: GameState, notes: Notes) {
  const year = awardCalendar(s.week).year
  const cats = AWARD_CATEGORIES.map((category) => ({ category, nominees: nomineesFor(s, category) })).filter((c) => c.nominees.length > 0)
  const nom: Nomination = { year, week: s.week, cats }
  s.nominations = nom
  const mine = cats.flatMap((c) => c.nominees.filter((n) => n.mine).map((n) => `${n.name} (${AWARD_LABEL[c.category]})`))
  const cer = awardCalendar(s.week).ceremonyWeek
  if (mine.length) notes.push({ tag: 'Awards', text: `Nominations An ${year} : ${mine.length} nomination${mine.length > 1 ? 's' : ''} pour vous — ${mine.slice(0, 3).join(', ')}${mine.length > 3 ? '…' : ''}. Cérémonie en semaine ${((cer - 1) % 52) + 1}.`, tone: 'g' })
  else notes.push({ tag: 'Awards', text: `Nominations An ${year} annoncées : aucun de vos artistes n'est nominé. Cérémonie en semaine ${((cer - 1) % 52) + 1}.`, tone: 'i' })
}

/** Nominations (8 semaines avant) puis cérémonie annuelle (fin d'année) : le vainqueur est le nominé le mieux classé le soir de la cérémonie. */
export function runAwards(s: GameState, notes: Notes) {
  s.awards ??= []
  const E = AWARD_WEEKS.ceremonyEvery
  if (s.week % E === E - AWARD_WEEKS.nominationsBefore) announceNominations(s, notes)
  if (s.week % E !== 0) return
  const year = s.week / E
  if (!s.nominations || s.nominations.year !== year) announceNominations(s, [])
  const mineIds = new Set(s.artists.map((a) => a.id))
  for (const c of s.nominations!.cats) {
    const rows = rowsFor(s, c.category)
    const score = (n: Nominee) => { const i = rows.findIndex((r) => nameOf(c.category, r) === n.name && r.artist === n.artist); return i < 0 ? 999 + n.rank : i }
    const winner = [...c.nominees].sort((a, b) => score(a) - score(b))[0]
    if (!winner) continue
    const mine = winner.mine || mineIds.has(winner.artistId ?? '')
    const nominated = c.nominees.some((n) => n.mine)
    const award: Award = { year, week: s.week, category: c.category, winner: winner.name, artistId: winner.artistId, artist: winner.artist, mine, nominated }
    s.awards.push(award)
    const label = AWARD_LABEL[c.category]
    const prize = AWARD_PRIZES[c.category]
    if (mine) {
      s.cash += prize.cash; addRep(s, prize.rep)
      notes.push({ tag: 'Awards', text: `Cérémonie An ${year} · ${label} : ${winner.name} est à vous ! (+$${prize.cash.toLocaleString('fr-FR')}, +${prize.rep} de réputation)`, tone: 'g' })
    } else notes.push({ tag: 'Awards', text: `Cérémonie An ${year} · ${label} : ${winner.name}${nominated ? ' (vous étiez parmi les nominés)' : ''}.`, tone: nominated ? 'e' : 'i' })
  }
  s.nominations = undefined
}
