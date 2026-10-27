import { useEffect, useMemo, useRef, useState } from 'react'
import { CHARS, SCENES, contextFor, fillText, type Bg, type Line } from '../data/story'
import { useGame } from '../store/gameStore'
import Avatar from './Avatar'

const SKY: Record<Bg, string> = {
  ville: 'linear-gradient(180deg,#0B0720 0%,#2A1B4D 55%,#FF7A59 130%)',
  bureau: 'linear-gradient(180deg,#1C1236 0%,#3A2570 70%,#FF3D9A 160%)',
  scene: 'radial-gradient(900px 500px at 50% 110%,rgba(255,198,61,.55),transparent),linear-gradient(180deg,#0C0719,#2A1B4D)',
  nuit: 'linear-gradient(180deg,#05030F 0%,#1A1040 70%,#35D3F0 190%)',
  studio: 'linear-gradient(180deg,#0C0820,#2A1B4D)',
  arene: 'linear-gradient(180deg,#05030F,#2A1B4D)',
  finale: 'linear-gradient(180deg,#0C0719,#5A2A6B)',
  aeroport: 'linear-gradient(180deg,#1C1236,#FF7A59 160%)',
}

/** Décor illustré (public/scenes/<bg>.webp) ; si l'image manque, le décor dessiné prend le relais. */
function Backdrop({ bg }: { bg: Bg }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [bg])
  if (failed || bg === 'scene') return <Skyline bg={bg} />
  return <img src={`/scenes/${bg}.webp`} alt="" onError={() => setFailed(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'kenburns 24s ease-in-out infinite alternate' }} />
}

function Skyline({ bg }: { bg: Bg }) {
  const bars = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x: i * 56, h: 120 + ((i * 53) % 190), w: 44 + ((i * 17) % 22) })), [])
  if (bg === 'scene') {
    return (
      <>
        {[18, 38, 62, 82].map((l, i) => <div key={i} style={{ position: 'absolute', left: `${l}%`, top: -40, width: 220, height: 640, transformOrigin: '50% 0', background: `linear-gradient(180deg,${['rgba(255,61,154,.55)', 'rgba(53,211,240,.45)', 'rgba(255,198,61,.5)', 'rgba(139,92,246,.55)'][i]},transparent 85%)`, clipPath: 'polygon(42% 0,58% 0,100% 100%,0 100%)', animation: `spotlight ${3 + i * 0.7}s ease-in-out ${i * 0.4}s infinite` }} />)}
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 220 }}>
          <path d={'M0 220 L0 150 ' + Array.from({ length: 48 }, (_, i) => `Q${i * 30 + 15} ${110 + ((i * 37) % 60)} ${i * 30 + 30} 150`).join(' ') + ' L1440 220 Z'} fill="#0A0616" />
        </svg>
      </>
    )
  }
  return (
    <svg viewBox="0 0 1440 460" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 460 }}>
      {bg === 'ville' || bg === 'nuit' ? <circle cx={1180} cy={110} r={46} fill={bg === 'nuit' ? '#DDEBFF' : '#FFE9B8'} opacity={0.9} /> : null}
      {bars.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={460 - b.h} width={b.w} height={b.h} fill={i % 2 ? '#120B24' : '#1A1033'} />
          {Array.from({ length: Math.floor(b.h / 34) }, (_, r) => (r * 7 + i * 3) % 5 < 2 ? <rect key={r} x={b.x + 8 + ((r + i) % 2) * 16} y={460 - b.h + 12 + r * 34} width={8} height={12} fill="#FFC63D" opacity={0.75} /> : null)}
        </g>
      ))}
    </svg>
  )
}

/** Scène cinématique : décor animé, personnages, dialogues tapés au clavier, choix de réponses. */
export default function Cinematic() {
  const id = useGame((s) => s.scene)
  const game = useGame((s) => s.game)
  const end = useGame((s) => s.endScene)
  const scene = SCENES.find((s) => s.id === id)
  const ctx = useMemo(() => (game ? contextFor(game) : null), [game])
  const [queue, setQueue] = useState<Line[]>([])
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState(0)
  const [titleDone, setTitleDone] = useState(false)
  const [picked, setPicked] = useState(false)
  const slots = useRef<{ left?: string; right?: string }>({})
  const founderLabel = useGame((st) => st.game?.label)
  const founderKey = founderLabel?.founderLook === 'm' ? 'story-joueur-m' : 'story-joueur'
  const founderPhoto = founderLabel?.photo

  useEffect(() => { if (scene) { setQueue(scene.lines); setI(0); setTyped(0); setPicked(false); setTitleDone(!scene.title); slots.current = {} } }, [scene?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!scene?.title) return; const t = setTimeout(() => setTitleDone(true), 2300); return () => clearTimeout(t) }, [scene?.id, scene?.title])

  const line = queue[i]
  const text = line && ctx ? fillText(line.text, ctx) : ''
  useEffect(() => {
    if (!titleDone || !line) return
    setTyped(0)
    const t = setInterval(() => setTyped((n) => { if (n >= text.length) { clearInterval(t); return n } return n + 1 }), 24)
    return () => clearInterval(t)
  }, [i, titleDone, text]) // eslint-disable-line react-hooks/exhaustive-deps

  const done = typed >= text.length
  const advance = () => {
    if (!titleDone) { setTitleDone(true); return }
    if (!line) return
    if (!done) { setTyped(text.length); return }
    if (line.choices && !picked) return
    if (i + 1 >= queue.length) end()
    else { setI(i + 1); setPicked(false) }
  }
  const choose = (reply: Line[]) => { setQueue([...queue.slice(0, i + 1), ...reply, ...queue.slice(i + 1)]); setPicked(true); setI(i + 1); setPicked(false) }

  useEffect(() => {
    if (!scene) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') end()
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  if (!scene || !ctx || !line) return null
  // placement des personnages : chacun garde son côté, le dernier qui parle passe devant
  if (line.who !== 'narrateur') {
    const side = line.side ?? CHARS[line.who].side
    const other = side === 'left' ? 'right' : 'left'
    if (slots.current[other] === line.who) slots.current[other] = undefined
    slots.current[side] = line.who
  }
  const shown = (['left', 'right'] as const).map((s) => ({ side: s, who: slots.current[s] })).filter((x): x is { side: 'left' | 'right'; who: string } => !!x.who)
  const speaker = CHARS[line.who as keyof typeof CHARS]
  const name = line.who === 'joueur' ? ctx.founder : speaker?.name

  return (
    <div onClick={advance} role="dialog" aria-label="Scène" style={{ position: 'absolute', inset: 0, zIndex: 80, background: SKY[scene.bg], overflow: 'hidden', cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#F4F0FF' }}>
      <div className="an-fade" style={{ position: 'absolute', inset: 0 }}><Backdrop bg={scene.bg} /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.55))' }} />
      {/* personnages */}
      {shown.map(({ side, who }) => {
        const c = CHARS[who as keyof typeof CHARS]
        const on = line.who === who
        const nm = who === 'joueur' ? ctx.founder : c.name
        return (
          <div key={who + side} className={side === 'left' ? 'an-slide-l' : 'an-slide-r'} style={{ position: 'absolute', bottom: 300, [side]: 150, width: 320, textAlign: 'center', transition: 'transform .3s, filter .3s, opacity .3s', transform: on ? 'scale(1.08)' : 'scale(.94)', filter: on ? 'none' : 'brightness(.55) saturate(.7)', opacity: titleDone ? 1 : 0 }}>
            <div className={on && !done ? 'an-talk' : ''} style={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar keyName={who === 'joueur' ? founderKey : c.portrait} src={who === 'joueur' ? founderPhoto : undefined} name={nm} gradient={c.gradient} size={230} style={{ boxShadow: `0 0 0 6px rgba(255,255,255,.9), 0 24px 60px rgba(0,0,0,.6), 0 0 90px ${on ? 'rgba(255,61,154,.5)' : 'transparent'}`, fontSize: 90 }} />
            </div>
            <div style={{ display: 'inline-block', marginTop: 14, padding: '6px 16px 8px', borderRadius: 14, background: 'rgba(12,8,32,.72)', backdropFilter: 'blur(6px)' }}>
              <div className="disp" style={{ fontSize: 26 }}>{nm}</div>
              <div className="lbl">{c.role}</div>
            </div>
          </div>
        )
      })}
      {/* bandes cinéma */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, background: '#05030F', animation: 'bars .8s ease-out both', height: 84 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 200, background: 'linear-gradient(0deg,#05030F 70%,transparent)' }} />
      <button onClick={(e) => { e.stopPropagation(); end() }} className="btn s sm" style={{ position: 'absolute', right: 24, top: 22, zIndex: 3 }}>Passer la scène</button>
      <div className="lbl" style={{ position: 'absolute', left: 28, top: 32, zIndex: 3 }}>{scene.title ?? ''}</div>
      {/* titre d'ouverture */}
      {!titleDone && (
        <div className="an-fade" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(5,3,15,.82)', zIndex: 4 }}>
          <div className="an-rise" style={{ textAlign: 'center' }}><div className="lbl">{ctx.label}</div><div className="disp" style={{ fontSize: 64, lineHeight: 1.05, marginTop: 8 }}>{scene.title}</div></div>
        </div>
      )}
      {/* dialogue */}
      {titleDone && (
        <div className="an-rise" key={i} style={{ position: 'absolute', left: 120, right: 120, bottom: 36, zIndex: 3 }}>
          {name && <div className="disp" style={{ display: 'inline-block', padding: '4px 18px 2px', fontSize: 24, color: '#1A0B2E', background: 'linear-gradient(180deg,#FFD66B,#FFB020)', clipPath: 'polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%)' }}>{name}</div>}
          <div className="pn" style={{ marginTop: name ? -2 : 0, padding: '20px 28px', minHeight: 112, fontSize: 24, lineHeight: 1.4, background: 'linear-gradient(180deg,rgba(42,27,77,.96),rgba(20,11,40,.98))', fontStyle: line.who === 'narrateur' ? 'italic' : 'normal' }}>
            <span className={done ? '' : 'cursor'}>{text.slice(0, typed)}</span>
            {done && !line.choices && <span className="an-pulse" style={{ position: 'absolute', right: 22, bottom: 14, fontSize: 14, color: 'var(--gold)', borderRadius: 8, padding: '2px 8px' }}>{i + 1 >= queue.length ? 'Terminer ▶' : 'Suite ▼'}</span>}
          </div>
          {done && line.choices && (
            <div className="an-rise" style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
              {line.choices.map((c) => <button key={c.label} className="btn sm" onClick={(e) => { e.stopPropagation(); choose(c.reply) }}>{c.label}</button>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
