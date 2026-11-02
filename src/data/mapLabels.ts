/** Placement des noms de villes sur une carte : essaie plusieurs positions autour du repère pour éviter tout chevauchement. */
export interface LabelItem { id: string; x: number; y: number; text: string; priority?: number }
export interface LabelBox { left: number; top: number; w: number; h: number }

const CHAR_W = 7.4
const H = 17
const MARK = 16

const hit = (a: LabelBox, b: LabelBox, pad = 2) => a.left < b.left + b.w + pad && b.left < a.left + a.w + pad && a.top < b.top + b.h + pad && b.top < a.top + a.h + pad
const overlap = (a: LabelBox, b: LabelBox) => Math.max(0, Math.min(a.left + a.w, b.left + b.w) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.top + a.h, b.top + b.h) - Math.max(a.top, b.top))

/** `width` et `height` : taille de la carte en pixels ; x et y des villes en pourcentages. */
export function placeLabels(items: LabelItem[], width: number, height: number): Record<string, LabelBox> {
  const pts = items.map((c) => ({ c, px: (c.x / 100) * width, py: (c.y / 100) * height }))
  const marks: LabelBox[] = pts.map((p) => ({ left: p.px - MARK / 2, top: p.py - MARK / 2, w: MARK, h: MARK }))
  const placed: Record<string, LabelBox> = {}
  const boxes: LabelBox[] = []
  const order = [...pts].sort((a, b) => (b.c.priority ?? 0) - (a.c.priority ?? 0))
  for (const p of order) {
    const w = Math.ceil(p.c.text.length * CHAR_W) + 4
    const r = MARK / 2 + 3
    const cand: LabelBox[] = [
      { left: p.px + r, top: p.py - H / 2, w, h: H }, // à droite
      { left: p.px - r - w, top: p.py - H / 2, w, h: H }, // à gauche
      { left: p.px - w / 2, top: p.py - r - H, w, h: H }, // au-dessus
      { left: p.px - w / 2, top: p.py + r, w, h: H }, // en dessous
      { left: p.px + r, top: p.py - r - H + 4, w, h: H }, // haut droite
      { left: p.px + r, top: p.py + r - 4, w, h: H }, // bas droite
      { left: p.px - r - w, top: p.py - r - H + 4, w, h: H }, // haut gauche
      { left: p.px - r - w, top: p.py + r - 4, w, h: H }, // bas gauche
      { left: p.px + r, top: p.py - r - H - 14, w, h: H }, // loin en haut à droite
      { left: p.px + r, top: p.py + r + 12, w, h: H }, // loin en bas à droite
      { left: p.px - r - w, top: p.py - r - H - 14, w, h: H },
      { left: p.px - r - w, top: p.py + r + 12, w, h: H },
    ].filter((b) => b.left >= 0 && b.left + b.w <= width && b.top >= 0 && b.top + b.h <= height)
    const myMark = marks[pts.indexOf(p)]
    const clash = (b: LabelBox) => boxes.reduce((n, o) => n + overlap(b, o), 0) + marks.reduce((n, m) => n + (m === myMark ? 0 : overlap(b, m)), 0)
    const free = cand.find((b) => !boxes.some((o) => hit(b, o)) && !marks.some((m) => m !== myMark && hit(b, m, 0)))
    const best = free ?? cand.reduce((a, b) => (clash(b) < clash(a) ? b : a), cand[0] ?? { left: p.px + r, top: p.py - H / 2, w, h: H })
    placed[p.c.id] = best
    boxes.push(best)
  }
  return placed
}
