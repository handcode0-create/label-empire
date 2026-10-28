import { opCost } from '../../engine/prices'
import { useState } from 'react'
import Hud from '../../components/Hud'
import Dock from '../../components/Dock'
import { MASTERING, MIX_OPTIONS, studioById } from '../../data/people'
import { cityById } from '../../data/world'
import { chooseMix, qualityPreview, releaseCalendar } from '../../engine/production'
import { useGame } from '../../store/gameStore'
import { currentSong, usd, wk } from '../../lib'

const STEPS = [['Ecriture', '1 Écrire'], ['Studio', '2 Enregistrer'], ['Mixage', '3 Mixer'], ['Sortie', '4 Sortir']]
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Mixage() {
  const g = useGame((s) => s.game)!
  const { sel, run, select, go } = useGame()
  const song = currentSong(g, sel.songId, ['recorded', 'mixed'])
  const [mixId, setMixId] = useState('local')
  const [master, setMaster] = useState(true)
  if (!song) return (
    <div className="scr"><Dock active="studio" /><Hud />
      <div className="main"><div className="pn cut" style={{maxWidth: 620}}><div className="h2">Rien à mixer</div><p className="mut">Enregistrez d'abord une chanson au studio.</p><a href="Studio.dc.html" className="btn">Aller au studio</a></div></div></div>
  )
  const done = song.stage === 'mixed'
  const st = song.studioId ? studioById(song.studioId) : null
  const mix = MIX_OPTIONS.find((m) => m.id === (done ? song.mixId : mixId))!
  const withMaster = done ? song.mastering : master
  const bonus = mix.bonus + (withMaster ? MASTERING.bonus : 0)
  const base = qualityPreview(g, song, 0)
  const final = done ? song.quality! : Math.min(100, base + bonus)
  const ready = done ? song.readyWeek : song.readyWeek + mix.weeks
  const from = Math.max(g.week, ready)
  const cal = releaseCalendar(g, from, 4)
  const chosen = sel.week && sel.week >= from && sel.week <= from + 12 ? sel.week : from
  const total = opCost(g, mix.cost + (withMaster ? MASTERING.cost : 0))
  const next = () => {
    if (!done && !run((s) => chooseMix(s, song.id, mixId, master))) return
    select({ songId: song.id, week: chosen }); go('Sortie')
  }
  const weekOf = (w: number) => `S${(w - 1) % 52 + 1} · An ${Math.floor((w - 1) / 52) + 1}`
  return (
    <div className="scr">
      <Dock active="studio" />
      <Hud />
      <div className="main" style={{display: 'flex', gap: 20}}>
        <div style={{width: 700, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>{STEPS.map(([s, l], i) => <a key={s} href={s + '.dc.html'} className={'chip' + (i === 2 ? ' on' : '')}>{l}</a>)}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><h1 className="h1" style={{fontSize: 36}}>Mixage et mastering</h1><span className="tag tg">{done ? 'Mixage lancé' : 'Enregistrement terminé'} · prise {song.recQ}</span></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {MIX_OPTIONS.map((m) => {
              const on = m.id === mix.id
              return (
                <div key={m.id} className={'pn' + (on ? ' sel' : '')} role="button" tabIndex={0} onClick={() => !done && setMixId(m.id)} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', cursor: done ? 'default' : 'pointer'}}>
                  <div style={{flex: 1}}><b style={{fontSize: 18}}>{m.name}</b><div className="mut" style={{fontSize: 13}}>{m.id === 'local' && st ? `Un ingénieur du son reconnu à ${cityById(st.cityId).name}.` : m.desc}</div></div>
                  <span className="tag tc">{usd(opCost(g, m.cost))}</span><span className="tag te">{m.label}</span><span className="tag ti">Qualité +{m.bonus}</span><span className={'tag ' + (m.risk === 'Moyen' ? 'tr_' : 'tg')}>Risque : {m.risk.toLowerCase()}</span>
                </div>
              )
            })}
          </div>
          <div className="pn" style={{display: 'flex', alignItems: 'center', gap: 14}}><input id="ms" type="checkbox" checked={withMaster} disabled={done} onChange={(e) => setMaster(e.target.checked)} style={{width: 24, height: 24, accentColor: '#FF3D9A'}} /><label htmlFor="ms" style={{flex: 1}}><b>Mastering inclus</b><div className="mut" style={{fontSize: 13}}>Volume et clarté pour les plateformes</div></label><span className="tag tc">{usd(MASTERING.cost)}</span><span className="tag ti">Qualité +{MASTERING.bonus}</span></div>
          <div className="pn cut"><div className="lbl">Qualité finale estimée</div><div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8}}><div className="num" style={{color: '#35D3F0'}}>{base} → {final}</div><div style={{flex: 1}} className="mt cy"><i style={{width: final + '%'}} /></div></div><div className="mut" style={{fontSize: 13, marginTop: 6}}>Estimé. Le résultat varie de ±3 selon l'ingénieur. Coût total : {usd(total)}.</div></div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="pn cut sel">
            <div style={{display: 'flex', alignItems: 'center'}}><span className="h2">Date de sortie</span><span className="sp" /><span className="tag ti">{weekOf(chosen)}</span></div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14}}>
              {cal.map((c) => (
                <div key={c.week} style={{display: 'grid', gridTemplateColumns: '54px repeat(7, 1fr)', gap: 6, alignItems: 'center'}}>
                  <b className="mut">S{(c.week - 1) % 52 + 1}</b>
                  {DAYS.map((d, i) => <a key={i} href="Mixage.dc.html" onClick={(e) => { e.preventDefault(); select({ week: c.week }) }} className={'chip' + (c.week === chosen && i === 4 ? ' on' : '')} style={{height: 38, justifyContent: 'center', padding: 0, opacity: c.tone === 'rival' ? 0.7 : 1}}>{d}</a>)}
                </div>
              ))}
            </div>
            <div style={{display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap'}}>{cal.map((c) => <span key={c.week} className={'tag ' + (c.tone === 'free' ? 'tg' : c.tone === 'rival' ? 'tr_' : 'te')}>S{(c.week - 1) % 52 + 1} : {c.tone === 'free' ? 'peu de concurrence' : c.tone === 'rival' ? "sortie d'un rival" : 'fête nationale, écoutes +15 %'}</span>)}</div>
            <div className="mut" style={{fontSize: 13, marginTop: 10}}>Mixage prêt en {wk(ready)} au plus tôt{done ? '' : ` avec « ${mix.name.toLowerCase()} »`}. Vous pourrez ajuster la date à l'étape suivante.</div>
          </div>
          <div className="sp" />
          <div style={{display: 'flex', gap: 12}}><a href="Studio.dc.html" className="btn s">Retour</a><a href="Sortie.dc.html" className="btn" style={{flex: 1, height: 60}} onClick={(e) => { e.preventDefault(); next() }}>{done ? 'Programmer la sortie par territoire' : 'Lancer le mixage et programmer la sortie'}</a></div>
        </div>
      </div>
    </div>
  )
}
