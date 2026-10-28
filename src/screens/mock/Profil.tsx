import Avatar from '../../components/Avatar'
import { useEffect, useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { ARTIST_LABELS, cityById } from '../../data/world'
import { ageOf } from '../../engine/artistLife'
import { sum } from '../../engine/util'
import { useGame } from '../../store/gameStore'
import {compact, stars, usd} from '../../lib'

const col = (v: number) => (v >= 75 ? 'cy' : v >= 60 ? 'gd' : v >= 45 ? 'gr' : 'rd')
const traitTone = (t: string, i: number) => (/dur|Exigeant|Ego/i.test(t) ? 'tr_' : ['tg', 'te', 'tc'][i % 3])

export default function Profil() {
  const g = useGame((s) => s.game)!
  const { sel } = useGame()
  const a = g.pool.find((x) => x.id === sel.candidateId)
  const [play, setPlay] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setPlay((p) => { if (p >= 100) { setPlaying(false); return 0 } return p + 4 }), 200)
    return () => clearInterval(t)
  }, [playing])
  if (!a) return (
    <div className="scr"><Dock active="artistes" /><Hud />
      <div className="main"><div className="pn cut" style={{maxWidth: 600}}><div className="h2">Artiste introuvable</div><p className="mut">Cet artiste n'est plus disponible (signé ailleurs ou déjà dans votre label).</p><a href="Decouverte.dc.html" className="btn">Retour à la liste</a></div></div></div>
  )
  const c = cityById(a.originCityId)
  const age = ageOf(g, a)
  const fansList = Object.entries(a.fans).sort((x, y) => y[1] - x[1]).slice(0, 4)
  const maxF = Math.max(1, ...fansList.map((f) => f[1]))
  const status = a.status === 'concours' ? ['te', 'Concours'] : a.rivalInterest ? ['tr_', 'Concurrence'] : ['tg', 'Disponible']
  return (
    <div className="scr">
      <Dock active="artistes" />
      <Hud />
      <div className="main" style={{padding: '0 0 0 0'}}>
        <div style={{position: 'relative', height: 300, overflow: 'hidden', background: 'radial-gradient(600px 300px at 18% 110%, rgba(139,92,246,0.7), transparent), radial-gradient(500px 260px at 90% -10%, rgba(255,61,154,0.55), transparent), linear-gradient(135deg,#2A1B4D,#0C0719)'}}>
          <div className="map" style={{position: 'absolute', inset: 0, opacity: '0.22'}}><div className="mk c" style={{left: c.x + '%', top: c.y + '%'}} /></div>
          <div style={{position: 'absolute', left: 36, top: 22}}><a href="Decouverte.dc.html" className="btn s sm">Retour à la liste</a></div>
          <div style={{position: 'absolute', left: 36, bottom: 28, display: 'flex', alignItems: 'flex-end', gap: 28}}>
            <Avatar artist={a} size={180} />
            <div style={{paddingBottom: 6}}><div style={{display: 'flex', gap: 8}}><span className="tag te">{a.genre}</span><span className={'tag ' + status[0]}>{status[1]}</span><span className="tag ti">{age} ans</span></div><h1 className="disp" style={{fontSize: 72, lineHeight: 1, marginTop: 8}}>{a.stageName}</h1><div className="lbl" style={{fontSize: 15, marginTop: 4}}>{c.name}, {c.country} · {a.lang}</div></div>
          </div>
          <div style={{position: 'absolute', right: 36, bottom: 28, display: 'flex', gap: 12}}><div className="pn" style={{textAlign: 'center', padding: '12px 20px'}}><div className="lbl">Potentiel</div><div style={{color: '#FFC63D', fontSize: 20}}>{stars(a.potential)}</div></div><div className="pn" style={{textAlign: 'center', padding: '12px 20px'}}><div className="lbl">Fans</div><div className="num" style={{color: '#35D3F0'}}>{compact(sum(a.fans))}</div></div><div className="pn" style={{textAlign: 'center', padding: '12px 20px'}}><div className="lbl">Avance demandée</div><div className="num" style={{color: '#FFC63D'}}>{usd(a.asking?.advance ?? 0)}</div></div></div>
        </div>
        <div style={{display: 'flex', gap: 20, padding: '20px 28px'}}>
          <div style={{width: 400, display: 'flex', flexDirection: 'column', gap: 12}}>
            <div className="pn cut"><div className="lbl">Compétences</div><div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12}}>
              {Object.entries(ARTIST_LABELS).map(([k, label]) => { const v = Math.round(a.skills[k] ?? 0); return (<div key={k} style={{display: 'grid', gridTemplateColumns: '120px 1fr 34px', gap: 10, alignItems: 'center', fontSize: 14}}><span>{label}</span><div className={'mt ' + col(v)}><i style={{width: Math.min(100, v) + '%'}} /></div><b>{v}</b></div>) })}
            </div></div>
            <div className="pn"><div className="lbl">Personnalité</div><div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10}}>{a.traits.map((t, i) => <span key={t} className={'tag ' + traitTone(t, i)}>{t}</span>)}</div></div>
          </div>
          <div style={{width: 440, display: 'flex', flexDirection: 'column', gap: 12}}>
            <div className="pn cut"><div className="lbl">Coordonnées</div>
              <div className="row" style={{gridTemplateColumns: '110px 1fr'}}><span className="mut">Nom civil</span><b>{a.realName}</b></div>
              <div className="row" style={{gridTemplateColumns: '110px 1fr'}}><span className="mut">Manager</span><b>{a.manager.name}</b></div>
              <div className="row" style={{gridTemplateColumns: '110px 1fr'}}><span className="mut">Agence</span><b>{a.manager.agency}</b></div>
              <div className="row" style={{gridTemplateColumns: '110px 1fr'}}><span className="mut">Contact</span><b>{a.manager.email}</b></div>
              <div className="row" style={{gridTemplateColumns: '110px 1fr'}}><span className="mut">Langues</span><b>{a.lang}</b></div>
              <div className="row" style={{gridTemplateColumns: '110px 1fr'}}><span className="mut">Autres offres</span><span className={'tag ' + (a.rivalInterest ? 'tr_' : 'tg')}>{a.rivalInterest ? 'Un label rival est intéressé' : 'Aucune'}</span></div></div>
            <div className="pn"><div className="lbl">Audience par territoire</div><div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10}}>
              {fansList.length === 0 && <span className="mut">Audience encore locale.</span>}
              {fansList.map(([id, f]) => <div key={id} style={{display: 'grid', gridTemplateColumns: '120px 1fr 54px', gap: 10, alignItems: 'center', fontSize: 14}}><span>{cityById(id).name}</span><div className="mt gd"><i style={{width: Math.max(3, Math.round((f / maxF) * 100)) + '%'}} /></div><b>{compact(f)}</b></div>)}
            </div></div>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
            <div className="pn"><div className="lbl">Titre démo</div><div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10}}><a href="Profil.dc.html" className="btn sm" style={{width: 44, padding: 0}} onClick={(e) => { e.preventDefault(); setPlaying(!playing) }}>{playing ? '❚❚' : '▶'}</a><div style={{flex: 1}}><b>« {a.demo.title} »</b><div className="mut" style={{fontSize: 13}}>qualité estimée {Math.round(a.demo.quality)}</div></div></div><div className="mt cy" style={{marginTop: 12}}><i style={{width: play + '%'}} /></div></div>
            <div className="bub"><span className="tag te" style={{marginRight: 8}}>Attentif</span>« {a.rivalInterest ? "J'ai plusieurs offres. Montrez-moi comment vous m'emmenez plus loin." : 'Je cherche un label qui croit en moi. Faites-moi une offre sérieuse.'} »</div>
            <div className="sp" />
            <a href="Contrat.dc.html" className="btn" style={{height: 60}}>Négocier le contrat</a>
            <a href="Decouverte.dc.html" className="btn s">Garder en liste</a>
          </div>
        </div>
      </div>
    </div>
  )
}
