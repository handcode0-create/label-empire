import { useEffect, useRef, useState, type ComponentType, type MouseEvent } from 'react'
import { SCREENS } from './screens/registry'
import { useGame } from './store/gameStore'
import Overlay from './components/Overlay'

const W = 1440, H = 900

/** Affiche la planche 1440×900 de la maquette, mise à l'échelle pour remplir la fenêtre. */
function useScale() {
  const [s, setS] = useState(1)
  useEffect(() => {
    const f = () => setS(Math.min(window.innerWidth / W, window.innerHeight / H))
    f(); window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return s
}

export default function App() {
  const [screen, setScreen] = useState<string>(() => location.hash.slice(1) || 'Main')
  const scale = useScale()
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

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      <div ref={ref} onClick={onClick} style={{ width: W * scale, height: H * scale }}>
        <div style={{ position: 'relative', width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <Screen />
          <Overlay />
          {error && <div role="alert" style={{ position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', color: '#FF5470', fontWeight: 700, fontSize: 16 }}>{error}</div>}
        </div>
      </div>
    </div>
  )
}
