import { useState } from 'react'
import { priceDelta, studioPrice } from '../../engine/prices'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { STUDIOS, SESSION_OPTIONS } from '../../data/people'
import { cityById } from '../../data/world'
import { bookStudio, recordingEstimate, studioAvailability, travelCost } from '../../engine/production'
import { useGame } from '../../store/gameStore'
import { currentSong, usd } from '../../lib'

const STEPS = [['Ecriture', '1 Écrire'], ['Studio', '2 Enregistrer'], ['Mixage', '3 Mixer'], ['Sortie', '4 Sortir']]
const CONTS = ['Afrique', 'Europe', 'Amérique', 'Asie']

export default function Studio() {
  const g = useGame((s) => s.game)!
  const { sel, run, select, go } = useGame()
  const song = currentSong(g, sel.songId, ['written'])
  const [cont, setCont] = useState<string | null>(null)
  const [byQuality, setByQuality] = useState(true)
  const [affordable, setAffordable] = useState(false)
  const [days, setDays] = useState(4)
  const [studioId, setStudioId] = useState(sel.studioId ?? 'ebene')
  if (!song) return (
    <div className="scr"><Dock active="studio" /><Hud />
      <div className="main"><div className="pn cut" style={{maxWidth: 620}}><div className="h2">Aucune chanson à enregistrer</div><p className="mut">Écrivez d'abord un titre : l'étape d'enregistrement s'applique à une chanson écrite.</p><a href="Ecriture.dc.html" className="btn">Écrire un titre</a></div></div></div>
  )
  const artist = g.artists.find((a) => a.id === song.artistId)!
  const totalFor = (sid: string, d: number) => { const s = STUDIOS.find((x) => x.id === sid)!; const t = travelCost(artist.originCityId, s); return studioPrice(g, s) * d + t.travel + t.visa }
  const list = STUDIOS
    .filter((s) => !cont || cityById(s.cityId).continent.startsWith(cont))
    .filter((s) => !affordable || totalFor(s.id, days) <= g.cash)
    .sort((a, b) => (byQuality ? b.quality - a.quality : studioPrice(g, a) - studioPrice(g, b)))
  const st = STUDIOS.find((s) => s.id === studioId) ?? STUDIOS[0]
  const sc = cityById(st.cityId)
  const t = travelCost(artist.originCityId, st)
  const est = recordingEstimate(g, song, st, days)
  const av = studioAvailability(st, g.week)
  const perDay = studioPrice(g, st)
  const total = perDay * days + t.travel + t.visa
  const broke = total > g.cash
  const ideal = st.genres.includes(song.genre)
  const submit = () => { if (run((s) => bookStudio(s, song.id, st.id, days))) { select({ songId: song.id, studioId: st.id }); go('Mixage') } }
  const written = g.songs.filter((s) => s.stage === 'written')
  const qualityColor = (q: number) => (q >= 85 ? '#3DDC97' : q >= 70 ? '#35D3F0' : q >= 55 ? '#FFC63D' : '#FF5470')

  return (
    <div className="scr">
      <Dock active="studio" />
      <Hud />
      <div className="main" style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 460px', gap: 22, alignItems: 'start'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0}}>
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>{STEPS.map(([s, l], i) => <a key={s} href={s + '.dc.html'} className={'chip' + (i === 1 ? ' on' : '')}>{l}</a>)}<a href="Projets.dc.html" className="chip">EP & albums</a></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <h1 className="h1" style={{fontSize: 36}}>Choisir le studio</h1>
            <span className="sp" />
            <span className="tag ti" title="Changer de chanson" style={{cursor: written.length > 1 ? 'pointer' : 'default'}} onClick={() => { if (written.length > 1) select({ songId: written[(written.findIndex((w) => w.id === song.id) + 1) % written.length].id }) }}>« {song.title} » · {artist.stageName} · {song.genre}{written.length > 1 ? ' ⇄' : ''}</span>
          </div>
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
            <span className={'chip' + (!cont ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setCont(null)}>Tous les continents</span>
            {CONTS.map((c) => <span key={c} className={'chip' + (cont === c ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setCont(cont === c ? null : c)}>{c}</span>)}
            <span className="sp" />
            <span className="chip on" style={{cursor: 'pointer'}} onClick={() => setByQuality(!byQuality)}>{byQuality ? 'Tri : qualité' : 'Tri : prix'}</span>
            <span className={'chip' + (affordable ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setAffordable(!affordable)}>Dans mon budget</span>
          </div>
          {list.length === 0 && <div className="pn mut">Aucun studio ne correspond à ces filtres.</div>}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12}}>
            {list.map((s, i) => {
              const a = studioAvailability(s, g.week); const c = cityById(s.cityId)
              const price = studioPrice(g, s); const delta = priceDelta(price, s.pricePerDay)
              const far = travelCost(artist.originCityId, s).travel > 0
              const on = s.id === st.id
              return (
                <div key={s.id} role="button" onClick={() => setStudioId(s.id)} className={'pn' + (on ? ' sel' : '')} style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', animation: `riseIn .35s ${Math.min(i, 8) * 0.03}s both`, transition: 'transform .15s'}}>
                  <div style={{display: 'flex', alignItems: 'flex-start', gap: 8}}>
                    <div style={{minWidth: 0, flex: 1}}>
                      <div style={{fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.name}</div>
                      <div className="mut" style={{fontSize: 12}}>{c.name}, {c.country}</div>
                    </div>
                    <span className={'tag ' + (!a.open ? 'tr_' : a.wait ? 'te' : 'tg')}>{a.label}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <span style={{color: '#FFC63D', fontSize: 14, letterSpacing: 1}}>{'★'.repeat(s.stars)}</span>
                    <div className="mt" style={{flex: 1}}><i style={{display: 'block', height: '100%', width: s.quality + '%', background: qualityColor(s.quality), borderRadius: 4}} /></div>
                    <span className="num" style={{fontSize: 22, color: qualityColor(s.quality), lineHeight: 1}}>{s.quality}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap'}}>
                    <b style={{fontSize: 18}}>{usd(price)}</b><span className="mut" style={{fontSize: 12}}>par jour</span>
                    {delta !== 0 && <span style={{fontSize: 12, fontWeight: 700, color: delta > 0 ? '#FF5470' : '#3DDC97'}}>{delta > 0 ? '▲ +' : '▼ '}{delta} % vs tarif de base</span>}
                  </div>
                  <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                    {s.genres.includes(song.genre) && <span className="tag tg">Genre idéal</span>}
                    {far && <span className="tag te">Voyage requis</span>}
                    {s.genres.filter((x) => x !== song.genre).slice(0, 2).map((x) => <span key={x} className="tag ti">{x}</span>)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mut" style={{fontSize: 13}}>{list.length} studio(s) sur {STUDIOS.length}. Les studios loin de l'artiste ajoutent voyage, visa et fatigue.</div>
        </div>

        <div style={{position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="map" style={{height: 200, position: 'relative'}}>
            {list.map((s) => { const c = cityById(s.cityId); return <div key={s.id} className={'mk ' + (s.id === st.id ? 'c' : 'g')} style={{left: c.x + '%', top: c.y + '%', cursor: 'pointer'}} onClick={() => setStudioId(s.id)} /> })}
            <span className="tag tc" style={{position: 'absolute', left: 10, bottom: 10}}>{st.name} · {sc.name}</span>
          </div>
          <div className="pn cut sel" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
              <span className="h2" style={{fontSize: 28}}>{st.name}</span><span className="sp" /><span className="mut">{sc.name}, {sc.country}</span>
            </div>
            <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
              {ideal && <span className="tag tg">Genre idéal pour « {song.title} »</span>}
              {st.genres.map((x) => <span key={x} className="tag ti">{x}</span>)}
              <span className="tag te">Producteur : {st.producer} {'★'.repeat(st.stars)}</span>
            </div>

            <div>
              <div className="lbl">Durée de session</div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8}}>
                {SESSION_OPTIONS.map((o) => (
                  <div key={o.days} role="button" onClick={() => setDays(o.days)} style={{cursor: 'pointer', textAlign: 'center', padding: '8px 4px', borderRadius: 12, border: '2px solid ' + (days === o.days ? '#FF3D9A' : '#3F2B73'), background: days === o.days ? 'rgba(255,61,154,.16)' : 'transparent', transition: 'all .2s'}}>
                    <div style={{fontWeight: 800}}>{o.label}</div>
                    <div className="mut" style={{fontSize: 12}}>{usd(perDay * o.days)}</div>
                    <div style={{fontSize: 11, color: o.q > 0 ? '#3DDC97' : o.q < 0 ? '#FF5470' : '#B3A6D9'}}>{o.q > 0 ? '+' : ''}{o.q} qualité · {o.weeks} sem.</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="lbl">Qualité de prise estimée</div>
              <div style={{position: 'relative', height: 14, borderRadius: 7, background: '#1A1030', marginTop: 8, overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: est.low + '%', width: Math.max(2, est.high - est.low) + '%', top: 0, bottom: 0, background: qualityColor(est.q), borderRadius: 7, transition: 'all .4s'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4}}><span className="mut">0</span><b style={{color: qualityColor(est.q)}}>{est.low} à {est.high}</b><span className="mut">100</span></div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6, fontSize: 14, borderTop: '1px solid #3F2B73', paddingTop: 10}}>
              <span className="mut">Studio · {days} j × {usd(perDay)}</span><b>{usd(perDay * days)}</b>
              {t.travel > 0 && <><span className="mut">Voyage</span><b>{usd(t.travel)}</b></>}
              {t.visa > 0 && <><span className="mut">Visa</span><b>{usd(t.visa)}</b></>}
              <span style={{fontWeight: 800}}>Total</span><b style={{fontSize: 20, color: broke ? '#FF5470' : '#FFC63D'}}>{usd(total)}</b>
            </div>
            <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
              <span className={'tag ' + (av.open ? (av.wait ? 'te' : 'tg') : 'tr_')}>{av.open ? (av.wait ? `Disponible dans ${av.wait} sem.` : 'Disponible maintenant') : 'Studio complet cette semaine'}</span>
              <span className={'tag ' + (est.fatigue ? 'tr_' : 'tg')}>{est.fatigue ? `Fatigue +${est.fatigue} après le voyage` : 'Pas de fatigue : studio dans sa ville'}</span>
              <span className="tag ti">Alchimie avec {st.producer} : incertaine</span>
            </div>
            {broke && <div style={{color: '#FF5470', fontSize: 13, fontWeight: 700}}>Trésorerie insuffisante : il manque {usd(total - g.cash)}.</div>}
          </div>
          <div style={{display: 'flex', gap: 12}}>
            <a href="Ecriture.dc.html" className="btn s">Retour</a>
            <a href="Mixage.dc.html" className="btn" style={{flex: 1, height: 60, whiteSpace: 'nowrap', opacity: broke ? 0.6 : 1}} onClick={(e) => { e.preventDefault(); submit() }}>Enregistrer · {usd(total)}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
