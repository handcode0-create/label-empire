import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { ACT_TITLES, OBJECTIVES, buyBackFreedom, buyoutCost, nextObjective } from '../../engine/objectives'
import { guard, useGame } from '../../store/gameStore'
import { usd } from '../../lib'

export default function Objectifs() {
  const g = useGame((s) => s.game)!
  const run = useGame((s) => s.run)
  const done = new Set(g.objectives ?? [])
  const next = nextObjective(g)
  const acts = [1, 2, 3, 4] as const
  return (
    <div className="scr">
      <Dock active="monde" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 900, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto', maxHeight: 760}}>
          {acts.map((a) => (
            <div key={a} className="pn cut">
              <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">{ACT_TITLES[a]}</span><span className="sp" /><span className="tag ti">{OBJECTIVES.filter((o) => o.act === a && done.has(o.id)).length} / {OBJECTIVES.filter((o) => o.act === a).length}</span></div>
              {OBJECTIVES.filter((o) => o.act === a).map((o) => {
                const ok = done.has(o.id)
                return (
                  <div key={o.id} className="row" style={{gridTemplateColumns: '28px 1fr auto auto', opacity: ok ? 0.65 : 1}}>
                    <span style={{color: ok ? '#3DDC97' : '#6E6896', fontSize: 18}}>{ok ? '✓' : '○'}</span>
                    <div><b>{o.title}</b><div className="mut" style={{fontSize: 13}}>{o.desc}</div></div>
                    <span className="mut" style={{fontSize: 13}}>{!ok && o.progress ? o.progress(g) : ''}</span>
                    <span className={'tag ' + (ok ? 'tg' : 'te')}>{o.reward.cash ? '+' + usd(o.reward.cash) : ''}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div style={{width: 376, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className="pn sel">
            <div className="lbl">Progression</div>
            <div className="num" style={{marginTop: 6}}>{done.size} / {OBJECTIVES.length}</div>
            <div className="mt" style={{marginTop: 8}}><i style={{width: Math.round((done.size / OBJECTIVES.length) * 100) + '%'}} /></div>
            <div className="mut" style={{fontSize: 13, marginTop: 10}}>Le jeu ne se termine que lorsque tous les objectifs sont accomplis. Un mauvais passage ne l’arrête pas : Meridian vous proposera un sauvetage, à ses conditions.</div>
          </div>
          {next && <div className="pn cut"><div className="lbl">Prochain objectif</div><div className="h2" style={{marginTop: 6}}>{next.title}</div><div className="mut" style={{fontSize: 14, marginTop: 4}}>{next.desc}</div></div>}
          <div className="pn cut">
            <div className="lbl">Accord Meridian Group</div>
            {g.deal ? (
              <>
                <div style={{marginTop: 6}}><b>{g.deal.kind === 'sauvetage' ? 'Sauvetage' : 'Offre de rachat acceptée'}</b></div>
                <div className="mut" style={{fontSize: 14, marginTop: 4}}>Prélèvement de {Math.round(g.deal.levy * 100)} % de vos recettes, encore {g.deal.weeksLeft} semaines.</div>
                <a href="Objectifs.dc.html" className="btn" style={{marginTop: 12}} onClick={guard(() => run(buyBackFreedom))}>Racheter ma liberté · {usd(buyoutCost(g.deal.weeksLeft))}</a>
              </>
            ) : <div className="mut" style={{fontSize: 14, marginTop: 6}}>Aucun accord : vous êtes indépendant.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
