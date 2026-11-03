import { describe, it, expect } from 'vitest'
import { speakable } from './voice'

describe('voix : préparation du texte', () => {
  it('lit les montants, pourcentages et rangs en toutes lettres', () => {
    expect(speakable('Gain de $25 000 et 12 % de fans, n°3 du classement N° 1')).toBe('Gain de 25 000 dollars et 12 pour cent de fans, numéro 3 du classement numéro 1')
  })
  it('retire les symboles décoratifs et compacte les espaces', () => {
    expect(speakable('Certain ·  réputation   +2 → fans')).toBe('Certain , réputation +2 , fans')
    expect(speakable('   ')).toBe('')
  })
})
