import { it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { botTurn, SIM_CFG } from './simBot'
import { OBJECTIVES } from './objectives'

it('durée complète', () => {
  let g = createGame({ ...SIM_CFG, seed: 1 }); g.freeMode = true
  const at: Record<string, number> = {}
  for (let i = 0; i < 520; i++) {
    g = botTurn(g); g = advanceWeek(g)
    for (const id of g.objectives) if (at[id] === undefined) at[id] = g.week
  }
  const rest = OBJECTIVES.filter((o) => !g.objectives.includes(o.id)).map((o) => o.id)
  require('fs').appendFileSync('/tmp/claude-0/-home-claude/fd9a6bf3-4e29-5c06-8096-495a3b5f31f5/scratchpad/full.log', JSON.stringify({ done: g.objectives.length, total: OBJECTIVES.length, rest, rep: g.reputation, cash: Math.round(g.cash), at }) + '\n')
}, 1_200_000)
