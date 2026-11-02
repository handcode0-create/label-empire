import { describe, it, expect } from 'vitest'
import { CITIES } from './world'
import { placeLabels } from './mapLabels'

describe('placement des noms sur la carte', () => {
  it('aucun nom de ville ne chevauche un autre nom ni un repère', () => {
    const items = CITIES.map((c) => ({ id: c.id, x: c.x, y: c.y, text: c.name + (c.id === 'abidjan' ? ' · siège' : '') }))
    const W = 900, H = 450
    const boxes = placeLabels(items, W, H)
    const list = Object.entries(boxes)
    expect(list.length).toBe(CITIES.length)
    for (let i = 0; i < list.length; i++) {
      const [, a] = list[i]
      for (let j = i + 1; j < list.length; j++) {
        const [, b] = list[j]
        const sep = a.left >= b.left + b.w || b.left >= a.left + a.w || a.top >= b.top + b.h || b.top >= a.top + a.h
        expect(sep, `${list[i][0]} / ${list[j][0]}`).toBe(true)
      }
    }
    for (const c of CITIES) for (const [id, b] of list) {
      if (id === c.id) continue
      const px = (c.x / 100) * W, py = (c.y / 100) * H
      const inside = px + 5 > b.left && px - 5 < b.left + b.w && py + 5 > b.top && py - 5 < b.top + b.h
      expect(inside, `repère ${c.id} sous le nom ${id}`).toBe(false)
    }
  })
})
