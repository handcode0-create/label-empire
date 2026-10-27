import { CONTINENTS, cityById } from '../../data/world'
import { resolveEvent } from '../../engine/economy'
import { guard, useGame } from '../../store/gameStore'
import { compact, usd } from '../../lib'

const TONE = { g: 'tg', c: 'tc', e: 'te', r: 'tr_', i: 'ti' } as const

export default function Rapport() {
  const g = useGame((s) => s.game)!
  const { run, go } = useGame()
  const r = g.report
  if (!r) return <div className="scr"><div className="pn" style={{margin: 60}}>Aucun rapport : validez d'abord une semaine depuis le Hub. <a href="Hub.dc.html" className="btn" style={{marginTop: 16}}>Retour au Hub</a></div></div>
  const ev = g.event
  const max = Math.max(1, ...Object.values(r.byContinent))
  return (
    <div className="scr">
      <div className="map" style={{position: 'absolute', left: 120, top: 150, width: 1200, height: 600, opacity: '0.25'}} />
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(12,7,25,0.6)'}} />
      <div className="pn cut" style={{position: 'absolute', left: 180, top: 48, width: 1080, height: 804, padding: '28px 32px', background: 'linear-gradient(180deg,#2A1B4D,#1C1236)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><h1 className="h1" style={{fontSize: 44}}>Semaine {(r.week - 1) % 52 + 1} · résultats</h1><span className={'tag ' + (r.cashDelta >= 0 ? 'tg' : 'tr_')}>Trésorerie : {r.cashDelta >= 0 ? '+' : ''}{usd(r.cashDelta)}</span><div className="sp" /><span className="lbl">An {Math.floor((r.week - 1) / 52) + 1}</span></div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 20}}>
          <div className="pn"><div className="lbl">Écoutes</div><div className="num" style={{marginTop: 6}}>{compact(r.streams)}</div><span className="mut" style={{fontSize: 14}}>tous territoires</span></div>
          <div className="pn"><div className="lbl">Revenus encaissés</div><div className="num" style={{marginTop: 6, color: '#FFC63D'}}>{usd(r.revenue)}</div><span className="mut" style={{fontSize: 14}}>après délais de paiement</span></div>
          <div className="pn"><div className="lbl">Dépenses</div><div className="num" style={{marginTop: 6}}>{usd(r.expenses)}</div><span className="mut" style={{fontSize: 14}}>salaires, studio, promo</span></div>
          <div className="pn"><div className="lbl">Nouveaux fans</div><div className="num" style={{marginTop: 6, color: '#35D3F0'}}>+{compact(r.newFans)}</div><span className="mut" style={{fontSize: 14}}>{g.stats.countriesReached.length} ville(s) atteinte(s)</span></div>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 18}}>
          <div className="pn" style={{width: 500}}>
            <div className="lbl">Revenus générés par continent</div>
            <div style={{display: 'grid', gridTemplateColumns: '120px 1fr 70px', gap: '11px 12px', alignItems: 'center', marginTop: 14, fontSize: 14}}>
              {CONTINENTS.filter((c) => r.byContinent[c]).length === 0 && <span className="mut" style={{gridColumn: '1 / -1'}}>Aucune écoute cette semaine.</span>}
              {CONTINENTS.filter((c) => r.byContinent[c]).map((c) => (<span key={c} style={{display: 'contents'}}><span>{c}</span><div className="mt gd"><i style={{width: Math.max(3, Math.round((r.byContinent[c] / max) * 100)) + '%'}} /></div><b>{usd(r.byContinent[c])}</b></span>))}
            </div>
            <div className="lbl" style={{marginTop: 18}}>Faits marquants</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, fontSize: 14, maxHeight: 190, overflow: 'auto'}}>
              {r.notes.length === 0 && <span className="mut">Semaine calme.</span>}
              {r.notes.slice(0, 6).map((n, i) => <div key={i} style={{display: 'flex', gap: 10, alignItems: 'center'}}><span className={'tag ' + TONE[n.tone]}>{n.tag}</span>{n.text}</div>)}
            </div>
          </div>
          {ev ? (
            <div className="pn sel" style={{flex: 1}}>
              <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><span className="tag tr_">Événement</span><span className="lbl">{ev.cityId ? cityById(ev.cityId).name : 'Industrie'}</span></div>
              <div className="h2" style={{marginTop: 10, fontSize: 28}}>{ev.title}</div>
              <p className="mut" style={{margin: '8px 0 14px'}}>{ev.text}</p>
              {ev.resolved ? <div className="tag tg">Décision prise : {ev.resolved}</div> : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                  {ev.choices.map((c) => (
                    <div key={c.id} className="pn" role="button" tabIndex={0} onClick={() => run((s) => resolveEvent(s, c.id))} style={{padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'}}><div style={{flex: 1}}><b>{c.label}</b><div className="mut" style={{fontSize: 13}}>{c.detail}</div></div><span className={'tag ' + (c.cost ? 'te' : 'tc')}>{c.cost ? usd(c.cost) : 'Gratuit'}</span></div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="pn" style={{flex: 1}}><div className="lbl">Détail des dépenses</div>
              <div style={{marginTop: 10, fontSize: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 8}}>{r.items.map((it, i) => <span key={i} style={{display: 'contents'}}><span>{it.label}</span><b style={{color: it.amount >= 0 ? '#3DDC97' : '#FF7DBB'}}>{usd(it.amount)}</b></span>)}</div></div>
          )}
        </div>
        <div style={{position: 'absolute', left: 32, right: 32, bottom: 28, display: 'flex', alignItems: 'center', gap: 14}}><span className="mut" style={{fontSize: 14}}>{r.nextWeek}</span><div className="sp" /><a href="Hub.dc.html" className="btn" style={{height: 60}} onClick={guard(() => { if (g.outcome) { go('Fin'); return false } })}>Continuer</a></div>
      </div>
    </div>
  )
}
