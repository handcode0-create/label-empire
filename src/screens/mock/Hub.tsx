import { useMemo, useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { CITIES, CONTINENTS } from '../../data/world'
import { agenda, alerts, fansByCity, fansByContinent, projection } from '../../engine/selectors'
import { guard, useGame } from '../../store/gameStore'
import { compact, usd } from '../../lib'

const TONE = { g: 'tg', e: 'te', c: 'tc', r: 'tr_', i: 'ti' } as const

export default function Hub() {
  const g = useGame((s) => s.game)!
  const { select, go, nextWeek } = useGame()
  const [zoom, setZoom] = useState<string | null>(null)
  const proj = useMemo(() => projection(g, 8), [g])
  const cities = fansByCity(g)
  const conts = fansByContinent(g)
  const maxCont = Math.max(1, ...Object.values(conts))
  const items = agenda(g)
  const al = alerts(g)
  const last = proj[proj.length - 1]
  const delta = g.cash > 0 ? Math.round(((last.cash - g.cash) / g.cash) * 100) : 0
  const pts = [g.cash, ...proj.map((p) => p.cash)]
  const lo = Math.min(...pts), hi = Math.max(...pts)
  const y = (v: number) => 62 - ((v - lo) / Math.max(1, hi - lo)) * 52
  const path = pts.map((v, i) => `${i ? 'L' : 'M'}${Math.round((i / (pts.length - 1)) * 320)} ${Math.round(y(v))}`).join(' ')
  const openCity = (id: string) => { select({ cityId: id }); go('Pays') }
  const shown = CITIES.filter((c) => !zoom || c.continent === zoom)

  return (
    <div className="scr">
      <Dock active="monde" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div className="pn" style={{width: 900, padding: 0, position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 20, top: 18, display: 'flex', gap: 8, alignItems: 'center', zIndex: 2}}>
            <span className={'chip' + (!zoom ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setZoom(null)}>Monde</span>
            {(['Afrique', 'Europe', 'Amérique du Nord', 'Asie'] as const).map((c) => <span key={c} className={'chip' + (zoom === c ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setZoom(zoom === c ? null : c)}>{c}</span>)}
          </div>
          <div className="map" style={{position: 'absolute', left: 0, top: 76, width: 900, height: 450}}>
            {shown.map((c) => {
              const office = g.offices.find((o) => o.cityId === c.id)
              const locked = c.minRep > g.reputation
              const cls = office ? (office.kind === 'partenaire' ? 'c' : 'g') : locked ? 'd' : ''
              const fans = cities[c.id] ?? 0
              const nameY = ({ abidjan: 4, lagos: -4.4, london: -4, berlin: -3, paris: 2.5, mumbai: 4 } as Record<string, number>)[c.id] ?? 0
              return (
                <div key={c.id}>
                  <div className={'mk ' + cls} role="button" tabIndex={0} aria-label={c.name} onClick={() => openCity(c.id)} style={{left: c.x + '%', top: c.y + '%', cursor: 'pointer', opacity: !office && !fans && !locked ? 0.65 : 1}} />
                  <div className="mn" onClick={() => openCity(c.id)} style={{left: c.x + '%', top: c.y + nameY + '%', cursor: 'pointer', color: office?.kind === 'siege' ? '#FFC63D' : locked ? '#9C90CC' : undefined}}>{c.name}{office?.kind === 'siege' ? ' · siège' : ''}</div>
                </div>
              )
            })}
          </div>
          <div style={{position: 'absolute', left: 20, bottom: 16, right: 20, display: 'flex', gap: 22, fontSize: 13, color: '#B3A6D9', alignItems: 'center'}}>
            <span><i className="mk g" style={{position: 'static', display: 'inline-block', verticalAlign: '-3px', margin: '0 8px 0 0'}} />Siège / bureau</span>
            <span><i className="mk c" style={{position: 'static', display: 'inline-block', verticalAlign: '-3px', margin: '0 8px 0 0'}} />Partenaire local</span>
            <span><i className="mk" style={{position: 'static', display: 'inline-block', verticalAlign: '-3px', margin: '0 8px 0 0'}} />Fans présents</span>
            <span><i className="mk d" style={{position: 'static', display: 'inline-block', verticalAlign: '-1px', margin: '0 8px 0 0'}} />Verrouillé · réputation requise</span>
          </div>
          <div style={{position: 'absolute', left: 20, right: 20, top: 548, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12}}>
            {CONTINENTS.map((c) => (
              <div key={c}><div className="lbl">{c === 'Amérique du Nord' ? 'Amér. Nord' : c === 'Amérique latine' ? 'Amér. latine' : c}</div><div className="disp" style={{fontSize: 22}}>{compact(conts[c] ?? 0)}</div><div className="mt" style={{marginTop: 6}}><i style={{width: Math.round(((conts[c] ?? 0) / maxCont) * 100) + '%'}} /></div></div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 20, right: 20, bottom: 56, fontSize: 13, color: '#9C90CC'}}>Fans du label par continent. Cliquez un continent pour filtrer, puis une ville pour ouvrir sa fiche.</div>
        </div>
        <div style={{width: 376, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className="pn cut" style={{paddingBottom: 8}}>
            <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Cette semaine</span><span className="sp" /><span className="tag ti">{items.length} événement{items.length > 1 ? 's' : ''}</span></div>
            <div style={{marginTop: 8}}>
              {items.length === 0 && <div className="mut" style={{padding: '14px 0', fontSize: 14}}>Rien de prévu. Écrivez un titre, lancez un concours ou planifiez une tournée.</div>}
              {items.map((it, i) => (
                <div key={i} className="row" style={{gridTemplateColumns: '48px 1fr auto'}}><span className="lbl">{it.day}</span><div><b>{it.title}</b><div className="mut" style={{fontSize: 13}}>{it.detail}</div></div>
                  {it.link ? <a href={it.link + '.dc.html'} className={'tag ' + TONE[it.tone]}>{it.tag}</a> : <span className={'tag ' + TONE[it.tone]}>{it.tag}</span>}</div>
              ))}
            </div>
          </div>
          <div className="pn">
            <div className="lbl">Trésorerie projetée sur 8 semaines</div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 6}}>
              <div className="num" style={{color: last.cash < 0 ? '#FF5470' : '#FFC63D'}}>{usd(last.cash)}</div><span className={delta >= 0 ? 'up' : 'mut'} style={{fontSize: 14, paddingBottom: 4, color: delta < 0 ? '#FF5470' : undefined}}>{delta >= 0 ? '+' : ''}{delta} %</span>
            </div>
            <svg viewBox="0 0 320 70" width="100%" height={70} style={{marginTop: 8}} role="img" aria-label="Courbe de trésorerie projetée">
              <defs><linearGradient id="fa" x1={0} y1={0} x2={0} y2={1}><stop offset={0} stopColor="#FFC63D" stopOpacity="0.35" /><stop offset={1} stopColor="#FFC63D" stopOpacity={0} /></linearGradient></defs>
              <path d={path + ' L320 70 L0 70Z'} fill="url(#fa)" />
              <path d={path} fill="none" stroke="#FFC63D" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="pn">
            <div className="lbl">Alertes</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10, fontSize: 14}}>
              {al.length === 0 && <div className="mut">Aucune alerte.</div>}
              {al.map((a, i) => <div key={i} style={{display: 'flex', gap: 10, alignItems: 'center'}}><span className={'tag ' + (a.tone === 'r' ? 'tr_' : 'te')}>{a.tag}</span>{a.text}</div>)}
            </div>
          </div>
          <div className="sp" />
          <a href="Rapport.dc.html" className="btn" style={{height: 64, fontSize: 24}} onClick={guard(() => { nextWeek(); if (useGame.getState().game?.outcome) { go('Fin'); return false } })}>Valider la semaine</a>
        </div>
      </div>
    </div>
  )
}
