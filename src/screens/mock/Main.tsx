import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../store/gameStore'

const STEPS = ['Chargement des marchés du monde…', 'Calibrage des classements mondiaux…', 'Recrutement des talents…', 'Allumage des projecteurs…', 'Tout est prêt.']
const TIPS = ['Un titre qui perce dans trois pays voisins déclenche un effet de région.', 'Un featuring avec un artiste du vivier coûte un cachet mais élargit votre audience.', 'Meridian Group surveille vos chiffres : ne laissez pas la trésorerie passer sous zéro.', 'Les campagnes média multiplient les écoutes… si le genre colle au support.', 'Un EP bien construit fait grimper la réputation plus vite que trois singles isolés.']

export default function Main() {
  const go = useGame((s) => s.go)
  const [pct, setPct] = useState(0)
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])
  useEffect(() => {
    const t0 = performance.now(); let raf = 0
    const tick = (t: number) => { const x = Math.min(1, (t - t0) / 3600); setPct(Math.round((1 - Math.pow(1 - x, 2.2)) * 100)); if (x < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const ready = pct >= 100
  useEffect(() => {
    if (!ready) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('Menu') } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [ready, go])
  const sparks = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ x: (i * 67) % 100, d: 5 + ((i * 13) % 7), delay: (i * 0.37) % 6, c: ['#FF3D9A', '#35D3F0', '#FFC63D', '#8B5CF6'][i % 4], s: 4 + (i % 4) * 2 })), [])
  const title = 'LABEL EMPIRE'
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor(pct / 25))]
  return (
    <div className="scr" onClick={() => ready && go('Menu')} style={{cursor: ready ? 'pointer' : 'default'}}>
      <img src="/scenes/scene.webp" alt="" aria-hidden="true" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, animation: 'kenburns 22s ease-in-out infinite alternate'}} onError={(e) => { e.currentTarget.style.display = 'none' }} />
      {sparks.map((p, i) => <i key={i} className="sp-spark" style={{position: 'absolute', left: p.x + '%', bottom: 0, width: p.s, height: p.s, borderRadius: '50%', background: p.c, boxShadow: `0 0 12px ${p.c}`, opacity: 0, animation: `spark ${p.d}s ease-out ${p.delay}s infinite`}} />)}
      <div className="map" style={{position: 'absolute', left: 120, top: 160, width: 1200, height: 600, opacity: '0.55'}} />
      <svg width={1440} height={900} viewBox="0 0 1440 900" style={{position: 'absolute', left: 0, top: 0}} aria-hidden="true">
        <defs><linearGradient id="arc" x1={0} x2={1}><stop offset={0} stopColor="#FF3D9A" /><stop offset={1} stopColor="#35D3F0" /></linearGradient></defs>
        <g fill="none" stroke="url(#arc)" strokeWidth={2.5} strokeDasharray="400" strokeLinecap="round" style={{animation: 'drawArc 2.2s ease-out .6s both'}}>
          <path d="M707 443 Q590 330 473 324" /><path d="M707 443 Q717 360 727 297" /><path d="M707 443 Q760 500 814 546" />
          <path d="M727 297 Q940 250 1144 335" /><path d="M707 443 Q640 520 565 539" /><path d="M814 546 Q1020 470 1223 573" />
        </g>
        <g fill="#FFC63D" style={{animation: 'fadeIn 1s ease 1.2s both'}}>
          <circle cx={707} cy={443} r={7} style={{transformOrigin: "707px 443px", animation: "dotPulse 2.4s ease-in-out 0.0s infinite"}} /><circle cx={727} cy={297} r={5} style={{transformOrigin: "727px 297px", animation: "dotPulse 2.4s ease-in-out 1.8s infinite"}} /><circle cx={473} cy={324} r={5} style={{transformOrigin: "473px 324px", animation: "dotPulse 2.4s ease-in-out 1.2s infinite"}} /><circle cx={565} cy={539} r={5} style={{transformOrigin: "565px 539px", animation: "dotPulse 2.4s ease-in-out 1.5s infinite"}} /><circle cx={1144} cy={335} r={5} style={{transformOrigin: "1144px 335px", animation: "dotPulse 2.4s ease-in-out 0.9s infinite"}} /><circle cx={814} cy={546} r={5} style={{transformOrigin: "814px 546px", animation: "dotPulse 2.4s ease-in-out 0.6s infinite"}} /><circle cx={1223} cy={573} r={5} style={{transformOrigin: "1223px 573px", animation: "dotPulse 2.4s ease-in-out 1.5s infinite"}} />
        </g>
      </svg>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(600px 360px at 50% 46%, rgba(18,11,36,0.92), rgba(18,11,36,0.35) 70%, transparent)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div className="lg" style={{width: 84, height: 84, fontSize: 34, margin: 0, animation: 'logoSpin .9s cubic-bezier(.2,.9,.3,1.2) .1s both, pulseGlow 2.4s ease-in-out 1.2s infinite'}}>LE</div>
        <div className="disp sp-title" style={{fontSize: 132, lineHeight: '0.95', letterSpacing: '0.08em', filter: 'drop-shadow(0 0 30px rgba(255,61,154,0.5))', display: 'flex'}} aria-label={title}>
          {title.split('').map((ch, i) => <span key={i} aria-hidden="true" style={{display: 'inline-block', whiteSpace: 'pre', animation: `titleIn .7s cubic-bezier(.2,.8,.2,1) ${0.35 + i * 0.07}s both`}}>{ch}</span>)}
        </div>
        <div className="lbl" style={{fontSize: 16, letterSpacing: '0.32em', color: '#B3A6D9', animation: 'riseIn .8s ease 1.5s both'}}>Dirigez un label. Conquérez le monde.</div>
      </div>
      <div style={{position: 'absolute', left: 520, right: 520, top: 640, display: 'flex', flexDirection: 'column', gap: 12}}>
        <div className="mt" style={{height: 10}}><i style={{width: pct + '%', transition: 'width .1s linear'}} /></div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#B3A6D9'}}><span>{step}</span><span style={{fontWeight: 700, color: '#F4F0FF'}}>{pct} %</span></div>
      </div>
      <a href="Menu.dc.html" className="btn sm" onClick={(e) => { e.preventDefault(); if (ready) go('Menu') }} aria-disabled={!ready} style={{position: 'absolute', left: 580, width: 280, top: 736, whiteSpace: 'nowrap', opacity: ready ? 1 : 0, pointerEvents: ready ? 'auto' : 'none', animation: ready ? 'popIn .5s ease both, pulseGlow 1.8s ease-in-out .5s infinite' : 'none'}}>Appuyer pour entrer</a>
      <div style={{position: 'absolute', left: 40, bottom: 32, maxWidth: 560, fontSize: 14, color: '#B3A6D9', animation: 'fadeIn 1s ease 1.8s both'}}><span className="lbl" style={{marginRight: 10}}>Astuce</span>{tip}</div>
      <div style={{position: 'absolute', right: 40, bottom: 32, fontSize: 13, color: '#9C90CC'}}>Label Empire · Les artistes et labels sont fictifs</div>
    </div>
  )
}
