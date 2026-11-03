import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { CITIES, cityById } from '../../data/world'
import { bestRank, chartFor, type ChartKind, type ChartLevel } from '../../engine/market'
import { useGame } from '../../store/gameStore'
import { compact } from '../../lib'
import { LabelLogo } from '../../components/Logo'
import { useOpen } from '../../components/useOpen'
import Cover from '../../components/Cover'
import Avatar from '../../components/Avatar'
import { rivalArtistIn } from '../../engine/rivalLife'
import { CONTINENTS } from '../../data/world'

const LEVELS: [ChartLevel, string][] = [['ville', 'Ville'], ['pays', 'Pays'], ['continent', 'Continent'], ['monde', 'Monde']]
const HERO_IMG: Record<string, string> = { singles: 'scene', albums: 'studio', eps: 'nuit', artistes: 'ceremonie' }
const KINDS: { k: ChartKind; name: string; top: string; unit: string; a: string; b: string }[] = [
  { k: 'singles', name: 'Top 100 singles', top: '100', unit: 'Singles', a: '#FF3D9A', b: '#6D3DF0' },
  { k: 'albums', name: 'Top 200 albums', top: '200', unit: 'Albums', a: '#FFC63D', b: '#FF3D9A' },
  { k: 'eps', name: 'Top 50 EP', top: '50', unit: 'EP', a: '#35D3F0', b: '#6D3DF0' },
  { k: 'artistes', name: 'Top 10 artistes', top: '10', unit: 'Artistes', a: '#3DDC97', b: '#35D3F0' },
]
const CSS = `@keyframes lcRow{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
@keyframes lcHero{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.lc-row{transition:background .15s}.lc-row:hover{background:rgba(255,255,255,.07)!important}
.lc-card{transition:transform .15s,background .15s}.lc-card:hover{transform:translateY(-2px);background:rgba(255,255,255,.1)!important}
.lc-play{transition:transform .15s,filter .15s}.lc-play:hover{transform:scale(1.07);filter:brightness(1.12)}
.lc-strip{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 0}.lc-strip::-webkit-scrollbar{display:none}`

export default function Classements() {
  const g = useGame((s) => s.game)!
  const sel = useGame((s) => s.sel)
  const [level, setLevel] = useState<ChartLevel>('pays')
  const [cityId, setCityId] = useState(sel.cityId ?? g.label.hqCityId)
  const [kind, setKind] = useState<ChartKind>('singles')
  const open = useOpen()
  const city = cityById(cityId)
  const rows = chartFor(g, level, cityId, kind).slice(0, kind === 'artistes' ? 10 : 20)
  const KIND_LABEL: Record<ChartKind, string> = { singles: 'Titre', artistes: 'Artiste', eps: 'EP', albums: 'Album' }
  const K = KINDS.find((x) => x.k === kind)!
  const scopeName = level === 'ville' ? city.name : level === 'pays' ? city.country : level === 'continent' ? city.continent : 'Monde'
  const total = rows.reduce((n, r) => n + r.streams, 0)
  const reached = g.stats.countriesReached
  const places = [...CITIES].sort((a, b) => Number(reached.includes(b.id)) - Number(reached.includes(a.id)) || Number(b.id === g.label.hqCityId) - Number(a.id === g.label.hqCityId))
  const goContinent = (c: string) => { if (city.continent !== c) setCityId((CITIES.find((x) => x.continent === c && reached.includes(x.id)) ?? CITIES.find((x) => x.continent === c)!).id) }
  const openRow = (r: (typeof rows)[number]) => (kind === 'artistes' ? open.artist(r.artistId) : kind === 'singles' ? open.song(r.songId) : open.artist(r.artistId))
  const thumb = (r: (typeof rows)[number]) => {
    if (kind === 'artistes') { const a = g.artists.find((x) => x.id === r.artistId) ?? rivalArtistIn(g, r.artistId ?? ''); return a ? <Avatar artist={a as never} size={44} /> : <Avatar name={r.title} size={44} /> }
    const cv = kind === 'singles' ? g.songs.find((x) => x.id === r.songId)?.cover : g.projects.find((x) => x.id === r.projectId)?.cover
    return <Cover title={r.title} artist={r.artist} kind={kind === 'albums' ? 'Album' : kind === 'eps' ? 'EP' : 'Single'} cover={cv} size={44} radius={6} />
  }
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
      <style>{CSS}</style>
      <div className="main">
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <h1 className="h1">Classements</h1>
          <div style={{display: 'flex', gap: 8}}>{LEVELS.map(([k, l]) => <span key={k} role="button" tabIndex={0} className={'chip' + (level === k ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setLevel(k)} onKeyDown={(e) => e.key === 'Enter' && setLevel(k)}>{l}</span>)}</div>
        </div>
        {level !== 'monde' && (
          <div className="lc-strip" style={{marginTop: 14}} aria-label="Lieu">
            {level === 'continent'
              ? CONTINENTS.map((c) => <span key={c} role="button" tabIndex={0} className={'chip' + (city.continent === c ? ' on' : '')} style={{cursor: 'pointer', flex: 'none'}} onClick={() => goContinent(c)} onKeyDown={(e) => e.key === 'Enter' && goContinent(c)}>{c}</span>)
              : places.map((c) => <span key={c.id} role="button" tabIndex={0} className={'chip' + (cityId === c.id ? ' on' : '')} style={{cursor: 'pointer', flex: 'none'}} onClick={() => setCityId(c.id)} onKeyDown={(e) => e.key === 'Enter' && setCityId(c.id)}>{level === 'pays' ? `${c.country}${places.filter((x) => x.country === c.country).length > 1 ? ' · ' + c.name : ''}` : c.name}</span>)}
          </div>
        )}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 14}}>
          {KINDS.map((x) => (
            <div key={x.k} role="button" tabIndex={0} className="lc-card" onClick={() => setKind(x.k)} onKeyDown={(e) => e.key === 'Enter' && setKind(x.k)} style={{display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 10, cursor: 'pointer', background: kind === x.k ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.05)', boxShadow: kind === x.k ? 'inset 0 0 0 2px var(--mag)' : 'none'}}>
              <div style={{width: 52, height: 52, borderRadius: 8, flex: 'none', background: `linear-gradient(135deg,${x.a},${x.b})`, display: 'grid', placeItems: 'center', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 22, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,.35)'}}>{x.top}</div>
              <div style={{minWidth: 0}}><b style={{fontSize: 15}}>{x.name}</b><div className="mut" style={{fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{scopeName}</div></div>
            </div>
          ))}
        </div>
        <div key={kind + level + cityId} style={{display: 'flex', gap: 20, marginTop: 16, alignItems: 'flex-start'}}>
          <div style={{width: 880, borderRadius: 14, overflow: 'hidden', background: 'rgba(20,12,42,.7)', boxShadow: 'inset 0 0 0 1px var(--ln)'}}>
            <div style={{display: 'flex', gap: 24, alignItems: 'flex-end', padding: '24px 24px 20px', background: `linear-gradient(180deg,${K.a}88 0%,${K.b}44 70%,rgba(12,8,32,0) 100%), linear-gradient(180deg,rgba(12,8,32,.55),rgba(12,8,32,.86)), url(/scenes/${HERO_IMG[kind] ?? 'scene'}.webp) center/cover no-repeat, #140C2A`, animation: 'lcHero .35s ease-out both'}}>
              <div style={{width: 176, height: 176, borderRadius: 10, flex: 'none', position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg,${K.a},${K.b})`, boxShadow: '0 14px 36px rgba(0,0,0,.5)', color: '#fff'}}>
                <div style={{position: 'absolute', top: 12, left: 14, fontWeight: 800, fontSize: 11, letterSpacing: '.14em', opacity: .9}}>LABEL EMPIRE</div>
                <div style={{position: 'absolute', left: 14, bottom: 34, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 84, lineHeight: .85, textShadow: '0 4px 14px rgba(0,0,0,.3)'}}><span style={{fontSize: 24, display: 'block', letterSpacing: '.12em'}}>TOP</span>{K.top}</div>
                <div style={{position: 'absolute', left: 14, bottom: 12, fontWeight: 700, fontSize: 13, opacity: .95}}>{K.unit} · {scopeName}</div>
              </div>
              <div style={{minWidth: 0, flex: 1}}>
                <div className="lbl">Classement officiel · semaine {g.week}</div>
                <div className="h1" style={{fontSize: 52, lineHeight: 1, margin: '6px 0 10px'}}>{K.name}</div>
                <div className="mut" style={{fontSize: 14}}>{scopeName} · {rows.length} {rows.length > 1 ? 'entrées' : 'entrée'} · <b style={{color: 'var(--ink)'}}>{compact(total)}</b> écoutes cette semaine</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14}}>
                  <button className="lc-play" aria-label="Ouvrir la fiche du numéro 1" disabled={!rows[0]} onClick={() => rows[0] && openRow(rows[0])} style={{width: 56, height: 56, borderRadius: 28, border: 0, cursor: 'pointer', background: 'var(--mag)', display: 'grid', placeItems: 'center', boxShadow: '0 8px 22px rgba(255,61,154,.45)'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1A0B2E"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                  {rows[0] && <span className="mut" style={{fontSize: 13}}>N°1 : <b style={{color: 'var(--ink)'}}>{rows[0].title}</b>{kind !== 'artistes' ? ` · ${rows[0].artist}` : ''}</span>}
                </div>
              </div>
            </div>
            <div style={{padding: '0 16px 10px'}}>
              <div className="row th" style={{gridTemplateColumns: '40px 1fr 200px 100px 64px', padding: '8px 8px', boxShadow: '0 1px 0 var(--ln)'}}><span style={{textAlign: 'center'}}>#</span><span>{KIND_LABEL[kind]}</span><span>Label</span><span>Écoutes</span><span>Évol.</span></div>
              {rows.map((r, i) => (
                <div key={r.rank + r.title} className="row lc-row" role="button" tabIndex={0} title="Ouvrir la fiche" onClick={() => openRow(r)} onKeyDown={(e) => e.key === 'Enter' && openRow(r)} style={{gridTemplateColumns: '40px 1fr 200px 100px 64px', padding: '8px', borderRadius: 8, borderBottom: 0, cursor: 'pointer', animation: `lcRow .32s ${Math.min(i, 12) * 0.035}s ease-out both`, ...(r.mine ? {background: 'rgba(255,61,154,0.14)', boxShadow: 'inset 0 0 0 1px var(--mag)'} : {})}}>
                  <span className="disp" style={{fontSize: 22, textAlign: 'center', color: r.mine ? '#FF7DBB' : r.rank <= 3 ? 'var(--gold)' : undefined}}>{r.rank}</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0}}>
                    {thumb(r)}
                    <div style={{minWidth: 0}}><b style={{display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: r.mine ? '#FF7DBB' : undefined}}>{r.title}</b>{kind !== 'artistes' && <div className="mut" style={{fontSize: 13}}><span style={{textDecoration: 'underline', textDecorationColor: 'var(--ln)'}} onClick={(e) => { e.stopPropagation(); open.artist(r.artistId) }}>{r.artist}</span></div>}</div>
                  </div>
                  <span style={{display: 'flex', alignItems: 'center', gap: 10}} onClick={(e) => { e.stopPropagation(); open.label(r.label) }}><LabelLogo name={r.label} logoId={r.mine ? g.label.logoId : undefined} size={28} />{r.mine ? <b style={{color: '#FF7DBB'}}>{g.label.name}</b> : <span className="mut">{r.label}</span>}</span>
                  <b>{compact(r.streams)}</b>
                  {r.delta === null ? <span className="tag tc">Nouv.</span> : r.delta > 0 ? <span className="up">▲ {r.delta}</span> : r.delta < 0 ? <span className="dn">▼ {Math.abs(r.delta)}</span> : <span className="mut">=</span>}
                </div>
              ))}
              {rows.length === 0 && <div className="mut" style={{padding: 20}}>Aucune donnée pour cette semaine.</div>}
            </div>
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
