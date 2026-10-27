import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { STUDIOS, SESSION_OPTIONS } from '../../data/people'
import { cityById } from '../../data/world'
import { bookStudio, recordingEstimate, studioAvailability, travelCost } from '../../engine/production'
import { useGame } from '../../store/gameStore'
import { currentSong, usd } from '../../lib'

const STEPS = [['Ecriture', '1 Écrire'], ['Studio', '2 Enregistrer'], ['Mixage', '3 Mixer'], ['Sortie', '4 Sortir']]
const CONTS = ['Afrique', 'Europe', 'Amérique', 'Asie', 'Océanie']

export default function Studio() {
  const g = useGame((s) => s.game)!
  const { sel, run, select, go } = useGame()
  const song = currentSong(g, sel.songId, ['written'])
  const [cont, setCont] = useState<string | null>(null)
  const [byQuality, setByQuality] = useState(true)
  const [cheap, setCheap] = useState(false)
  const [days, setDays] = useState(4)
  const [studioId, setStudioId] = useState(sel.studioId ?? 'ebene')
  if (!song) return (
    <div className="scr"><Dock active="studio" /><Hud />
      <div className="main"><div className="pn cut" style={{maxWidth: 620}}><div className="h2">Aucune chanson à enregistrer</div><p className="mut">Écrivez d'abord un titre : l'étape d'enregistrement s'applique à une chanson écrite.</p><a href="Ecriture.dc.html" className="btn">Écrire un titre</a></div></div></div>
  )
  const artist = g.artists.find((a) => a.id === song.artistId)!
  const list = STUDIOS
    .filter((s) => !cont || cityById(s.cityId).continent.startsWith(cont))
    .filter((s) => !cheap || s.pricePerDay <= 2000)
    .sort((a, b) => (byQuality ? b.quality - a.quality : a.pricePerDay - b.pricePerDay))
  const st = STUDIOS.find((s) => s.id === studioId) ?? STUDIOS[0]
  const sc = cityById(st.cityId)
  const t = travelCost(artist.originCityId, st)
  const est = recordingEstimate(g, song, st, days)
  const av = studioAvailability(st, g.week)
  const total = st.pricePerDay * days
  const submit = () => { if (run((s) => bookStudio(s, song.id, st.id, days))) { select({ songId: song.id, studioId: st.id }); go('Mixage') } }
  const written = g.songs.filter((s) => s.stage === 'written')
  return (
    <div className="scr">
      <Dock active="studio" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 780, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>{STEPS.map(([s, l], i) => <a key={s} href={s + '.dc.html'} className={'chip' + (i === 1 ? ' on' : '')}>{l}</a>)}<a href="Projets.dc.html" className="chip">EP & albums</a></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><h1 className="h1" style={{fontSize: 36}}>Choisir le studio</h1><span className="sp" />
            <span className="tag ti" style={{cursor: written.length > 1 ? 'pointer' : 'default'}} onClick={() => { if (written.length > 1) select({ songId: written[(written.findIndex((w) => w.id === song.id) + 1) % written.length].id }) }}>« {song.title} » · {artist.stageName}{written.length > 1 ? ' ⇄' : ''}</span></div>
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
            <span className={'chip' + (!cont ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setCont(null)}>Tous les continents</span>
            {CONTS.slice(0, 4).map((c) => <span key={c} className={'chip' + (cont === c ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setCont(cont === c ? null : c)}>{c}</span>)}
            <span className="chip on" style={{cursor: 'pointer'}} onClick={() => setByQuality(!byQuality)}>{byQuality ? 'Trié par qualité' : 'Trié par prix'}</span>
            <span className={'chip' + (cheap ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setCheap(!cheap)}>Budget max $2 000/j</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 560, overflow: 'auto'}}>
            {list.map((s) => { const a = studioAvailability(s, g.week); const c = cityById(s.cityId); return (
              <a key={s.id} href="Studio.dc.html" onClick={(e) => { e.preventDefault(); setStudioId(s.id) }} className={'pn' + (s.id === st.id ? ' sel' : '')} style={{display: 'grid', gridTemplateColumns: '1fr 100px 70px 70px 100px', gap: 12, alignItems: 'center', padding: '9px 16px'}}>
                <div><b>{s.name}</b><div className="mut" style={{fontSize: 13}}>{c.name}, {c.country}</div></div>
                <span style={{color: '#FFC63D'}}>{'★'.repeat(s.stars)}</span><b>{usd(s.pricePerDay)}/j</b>
                <span className="num" style={{fontSize: 22, color: '#35D3F0'}}>{s.quality}</span>
                <span className={'tag ' + (!a.open ? 'tr_' : a.wait ? 'te' : 'tg')}>{a.label}</span>
              </a>) })}
          </div>
          <div className="mut" style={{fontSize: 13}}>{list.length} studios sur {STUDIOS.length} affichés. Les studios loin de l'artiste ajoutent voyage, visa et fatigue.</div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="map" style={{height: 190, position: 'relative'}}>{list.map((s) => { const c = cityById(s.cityId); return <div key={s.id} className={'mk ' + (s.id === st.id ? 'c' : 'g')} style={{left: c.x + '%', top: c.y + '%', cursor: 'pointer'}} onClick={() => setStudioId(s.id)} /> })}</div>
          <div className="pn cut sel">
            <div style={{display: 'flex', alignItems: 'baseline'}}><span className="h2" style={{fontSize: 28}}>{st.name}</span><span className="sp" /><span className="mut">{sc.name}</span></div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}>{st.genres.map((x) => <span key={x} className="tag ti">{x}</span>)}<span className="tag te">Producteur : {st.producer} {'★'.repeat(st.stars)}</span></div>
            <div className="lbl" style={{marginTop: 12}}>Durée de session</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8}}>{SESSION_OPTIONS.map((o) => <span key={o.days} className={'chip' + (days === o.days ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setDays(o.days)}>{o.label}</span>)}</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 4}}>Studio {usd(total)}{t.travel ? ` · voyage ${usd(t.travel)}` : ''}{t.visa ? ` · visa ${usd(t.visa)}` : ''}</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 4}}>Qualité de prise {est.low} à {est.high}</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 4}}>{av.open ? `Alchimie avec ${st.producer}${av.wait ? ` · disponible dans ${av.wait} sem.` : ''}` : 'Studio complet cette semaine'}</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 4}}>{est.fatigue ? `Fatigue +${est.fatigue} après le voyage` : 'Faible : studio dans sa ville'}</div></div>
            </div>
          </div>
          <div className="sp" />
          <div style={{display: 'flex', gap: 12}}><a href="Ecriture.dc.html" className="btn s">Retour</a><a href="Mixage.dc.html" className="btn" style={{flex: 1, height: 60}} onClick={(e) => { e.preventDefault(); submit() }}>Lancer l'enregistrement</a></div>
        </div>
      </div>
    </div>
  )
}
