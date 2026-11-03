import { placeLabels } from '../../data/mapLabels'
import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { PARTNERS, venueKind } from '../../data/people'
import { CITIES, cityById } from '../../data/world'
import { estimateStop, newStop, planTour, priceOptions, tourSummary, venueOptions } from '../../engine/tour'
import type { TourStop } from '../../engine/types'
import { useGame } from '../../store/gameStore'
import { usd } from '../../lib'
import { generateTourName } from '../../data/eventNames'
import { createRng } from '../../engine/rng'

const link: React.CSSProperties = { cursor: 'pointer', userSelect: 'none' }

export default function Tournee() {
  const g = useGame((s) => s.game)!
  const { sel, run, go, say } = useGame()
  const [artistId, setArtistId] = useState(g.artists.find((a) => a.id === sel.artistId)?.id ?? g.artists[0]?.id ?? '')
  const artist = g.artists.find((a) => a.id === artistId)
  const [name, setName] = useState(() => { const a0 = g.artists.find((a) => a.id === (g.artists.find((x) => x.id === sel.artistId)?.id ?? g.artists[0]?.id)); return generateTourName(createRng((Date.now() >>> 0) ^ 0x9e37), { artist: a0?.stageName ?? 'Tournée', cities: sel.cityId ? [cityById(sel.cityId).name] : [], year: Math.floor((g.week - 1) / 52) + 2027, lang: a0?.lang }, g.tours.map((t) => t.name)) })
  const [stops, setStops] = useState<TourStop[]>(() => (sel.cityId ? [newStop(sel.cityId, g.week + 2)] : []))
  const [partners, setPartners] = useState<string[]>([])
  const [picker, setPicker] = useState(false)
  const [active, setActive] = useState(0)
  const unlocked = CITIES.filter((c) => c.minRep <= g.reputation)
  const tourLabels = placeLabels(unlocked.map((c) => { const n = stops.findIndex((x) => x.cityId === c.id); return { id: c.id, x: c.x, y: c.y, text: n >= 0 ? `${n + 1}. ${c.name}` : '', priority: n >= 0 ? 1e6 : 0 } }), 700, 130)
  const patch = (i: number, p: Partial<TourStop>) => setStops(stops.map((s, j) => (j === i ? { ...s, ...p } : s)))
  const addStop = (cityId: string) => { if (!cityId) return; const lastW = stops.length ? stops[stops.length - 1].week : g.week + 1; setStops([...stops, newStop(cityId, lastW + 1)]); setActive(stops.length) }
  const togglePartner = (id: string, minRep: number) => {
    if (partners.includes(id)) return setPartners(partners.filter((p) => p !== id))
    if (g.reputation < minRep) return say(`Ce partenaire exige une réputation de ${minRep}.`, 'err')
    setPartners([...partners, id])
  }
  const genName = () => setName(generateTourName(createRng((Date.now() ^ (name.length * 7919)) >>> 0), { artist: artist?.stageName ?? 'Tournée', cities: stops.map((x) => cityById(x.cityId).name), year: Math.floor((g.week - 1) / 52) + 2027, lang: artist?.lang }, g.tours.map((t) => t.name)))
  const sum = artist && stops.length ? tourSummary(g, artist, stops, partners) : { cost: 0, revenue: 0, profit: 0 }
  const fills = artist ? stops.map((s) => ({ s, f: estimateStop(g, artist, s, partners).fill })) : []
  const worst = fills.slice().sort((a, b) => a.f - b.f)[0]
  const act = Math.min(active, stops.length - 1)
  const cur = stops[act]
  const vopts = artist && cur ? venueOptions(g, artist, cur.cityId, partners, cur.week) : null
  const popts = artist && cur ? priceOptions(g, artist, cur, partners) : null
  const visa = stops.filter((s) => cityById(s.cityId).visa).map((s) => cityById(s.cityId).name)
  const submit = () => { if (artist && run((s) => planTour(s, { name, artistId, stops, partners }))) go('Hub') }
  if (!artist) return <div className="scr"><Dock active="tournees" /><Hud /><div className="main"><div className="pn cut" style={{maxWidth: 600}}><div className="h2">Aucun artiste</div><p className="mut">Signez un artiste avant de planifier une tournée.</p><a href="Decouverte.dc.html" className="btn">Découvrir un artiste</a></div></div></div>
  return (
    <div className="scr">
      <Dock active="tournees" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 700, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><h1 className="h1" style={{fontSize: 36}}>Nouvelle tournée</h1><span className="sp" />{g.artists.map((x) => <span key={x.id} className={'chip' + (x.id === artistId ? ' on' : '')} role="button" onClick={() => setArtistId(x.id)}>{x.stageName}</span>)}</div>
          <div className="pn cut" style={{padding: '14px 18px'}}><label htmlFor="tn" className="lbl">Nom de la tournée</label><div style={{display: 'flex', gap: 8, marginTop: 8}}><input id="tn" className="in" style={{fontSize: 20, fontWeight: 700}} value={name} onChange={(e) => setName(e.target.value)} /><button type="button" className="btn g sm" aria-label="Générer un nom de tournée" title="Générer un nom" style={{height: 48, flex: 'none'}} onClick={genName}>🎲 Générer</button></div></div>
          <div className="map" style={{height: 130, position: 'relative'}}>
            <div className="mk g" style={{left: cityById(artist.originCityId).x + '%', top: cityById(artist.originCityId).y + '%'}} />
            {unlocked.map((c) => { const n = stops.findIndex((x) => x.cityId === c.id); const lb = tourLabels[c.id]; return (
              <div key={c.id}>
                <div className={'mk' + (n >= 0 ? ' c' : ' d')} role="button" tabIndex={0} aria-label={(n >= 0 ? 'Retirer ' : 'Ajouter ') + c.name} title={c.name} onClick={() => (n >= 0 ? setStops(stops.filter((_, j) => j !== n)) : addStop(c.id))} style={{left: c.x + '%', top: c.y + '%', cursor: 'pointer', opacity: n >= 0 ? 1 : 0.7}} />
                {n >= 0 && lb && <div className="mn" style={{left: lb.left, top: lb.top, transform: 'none', lineHeight: lb.h + 'px', pointerEvents: 'none'}}>{n + 1}. {c.name}</div>}
              </div>) })}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}><span className="lbl">Étapes et prix des billets</span><span className="sp" />
            <button type="button" className={'chip' + (picker ? ' on' : '')} onClick={() => setPicker(!picker)}>{picker ? 'Fermer' : '+ Ajouter une étape'}</button></div>
          {picker && (
            <div className="pn" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 12, maxHeight: 220, overflow: 'auto'}}>
              {unlocked.map((c) => { const n = stops.filter((x) => x.cityId === c.id).length; const fans = artist.fans[c.id] ?? 0; return (
                <div key={c.id} className={'pn' + (n ? ' sel' : '')} role="button" tabIndex={0} onClick={() => addStop(c.id)} style={{padding: '8px 10px', cursor: 'pointer'}}>
                  <b style={{fontSize: 14}}>{c.name}</b>{n > 0 && <span className="tag tg" style={{marginLeft: 6}}>×{n}</span>}
                  <div className="mut" style={{fontSize: 11}}>{c.country} · {fans > 0 ? `${Math.round(fans / 1000)} k fans` : 'aucun fan'}{c.visa ? ' · visa' : ''}</div>
                </div>) })}
            </div>
          )}
          <div style={{display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 175, overflow: 'auto'}}>
            {stops.length === 0 && <div className="pn mut">Aucune étape. Ajoutez une ville : la capacité de la salle et le prix du billet déterminent le remplissage.</div>}
            {stops.map((s, i) => { const c = cityById(s.cityId); const f = fills[i]?.f ?? 0; return (
              <div key={i} className={'pn' + (i === act ? ' sel' : '')} onClick={() => setActive(i)} style={{cursor: 'pointer', display: 'grid', gridTemplateColumns: '28px 1fr 100px 120px 56px', gap: 12, alignItems: 'center', padding: '10px 16px'}}>
                <b className="disp" style={{fontSize: 22, color: '#FF7DBB'}}>{i + 1}</b>
                <div><b>{c.name}, {c.country}</b><div className="mut" style={{fontSize: 13}}><span>{venueKind(s.kind).label} · {s.venue} · {s.capacity.toLocaleString('fr-FR')} places</span> · <span style={{...link, color: '#FF7DBB'}} onClick={() => setStops(stops.filter((_, j) => j !== i))}>retirer</span></div></div>
                <span className="tag ti"><span style={link} onClick={() => patch(i, { week: Math.max(g.week + 1, s.week - 1) })}>‹</span>&nbsp;Sem. {(s.week - 1) % 52 + 1}&nbsp;<span style={link} onClick={() => patch(i, { week: s.week + 1 })}>›</span></span>
                <div style={{display: 'flex', flexDirection: 'column', gap: 2}}><label className="mut" style={{fontSize: 11}} htmlFor={'pr' + i}>Prix du billet</label><div style={{display: 'flex', alignItems: 'center', gap: 4}}><b>$</b><input id={'pr' + i} type="number" min={1} step={1} className="in" style={{width: 72, height: 34, padding: '0 8px', fontWeight: 700, textAlign: 'right'}} value={s.price} onChange={(e) => patch(i, { price: Math.max(1, Math.round(Number(e.target.value) || 1)) })} /></div></div>
                <b className={f >= 0.7 ? 'up' : f >= 0.45 ? '' : 'dn'}>{Math.round(f * 100)} %</b>
              </div>) })}
          </div>
          {cur && vopts && popts && (
            <div className="pn cut" data-testid="venue-panel" style={{padding: '10px 12px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <span className="lbl">Salle · étape {act + 1} · {cityById(cur.cityId).name}</span><span className="sp" />
                <span className="mut" style={{fontSize: 12}}>Prix conseillé ${popts.base} · optimal ${popts.optimal.price} ({Math.round(popts.optimal.fill * 100)} % de remplissage)</span>
                <button type="button" className="chip" onClick={() => patch(act, { price: popts.optimal.price })}>Prix optimal</button>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8}}>
                {vopts.map((v) => { const k = venueKind(v.kind); const on = v.kind === (cur.kind ?? ''); return (
                  <div key={v.kind} className={'pn' + (on ? ' sel' : '')} role="button" tabIndex={0} title={k.desc} data-venue={v.kind} style={{padding: '8px 10px', cursor: 'pointer', opacity: v.locked ? 0.5 : 1, position: 'relative'}} onClick={() => { if (v.locked) return say(`${k.label} : réputation ${k.minRep} requise.`, 'err'); patch(act, { venue: v.name, kind: v.kind, capacity: v.capacity, price: v.price }) }}>
                    {v.best && <span className="tag tg" style={{position: 'absolute', right: 6, top: 6, fontSize: 10}}>Conseillé</span>}
                    <b style={{fontSize: 14}}>{k.label}</b>
                    <div className="mut" style={{fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{v.name}</div>
                    <div style={{fontSize: 12, marginTop: 2}}>{v.capacity.toLocaleString('fr-FR')} pl. · coût {usd(v.cost)}</div>
                    {v.locked ? <div className="mut" style={{fontSize: 11}}>🔒 Réputation {k.minRep}</div> : (<>
                      <div style={{fontSize: 12, whiteSpace: 'nowrap'}}>Billet <b>${v.price}</b> · <b className={v.fill >= 0.7 ? 'up' : v.fill >= 0.45 ? '' : 'dn'}>{Math.round(v.fill * 100)} %</b></div>
                      <div style={{fontSize: 11, whiteSpace: 'nowrap', color: v.profit >= 0 ? '#3DDC97' : '#FF5470'}}>{v.profit >= 0 ? '+' : '−'}{usd(Math.abs(v.profit))}</div>
                    </>)}
                  </div>) })}
              </div>
              <div style={{display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center'}}>
                <span className="mut" style={{fontSize: 12}}>Prix du billet :</span>
                {popts.steps.map((p) => <button type="button" key={p.price} className={'chip' + (cur.price === p.price ? ' on' : '')} onClick={() => patch(act, { price: p.price })} title={`${p.sold.toLocaleString('fr-FR')} billets vendus`}>${p.price} · {Math.round(p.fill * 100)} % · {usd(p.gross)}</button>)}
              </div>
            </div>
          )}
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
