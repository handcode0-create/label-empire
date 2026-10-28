import { describe, it, expect } from 'vitest'

import { GENRES } from '../data/world'
describe('genres', () => {
  it('au moins 15 genres distincts', () => { expect(new Set(GENRES).size).toBeGreaterThanOrEqual(15) })
})
