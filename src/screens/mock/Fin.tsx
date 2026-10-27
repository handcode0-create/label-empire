import { cityById, palierFor } from '../../data/world'
import { totalFans } from '../../engine/util'
import { guard, useGame } from '../../store/gameStore'
import { compact, usd } from '../../lib'

export default function Fin() {
  const g = useGame((s) => s.game)
  const { freeMode, quit } = useGame()
  if (!g || !g.outcome) return <div className="scr"><div className="pn cut" style={{margin: 80, maxWidth: 560}}><div className="h2">Partie en cours</div><p className="mut">La fin de partie apparaît quand vous atteignez la réputation 100 (victoire) ou après 4 semaines de trésorerie négative (défaite).</p><a href="Hub.dc.html" className="btn">Retour au jeu</a></div></div>
  const win = g.outcome === 'victoire'
  const years = Math.floor((g.week - 1) / 52)
  const fans = totalFans(g)
  const score = Math.round(g.reputation * 60 + fans / 2000 + Math.max(0, g.cash) / 1000 + g.stats.countriesReached.length * 40)
  const conts = new Set(g.stats.countriesReached.map((id) => cityById(id).continent)).size
  const accent = win ? '#FFC63D' : '#FF5470'
  return (
    <div className="scr">
      <div className="map" style={{position: 'absolute', left: 120, top: 90, width: 1200, height: 600, opacity: '0.8'}}>
        {g.stats.countriesReached.map((id) => { const c = cityById(id); return <div key={id} className={'mk ' + (win ? 'g' : 'd')} style={{left: c.x + '%', top: c.y + '%'}} /> })}
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(700px 380px at 50% 38%, rgba(18,11,36,0.88), rgba(18,11,36,0.2) 75%, transparent)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
        <span className={'tag ' + (win ? 'te' : 'tr_')} style={{height: 30, fontSize: 14}}>Palier {palierFor(g.reputation).n} · {palierFor(g.reputation).name}</span>
        <div className="disp" style={{fontSize: 120, lineHeight: 1, letterSpacing: '0.08em', color: accent, textShadow: `0 0 40px ${win ? 'rgba(255,198,61,0.5)' : 'rgba(255,84,112,0.5)'}`}}>{win ? 'VICTOIRE' : 'DÉFAITE'}</div>
        <div className="lbl" style={{fontSize: 16, letterSpacing: '0.28em', color: '#B3A6D9'}}>{win ? `${g.label.name} règne sur la scène mondiale` : `${g.label.name} ferme ses portes : quatre semaines de trésorerie négative`}</div>
      </div>
      <div style={{position: 'absolute', left: 150, right: 150, top: 440, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14}}>
        <div className="pn cut" style={{textAlign: 'center'}}><div className="lbl">Durée</div><div className="num" style={{marginTop: 6}}>{years ? `${years} an${years > 1 ? 's' : ''}` : `${g.week - 1} sem.`}</div><div className="mut" style={{fontSize: 13}}>{g.week - 1} semaines</div></div>
        <div className="pn cut" style={{textAlign: 'center'}}><div className="lbl">Villes conquises</div><div className="num" style={{marginTop: 6, color: '#FF7DBB'}}>{g.stats.countriesReached.length}</div><div className="mut" style={{fontSize: 13}}>sur {conts} continent{conts > 1 ? 's' : ''}</div></div>
        <div className="pn cut" style={{textAlign: 'center'}}><div className="lbl">Fans</div><div className="num" style={{marginTop: 6, color: '#35D3F0'}}>{compact(fans)}</div><div className="mut" style={{fontSize: 13}}>dans le monde</div></div>
        <div className="pn cut" style={{textAlign: 'center'}}><div className="lbl">Artistes signés</div><div className="num" style={{marginTop: 6}}>{g.artists.filter((a) => !a.isFounder).length}</div><div className="mut" style={{fontSize: 13}}>{g.songs.filter((s) => s.stage === 'released').length} titres sortis</div></div>
        <div className="pn cut" style={{textAlign: 'center'}}><div className="lbl">Trésorerie finale</div><div className="num" style={{marginTop: 6, color: accent}}>{usd(g.cash)}</div><div className="mut" style={{fontSize: 13}}>{g.loan ? 'prêt en cours' : 'sans dette'}</div></div>
      </div>
      <div style={{position: 'absolute', left: 150, right: 150, top: 640, display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center'}}>
        <span className="tag tg">Réputation finale : {Math.floor(g.reputation)}</span><span className="tag tc">Revenus cumulés : {usd(g.stats.totalRevenue)}</span><span className="tag ti">Score : {score.toLocaleString('fr-FR')}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', gap: 18, justifyContent: 'center'}}>
        {win && <a href="Hub.dc.html" className="btn" style={{height: 60}} onClick={guard(() => { freeMode() })}>Continuer en mode libre</a>}
        <a href="NouvellePartie.dc.html" className={'btn' + (win ? ' s' : '')} style={{height: 60}} onClick={() => quit()}>Nouvelle partie</a>
        <a href="Menu.dc.html" className="btn s" style={{height: 60}}>Menu principal</a>
      </div>
    </div>
  )
}
