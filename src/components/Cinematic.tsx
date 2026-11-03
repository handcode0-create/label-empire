import { speak, stopSpeaking } from '../voice'
import { useEffect, useMemo, useRef, useState } from 'react'
import { applyStoryEffect } from '../engine/storyEffects'
import { BG_FALLBACK, CHARS, SCENES, contextFor, fillText, type Bg, type ContractPaper, type Line } from '../data/story'
import { usd } from '../lib'
import { useGame } from '../store/gameStore'
import Avatar from './Avatar'
import { Trophy } from './Trophies'
import { acceptMeridianOffer } from '../engine/objectives'
import { careForTourArtist } from '../engine/tour'

const SKY: Record<Bg, string> = {
  ville: 'linear-gradient(180deg,#0B0720 0%,#2A1B4D 55%,#FF7A59 130%)',
  bureau: 'linear-gradient(180deg,#1C1236 0%,#3A2570 70%,#FF3D9A 160%)',
  scene: 'radial-gradient(900px 500px at 50% 110%,rgba(255,198,61,.55),transparent),linear-gradient(180deg,#0C0719,#2A1B4D)',
  nuit: 'linear-gradient(180deg,#05030F 0%,#1A1040 70%,#35D3F0 190%)',
  studio: 'linear-gradient(180deg,#0C0820,#2A1B4D)',
  arene: 'linear-gradient(180deg,#05030F,#2A1B4D)',
  finale: 'linear-gradient(180deg,#0C0719,#5A2A6B)',
  aeroport: 'linear-gradient(180deg,#1C1236,#FF7A59 160%)',
  plateau: 'linear-gradient(180deg,#0C0820,#2A1B4D)',
  redaction: 'linear-gradient(180deg,#1C1236 0%,#3A2570 70%,#FF3D9A 160%)',
  ceremonie: 'radial-gradient(900px 500px at 50% 110%,rgba(255,198,61,.55),transparent),linear-gradient(180deg,#0C0719,#2A1B4D)',
  agence: 'linear-gradient(180deg,#0B0720 0%,#2A1B4D 55%,#FF7A59 130%)',
  terrasse: 'linear-gradient(180deg,#05030F 0%,#1A1040 70%,#35D3F0 190%)',
  tour: 'linear-gradient(180deg,#0C0719,#5A2A6B)',
}

/** Décor illustré (public/scenes/<bg>.webp) ; si l'image manque, le décor dessiné prend le relais. */
function Backdrop({ bg }: { bg: Bg }) {
  // image dédiée, puis décor de secours (ex. « tour » → « finale »), puis décor dessiné
  const [level, setLevel] = useState(0)
  useEffect(() => setLevel(0), [bg])
  const chain: Bg[] = [bg, ...(BG_FALLBACK[bg] ? [BG_FALLBACK[bg] as Bg] : [])]
  if (level >= chain.length) return <Skyline bg={chain[chain.length - 1]} />
  return <img key={chain[level]} src={`/scenes/${chain[level]}.webp`} alt="" onError={() => setLevel((n) => n + 1)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'kenburns 24s ease-in-out infinite alternate' }} />
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
  const run = useGame((s) => s.run)
  const custom = useGame((s) => s.customScene)
  const scene = custom && custom.id === id ? custom : SCENES.find((s) => s.id === id)
  const ctx = useMemo(() => (game ? contextFor(game) : null), [game])
  const [queue, setQueue] = useState<Line[]>([])
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState(0)
  const [titleDone, setTitleDone] = useState(false)
  const [picked, setPicked] = useState(false)
  const slots = useRef<{ left?: string; right?: string }>({})
  const founderLabel = useGame((st) => st.game?.label)
  const founderKey = founderLabel?.founderAvatar ?? (founderLabel?.founderLook === 'm' ? 'story-joueur-m' : 'story-joueur')
  const founderPhoto = founderLabel?.photo

  useEffect(() => { if (scene) { setQueue(scene.custom || scene.paper !== undefined || scene.cast ? [...scene.lines] : [...scene.lines, { who: 'narrateur', text: 'Objectif · {goal}' }]); setI(0); setTyped(0); setPicked(false); setTitleDone(!scene.title); slots.current = {} } }, [scene?.id]) // eslint-disable-line react-hooks/exhaustive-deps
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
  // Voix : lit chaque réplique avec la voix du personnage, et se tait à la fin de la scène.
  const voiceOn = useGame((st) => st.options.voice)
  useEffect(() => {
    if (!voiceOn || !titleDone || !line || !text) return
    speak(text, { who: line.who, look: founderLabel?.founderLook })
  }, [i, titleDone, text, voiceOn, scene?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopSpeaking(), [scene?.id])
  const advance = () => {
    if (!titleDone) { setTitleDone(true); return }
    if (!line) return
    if (!done) { setTyped(text.length); return }
    if (line.choices && !picked) return
    if (i + 1 >= queue.length) end()
    else { setI(i + 1); setPicked(false) }
  }
  const choose = (reply: Line[], effect?: string) => {
    if (effect === 'accept-meridian') run(acceptMeridianOffer)
    if (effect === 'repos' || effect === 'prime') run((s) => careForTourArtist(s, effect))
    if (effect === 'dossier-publier' || effect === 'dossier-negocier' || effect === 'dossier-attendre' || effect === 'roster-diner' || effect === 'awa-exclusif') run((s) => applyStoryEffect(s, effect))
    setQueue([...queue.slice(0, i + 1), ...reply, ...queue.slice(i + 1)]); setPicked(true); setI(i + 1); setPicked(false) }

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
  const cast = scene.cast
  const name = line.who === 'joueur' ? ctx.founder : line.who === 'artiste' && cast ? cast.stageName : speaker?.name
  const stampAt = queue.findIndex((l) => l.stamp)
  const showPaper = !!scene.paper && stampAt >= 0 && i >= stampAt

  return (
    <div onClick={advance} role="dialog" aria-label="Scène" style={{ position: 'absolute', inset: 0, zIndex: 80, background: SKY[scene.bg], overflow: 'hidden', cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#F4F0FF' }}>
      <div className="an-fade" style={{ position: 'absolute', inset: 0 }}><Backdrop bg={scene.bg} /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.55))' }} />
      {/* personnages */}
      {shown.map(({ side, who }) => {
        const c = CHARS[who as keyof typeof CHARS]
        const on = line.who === who
        const nm = who === 'joueur' ? ctx.founder : who === 'artiste' && cast ? cast.stageName : c.name
        return (
          <div key={who + side} className={side === 'left' ? 'an-slide-l' : 'an-slide-r'} style={{ position: 'absolute', bottom: 300, [side]: 150, width: 320, textAlign: 'center', transition: 'transform .3s, filter .3s, opacity .3s', transform: on ? 'scale(1.08)' : 'scale(.94)', filter: on ? 'none' : 'brightness(.55) saturate(.7)', opacity: titleDone ? 1 : 0 }}>
            <div className={on && !done ? 'an-talk' : ''} style={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar {...(who === 'artiste' && cast ? { artist: cast } : { keyName: who === 'joueur' ? founderKey : c.portrait, gradient: c.gradient, name: nm })} src={who === 'joueur' ? founderPhoto : undefined} size={230} style={{ boxShadow: `0 0 0 6px rgba(255,255,255,.9), 0 24px 60px rgba(0,0,0,.6), 0 0 90px ${on ? 'rgba(255,61,154,.5)' : 'transparent'}`, fontSize: 90 }} />
            </div>
            <div style={{ display: 'inline-block', marginTop: 14, padding: '6px 16px 8px', borderRadius: 14, background: 'rgba(12,8,32,.72)', backdropFilter: 'blur(6px)' }}>
              <div className="disp" style={{ fontSize: 26 }}>{nm}</div>
              <div className="lbl">{c.role}</div>
            </div>
          </div>
        )
      })}
      {line.trophy && (
        <div key={i} data-testid="trophy-card" style={{ position: 'absolute', left: '50%', top: 120, width: 360, marginLeft: -180, zIndex: 2, textAlign: 'center', animation: 'trophyIn .7s cubic-bezier(.2,.9,.3,1.2) both' }}>
          <div style={{ display: 'inline-block', filter: line.trophy.mine ? 'drop-shadow(0 0 40px rgba(255,198,61,.7))' : 'none' }}><Trophy kind={line.trophy.kind} size={190} metal={line.trophy.mine ? 'or' : 'argent'} /></div>
          <div style={{ display: 'inline-block', fontWeight: 800, fontSize: 28, marginTop: 8, padding: '6px 20px', borderRadius: 14, background: 'rgba(12,7,25,.92)', boxShadow: 'inset 0 0 0 2px #FFC63D' }}>{line.trophy.winner}</div>
          {line.trophy.mine && <div className="tag tg" style={{ marginTop: 6 }}>Remporté par votre label</div>}
        </div>
      )}
      {showPaper && scene.paper && <ContractStamp p={scene.paper} fresh={i === stampAt} />}
      {/* bandes cinéma */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, background: '#05030F', animation: 'bars .8s ease-out both', height: 84 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 200, background: 'linear-gradient(0deg,#05030F 70%,transparent)' }} />
      <button onClick={(e) => { e.stopPropagation(); end() }} className="btn s sm" style={{ position: 'absolute', right: 24, top: 22, zIndex: 3 }}>Passer la scène</button>
      <button onClick={(e) => { e.stopPropagation(); const st = useGame.getState(); st.setOption('voice', !st.options.voice); if (st.options.voice) stopSpeaking() }} className="btn s sm" aria-pressed={voiceOn} title="Lecture à voix haute" style={{ position: 'absolute', right: 230, top: 22, zIndex: 3 }}>{voiceOn ? '🔊 Voix activée' : '🔈 Voix désactivée'}</button>
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
              {line.choices.map((c) => <button key={c.label} className="btn sm" onClick={(e) => { e.stopPropagation(); choose(c.reply, c.effect) }}>{ctx ? fillText(c.label, ctx) : c.label}</button>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Contrat posé au centre : la signature se trace, puis le tampon s'abat dessus. */
function ContractStamp({ p, fresh }: { p: ContractPaper; fresh: boolean }) {
  const part = Math.round((1 - p.royalty) * 100)
  const dur = p.weeks % 52 === 0 ? `${p.weeks / 52} an${p.weeks > 52 ? 's' : ''}` : `${p.weeks} semaines`
  const d = fresh ? 1 : 0
  return (
    <div data-testid="contract-paper" style={{ position: 'absolute', left: '50%', top: 118, width: 430, marginLeft: -215, zIndex: 2, padding: '26px 30px 22px', borderRadius: 6, background: 'linear-gradient(180deg,#FBF6E8,#EFE6CC)', color: '#2A1B4D', boxShadow: '0 30px 80px rgba(0,0,0,.65)', transform: 'rotate(-1.5deg)', overflow: 'hidden' }}>
      <div className="disp" style={{ fontSize: 26, letterSpacing: '.04em', textAlign: 'center' }}>{p.kind === 'sign' ? 'CONTRAT D’ARTISTE' : 'AVENANT AU CONTRAT'}</div>
      <div style={{ textAlign: 'center', fontSize: 13, opacity: .7, marginTop: 2 }}>{p.label}</div>
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 18px', fontSize: 15, lineHeight: 1.35 }}>
        <span>Artiste</span><b style={{ textAlign: 'right' }}>{p.artist}</b>
        <span>{p.kind === 'sign' ? 'Avance' : 'Prime'}</span><b style={{ textAlign: 'right' }}>{usd(p.advance)}</b>
        <span>Part du label</span><b style={{ textAlign: 'right' }}>{part} %</b>
        <span>Durée</span><b style={{ textAlign: 'right' }}>{dur}</b>
        <span>Territoires</span><b style={{ textAlign: 'right' }}>{p.scope}</b>
      </div>
      <div style={{ position: 'relative', height: 112, marginTop: 14, borderTop: '1px dashed rgba(42,27,77,.35)' }}>
        <span style={{ position: 'absolute', left: 0, bottom: 4, fontSize: 12, opacity: .6 }}>Signature de l’artiste</span>
        <span style={{ position: 'absolute', right: 0, bottom: 4, fontSize: 12, opacity: .6 }}>{p.founder}, pour le label</span>
        <svg viewBox="0 0 220 70" style={{ position: 'absolute', left: 6, top: 8, width: 230, height: 76 }}>
          <path d="M6 52 C20 8, 34 6, 38 30 S 50 62, 66 30 S 84 12, 96 40 S 120 58, 132 26 S 150 22, 160 44 L 212 40" fill="none" stroke="#1B2A7A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d} style={fresh ? { animation: 'sign 1.4s .3s ease-out forwards' } : { strokeDashoffset: 0 }} />
        </svg>
        <div data-testid="stamp" className={fresh ? 'stamp-slam' : ''} style={{ position: 'absolute', right: 0, top: 6, width: 178, height: 96, display: 'grid', placeItems: 'center', border: '5px double #C21E4F', borderRadius: 12, color: '#C21E4F', transform: 'rotate(-12deg)', textAlign: 'center', ...(fresh ? { animationDelay: '1.7s' } : {}) }}>
          <div><div className="disp" style={{ fontSize: 40, lineHeight: 1 }}>SIGNÉ</div><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.2em', marginTop: 4 }}>APPROUVÉ</div></div>
        </div>
      </div>
    </div>
  )
}
