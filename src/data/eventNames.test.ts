import { describe, expect, it } from 'vitest'
import { generateContestName, generateTourName } from './eventNames'
import { createRng } from '../engine/rng'
import { CITIES, cityById } from './world'
import { CONTEST_RANGE } from '../engine/scouting'

describe('noms de concours et de tournées', () => {
  it('le nom de concours cite la ville et évite les doublons', () => {
    const taken: string[] = []
    for (let i = 0; i < 40; i++) { const n = generateContestName(createRng(i + 1), { city: 'New York', format: 'tv' }, taken); expect(n).toContain('New York'); expect(taken).not.toContain(n); taken.push(n) }
  })
  it('le nom de tournée n’est jamais vide et évite les doublons', () => {
    const taken: string[] = []
    for (let i = 0; i < 40; i++) { const n = generateTourName(createRng(i + 7), { artist: 'Zola Gold', cities: ['Abidjan', 'Paris', 'Lagos', 'Londres'], year: 2027 }, taken); expect(n.trim().length).toBeGreaterThan(3); expect(taken).not.toContain(n); taken.push(n) }
  })
  it('New York et Los Angeles sont ouverts aux concours dès 15 de réputation', () => {
    expect(cityById('newyork').minRep).toBeLessThanOrEqual(15 + CONTEST_RANGE)
    expect(cityById('losangeles').minRep).toBeLessThanOrEqual(15 + CONTEST_RANGE)
  })
  it('le monde compte désormais plus de destinations', () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(26)
    expect(new Set(CITIES.map((c) => c.id)).size).toBe(CITIES.length)
  })
})
