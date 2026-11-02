import { it } from 'vitest'
import { advanceWeek } from './advanceWeek'
import { createGame } from './newGame'
import { botTurn, SIM_CFG } from './simBot'
it('save', () => {
  let g = createGame({ ...SIM_CFG, seed: 2 }); g.freeMode = true
  for (let i = 0; i < 70; i++) { g = botTurn(g); g = advanceWeek(g) }
  g.seenScenes = ['intro', 'premier-artiste', 'premier-studio', 'premiere-sortie']
  require('fs').writeFileSync('/tmp/claude-0/-home-claude/fd9a6bf3-4e29-5c06-8096-495a3b5f31f5/scratchpad/save.json', JSON.stringify(g))
}, 300_000)
