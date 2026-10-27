import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { CITIES, cityById } from '../../data/world'
import { bestRank, chartFor, type ChartKind, type ChartLevel } from '../../engine/market'
import { useGame } from '../../store/gameStore'
import { compact } from '../../lib'
import { LabelLogo } from '../../components/Logo'
import { useOpen } from '../../components/useOpen'

const LEVELS: [ChartLevel, string][] = [['ville', 'Ville'], ['pays', 'Pays'], ['continent', 'Continent'], ['monde', 'Monde']]
const selectStyle: React.CSSProperties = { height: 36, padding: '0 14px', borderRadius: 18, fontWeight: 700, fontSize: 14, color: '#B3A6D9', boxShadow: 'inset 0 0 0 1px var(--ln)', background: 'rgba(28,18,54,.9)', border: 0, cursor: 'pointer' }

export default function Classements() {
  const g = useGame((s) => s.game)!
  const sel = useGame((s) => s.sel)
  const [level, setLevel] = useState<ChartLevel>('pays')
  const [cityId, setCityId] = useState(sel.cityId ?? g.label.hqCityId)
  const [kind, setKind] = useState<ChartKind>('singles')
  const open = useOpen()
  const city = cityById(cityId)
  const rows = chartFor(g, level, cityId, kind).slice(0, kind === 'singles' ? 9 : 10)
  const KIND_LABEL: Record<ChartKind, string> = { singles: 'Titre', artistes: 'Artiste', eps: 'EP', albums: 'Album' }
  const top = g.songs.filter((s) => s.stage === 'released').sort((a, b) => Object.values(b.stats.lastByCity).reduce((x, y) => x + y, 0) - Object.values(a.stats.lastByCity).reduce((x, y) => x + y, 0))[0]
  const spread = top ? Object.entries(top.stats.lastByCity).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 4) : []
  const maxS = Math.max(1, ...spread.map((x) => x[1]))
  const other = CITIES.find((c) => c.id !== cityId && g.stats.countriesReached.includes(c.id)) ?? CITIES[3]
  const pos = (lv: ChartLevel, id: string) => { const r = bestRank(g, lv, id); return r ? 'n°' + r : 'hors' }
  const limit = (lv: ChartLevel) => ({ ville: 100, pays: 100, continent: 50, monde: 100 }[lv])
  const posTone = (lv: ChartLevel, id: string) => (bestRank(g, lv, id) ? undefined : '#9C90CC')
  return (
    <div className="scr">
      <Dock active="classements" />
      <Hud />
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <h1 className="h1">Classements</h1>
          <div style={{display: 'flex', gap: 8}}>{LEVELS.map(([k, l]) => <span key={k} className={'chip' + (level === k ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setLevel(k)}>{l}</span>)}</div>
          <div className="sp" />
          <select aria-label="Ville" style={selectStyle} value={cityId} onChange={(e) => setCityId(e.target.value)}>{CITIES.map((c) => <option key={c.id} value={c.id}>{level === 'pays' || level === 'ville' ? `${c.country} · ${c.name}` : c.name}</option>)}</select>
          <select aria-label="Type" style={selectStyle} value={kind} onChange={(e) => setKind(e.target.value as ChartKind)}><option value="singles">Top 100 singles</option><option value="albums">Top 200 albums</option><option value="eps">Top 50 EP</option><option value="artistes">Top artistes</option></select>
        </div>
        <div style={{display: 'flex', gap: 20, marginTop: 16}}>
          <div className="pn cut" style={{width: 880, paddingBottom: 8}}>
            <div className="row th" style={{gridTemplateColumns: '50px 1fr 200px 110px 70px', paddingTop: 0}}><span>Rang</span><span>{KIND_LABEL[kind]}</span><span>Label</span><span>Écoutes</span><span>Évol.</span></div>
            {rows.map((r) => (
              <div key={r.rank + r.title} className="row" role="button" tabIndex={0} title="Ouvrir la fiche" onClick={() => (kind === 'singles' ? open.song(r.songId) : open.artist(r.artistId))} style={{gridTemplateColumns: '50px 1fr 200px 110px 70px', cursor: 'pointer', ...(r.mine ? {background: 'rgba(255,61,154,0.12)', borderRadius: 8, boxShadow: 'inset 0 0 0 1px var(--mag)'} : {})}}>
                <span className="disp" style={{fontSize: 24, color: r.mine ? '#FF7DBB' : undefined}}>{r.rank}</span>
                <div><b>{r.title}</b>{kind !== 'artistes' && <div className="mut" style={{fontSize: 13}}><span style={{textDecoration: 'underline', textDecorationColor: 'var(--ln)'}} onClick={(e) => { e.stopPropagation(); open.artist(r.artistId) }}>{r.artist}</span></div>}</div>
                <span style={{display: 'flex', alignItems: 'center', gap: 10}} onClick={(e) => { e.stopPropagation(); open.label(r.label) }}><LabelLogo name={r.label} logoId={r.mine ? g.label.logoId : undefined} size={28} />{r.mine ? <b style={{color: '#FF7DBB'}}>{g.label.name}</b> : <span className="mut">{r.label}</span>}</span>
                <b>{compact(r.streams)}</b>
                {r.delta === null ? <span className="tag tc">Nouv.</span> : r.delta > 0 ? <span className="up">+{r.delta}</span> : r.delta < 0 ? <span className="dn">−{Math.abs(r.delta)}</span> : <span className="mut">=</span>}
              </div>
            ))}
            {rows.length === 0 && <div className="mut" style={{padding: 20}}>Aucune donnée pour cette semaine.</div>}
          </div>
          <div style={{width: 420, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div className="pn">
              <div className="lbl">Vos positions cette semaine</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12}}>
                <div><div className="mut" style={{fontSize: 13}}>{city.country}</div><div className="num" style={{color: posTone('pays', cityId) ?? '#FF7DBB'}}>{pos('pays', cityId)}</div></div>
                <div><div className="mut" style={{fontSize: 13}}>{city.continent}, top {limit('continent')}</div><div className="num" style={{color: posTone('continent', cityId) ?? '#35D3F0'}}>{pos('continent', cityId)}</div></div>
                <div><div className="mut" style={{fontSize: 13}}>{other.country}</div><div className="num" style={{color: posTone('pays', other.id)}}>{pos('pays', other.id)}</div></div>
                <div><div className="mut" style={{fontSize: 13}}>Monde, top {limit('monde')}</div><div className="num" style={{color: posTone('monde', cityId) ?? '#9C90CC'}}>{pos('monde', cityId)}</div></div>
              </div>
            </div>
            <div className="pn">
              <div className="lbl">Diffusion du titre{top ? ` · « ${top.title} »` : ''}</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, fontSize: 14}}>
                {spread.length === 0 && <span className="mut">Aucun titre en diffusion. Programmez une sortie.</span>}
                {spread.map(([id, v]) => <div key={id} style={{display: 'grid', gridTemplateColumns: '110px 1fr 56px', gap: 10, alignItems: 'center'}}><span>{cityById(id).name}</span><div className="mt"><i style={{width: Math.max(3, Math.round((v / maxS) * 100)) + '%'}} /></div><b>{compact(v)}</b></div>)}
              </div>
              {spread.length > 0 && <div className="tag te" style={{marginTop: 14}}>Effet de région : {spread.length} marché(s) atteints cette semaine</div>}
            </div>
            <div className="pn">
              <div className="lbl">Genres dominants à {city.name}</div>
              <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}>{city.strong.slice(0, 3).map((x, i) => <span key={x} className={'tag ' + ['tg', 'tc', 'ti'][i]}>{i + 1} {x}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
