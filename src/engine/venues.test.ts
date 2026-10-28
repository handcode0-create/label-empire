import { describe, it, expect } from 'vitest'
import { venuesFor } from '../data/people'
import { cityById } from '../data/world'
import { newStop, suggestedPrice } from './tour'

describe('types de salles', () => {
  it('chaque ville propose 5 types de salles de capacité croissante', () => {
    for (const id of ['abidjan', 'lagos', 'paris']) {
      const v = venuesFor(cityById(id))
      expect(v.map((x) => x.kind)).toEqual(['club', 'theatre', 'salle', 'arene', 'stade'])
      for (let i = 1; i < v.length; i++) expect(v[i].capacity).toBeGreaterThan(v[i - 1].capacity)
    }
  })
  it('le prix conseillé monte avec la taille de la salle', () => {
    expect(suggestedPrice('paris', 'stade')).toBeGreaterThan(suggestedPrice('paris', 'club'))
    expect(newStop('paris', 5, 4).kind).toBe('stade')
  })
})
