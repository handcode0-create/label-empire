import { describe, expect, it } from 'vitest'
import { CERT_MIN_REP, levelForRep } from './certifications'

describe('certifications et réputation', () => {
  it('pas de platine avant 30 de réputation, même avec les écoutes', () => {
    expect(levelForRep('titre', 40_000_000, 20)).toBe('or')
    expect(levelForRep('titre', 40_000_000, 30)).toBe('platine')
  })
  it('le diamant exige 75 de réputation', () => {
    expect(levelForRep('titre', 60_000_000, 60)).toBe('platine')
    expect(levelForRep('titre', 60_000_000, CERT_MIN_REP.diamant)).toBe('diamant')
  })
  it('sans écoutes suffisantes, aucun disque', () => { expect(levelForRep('titre', 1_000_000, 80)).toBeNull() })
})
