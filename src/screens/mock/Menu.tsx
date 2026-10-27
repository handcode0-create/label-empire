import { useGame, guard } from '../../store/gameStore'
import { cityById, palierFor } from '../../data/world'
import { totalFans } from '../../engine/util'
import { compact, usd } from '../../lib'

export default function Menu() {
  const { game, hasSave, load, setModal, quit } = useGame()
  const saved = hasSave()
  const g = game
  const wk = g ? `Semaine ${(g.week - 1) % 52 + 1}` : ''
  return (
    <div className="scr">
      <div className="map" style={{position: 'absolute', left: 520, top: 120, width: 960, height: 480, opacity: '0.5'}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 560, background: 'linear-gradient(90deg, rgba(12,7,25,0.96) 70%, transparent)'}} />
      <div style={{position: 'absolute', left: 80, top: 72, display: 'flex', alignItems: 'center', gap: 16}}>
        <div className="lg" style={{margin: 0}}>LE</div>
        <div className="disp" style={{fontSize: 40, letterSpacing: '0.08em'}}>LABEL EMPIRE</div>
      </div>
      <div style={{position: 'absolute', left: 80, top: 220, width: 400, display: 'flex', flexDirection: 'column', gap: 14}}>
        <a href="Hub.dc.html" className="btn" onClick={guard(() => { if (g) return true; if (hasSave()) return load(); useGame.getState().say('Aucune partie en cours : lancez une nouvelle partie.', 'err'); return false })} style={{height: 64, justifyContent: 'space-between', padding: '0 28px', opacity: g || saved ? 1 : 0.55}}>Continuer <span style={{fontSize: 14, letterSpacing: '0.02em', textTransform: 'none'}}>{wk}</span></a>
        <a href="NouvellePartie.dc.html" className="btn s">Nouvelle partie</a>
        <a href="Hub.dc.html" className="btn s" onClick={guard(() => load())}>Charger une partie</a>
        <a href="Menu.dc.html" className="btn s" onClick={guard(() => { setModal('options'); return false })}>Options</a>
        <a href="Menu.dc.html" className="btn s" onClick={guard(() => { setModal('credits'); return false })}>Crédits</a>
        <a href="Main.dc.html" className="btn s" onClick={() => quit()} style={{opacity: '0.8'}}>Quitter</a>
      </div>
      {g && (
        <div className="pn cut" style={{position: 'absolute', left: 640, top: 560, width: 720, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18}}>
          <div style={{gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12}}><span className="lbl">Dernière partie</span><span className="tag tg">Sauvegarde automatique</span></div>
          <div><div className="lbl">Label</div><div className="h2" style={{marginTop: 6}}>{g.label.name}</div><div className="mut" style={{fontSize: 14}}>Siège : {cityById(g.label.hqCityId).name}</div></div>
          <div><div className="lbl">Palier</div><div className="h2" style={{marginTop: 6}}>{palierFor(g.reputation).n} · {palierFor(g.reputation).name.replace('Label ', '')}</div><div className="mut" style={{fontSize: 14}}>Réputation {Math.floor(g.reputation)}</div></div>
          <div><div className="lbl">Fans</div><div className="h2" style={{marginTop: 6, color: '#35D3F0'}}>{compact(totalFans(g))}</div><div className="mut" style={{fontSize: 14}}>{g.stats.countriesReached.length} ville(s)</div></div>
          <div><div className="lbl">Trésorerie</div><div className="h2" style={{marginTop: 6, color: '#FFC63D'}}>{usd(g.cash)}</div><div className="mut" style={{fontSize: 14}}>Semaine {(g.week - 1) % 52 + 1}, an {Math.floor((g.week - 1) / 52) + 1}</div></div>
        </div>
      )}
      <div style={{position: 'absolute', left: 80, bottom: 32, fontSize: 13, color: '#9C90CC'}}>Label Empire · Les artistes et labels sont fictifs</div>
    </div>
  )
}
