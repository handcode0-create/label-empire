import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import Slider from '../../components/Slider'
import { CITIES, cityById } from '../../data/world'
import { CONTEST_FORMATS, startContest } from '../../engine/scouting'
import { useGame } from '../../store/gameStore'
import { initials, usd } from '../../lib'

export default function Concours() {
  const g = useGame((s) => s.game)!
  const { run, select, say } = useGame()
  const cities = CITIES.filter((c) => c.minRep <= g.reputation + 10).slice(0, 6)
  const [name, setName] = useState('Révélation ' + cityById(cities[0]?.id ?? 'abidjan').name)
  const [cityId, setCityId] = useState(cities[0]?.id ?? 'abidjan')
  const [format, setFormat] = useState<keyof typeof CONTEST_FORMATS>('salle')
  const f = CONTEST_FORMATS[format]
  const [budget, setBudget] = useState(12000)
  const juryOptions = [...g.staff.slice(0, 2).map((m) => m.name), 'Invité local']
  const [jury, setJury] = useState<string[]>(juryOptions.slice(0, 2))
  const city = cityById(cityId)
  const eff = Math.max(budget, f.min)
  const estimate = Math.round(eff / f.per)
  const rival = g.pool.some((a) => a.rivalInterest && a.originCityId === cityId)
  const shown = g.contests.filter((k) => k.status === 'termine' && k.finalists.length).slice(-1)[0] ?? g.contests.filter((k) => k.status === 'ouvert').slice(-1)[0]
  const finalists = shown ? shown.finalists.map((id) => g.pool.find((a) => a.id === id)).filter(Boolean) as typeof g.pool : []
  const changeCity = (id: string) => { setCityId(id); if (name.startsWith('Révélation ')) setName('Révélation ' + cityById(id).name) }
  return (
    <div className="scr">
      <Dock active="artistes" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 470, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><a href="Decouverte.dc.html" className="btn s sm">Retour</a><h1 className="h1" style={{fontSize: 36}}>Organiser un concours</h1></div>
          <div className="pn cut">
            <label htmlFor="cn" className="lbl">Nom du concours</label>
            <input id="cn" className="in" style={{marginTop: 8}} value={name} onChange={(e) => setName(e.target.value)} />
            <div className="lbl" style={{marginTop: 16}}>Pays et ville</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}>{cities.map((c) => <span key={c.id} className={'chip' + (c.id === cityId ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => changeCity(c.id)}>{c.country} · {c.name}</span>)}</div>
            <div className="lbl" style={{marginTop: 16}}>Format</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}>{(Object.keys(CONTEST_FORMATS) as (keyof typeof CONTEST_FORMATS)[]).map((k) => <span key={k} className={'chip' + (k === format ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => { setFormat(k); setBudget(Math.max(budget, CONTEST_FORMATS[k].min)) }}>{CONTEST_FORMATS[k].label}</span>)}</div>
            <div style={{display: 'flex', alignItems: 'baseline', marginTop: 16}}><span className="lbl">Budget</span><span className="sp" /><b className="disp" style={{fontSize: 24, color: '#FFC63D'}}>{usd(budget)}</b></div>
            <Slider min={3000} max={50000} step={500} value={budget} onChange={setBudget} style={{marginTop: 14}} />
            <div className="lbl" style={{marginTop: 16}}>Jury</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}>{juryOptions.map((j) => <span key={j} className={'chip' + (jury.includes(j) ? ' on' : '')} style={{cursor: 'pointer'}} onClick={() => setJury(jury.includes(j) ? jury.filter((x) => x !== j) : [...jury, j])}>{j}</span>)}</div>
          </div>
          <div className="pn">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Coût : {usd(budget)} aujourd'hui</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>~{estimate} candidats, 4 finalistes</div></div>
              <div><span className="tag ti">Incertain</span><div style={{marginTop: 6}}>Une vraie pépite ou non</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>{rival ? 'Un rival suit déjà un talent à ' + city.name : 'Faible'}</div></div>
            </div>
          </div>
          <div className="sp" />
          <a href="Decouverte.dc.html" className="btn" style={{height: 60}} onClick={(e) => { e.preventDefault(); if (run((s) => startContest(s, { name, cityId, format, budget, jury }))) say(`Concours « ${name} » lancé : finale dans 2 semaines.`) }}>Lancer le concours</a>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{position: 'relative', height: 200, borderRadius: 16, overflow: 'hidden', background: 'radial-gradient(420px 220px at 50% 120%, rgba(255,198,61,0.55), transparent), radial-gradient(300px 200px at 15% 0%, rgba(255,61,154,0.5), transparent), radial-gradient(300px 200px at 85% 0%, rgba(53,211,240,0.4), transparent), linear-gradient(180deg,#1C1236,#0C0719)'}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, background: 'linear-gradient(0deg,#2A1B4D,transparent)'}} />
            <div style={{position: 'absolute', left: 28, top: 22}}><span className={'tag ' + (shown?.status === 'termine' ? 'tr_' : 'te')}>{shown ? (shown.status === 'termine' ? 'Finale terminée' : 'Inscriptions en cours') : 'Aperçu'}</span></div>
            <div style={{position: 'absolute', left: 28, bottom: 20}}><div className="lbl">{shown ? cityById(shown.cityId).name : city.name} · {CONTEST_FORMATS[shown?.format ?? format].label}</div><div className="disp" style={{fontSize: 42, lineHeight: 1}}>{shown?.name ?? name}</div></div>
            <div style={{position: 'absolute', right: 24, bottom: 20, textAlign: 'right'}}><div className="num" style={{color: '#FFC63D'}}>{shown?.candidates ?? estimate}</div><div className="mut" style={{fontSize: 13}}>candidats {shown ? 'auditionnés' : 'estimés'}</div></div>
          </div>
          <div className="lbl">{finalists.length ? `Les ${finalists.length} finalistes` : 'Finalistes'}</div>
          {finalists.length ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12}}>
              {finalists.map((a, i) => (
                <div key={a.id} className={'pn' + (i === 0 ? ' sel' : '')} style={{textAlign: 'center', padding: '16px 12px'}}>
                  <div style={{display: 'flex', justifyContent: 'center'}}><div className="av" style={{width: 76, height: 76, fontSize: 27, background: `linear-gradient(135deg,${a.gradient})`}}>{initials(a.stageName)}</div></div>
                  <div style={{marginTop: 10}}><b style={{fontSize: 17}}>{a.stageName}</b></div>
                  <div className="mut" style={{fontSize: 13}}>{cityById(a.originCityId).name} · {a.genre}</div>
                  <div className="num" style={{marginTop: 8, color: '#FFC63D'}}>{Math.round(a.demo.quality)}</div><div className="mut" style={{fontSize: 12}}>note du jury</div>
                  <a href="Profil.dc.html" className={'btn sm' + (i === 0 ? '' : ' s')} style={{marginTop: 10}} onClick={() => select({ candidateId: a.id })}>Voir le profil</a>
                </div>
              ))}
            </div>
          ) : <div className="pn mut">Les finalistes apparaîtront ici à la fin du concours (2 semaines après le lancement).</div>}
          <div className="bub"><span className="tag tc" style={{marginRight: 8}}>Jury</span>{finalists[0] ? `« ${finalists[0].stageName} a une présence rare. Il vous faudra être rapide : un rival pourrait le contacter. »` : '« Plus le budget et le jury sont solides, meilleurs seront les finalistes. »'}</div>
          <div className="mut" style={{fontSize: 13}}>Vous avez l'exclusivité sur les finalistes pendant 2 semaines. Ensuite, ils rejoignent la liste de découverte.</div>
        </div>
      </div>
    </div>
  )
}
