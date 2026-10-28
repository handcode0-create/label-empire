import { addRep } from './util'
import { chartFor } from './market'
import type { GameState } from './types'

type Notes = { tag: string; text: string; tone: 'g' | 'c' | 'e' | 'r' | 'i' }[]
export const AWARD_PRIZE = { cash: 60_000, rep: 2 }

/** Cérémonie annuelle : à la fin de chaque année (semaine 52), titre et artiste de l'année du classement mondial. */
export function runAwards(s: GameState, notes: Notes) {
  s.awards ??= []
  if (s.week % 52 !== 0) return
  const year = s.week / 52
  const mineIds = new Set(s.artists.map((a) => a.id))
  const singles = chartFor(s, 'monde', s.label.hqCityId, 'singles')
  const artists = chartFor(s, 'monde', s.label.hqCityId, 'artistes')
  const cats: ['titre' | 'artiste', typeof singles][] = [['titre', singles], ['artiste', artists]]
  for (const [category, rows] of cats) {
    const top = rows[0]
    if (!top) continue
    const winner = category === 'titre' ? (top.title ?? top.artist) : top.artist
    const mine = mineIds.has(top.artistId ?? '')
    const nominated = mine || rows.slice(0, 5).some((r) => mineIds.has(r.artistId ?? ''))
    s.awards.push({ year, week: s.week, category, winner, artistId: top.artistId, mine, nominated })
    const label = category === 'titre' ? 'Titre de l’année' : 'Artiste de l’année'
    if (mine) {
      s.cash += AWARD_PRIZE.cash; addRep(s, AWARD_PRIZE.rep)
      notes.push({ tag: 'Palier', text: `Cérémonie An ${year} · ${label} : ${winner} est à vous ! (+$${AWARD_PRIZE.cash.toLocaleString('fr-FR')}, +${AWARD_PRIZE.rep} de réputation)`, tone: 'g' })
    } else notes.push({ tag: 'Palier', text: `Cérémonie An ${year} · ${label} : ${winner}${nominated ? ' (vous étiez parmi les nominés)' : ''}.`, tone: nominated ? 'e' : 'i' })
  }
}
