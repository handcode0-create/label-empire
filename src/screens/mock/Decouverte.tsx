import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { cityById } from '../../data/world'
import { visibleCandidates } from '../../engine/scouting'
import { sum } from '../../engine/util'
import { useGame } from '../../store/gameStore'
import { compact, initials, stars, usd } from '../../lib'

export default function Decouverte() {
  const g = useGame((s) => s.game)!
  const { select } = useGame()
  const all = visibleCandidates(g)
  const countries = [...new Set(all.map((a) => cityById(a.originCityId).country))].slice(0, 4)
  const [country, setCountry] = useState<string | null>(null)
  const [genre, setGenre] = useState<string | null>(null)
  const [pot, setPot] = useState(false)
  const [avail, setAvail] = useState(false)
  const genres = [...new Set(all.map((a) => a.genre))]
  const list = all.filter((a) => (!country || cityById(a.originCityId).country === country) && (!genre || a.genre === genre) && (!pot || a.potential >= 4) && (!avail || (a.status !== 'concours' && !a.rivalInterest)))
  const scout = g.staff.find((m) => m.skill === 'reperage')
  const tag = (a: (typeof all)[number]) => a.status === 'concours' ? ['te', 'Concours'] : a.rivalInterest ? ['tr_', 'Concurrence'] : ['tg', 'Disponible']
  const cycle = () => setGenre(genre === null ? genres[0] : genres[genres.indexOf(genre) + 1] ?? null)
  const open = g.contests.filter((k) => k.status === 'ouvert')
  const done = g.contests.filter((k) => k.status === 'termine').slice(-2)
  return (
    <div className="scr">
      <Dock active="artistes" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 850, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{position: 'relative', height: 150, borderRadius: 16, overflow: 'hidden', background: 'radial-gradient(500px 200px at 20% 120%, rgba(255,61,154,0.55), transparent), radial-gradient(500px 220px at 85% -20%, rgba(53,211,240,0.4), transparent), linear-gradient(135deg,#2A1B4D,#150C2A)'}}>
            <div className="map" style={{position: 'absolute', inset: 0, opacity: '0.35'}}><div className="mk c" style={{left: '50.9%', top: '46.4%'}} /><div className="mk c" style={{left: '48.9%', top: '47.1%'}} /><div className="mk c" style={{left: '57.8%', top: '64.4%'}} /></div>
            <div style={{position: 'absolute', left: 24, bottom: 18}}><div className="lbl">Scouting · {g.pool.length} artistes dans le vivier mondial</div><h1 className="h1" style={{fontSize: 40}}>Découvrir un artiste</h1></div>
            <div style={{position: 'absolute', right: 20, top: 16, display: 'flex', gap: 8}}><span className="tag ti">{scout ? `Éclaireur : ${scout.name} ${'★'.repeat(scout.level)}` : 'Aucun éclaireur'}</span><span className="tag tg">{all.length} artistes repérés</span></div>
          </div>
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
            <span className={'chip' + (!country ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setCountry(null)}>Tous les pays</span>
            {countries.map((c) => <span key={c} className={'chip' + (country === c ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setCountry(country === c ? null : c)}>{c}</span>)}
            <span className={'chip' + (genre ? ' on' : '')} style={{cursor: 'pointer'}} onClick={cycle}>{genre ?? 'Tous les genres'}</span>
            <span className={'chip' + (pot ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setPot(!pot)}>Potentiel ★★★★+</span>
            <span className={'chip' + (avail ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setAvail(!avail)}>Disponibles</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {list.length === 0 && <div className="pn mut">Aucun artiste ne correspond à ces filtres.</div>}
            {list.slice(0, 6).map((a, i) => { const [t, label] = tag(a); const c = cityById(a.originCityId); return (
              <a key={a.id} href="Profil.dc.html" onClick={() => select({ candidateId: a.id })} className={'pn' + (i === 0 ? ' sel' : '')} style={{display: 'grid', gridTemplateColumns: '64px 1fr 110px 90px 90px 110px', gap: 14, alignItems: 'center', padding: '12px 18px'}}>
                <div className="av" style={{width: 56, height: 56, fontSize: 20, background: `linear-gradient(135deg,${a.gradient})`}}>{initials(a.stageName)}</div>
                <div><b style={{fontSize: 17}}>{a.stageName}</b><div className="mut" style={{fontSize: 13}}>{c.name}, {c.country} · {a.genre}</div></div>
                <span style={{color: '#FFC63D'}}>{stars(a.potential)}</span>
                <span><b>{compact(sum(a.fans))}</b><div className="mut" style={{fontSize: 12}}>fans</div></span>
                <b>{usd(a.asking?.advance ?? 0)}</b>
                <span className={'tag ' + t}>{label}</span>
              </a>) })}
          </div>
          <div className="mut" style={{fontSize: 13}}>Cliquez sur un artiste pour ouvrir son profil complet et ses coordonnées. Le nombre d'artistes visibles dépend de votre éclaireur et de vos bureaux.</div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className="pn cut sel">
            <span className="tag te">Nouveau</span>
            <div className="h2" style={{marginTop: 10, fontSize: 28}}>Concours de talents</div>
            <p className="mut" style={{margin: '8px 0 14px'}}>Organisez une audition publique dans un pays. Les meilleurs candidats vous sont présentés, avant la concurrence.</p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Dès $3 000</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>Finale sous 2 semaines</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 6}}>Qualité des finalistes</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>Rival sur le même pays</div></div>
            </div>
            <a href="Concours.dc.html" className="btn" style={{marginTop: 16, width: '100%'}}>Organiser un concours</a>
          </div>
          <div className="pn">
            <div className="lbl">Concours en cours</div>
            {open.length + done.length === 0 && <div className="mut" style={{fontSize: 14, marginTop: 10}}>Aucun concours pour l'instant.</div>}
            {open.map((k) => <div key={k.id} className="row" style={{gridTemplateColumns: '1fr 90px'}}><div><b>{k.name}</b><div className="mut" style={{fontSize: 13}}>{cityById(k.cityId).name} · finale en semaine {k.endWeek}</div></div><span className="tag te">{k.candidates} candidats</span></div>)}
            {done.map((k) => <div key={k.id} className="row" style={{gridTemplateColumns: '1fr 90px'}}><div><b>{k.name}</b><div className="mut" style={{fontSize: 13}}>Terminé · {k.finalists.length} finalistes</div></div><span className="tag tg">Terminé</span></div>)}
          </div>
          <div className="sp" />
          <a href="Artistes.dc.html" className="btn s">Retour à mes artistes</a>
        </div>
      </div>
    </div>
  )
}
