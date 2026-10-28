import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { missionProgress } from '../../engine/missions'
import { useGame } from '../../store/gameStore'
import { usd, wk } from '../../lib'

const TONE: Record<string, string> = { g: 'tg', c: 'tc', e: 'te', r: 'tr_', i: 'ti' }

export default function Actualites() {
  const g = useGame((s) => s.game)!
  const missions = g.missions ?? []
  const actives = missions.filter((m) => m.status === 'actif')
  const past = missions.filter((m) => m.status !== 'actif').slice(-5).reverse()
  const news = g.news ?? []
  return (
    <div className="scr">
      <Dock active="monde" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 560, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className="pn sel">
            <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Missions</span><span className="sp" /><span className="tag ti">{actives.length} en cours</span></div>
            <div className="mut" style={{fontSize: 13, marginTop: 4}}>Chaque mission a une échéance : une récompense si vous réussissez, une perte de réputation sinon.</div>
          </div>
          {actives.length === 0 && <div className="pn cut mut">Aucune mission pour le moment. De nouvelles missions arrivent chaque semaine.</div>}
          {actives.map((m) => {
            const p = missionProgress(g, m)
            const left = m.deadline - g.week + 1
            const pct = m.kind === 'rank' ? (p.done ? 100 : 0) : Math.min(100, Math.round((p.now / p.goal) * 100))
            return (
              <div key={m.id} className="pn cut">
                <div style={{display: 'flex', alignItems: 'center'}}><b>{m.title}</b><span className="sp" /><span className={'tag ' + (left <= 2 ? 'tr_' : 'te')}>{left} sem. restante{left > 1 ? 's' : ''}</span></div>
                <div className="mut" style={{fontSize: 13, marginTop: 4}}>{m.desc}</div>
                <div className="mt" style={{marginTop: 10}}><i style={{width: pct + '%'}} /></div>
                <div style={{display: 'flex', marginTop: 8, fontSize: 13}}><span className="mut">{p.label}</span><span className="sp" /><span className="tag tg">+{usd(m.reward.cash)}</span><span className="tag tr_" style={{marginLeft: 6}}>−{m.penalty} rép.</span></div>
              </div>
            )
          })}
          {(g.awards ?? []).length > 0 && (
            <div className="pn cut">
              <div className="lbl">Palmarès des cérémonies</div>
              {[...g.awards].reverse().slice(0, 6).map((w, i) => (
                <div key={i} className="row" style={{gridTemplateColumns: '60px 1fr auto'}}>
                  <span className="mut">An {w.year}</span><span>{w.category === 'titre' ? 'Titre' : 'Artiste'} : <b>{w.winner}</b></span>
                  <span className={'tag ' + (w.mine ? 'tg' : w.nominated ? 'te' : 'ti')}>{w.mine ? 'Gagné' : w.nominated ? 'Nominé' : '—'}</span>
                </div>
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div className="pn cut">
              <div className="lbl">Dernières missions</div>
              {past.map((m) => (
                <div key={m.id} className="row" style={{gridTemplateColumns: '24px 1fr auto'}}>
                  <span style={{color: m.status === 'reussi' ? '#3DDC97' : '#FF6B8A'}}>{m.status === 'reussi' ? '✓' : '✕'}</span>
                  <span>{m.title}</span>
                  <span className="mut" style={{fontSize: 13}}>{wk(m.endWeek ?? 0).replace('semaine', 'sem.')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{width: 716, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto', maxHeight: 760}}>
          <div className="pn sel"><span className="h2">Fil d’actualités</span><div className="mut" style={{fontSize: 13, marginTop: 4}}>Votre label, le classement mondial et les manœuvres de Meridian.</div></div>
          {news.length === 0 && <div className="pn cut mut">Rien à signaler. Passez la semaine pour voir l’actualité arriver.</div>}
          {news.map((n) => (
            <div key={n.id} className="pn cut" style={{padding: '12px 16px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span className={'tag ' + (TONE[n.tone] ?? 'ti')}>{n.tag}</span><span className="sp" /><span className="mut" style={{fontSize: 12}}>Semaine {n.week}</span></div>
              <div style={{marginTop: 6, fontSize: 14}}>{n.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
