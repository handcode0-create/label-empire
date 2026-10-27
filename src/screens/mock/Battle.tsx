import { useEffect, useMemo, useRef, useState } from 'react'
import Avatar from '../../components/Avatar'
import { MANCHES, STYLES, buildBattle, coachPoints, scoreManche, type MancheResult, type Punch } from '../../engine/battle'
import { hash, createRng } from '../../engine/rng'
import { applyCoaching, countryOf, currentRound, entrantOf } from '../../engine/tournament'
import { useGame } from '../../store/gameStore'

type Phase = 'choix-camp' | 'annonce' | 'adversaire' | 'reponse' | 'resultat-manche' | 'bilan'
const THINK_MS = 9000

/** Texte qui s'écrit lettre par lettre ; renvoie le texte visible et un booléen « terminé ». */
function useTyped(text: string, active: boolean, speed = 22) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (!active) return
    const t = setInterval(() => setN((k) => { if (k >= text.length) { clearInterval(t); return k } return k + 1 }), speed)
    return () => clearInterval(t)
  }, [text, active, speed])
  return { shown: text.slice(0, n), done: n >= text.length }
}

export default function Battle() {
  const g = useGame((s) => s.game)!
  const sel = useGame((s) => s.sel)
  const { run, say, go } = useGame()
  const t = g.tournament
  const duel = t && currentRound(t)?.duels.find((d) => d.id === sel.duelId && !d.winner)
  const [attempt, setAttempt] = useState(0)
  const [meId, setMeId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('choix-camp')
  const [m, setM] = useState(0)
  const [pick, setPick] = useState<Punch | null>(null)
  const [results, setResults] = useState<MancheResult[]>([])
  const [timeLeft, setTimeLeft] = useState(THINK_MS)
  const [hit, setHit] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const me = t && duel && meId ? entrantOf(t, meId) : null
  const opp = t && duel && meId ? entrantOf(t, meId === duel.a ? duel.b : duel.a) : null
  const manches = useMemo(() => (me && opp ? buildBattle(createRng(hash(`${duel!.id}-${me.id}-${attempt}`)), me, opp, countryOf(opp), countryOf(me)) : []), [me?.id, opp?.id, attempt]) // eslint-disable-line react-hooks/exhaustive-deps
  const cur = manches[m]

  // texte adverse
  const oppTyped = useTyped(cur?.opp.text ?? '', phase === 'adversaire')
  useEffect(() => { if (phase === 'adversaire' && oppTyped.done) { const x = setTimeout(() => { setPhase('reponse'); setTimeLeft(THINK_MS) }, 900); return () => clearTimeout(x) } }, [phase, oppTyped.done])
  // ma réplique
  const meTyped = useTyped(pick?.text ?? '', phase === 'resultat-manche', 16)

  // annonce de manche
  useEffect(() => { if (phase === 'annonce') { const x = setTimeout(() => setPhase('adversaire'), 1500); return () => clearTimeout(x) } }, [phase, m])

  // compte à rebours
  useEffect(() => {
    if (phase !== 'reponse') return
    const start = Date.now()
    timer.current = setInterval(() => {
      const left = THINK_MS - (Date.now() - start)
      setTimeLeft(Math.max(0, left))
      if (left <= 0) { if (timer.current) clearInterval(timer.current); choose(null, 0) }
    }, 80)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [phase, m]) // eslint-disable-line react-hooks/exhaustive-deps

  function choose(p: Punch | null, ratio: number) {
    if (!cur || !me || !opp || phase !== 'reponse') return
    if (timer.current) clearInterval(timer.current)
    const r = scoreManche(p, cur, me, opp, ratio)
    setPick(p); setResults((x) => [...x, r]); setHit((h) => h + 1); setPhase('resultat-manche')
  }
  useEffect(() => {
    if (phase !== 'resultat-manche') return
    const x = setTimeout(() => { if (m + 1 >= MANCHES) setPhase('bilan'); else { setM(m + 1); setPick(null); setPhase('annonce') } }, 3600)
    return () => clearTimeout(x)
  }, [phase, m])

  if (!t || !duel) {
    return <div className="scr" style={{ display: 'grid', placeItems: 'center' }}><div className="pn" style={{ textAlign: 'center' }}><div className="h2">Aucun duel sélectionné</div><a href="Tournoi.dc.html" className="btn" style={{ marginTop: 16 }}>Retour au tournoi</a></div></div>
  }
  const A = entrantOf(t, duel.a), B = entrantOf(t, duel.b)
  const total = results.reduce((s, r) => ({ me: s.me + r.me, opp: s.opp + r.opp }), { me: 0, opp: 0 })
  const crowd = Math.max(6, Math.min(94, 50 + (total.me - total.opp) * 0.9))
  const last = results[results.length - 1]
  const pts = coachPoints(results)
  const speaking: 'me' | 'opp' | null = phase === 'adversaire' ? 'opp' : phase === 'resultat-manche' ? 'me' : null

  const restart = () => { setAttempt((n) => n + 1); setM(0); setPick(null); setResults([]); setPhase('annonce') }
  const validate = () => { if (me && run((s) => applyCoaching(s, duel.id, me.id, pts))) { say(`Préparation validée : ${pts >= 0 ? '+' : ''}${pts} points pour ${me.stageName}.`); go('Tournoi') } }

  const fighter = (a: typeof A, side: 'l' | 'r', who: 'me' | 'opp') => (
    <div key={`${a.id}-${who}`} className={side === 'l' ? 'an-slide-l' : 'an-slide-r'} style={{ position: 'absolute', top: 92, [side === 'l' ? 'left' : 'right']: 160, width: 300, textAlign: 'center' }}>
      <div className={speaking === who ? 'an-talk' : ''} style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <Avatar artist={a} size={200} style={{ boxShadow: `0 0 0 6px ${who === 'me' ? '#FF3D9A' : '#35D3F0'}, 0 20px 60px rgba(0,0,0,.6), 0 0 ${speaking === who ? 90 : 20}px ${who === 'me' ? 'rgba(255,61,154,.7)' : 'rgba(53,211,240,.7)'}`, fontSize: 72, transition: 'box-shadow .3s' }} />
        {phase === 'resultat-manche' && last && (
          <div key={hit} style={{ position: 'absolute', top: -10, left: '50%', marginLeft: -50, width: 100, textAlign: 'center', animation: 'floatUp 1.8s ease-out both' }}>
            <b className="disp" style={{ fontSize: 46, color: who === 'me' ? '#FF7DBB' : '#7BE6FA', textShadow: '0 2px 12px #000' }}>+{who === 'me' ? last.me : last.opp}</b>
          </div>
        )}
      </div>
      <div className="disp" style={{ fontSize: 28, marginTop: 10 }}>{a.stageName}</div>
      <div className="lbl">{countryOf(a)} · {a.genre}</div>
    </div>
  )

  return (
    <div className="scr" style={{ background: 'radial-gradient(900px 520px at 50% 105%,rgba(255,198,61,.35),transparent),radial-gradient(500px 360px at 12% 0%,rgba(255,61,154,.45),transparent),radial-gradient(500px 360px at 88% 0%,rgba(53,211,240,.4),transparent),linear-gradient(180deg,#120B24,#0C0719)' }}>
      {phase === 'resultat-manche' && last?.counter === 'perd' && <div key={'x' + hit} className="an-shake" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><div style={{ position: 'absolute', inset: 0, background: 'rgba(255,84,112,.35)', animation: 'flash .7s both' }} /></div>}
      {phase === 'resultat-manche' && last?.counter === 'gagne' && <div key={'y' + hit} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(61,220,151,.28)', animation: 'flash .7s both' }} />}

      <div style={{ position: 'absolute', left: 28, right: 28, top: 20, display: 'flex', alignItems: 'center', gap: 14, zIndex: 3 }}>
        <a href="Tournoi.dc.html" className="btn s sm">Quitter</a>
        <div><div className="lbl">{currentRound(t)!.name} · {t.name}</div><div className="disp" style={{ fontSize: 30, lineHeight: 1 }}>Battle de punchlines</div></div>
        <span className="sp" />
        {meId && Array.from({ length: MANCHES }, (_, i) => <span key={i} className={'tag ' + (i < results.length ? 'tg' : i === m ? 'te' : 'ti')}>Manche {i + 1}</span>)}
      </div>

      {/* choix du camp */}
      {phase === 'choix-camp' && (
        <div className="an-fade" style={{ position: 'absolute', inset: '90px 120px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
          <div className="h1" style={{ textAlign: 'center' }}>Quel candidat coachez-vous ?</div>
          <div className="mut" style={{ maxWidth: 760, textAlign: 'center' }}>Trois manches. Lisez la réplique adverse, puis choisissez la bonne riposte avant la fin du temps. Technique bat Impact, Impact bat Humour, Humour bat Technique. Le Flow ne craint rien.</div>
          <div style={{ display: 'flex', gap: 40, marginTop: 8 }}>
            {[A, B].map((a, i) => (
              <div key={a.id} className="pn lift" style={{ width: 340, textAlign: 'center', padding: 24, cursor: 'pointer' }} onClick={() => { setMeId(a.id); setAttempt(0); setM(0); setResults([]); setPick(null); setPhase('annonce') }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><Avatar artist={a} size={150} /></div>
                <div className="disp" style={{ fontSize: 30, marginTop: 10 }}>{a.stageName}</div>
                <div className="mut">{countryOf(a)} · {a.genre}</div>
                <div className="mut" style={{ fontSize: 13, marginTop: 6 }}>Écriture {a.skills.ecriture} · Charisme {a.skills.charisme}</div>
                <div className="btn" style={{ marginTop: 14, width: '100%' }}>Coacher {i === 0 ? 'ce candidat' : 'celui-ci'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {me && opp && phase !== 'choix-camp' && (
        <>
          {fighter(me, 'l', 'me')}
          {fighter(opp, 'r', 'opp')}
          <div className="disp" style={{ position: 'absolute', left: '50%', top: 150, marginLeft: -50, width: 100, textAlign: 'center', fontSize: 60, color: '#FFC63D', textShadow: '0 4px 20px rgba(255,198,61,.6)' }}>VS</div>

          {/* jauge de la salle */}
          <div style={{ position: 'absolute', left: 160, right: 160, top: 388, zIndex: 2 }}>
            <div style={{ display: 'flex', fontSize: 12, fontWeight: 700 }}><span style={{ color: '#FF7DBB' }}>{me.stageName}</span><span className="sp" /><span className="lbl">La salle</span><span className="sp" /><span style={{ color: '#7BE6FA' }}>{opp.stageName}</span></div>
            <div style={{ position: 'relative', height: 16, borderRadius: 8, background: 'linear-gradient(90deg,#35D3F0,#1A1030 50%,#35D3F0)', marginTop: 6, boxShadow: 'inset 0 0 0 1px var(--ln)' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${crowd}%`, borderRadius: 8, background: 'linear-gradient(90deg,#8B5CF6,#FF3D9A)', transition: 'width .9s cubic-bezier(.2,.8,.2,1)' }} />
              <div style={{ position: 'absolute', top: -6, left: `calc(${crowd}% - 14px)`, width: 28, height: 28, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 4px rgba(255,61,154,.5)', transition: 'left .9s cubic-bezier(.2,.8,.2,1)' }} />
            </div>
          </div>

          {/* bulle de dialogue */}
          <div style={{ position: 'absolute', left: 160, right: 160, top: 462, minHeight: 110, display: 'flex', justifyContent: phase === 'resultat-manche' ? 'flex-start' : 'flex-end' }}>
            {phase === 'annonce' && <div key={m} className="an-pop" style={{ margin: '0 auto', textAlign: 'center' }}><div className="lbl">Prépare-toi</div><div className="disp" style={{ fontSize: 72, lineHeight: 1 }}>Manche {m + 1}</div></div>}
            {(phase === 'adversaire' || phase === 'reponse') && cur && (
              <div className="bub an-rise" key={'o' + m} style={{ maxWidth: 760, fontSize: 24, boxShadow: 'inset 0 0 0 2px #35D3F0', background: 'rgba(28,18,54,.95)' }}>
                <span className="tag" style={{ marginRight: 10, background: 'rgba(53,211,240,.18)', color: STYLES[cur.opp.style].color }}>{STYLES[cur.opp.style].label}</span>
                <span className={oppTyped.done ? '' : 'cursor'}>{phase === 'reponse' ? cur.opp.text : oppTyped.shown}</span>
              </div>
            )}
            {phase === 'resultat-manche' && cur && (
              <div className="bub an-rise" key={'m' + m} style={{ maxWidth: 760, fontSize: 24, boxShadow: 'inset 0 0 0 2px #FF3D9A', background: 'rgba(60,20,70,.95)' }}>
                {pick ? (<><span className="tag" style={{ marginRight: 10, background: 'rgba(255,61,154,.18)', color: STYLES[pick.style].color }}>{STYLES[pick.style].label}</span><span className={meTyped.done ? '' : 'cursor'}>{meTyped.shown}</span></>) : <i>Le temps est écoulé : {me.stageName} reste sans voix.</i>}
              </div>
            )}
          </div>
          {phase === 'resultat-manche' && last && (
            <div key={'c' + hit} className="an-pop" style={{ position: 'absolute', left: '50%', top: 590, marginLeft: -170, width: 340, textAlign: 'center' }}>
              <span className={'tag ' + (last.counter === 'gagne' ? 'tg' : last.counter === 'perd' ? 'tr_' : 'ti')} style={{ height: 34, padding: '0 18px', fontSize: 16 }}>{last.counter === 'gagne' ? 'Contre parfait !' : last.counter === 'perd' ? 'Contré !' : 'Échange équilibré'}</span>
            </div>
          )}

          {/* choix des répliques */}
          {phase === 'reponse' && cur && (
            <div className="an-rise" style={{ position: 'absolute', left: 60, right: 60, bottom: 30 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="lbl">Votre riposte</div>
                <div className={'mt' + (timeLeft < 3000 ? ' rd' : ' gd')} style={{ flex: 1, height: 12 }}><i style={{ width: `${(timeLeft / THINK_MS) * 100}%`, transition: 'width .08s linear' }} /></div>
                <b className="disp" style={{ fontSize: 24, color: timeLeft < 3000 ? '#FF5470' : '#FFC63D', width: 40, textAlign: 'right' }}>{Math.ceil(timeLeft / 1000)}</b>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                {cur.options.map((o, i) => (
                  <button key={o.id} className="pn lift an-rise" style={{ textAlign: 'left', cursor: 'pointer', border: 0, color: 'inherit', font: 'inherit', minHeight: 150, animationDelay: `${i * 90}ms`, boxShadow: `inset 0 0 0 2px ${STYLES[o.style].color}` }} onClick={() => choose(o, timeLeft / THINK_MS)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="tag" style={{ background: 'rgba(255,255,255,.08)', color: STYLES[o.style].color }}>{STYLES[o.style].label}</span>
                      <span className="mut" style={{ fontSize: 12 }}>{STYLES[o.style].hint}</span>
                      <span className="sp" />
                      <span className="mut" style={{ fontSize: 12 }}>Puissance {o.power}</span>
                    </div>
                    <div style={{ fontSize: 19, lineHeight: 1.4, marginTop: 10 }}>{o.text}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* bilan */}
          {phase === 'bilan' && (
            <div className="an-fade" style={{ position: 'absolute', inset: 0, background: 'rgba(8,4,18,.82)', display: 'grid', placeItems: 'center', zIndex: 5 }}>
              <div className="pn cut an-pop" style={{ width: 620, textAlign: 'center', padding: 32 }}>
                <div className="lbl">Fin du battle</div>
                <div className="disp" style={{ fontSize: 48, lineHeight: 1.05 }}>{total.me > total.opp ? `${me.stageName} a dominé la salle` : total.me === total.opp ? 'Match nul' : `${opp.stageName} a pris le dessus`}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 40, margin: '22px 0' }}>
                  <div><div className="num" style={{ color: '#FF7DBB' }}>{total.me}</div><div className="mut" style={{ fontSize: 13 }}>{me.stageName}</div></div>
                  <div className="disp" style={{ fontSize: 36, alignSelf: 'center', color: 'var(--dim)' }}>–</div>
                  <div><div className="num" style={{ color: '#7BE6FA' }}>{total.opp}</div><div className="mut" style={{ fontSize: 13 }}>{opp.stageName}</div></div>
                </div>
                <span className={'tag ' + (pts >= 0 ? 'tg' : 'tr_')} style={{ height: 32, fontSize: 15, padding: '0 16px' }}>Préparation : {pts >= 0 ? '+' : ''}{pts} points au score du duel</span>
                <div className="mut" style={{ fontSize: 13, margin: '12px 0 20px' }}>Ces points s'ajoutent au score de {me.stageName} quand la phase sera jouée. Le talent et le hasard comptent aussi.</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn s" onClick={restart}>Rejouer</button>
                  <button className="btn" onClick={validate}>Valider la préparation</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
