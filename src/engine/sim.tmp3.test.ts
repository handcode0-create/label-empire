import { it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { botTurn, SIM_CFG } from './simBot'
import { weeklyFixedCosts } from './economy'
import { totalFans } from './util'

it('trajectoire', () => {
  let g = createGame({ ...SIM_CFG, seed: 1 }); g.freeMode = true
  const rows: string[] = []
  for (let i = 0; i < 260; i++) {
    g = botTurn(g); g = advanceWeek(g)
    if ([12, 26, 52, 78, 104, 156, 208, 259].includes(i)) rows.push(['sem', g.week, 'rep', g.reputation.toFixed(1), 'cash', Math.round(g.cash), 'fans', Math.round(totalFans(g)), 'rev/sem', Math.round(g.report?.revenue ?? 0), 'charges', weeklyFixedCosts(g).total, 'titres', g.songs.filter((s) => s.stage === 'released').length, 'artistes', g.artists.length].join(' '))
  }
  require('fs').writeFileSync('/tmp/claude-0/-home-claude/fd9a6bf3-4e29-5c06-8096-495a3b5f31f5/scratchpad/traj.log', rows.join('\n') + '\n')
}, 600_000)
