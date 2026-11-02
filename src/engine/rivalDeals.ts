import { cityById } from '../data/world'
import { prestige } from './prices'
import { allRivalArtists, rivalArtistIn } from './rivalLife'
import type { RivalArtist } from './rivals'
import { ARTIST_SKILLS } from './types'
import type { Artist, Feat, GameState, Result } from './types'
import { addRep, artistSlots, clamp, clone, fail, money, ok, signedCount, spend, useAp } from './util'

/** Un artiste d'un label rival, vu comme partenaire : conditions d'un featuring avec lui. */
export function rivalFeatQuote(s: GameState, r: RivalArtist) {
  const pop = r.popularity
  const fee = Math.max(2000, Math.round((pop * pop * 90_000 * prestige(s)) / 500) * 500)
  const minRep = Math.max(0, Math.round(pop * 70 - 10))
  const bonus = clamp(Math.round(pop * 10 - 2), 0, 9)
  return { fee, share: 0.15, bonus, minRep, ok: s.reputation >= minRep }
}
export function makeRivalFeat(s: GameState, r: RivalArtist): Feat {
  const q = rivalFeatQuote(s, r)
  return { name: r.stageName, rivalId: r.id, cityId: r.originCityId, fee: q.fee, share: q.share, bonus: q.bonus, fans: { [r.originCityId]: Math.round(r.popularity * 900_000) } }
}

/** Rachat du contrat d'un artiste signé chez un rival (il rejoint votre label). */
export function buyoutQuote(s: GameState, r: RivalArtist) {
  const pop = r.popularity
  const price = Math.round((pop * pop * 1_200_000 * (0.6 + r.contract.yearsLeft * 0.25) * prestige(s)) / 1000) * 1000
  const minRep = Math.max(10, Math.round(pop * 80 - 5))
  return { price, minRep, ok: s.reputation >= minRep && signedCount(s) < artistSlots(s) && s.cash >= price }
}
export const isSignedByMe = (s: GameState, id: string) => (s.rivals?.signed ?? []).includes(id)

export function buyoutRival(s0: GameState, rivalId: string): Result {
  const s = clone(s0)
  const r = rivalArtistIn(s, rivalId)
  if (!r || !allRivalArtists(s).some((x) => x.id === rivalId)) return fail(s0, 'Artiste introuvable ou déjà parti.')
  const q = buyoutQuote(s, r)
  if (s.reputation < q.minRep) return fail(s0, `Réputation insuffisante : ${q.minRep} requis pour approcher ${r.stageName}.`)
  if (signedCount(s) >= artistSlots(s)) return fail(s0, `Plus de place : ${artistSlots(s)} artistes maximum.`)
  if (s.cash < q.price) return fail(s0, `Trésorerie insuffisante : ${money(q.price)} pour racheter le contrat.`)
  const e = useAp(s)
  if (e) return fail(s0, e)
  const e2 = spend(s, q.price, `Rachat du contrat de ${r.stageName}`)
  if (e2) return fail(s0, e2)
  const city = cityById(r.originCityId)
  const potential = clamp(Math.round(1 + r.popularity * 4.2), 1, 5)
  const skill = Math.round(28 + r.popularity * 62)
  const skills = Object.fromEntries(ARTIST_SKILLS.map((k) => [k, clamp(skill + ((k.length * 7) % 9) - 4, 15, 98)])) as Artist['skills']
  const a: Artist = {
    id: `rb-${r.id}`, stageName: r.stageName, realName: r.realName, originCityId: r.originCityId, genre: r.genre, lang: city.lang,
    skills, potential, fans: { [city.id]: Math.round(r.popularity * 1_800_000) }, isFounder: false, morale: 80, fatigue: 0,
    contract: { royalty: clamp(r.contract.royalty + 0.05, 0.2, 0.5), advance: q.price, weeks: Math.max(104, r.contract.yearsLeft * 52), signedWeek: s.week, scope: r.contract.scope },
    manager: { name: 'Manager indépendant', agency: r.labelName, email: `contact@${r.labelName.toLowerCase().replace(/[^a-z]+/g, '')}.example` },
    traits: ['Ambitieux'], gradient: '#8B5CF6,#FF3D9A', demo: { title: 'Titre inédit', quality: clamp(skill, 20, 95) },
  }
  s.artists.push(a)
  s.rivals.signed = [...(s.rivals.signed ?? []), r.id]
  addRep(s, 0.4)
  s.log.push(`Rachat : ${r.stageName} quitte ${r.labelName} pour votre label.`)
  return ok(s, `${r.stageName} rejoint votre label. ${r.labelName} a empoché ${money(q.price)}.`)
}
