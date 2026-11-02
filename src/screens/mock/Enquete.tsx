import { useState } from 'react'
import Avatar from '../../components/Avatar'
import Dock from '../../components/Dock'
import Hud from '../../components/Hud'
import { CLUES, MAX_STRENGTH, THREADS, TIER_NAME, clueById, inquiryOpen, inquiryStrength, investigate, isLinked, linkClues, successChance, tierOf, verifyClue } from '../../engine/inquiry'
import { usd } from '../../lib'
import { useGame } from '../../store/gameStore'

const W = 28, H = 25 // taille d'une carte en % de la planche
const SKILL: Record<string, string> = { marketing: 'Marketing', reseau: 'Réseau', finance: 'Finance', negociation: 'Négociation', production: 'Production' }

export default function Enquete() {
  const g = useGame((s) => s.game)!
  const run = useGame((s) => s.run)
  const say = useGame((s) => s.say)
  const [pick, setPick] = useState<string | null>(null)
  const q = g.inquiry
  const open = inquiryOpen(g)
  const strength = inquiryStrength(g)
  const tier = tierOf(strength)
  const found = Object.keys(q?.clues ?? {}).length
  const waiting = g.eventSeen?.['dossier-attendre'] !== undefined && g.eventSeen?.['dossier'] === undefined
  const decided = g.eventSeen?.['dossier'] !== undefined
  const heat = q?.heat ?? 0
  const tierColor = ['#FF8E5A', '#FFC63D', '#3DDC97'][tier]
  const centers = Object.fromEntries(CLUES.map((c) => [c.id, [c.x + W / 2, c.y + H / 2]]))
  const strings = (q?.links ?? []).map((k) => k.split('|') as [string, string])
  const onCard = (id: string) => {
    if (!q?.clues[id]) return
    if (!pick) { setPick(id); return }
    if (pick === id) { setPick(null); return }
    const r = isLinked(g, pick, id) ? null : run((s) => linkClues(s, pick, id))
    if (r === null) say('Ces deux pièces sont déjà reliées.', 'err')
    setPick(null)
  }
  return (
    <div className="scr">
      <Dock active="monde" />
      <Hud />
      <div className="main" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="h2">Enquête Horizon</div>
            <span className="tag te">{found}/{CLUES.length} indices</span>
            {Object.entries(THREADS).map(([k, t]) => <span key={k} className="tag" style={{ boxShadow: `inset 0 0 0 1px ${t.color}`, color: t.color }}>{t.name}</span>)}
            <span className="sp" />
            <a href="Hub.dc.html" className="btn s sm" onClick={(e) => { e.preventDefault(); useGame.getState().go('Hub') }}>Retour au monde</a>
          </div>
          <div style={{ position: 'relative', height: 600, borderRadius: 18, overflow: 'hidden', background: 'radial-gradient(900px 400px at 50% 0%, rgba(139,92,246,.18), transparent), repeating-linear-gradient(45deg, #1b1230 0 14px, #1e1536 14px 28px)', boxShadow: 'inset 0 0 0 2px var(--ln), inset 0 0 60px rgba(0,0,0,.5)' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {strings.map(([a, b]) => {
                const [x1, y1] = centers[a], [x2, y2] = centers[b]
                return <g key={a + b}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF3D5A" strokeWidth={2.4} vectorEffect="non-scaling-stroke" strokeLinecap="round" /><circle cx={x1} cy={y1} r={0.7} fill="#FFC63D" /><circle cx={x2} cy={y2} r={0.7} fill="#FFC63D" /></g>
              })}
            </svg>
            {CLUES.map((c) => {
              const f = q?.clues[c.id]
              const th = THREADS[c.thread]
              const on = pick === c.id
              const ch = Math.round(successChance(g, c) * 100)
              return (
                <div key={c.id} role={f ? 'button' : undefined} tabIndex={f ? 0 : undefined} onClick={() => onCard(c.id)} onKeyDown={(e) => e.key === 'Enter' && onCard(c.id)}
                  className={f ? 'an-pop' : undefined}
                  style={{ position: 'absolute', left: c.x + '%', top: c.y + '%', width: W + '%', height: H + '%', padding: '10px 12px', borderRadius: 10, cursor: f ? 'pointer' : 'default', transform: `rotate(${(c.x % 7) - 3}deg)`, display: 'flex', flexDirection: 'column',
                    background: f ? '#F4E9C9' : 'rgba(20,12,40,.85)', color: f ? '#2B1D10' : '#B3A6D9', boxShadow: on ? '0 0 0 3px #FF3D9A, 0 10px 24px rgba(0,0,0,.5)' : f ? '0 8px 18px rgba(0,0,0,.45)' : 'inset 0 0 0 2px #3A2D63', borderTop: f ? `5px solid ${th.color}` : undefined }}>
                  <i style={{ position: 'absolute', top: -6, left: '50%', width: 12, height: 12, borderRadius: '50%', background: '#FF3D5A', boxShadow: '0 2px 4px rgba(0,0,0,.5)' }} />
                  {f ? (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.15 }}>{c.title}</div>
                      <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.3, flex: 1, overflow: 'hidden' }}>{c.text}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {f.verified ? <span style={{ fontSize: 11, fontWeight: 800, color: '#1B7A52' }}>✓ VÉRIFIÉ PAR AWA</span>
                          : f.verifyDue ? <span style={{ fontSize: 11, fontWeight: 700, color: '#8A5A00' }}>Vérification · sem. {(f.verifyDue - 1) % 52 + 1}</span>
                          : <button style={{ fontSize: 11, fontWeight: 800, border: 0, background: '#2B1D10', color: '#F4E9C9', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); run((s) => verifyClue(s, c.id)) }}>Faire vérifier · 1 action · $1 500</button>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="lbl" style={{ color: th.color }}>{th.name}</div>
                      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, margin: '2px 0' }}>?</div>
                      <div style={{ fontSize: 12 }}>Piste à explorer · profil {SKILL[c.skill] ?? c.skill} · ~{ch} % de réussite</div>
                      <button className="btn sm" disabled={!open} style={{ border: 0, cursor: 'pointer', marginTop: 'auto', height: 32, fontSize: 12 }} onClick={() => run((s) => investigate(s, c.id))}>Enquêter · 1 action · {usd(c.cost)}</button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mut" style={{ fontSize: 13, marginTop: 10 }}>{pick ? `« ${clueById(pick).title} » sélectionné : cliquez sur une autre pièce trouvée pour tenter de les relier.` : 'Cliquez une pièce trouvée, puis une autre : si elles s’éclairent mutuellement, un fil rouge les relie.'}</div>
        </div>
        <div style={{ width: 330, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="pn cut">
            <div className="lbl">Solidité du dossier</div>
            <div className="num" style={{ fontSize: 30, color: tierColor, marginTop: 4 }}>{TIER_NAME[tier]}</div>
            <div className="mt" style={{ marginTop: 10 }}><i style={{ width: Math.min(100, (strength / MAX_STRENGTH) * 100 * 1.6) + '%', background: tierColor }} /></div>
            <div className="mut" style={{ fontSize: 12, marginTop: 8 }}>Indices ×1 · liens ×2 · vérifications ×1 → {strength} pts (solide à 8, irréfutable à 18).</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="tag ti">{(q?.links.length ?? 0)} lien(s)</span>
              <span className="tag tg">{Object.values(q?.clues ?? {}).filter((c) => c.verified).length} vérifié(s)</span>
            </div>
          </div>
          <div className="pn cut">
            <div className="lbl">Méfiance de Meridian</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>{[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i < heat ? '#FF5470' : '#2A1B4D' }} />)}</div>
            <div className="mut" style={{ fontSize: 12, marginTop: 8 }}>Chaque démarche ratée l’augmente. À 3, Meridian lance une offensive de 4 semaines. Elle retombe d’un cran toutes les 4 semaines.</div>
          </div>
          <div className="pn cut">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar keyName="story-awa" name="Awa Sylla" gradient="#3DDC97,#35D3F0" size={56} />
              <div><b>Awa Sylla</b><div className="mut" style={{ fontSize: 12 }}>Journaliste d’investigation</div></div>
            </div>
            <div className="bub" style={{ marginTop: 12, fontSize: 14 }}>
              {!open ? '« Venez me voir quand vous aurez atteint cent mille fans. Je vous montrerai ce que je cherche. »'
                : decided ? '« Le dossier est parti : l’enquête est close. »'
                : waiting ? (strength >= 8 ? '« Je crois qu’on y est. Je passe vous voir. »' : '« Il nous faut plus de pièces reliées entre elles. Un fil rouge vaut deux indices. »')
                : '« Une enveloppe anonyme finira par arriver. Autant avoir des preuves à lui opposer quand elle arrivera. »'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
