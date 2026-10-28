import { useEffect, useRef, useState, type ComponentType, type MouseEvent } from 'react'
import { SCREENS } from './screens/registry'
import { useGame } from './store/gameStore'
import Overlay from './components/Overlay'

const W = 1440, H = 900

/** Affiche la planche 1440×900 de la maquette, mise à l'échelle pour remplir la fenêtre. */
function useScale() {
  const [v, setV] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const f = () => setV({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  const scale = Math.min(v.w / W, v.h / H)
  return { scale, vw: v.w, vh: v.h }
}

const toggleFullscreen = () => {
  try {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen()
  } catch { /* plein écran indisponible */ }
}

export default function App() {
  const [screen, setScreen] = useState<string>(() => location.hash.slice(1) || 'Main')
  const { scale, vw, vh } = useScale()
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.key === 'f' || e.key === 'F') && !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) toggleFullscreen() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
  const ref = useRef<HTMLDivElement>(null)
  const game = useGame((s) => s.game)
  const needsGame = !['Main', 'Menu', 'NouvellePartie', 'NouvellePartie2'].includes(screen)
  // Un écran de jeu sans partie en mémoire : on recharge la sauvegarde, sinon retour au menu.
  const missing = needsGame && !game
  useEffect(() => {
    if (!missing) return
    if (!useGame.getState().load()) setScreen('Menu')
  }, [missing])
  const Screen: ComponentType = missing ? SCREENS.Menu : (SCREENS[screen] ?? SCREENS.Main)

  const [error, setError] = useState<string | null>(null)
  useEffect(() => { location.hash = screen }, [screen])
  useEffect(() => {
    const h = () => { const n = location.hash.slice(1); if (SCREENS[n]) setScreen(n) }
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented) return // une action a refusé la navigation
    const a = (e.target as HTMLElement).closest('a')
    const href = a?.getAttribute('href')
    if (!a || !href) return
    e.preventDefault()
    const m = href.match(/^([A-Za-z0-9]+)\.dc\.html$/)
    if (!m || !SCREENS[m[1]]) return
    const target = m[1]
    const store = useGame.getState()
    if (screen === 'NouvellePartie' && target === 'NouvellePartie2') {
      const c = store.config
      if (!c.labelName.trim() || !c.founderName.trim()) { setError('Renseignez le nom du label et le nom du fondateur.'); return }
    }
    if (screen === 'NouvellePartie2' && target === 'Hub') {
      const errs = store.errors()
      if (errs.length) { setError(errs.join(' · ')); return }
      store.start()
    }
    setError(null)
    setScreen(target)
  }

  // Le décor remplit toute la fenêtre ; la planche 1440×900 est centrée et ses bords se fondent dans le décor.
  const extraX = vw - W * scale, extraY = vh - H * scale
  const fade = 'linear-gradient(90deg,transparent,#000 56px,#000 calc(100% - 56px),transparent)'
  const fadeY = 'linear-gradient(180deg,transparent,#000 40px,#000 calc(100% - 40px),transparent)'
  const dockless = ['Main', 'Menu', 'NouvellePartie', 'NouvellePartie2', 'Fin', 'Battle', 'Rapport'].includes(missing ? 'Menu' : screen)
  const mask = dockless ? [extraX > 2 ? fade : null, extraY > 2 ? fadeY : null].filter(Boolean).join(',') : ''
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'grid', placeItems: 'center', position: 'relative', background: 'radial-gradient(900px 600px at 82% -8%,rgba(139,92,246,.30),transparent 60%),radial-gradient(700px 520px at 0% 100%,rgba(255,61,154,.15),transparent 60%),#120B24' }}>
      <div ref={ref} onClick={onClick} style={{ width: W * scale, height: H * scale, WebkitMaskImage: mask || undefined, maskImage: mask || undefined, WebkitMaskComposite: 'source-in', maskComposite: 'intersect' }}>
        <div style={{ position: 'relative', width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <Screen />
          {error && <div role="alert" style={{ position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', color: '#FF5470', fontWeight: 700, fontSize: 16 }}>{error}</div>}
        </div>
      </div>
      {/* Scènes et fenêtres : couche plein écran, en unités de la planche. */}
      <div style={{ position: 'fixed', left: 0, top: 0, width: vw / scale, height: vh / scale, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', display: 'contents' }}><Overlay /></div>
      </div>
      <button type="button" onClick={toggleFullscreen} aria-label="Plein écran (F)" title="Plein écran (F)" style={{ position: 'fixed', right: 10, bottom: 10, width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(12,7,25,.6)', color: '#F4F0FF', cursor: 'pointer', fontSize: 16, zIndex: 50 }}>⛶</button>
    </div>
  )
}
