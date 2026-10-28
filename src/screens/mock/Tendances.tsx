import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { GENRES, cityById } from '../../data/world'
import { SEASONS, activeTrends, seasonOf, trendMult } from '../../engine/dynamics'
import { useGame } from '../../store/gameStore'
import { weekNo, wk } from '../../lib'

export default function Tendances() {
  const g = useGame((s) => s.game)!
  const trends = activeTrends(g)
  const moves = (g.rivalMoves ?? []).filter((m) => m.until >= g.week)
  const season = seasonOf(g.week)
  const mer = g.meridian
  const rows = [...GENRES].map((x) => ({ genre: x, m: trendMult(g, x, g.week) })).sort((a, b) => b.m - a.m)
  const mine = new Set(g.songs.map((s) => s.genre).concat(g.artists.map((a) => a.genre)))
  return (
    <div className="scr">
      <Dock active="monde" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <h1 className="h1">Marché & tendances</h1>
          <span className="tag ti">{season ? season.label : 'Saison creuse'}</span>
          <span className="sp" />
          <a href="Hub.dc.html" className="btn s">Retour</a>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 14}}>
          <div style={{width: 620, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', maxHeight: 780}}>
            <div className="pn cut">
              <div className="lbl">Poids des genres cette semaine</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10}}>
                {rows.map((r) => {
                  const pct = Math.round((r.m - 1) * 100)
                  return (
                    <div key={r.genre} style={{display: 'grid', gridTemplateColumns: '130px 1fr 60px', gap: 10, alignItems: 'center', fontSize: 14}}>
                      <span style={{fontWeight: mine.has(r.genre) ? 700 : 400}}>{r.genre}{mine.has(r.genre) ? ' ★' : ''}</span>
                      <div className={'mt ' + (pct > 0 ? 'gr' : pct < 0 ? 'rd' : 'cy')}><i style={{width: Math.min(100, Math.max(4, 50 + pct * 1.6)) + '%'}} /></div>
                      <b style={{color: pct > 0 ? '#3DDC97' : pct < 0 ? '#FF5470' : undefined}}>{pct > 0 ? '+' : ''}{pct} %</b>
                    </div>
                  )
                })}
              </div>
              <div className="mut" style={{fontSize: 12, marginTop: 10}}>★ = genres de votre label. Les tendances et la saison modifient les écoutes de tous les titres du genre.</div>
            </div>
            <div className="pn cut">
              <div className="lbl">Calendrier des saisons</div>
              {SEASONS.map((x) => (
                <div key={x.id} className="row" style={{gridTemplateColumns: '1fr auto'}}>
                  <div><b>{x.label}</b><div className="mut" style={{fontSize: 12}}>{x.text}</div></div>
                  <span className={'tag ' + (season?.id === x.id ? 'tg' : 'ti')}>sem. {x.weeks[0]}–{x.weeks[1]}</span>
                </div>
              ))}
              <div className="mut" style={{fontSize: 12, marginTop: 8}}>Nous sommes en semaine {weekNo(g.week)}.</div>
            </div>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', maxHeight: 780}}>
            <div className={'pn' + (mer.phase === 'offensive' ? ' sel' : '')}>
              <div style={{display: 'flex', alignItems: 'center'}}><span className="lbl">Meridian Group</span><span className="sp" /><span className={'tag ' + (mer.phase === 'offensive' ? 'tr_' : 'tg')}>{mer.phase === 'offensive' ? 'Offensive' : 'Calme'}</span></div>
              <div style={{marginTop: 8, fontSize: 14}}>{mer.phase === 'offensive' ? `Campagne agressive${mer.region ? ' en ' + mer.region.replace('-', ' ') : ''} : −10 % d’écoutes sur la zone jusqu’en ${wk(mer.until)}.` : 'Pas d’offensive en cours. Meridian surveille votre réputation.'}</div>
            </div>
            <div className="pn">
              <div style={{display: 'flex', alignItems: 'center'}}><span className="lbl">Tendances en cours</span><span className="sp" /><span className="tag ti">{trends.length}</span></div>
              {trends.length === 0 && <div className="mut" style={{fontSize: 14, marginTop: 8}}>Aucune tendance marquée : le marché est stable.</div>}
              {trends.map((t) => (
                <div key={t.id} className="row" style={{gridTemplateColumns: '1fr auto'}}>
                  <div><b>{t.genre}</b><div className="mut" style={{fontSize: 12}}>{t.cause} · jusqu’en {wk(t.until)}</div></div>
                  <span className={'tag ' + (t.mult >= 1 ? 'tg' : 'tr_')}>{t.mult >= 1 ? '+' : '−'}{Math.round(Math.abs(t.mult - 1) * 100)} %</span>
                </div>
              ))}
            </div>
            <div className="pn">
              <div style={{display: 'flex', alignItems: 'center'}}><span className="lbl">Sorties rivales actives</span><span className="sp" /><span className="tag ti">{moves.length}</span></div>
              {moves.length === 0 && <div className="mut" style={{fontSize: 14, marginTop: 8}}>Aucune sortie rivale ne vous gêne en ce moment.</div>}
              {moves.map((m) => (
                <div key={m.id} className="row" style={{gridTemplateColumns: '1fr auto'}}>
                  <div><b>{m.artist}</b> · « {m.title} »<div className="mut" style={{fontSize: 12}}>{m.label} · {m.genre} · {m.cityIds.map((id) => cityById(id).name).join(', ')} · jusqu’en {wk(m.until)}</div></div>
                  <span className="tag tr_">−{Math.round(m.strength * 100)} %</span>
                </div>
              ))}
              <div className="mut" style={{fontSize: 12, marginTop: 8}}>Les titres du même genre perdent le plein effet, les autres environ un tiers. Une contre-campagne est parfois proposée en événement.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
