import { it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { botTurn, SIM_CFG } from './simBot'
it('rep100', () => {
  const out: string[] = []
  for (const seed of [1, 2]) {
    let g = createGame({ ...SIM_CFG, seed }); g.freeMode = true; let hit = -1
    const at: Record<number, string> = {}
    for (let i = 0; i < 400; i++) { g = botTurn(g); g = advanceWeek(g); if (hit < 0 && g.reputation >= 99.95) hit = g.week; if (i % 52 === 51) at[g.week] = g.reputation.toFixed(0) + '/' + Math.round(g.cash / 1e6) + 'M' }
    out.push('seed ' + seed + ' hit100 ' + hit + ' ' + JSON.stringify(at))
  }
  require('fs').writeFileSync('/tmp/claude-0/-home-claude/fd9a6bf3-4e29-5c06-8096-495a3b5f31f5/scratchpad/hit.log', out.join('\n') + '\n')
}, 900_000)
