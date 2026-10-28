import { liveCity } from '../../engine/prices'
import { useMemo } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { cityById } from '../../data/world'
import { loanLimit, repayLoan, takeLoan, weeklyFixedCosts } from '../../engine/economy'
import { projection } from '../../engine/selectors'
import { guard, useGame } from '../../store/gameStore'
import { compact, usd, wk } from '../../lib'

export default function Finances() {
  const g = useGame((s) => s.game)!
  const { run } = useGame()
  const proj = useMemo(() => projection(g, 8), [g])
  const maxV = Math.max(1000, ...proj.map((p) => Math.max(p.revenue, p.expenses)))
  const top = Math.ceil(maxV / 10000) * 10000 || 10000
  const h = (v: number) => Math.max(1, Math.round((v / top) * 190))
  const peak = proj.reduce((a, b) => (b.expenses > a.expenses ? b : a), proj[0])
  const reached = [...new Set(g.stats.countriesReached)].map((id) => liveCity(g, cityById(id))).slice(0, 5)
  const pirate = [...reached].sort((a, b) => b.piracy - a.piracy).slice(0, 3)
  const pend = new Map<string, { amount: number; week: number }>()
  for (const p of g.pending) { const cur = cityById(p.cityId).currency; const e = pend.get(cur) ?? { amount: 0, week: p.week }; e.amount += p.amount; e.week = Math.min(e.week, p.week); pend.set(cur, e) }
  const limit = loanLimit(g)
  const loan = g.loan
  const fixed = weeklyFixedCosts(g)
  return (
    <div className="scr">
      <Dock active="finances" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 790, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}><h1 className="h1">Finances</h1><span className={'tag ' + (g.cash >= 0 ? 'tg' : 'tr_')}>{g.cash >= 0 ? 'Aucune dette cachée' : 'Trésorerie négative : ' + g.negWeeks + ' / 4 semaines'}</span><span className="tag ti">Charges fixes : {usd(fixed.total)} / sem.</span></div>
          <div className="pn cut">
            <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Recettes et dépenses, 8 prochaines semaines</span><span className="sp" /><span className="tag te">Projection</span></div>
            <svg viewBox="0 0 700 250" width="100%" height={250} style={{marginTop: 10}} role="img" aria-label="Recettes et dépenses projetées par semaine">
              <g stroke="#3F2B73" strokeWidth={1}><line x1={30} x2={690} y1={200} y2={200} /><line x1={30} x2={690} y1={105} y2={105} strokeDasharray="3 5" /><line x1={30} x2={690} y1={10} y2={10} strokeDasharray="3 5" /></g>
              <g fill="#B3A6D9" fontFamily="DM Sans, sans-serif" fontSize={12}><text x={0} y={204}>0</text><text x={0} y={109}>{compact(top / 2)}</text><text x={0} y={14}>{compact(top)}</text></g>
              <g fill="#FFC63D">{proj.map((p, i) => <rect key={i} x={46 + i * 66} y={200 - h(p.revenue)} width={20} height={h(p.revenue)} rx={3} />)}</g>
              <g fill="#FF3D9A">{proj.map((p, i) => <rect key={i} x={70 + i * 66} y={200 - h(p.expenses)} width={20} height={h(p.expenses)} rx={3} />)}</g>
              <g fill="#B3A6D9" fontFamily="DM Sans, sans-serif" fontSize={12} textAnchor="middle">{proj.map((p, i) => <text key={i} x={68 + i * 66} y={220}>S{(p.week - 1) % 52 + 1}</text>)}</g>
              <g fontFamily="DM Sans, sans-serif" fontSize={13} fill="#F4F0FF"><rect x={568} y={30} width={12} height={12} fill="#FFC63D" rx={2} /><text x={586} y={41}>Recettes</text><rect x={568} y={54} width={12} height={12} fill="#FF3D9A" rx={2} /><text x={586} y={65}>Dépenses</text></g>
            </svg>
            <div className="mut" style={{fontSize: 13}}>Pic de dépenses en {wk(peak.week)} ({usd(peak.expenses)}). Trésorerie projetée en {wk(proj[proj.length - 1].week)} : <b style={{color: proj[proj.length - 1].cash < 0 ? '#FF5470' : '#FFC63D'}}>{usd(proj[proj.length - 1].cash)}</b>. La projection suppose aucune nouvelle action.</div>
          </div>
          <div className="pn">
            <div className="lbl">Trésorerie et revenus en attente</div>
            <div className="row th" style={{gridTemplateColumns: '1fr 190px 130px 90px', paddingTop: 10}}><span>Devise</span><span>État</span><span>En dollars</span><span>Échéance</span></div>
            <div className="row" style={{gridTemplateColumns: '1fr 190px 130px 90px'}}><b>Dollar (trésorerie)</b><span>Disponible</span><b>{usd(g.cash)}</b><span className="mut">=</span></div>
            {[...pend.entries()].slice(0, 4).map(([cur, v]) => <div key={cur} className="row" style={{gridTemplateColumns: '1fr 190px 130px 90px'}}><b>{cur}</b><span>En attente de paiement</span><b>{usd(v.amount)}</b><span className="up">S{(v.week - 1) % 52 + 1}</span></div>)}
            {pend.size === 0 && <div className="row mut" style={{gridTemplateColumns: '1fr'}}>Aucun revenu en attente : sortez un titre pour en générer.</div>}
          </div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="pn">
            <div className="lbl">Retenues par pays (taux de jeu)</div>
            <div style={{marginTop: 6}}>
              {reached.map((c) => <div key={c.id} className="row" style={{gridTemplateColumns: '1fr 70px 100px'}}><span>{c.country}</span><b>{Math.round(c.tax * 100)} %</b><span className={'tag ' + (c.delay <= 3 ? 'tg' : 'te')}>Délai {c.delay} sem.</span></div>)}
            </div>
          </div>
          <div className="pn">
            <div className="lbl">Piratage estimé</div>
            <div style={{display: 'grid', gridTemplateColumns: '90px 1fr 50px', gap: 10, alignItems: 'center', marginTop: 12, fontSize: 14}}>
              {pirate.map((c) => <span key={c.id} style={{display: 'contents'}}><span>{c.name}</span><div className={'mt ' + (c.piracy > 0.3 ? 'rd' : c.piracy > 0.15 ? 'gd' : 'gr')}><i style={{width: Math.round(c.piracy * 100) + '%'}} /></div><b>−{Math.round(c.piracy * 100)} %</b></span>)}
            </div>
          </div>
          <div className="pn cut sel">
            {loan ? (<>
              <div className="lbl">Prêt en cours</div>
              <div className="num" style={{marginTop: 6, color: '#FFC63D'}}>{usd(loan.remaining)}</div>
              <div className="mut" style={{fontSize: 14, marginTop: 6}}>Reste à rembourser, {usd(loan.weekly)} par semaine pendant {loan.weeksLeft} semaines.</div>
              <a href="Finances.dc.html" className="btn g" style={{marginTop: 14, width: '100%'}} onClick={guard(() => { run((s) => repayLoan(s)); return false })}>Rembourser maintenant</a>
            </>) : (<>
              <div className="lbl">Prêt bancaire disponible</div>
              <div className="num" style={{marginTop: 6, color: '#FFC63D'}}>{usd(limit)}</div>
              <div className="mut" style={{fontSize: 14, marginTop: 6}}>Taux fixe 9 %, remboursé sur 26 semaines. Plafond selon votre réputation.</div>
              <div style={{display: 'flex', gap: 8, marginTop: 10}}><span className="tag tc">Intérêts : {usd(limit * 0.09)}</span><span className="tag tr_">Risque : {g.cash < fixed.total * 6 ? 'trésorerie serrée' : 'charges +' + usd(Math.ceil((limit * 1.09) / 26)) + ' / sem.'}</span></div>
              <a href="Finances.dc.html" className="btn g" style={{marginTop: 14, width: '100%'}} onClick={guard(() => { run((s) => takeLoan(s)); return false })}>Demander le prêt</a>
            </>)}
          </div>
          <div className="sp" />
          <a href="Hub.dc.html" className="btn s">Retour au monde</a>
        </div>
      </div>
    </div>
  )
}
