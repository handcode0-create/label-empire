import { it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { botTurn, SIM_CFG } from './simBot'
import { CITIES } from '../data/world'
import { weeklyStreams } from './market'
import { liveCity } from './market'
it('ratios', () => {
  let g = createGame({ ...SIM_CFG, seed: 1 }); g.freeMode = true
  const rows: string[] = []
  for (let i = 0; i < 200; i++) {
    g = botTurn(g); g = advanceWeek(g)
    if ([20, 52, 104, 199].includes(i)) {
      const rel = g.songs.filter((s) => s.stage === 'released')
      const r = CITIES.map((c) => { const t = rel.reduce((a, s) => a + weeklyStreams(g, s, c, g.week), 0); return [c.id, t / c.base] as [string, number] }).sort((a, b) => b[1] - a[1]).slice(0, 5)
      rows.push('sem ' + g.week + ' rep ' + g.reputation.toFixed(0) + ' ' + r.map(([id, v]) => id + ':' + v.toFixed(2)).join(' '))
    }
  }
  require('fs').writeFileSync('/tmp/claude-0/-home-claude/fd9a6bf3-4e29-5c06-8096-495a3b5f31f5/scratchpad/ratio.log', rows.join('\n') + '\n')
}, 600_000)
