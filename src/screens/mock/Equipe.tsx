import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { RECRUITS } from '../../data/people'
import { CITIES, cityById } from '../../data/world'
import { fireStaff, hireStaff, officeRequirement, openOffice, raiseSalary, weeklyFixedCosts } from '../../engine/economy'
import { fansInCity } from '../../engine/util'
import { useGame } from '../../store/gameStore'
import { compact, usd } from '../../lib'

const pill: React.CSSProperties = { cursor: 'pointer', userSelect: 'none' }

export default function Equipe() {
  const g = useGame((s) => s.game)!
  const { run } = useGame()
  const fixed = weeklyFixedCosts(g)
  const vacant = RECRUITS.filter((r) => !g.staff.some((m) => m.id === r.id))
  const low = [...g.staff].sort((a, b) => a.morale - b.morale)[0]
  const candidates = CITIES.filter((c) => !g.offices.some((o) => o.cityId === c.id))
  const [target, setTarget] = useState(candidates.find((c) => c.minRep <= g.reputation + 10)?.id ?? candidates[0].id)
  const [kind, setKind] = useState<'bureau' | 'partenaire'>('partenaire')
  const tc = cityById(target)
  const req = officeRequirement(target, kind)
  const fans = fansInCity(g, target)
  const missing = Math.max(0, req.fans - fans)
  const rows = [...g.offices.map((o) => ({ id: o.cityId, o })), ...candidates.filter((c) => c.minRep <= g.reputation + 10).slice(0, 4).map((c) => ({ id: c.id, o: null }))]
  return (
    <div className="scr">
      <Dock active="equipe" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 760}}>
          <div style={{display: 'flex', alignItems: 'center'}}><h1 className="h1">Équipe</h1><span className="sp" /><span className="tag ti">Salaires : {usd(fixed.salaries)} / semaine</span></div>
          <div className="pn cut" style={{marginTop: 14, padding: '12px 20px', maxHeight: 520, overflow: 'auto'}}>
            <div className="row th" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><span>Rôle</span><span>Ville</span><span>Niveau</span><span>Salaire / sem.</span><span>Moral</span></div>
            {g.staff.map((m) => (
              <div key={m.id} className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>{m.name}</b><div className="mut" style={{fontSize: 13}}>{m.role}</div></div><span>{cityById(m.cityId).name}</span><span style={{color: '#FFC63D'}}>{'★'.repeat(m.level)}</span><span>{usd(m.salary)}</span>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}><div className={'mt ' + (m.morale >= 65 ? 'gr' : m.morale >= 45 ? 'gd' : 'rd')} style={{flex: 1}}><i style={{width: Math.round(m.morale) + '%'}} /></div>
                  <span className="tag tc" style={pill} title="+15 % de salaire, moral +25" onClick={() => run((s) => raiseSalary(s, m.id))}>Augmenter</span>
                  <span className="tag tr_" style={pill} title={'Indemnité : ' + usd(m.salary * 2)} onClick={() => { if (window.confirm(`Licencier ${m.name} ? Indemnité : ${usd(m.salary * 2)}`)) run((s) => fireStaff(s, m.id)) }}>✕</span></div></div>
            ))}
            {vacant.map((r) => (
              <div key={r.id} className="row" style={{gridTemplateColumns: '210px 120px 80px 100px 1fr'}}><div><b>Poste vacant</b><div className="mut" style={{fontSize: 13}}>{r.name} · {r.role}</div></div><span>{cityById(r.cityId).name}</span><span style={{color: '#FFC63D'}}>{'★'.repeat(r.level)}</span><span>{usd(r.salary)}</span><a href="Equipe.dc.html" className="tag tc" style={{justifySelf: 'start'}} title={'Prime : ' + usd(r.salary * 4)} onClick={(e) => { e.preventDefault(); run((s) => hireStaff(s, r.id)) }}>Recruter · {usd(r.salary * 4)}</a></div>
            ))}
          </div>
          {low && low.morale < 50 && <div className="bub" style={{marginTop: 14}}><span className="tag tr_" style={{marginRight: 8}}>Alerte</span>{low.name} ({cityById(low.cityId).name}) demande une revalorisation. Son moral est bas.</div>}
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <h2 className="h2" style={{marginTop: 6}}>Bureaux et partenaires</h2>
          <div className="pn" style={{padding: '12px 18px'}}>
            {rows.map(({ id, o }) => { const c = cityById(id); const locked = !o && c.minRep > g.reputation; return (
              <div key={id} className="row" role="button" tabIndex={0} onClick={() => setTarget(id)} style={{gridTemplateColumns: '1fr 150px', cursor: 'pointer', ...(id === target && !o ? {boxShadow: 'inset 0 0 0 1px var(--mag)', borderRadius: 8} : {})}}>
                <div><b>{c.name}</b><div className="mut" style={{fontSize: 13}}>{o ? (o.kind === 'siege' ? `Siège · loyer ${usd(c.rent)} / mois` : o.kind === 'bureau' ? `${usd(c.rent)} / mois` : 'Revenus locaux +5 %') : 'Aucune présence'}{o && o.since > g.week ? ` · prêt en S${o.since}` : ''}</div></div>
                <span className={'tag ' + (o ? (o.kind === 'partenaire' ? 'tc' : 'tg') : locked ? 'tr_' : 'te')}>{o ? (o.kind === 'siege' ? 'Bureau complet' : o.kind === 'bureau' ? 'Bureau' : 'Partenaire distribution') : locked ? `Rép. ${c.minRep}` : 'Disponible'}</span></div>) })}
          </div>
          <div className="pn cut sel">
            <div style={{display: 'flex', alignItems: 'center'}}><span className="lbl">Ouvrir un bureau</span><span className="sp" />
              <span className={'chip' + (kind === 'partenaire' ? ' on' : '')} style={{...pill, height: 28}} onClick={() => setKind('partenaire')}>Partenaire</span>&nbsp;<span className={'chip' + (kind === 'bureau' ? ' on' : '')} style={{...pill, height: 28}} onClick={() => setKind('bureau')}>Bureau</span></div>
            <div className="h2" style={{marginTop: 6, fontSize: 28}}>{tc.name}</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10, fontSize: 14}}>
              <div><span className="tag tc">Certain</span><div style={{marginTop: 6}}>Coût d'installation : {usd(req.cost)}</div></div>
              <div><span className="tag te">Estimé</span><div style={{marginTop: 6}}>Délai : {req.weeks} semaines</div></div>
              <div><span className="tag ti">Seuil de fans</span><div style={{marginTop: 6}}>{compact(fans)} sur {compact(req.fans)} requis</div></div>
              <div><span className="tag tr_">Risque</span><div style={{marginTop: 6}}>{tc.rent >= 6000 ? 'Loyers et salaires élevés' : 'Charges modérées'}</div></div>
            </div>
            <div className="mt" style={{marginTop: 14}}><i style={{width: Math.min(100, Math.round((fans / Math.max(1, req.fans)) * 100)) + '%'}} /></div>
            <a href="Equipe.dc.html" className={'btn' + (missing ? ' s' : '')} style={{marginTop: 14, width: '100%'}} onClick={(e) => { e.preventDefault(); run((s) => openOffice(s, target, kind)) }}>{missing ? `Fans insuffisants : encore ${compact(missing)}` : g.reputation < tc.minRep ? `Réputation ${tc.minRep} requise` : `Ouvrir à ${tc.name}`}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
