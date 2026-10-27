import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { PARTNERS, venuesFor } from '../../data/people'
import { CITIES, cityById } from '../../data/world'
import { estimateStop, newStop, planTour, tourSummary } from '../../engine/tour'
import type { TourStop } from '../../engine/types'
import { useGame } from '../../store/gameStore'
import { usd } from '../../lib'

const link: React.CSSProperties = { cursor: 'pointer', userSelect: 'none' }

export default function Tournee() {
  const g = useGame((s) => s.game)!
  const { sel, run, go, say } = useGame()
  const [artistId, setArtistId] = useState(g.artists.find((a) => a.id === sel.artistId)?.id ?? g.artists[0]?.id ?? '')
  const artist = g.artists.find((a) => a.id === artistId)
  const [name, setName] = useState(`Tournée ${g.label.name.split(' ')[0]}`)
  const [stops, setStops] = useState<TourStop[]>(() => (sel.cityId ? [newStop(sel.cityId, g.week + 2)] : []))
  const [partners, setPartners] = useState<string[]>([])
  const unlocked = CITIES.filter((c) => c.minRep <= g.reputation)
  const patch = (i: number, p: Partial<TourStop>) => setStops(stops.map((s, j) => (j === i ? { ...s, ...p } : s)))
  const addStop = (cityId: string) => { if (!cityId) return; const lastW = stops.length ? stops[stops.length - 1].week : g.week + 1; setStops([...stops, newStop(cityId, lastW + 1)]) }
  const cycleVenue = (i: number) => { const s = stops[i]; const vs = venuesFor(cityById(s.cityId)); const k = (vs.findIndex((v) => v.name === s.venue) + 1) % vs.length; patch(i, { venue: vs[k].name, capacity: vs[k].capacity }) }
  const togglePartner = (id: string, minRep: number) => {
    if (partners.includes(id)) return setPartners(partners.filter((p) => p !== id))
    if (g.reputation < minRep) return say(`Ce partenaire exige une réputation de ${minRep}.`, 'err')
    setPartners([...partners, id])
  }
  const sum = artist && stops.length ? tourSummary(g, artist, stops, partners) : { cost: 0, revenue: 0, profit: 0 }
  const fills = artist ? stops.map((s) => ({ s, f: estimateStop(g, artist, s, partners).fill })) : []
  const worst = fills.slice().sort((a, b) => a.f - b.f)[0]
  const visa = stops.filter((s) => cityById(s.cityId).visa).map((s) => cityById(s.cityId).name)
  const submit = () => { if (artist && run((s) => planTour(s, { name, artistId, stops, partners }))) go('Hub') }
  if (!artist) return <div className="scr"><Dock active="tournees" /><Hud /><div className="main"><div className="pn cut" style={{maxWidth: 600}}><div className="h2">Aucun artiste</div><p className="mut">Signez un artiste avant de planifier une tournée.</p><a href="Decouverte.dc.html" className="btn">Découvrir un artiste</a></div></div></div>
  return (
    <div className="scr">
      <Dock active="tournees" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 700, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><h1 className="h1" style={{fontSize: 36}}>Nouvelle tournée</h1><span className="sp" /><span className="tag tg" style={link} onClick={() => setArtistId(g.artists[(g.artists.findIndex((a) => a.id === artistId) + 1) % g.artists.length].id)}>Artiste : {artist.stageName}{g.artists.length > 1 ? ' ⇄' : ''}</span></div>
          <div className="pn cut" style={{padding: '14px 18px'}}><label htmlFor="tn" className="lbl">Nom de la tournée</label><input id="tn" className="in" style={{marginTop: 8, fontSize: 20, fontWeight: 700}} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="map" style={{height: 190, position: 'relative'}}>
            <div className="mk g" style={{left: cityById(artist.originCityId).x + '%', top: cityById(artist.originCityId).y + '%'}} />
            {stops.map((s, i) => { const c = cityById(s.cityId); return <div key={i}><div className="mk c" style={{left: c.x + '%', top: c.y + '%'}} /><div className="mn" style={{left: c.x + '%', top: c.y + '%'}}>{c.name}</div></div> })}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}><span className="lbl">Étapes et prix des billets</span><span className="sp" />
            <select aria-label="Ajouter une étape" value="" onChange={(e) => addStop(e.target.value)} style={{height: 36, padding: '0 14px', borderRadius: 18, fontWeight: 700, fontSize: 14, color: '#FF7DBB', boxShadow: 'inset 0 0 0 2px var(--mag)', background: 'transparent', border: 0, cursor: 'pointer'}}>
              <option value="">+ Ajouter une étape</option>
              {unlocked.map((c) => <option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}
            </select></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 330, overflow: 'auto'}}>
            {stops.length === 0 && <div className="pn mut">Aucune étape. Ajoutez une ville : la capacité de la salle et le prix du billet déterminent le remplissage.</div>}
            {stops.map((s, i) => { const c = cityById(s.cityId); const f = fills[i]?.f ?? 0; return (
              <div key={i} className={'pn' + (i === 1 ? ' sel' : '')} style={{display: 'grid', gridTemplateColumns: '28px 1fr 100px 130px 64px', gap: 12, alignItems: 'center', padding: '10px 16px'}}>
                <b className="disp" style={{fontSize: 22, color: '#FF7DBB'}}>{i + 1}</b>
                <div><b>{c.name}, {c.country}</b><div className="mut" style={{fontSize: 13}}><span style={link} onClick={() => cycleVenue(i)} title="Changer de salle">{s.venue} · {s.capacity.toLocaleString('fr-FR')} places ⇄</span> · <span style={{...link, color: '#FF7DBB'}} onClick={() => setStops(stops.filter((_, j) => j !== i))}>retirer</span></div></div>
                <span className="tag ti"><span style={link} onClick={() => patch(i, { week: Math.max(g.week + 1, s.week - 1) })}>‹</span>&nbsp;Sem. {(s.week - 1) % 52 + 1}&nbsp;<span style={link} onClick={() => patch(i, { week: s.week + 1 })}>›</span></span>
                <div style={{display: 'flex', alignItems: 'center', gap: 6}}><a href="Tournee.dc.html" className="chip" style={{height: 28, padding: '0 10px'}} onClick={(e) => { e.preventDefault(); patch(i, { price: Math.max(1, s.price - 1) }) }}>−</a><b style={{minWidth: 40, textAlign: 'center', fontSize: 17}}>${s.price}</b><a href="Tournee.dc.html" className="chip on" style={{height: 28, padding: '0 10px'}} onClick={(e) => { e.preventDefault(); patch(i, { price: s.price + 1 }) }}>+</a></div>
                <b className={f >= 0.7 ? 'up' : f >= 0.45 ? '' : 'dn'}>{Math.round(f * 100)} %</b>
              </div>) })}
          </div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div className="lbl">Partenaires</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {PARTNERS.map((p) => { const on = partners.includes(p.id); const locked = g.reputation < p.minRep; return (
              <div key={p.id} className={'pn' + (on ? ' sel' : '')} role="button" tabIndex={0} onClick={() => togglePartner(p.id, p.minRep)} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', opacity: locked ? 0.55 : 1}}><div style={{flex: 1}}><b>{p.kind} : {p.name}</b><div className="mut" style={{fontSize: 13}}>{p.desc}</div></div><span className={'tag ' + (on ? 'tg' : locked ? 'tr_' : 'ti')}>{on ? 'Choisi' : locked ? `Rép. ${p.minRep}` : 'Option'}</span></div>) })}
          </div>
          <div className="pn cut">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Coûts : {usd(sum.cost)} (acompte {usd(sum.cost * 0.3)})</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>Recettes : {usd(sum.revenue)}</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 6}}>{worst ? `${cityById(worst.s.cityId).name} : salle à ${Math.round(worst.f * 100)} %` : 'Remplissage des salles'}</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>{visa.length ? `Visa à prévoir : ${visa.join(', ')}` : 'Fatigue de l’artiste'}</div></div>
            </div>
            <div className="lbl" style={{marginTop: 12}}>Bénéfice estimé</div><div className="num" style={{color: sum.profit >= 0 ? '#3DDC97' : '#FF5470'}}>{sum.profit >= 0 ? '+' : '−'}{usd(Math.abs(sum.profit))}</div>
          </div>
          <div className="sp" />
          <a href="Hub.dc.html" className="btn" style={{height: 60}} onClick={(e) => { e.preventDefault(); submit() }}>Lancer la tournée</a>
        </div>
      </div>
    </div>
  )
}
