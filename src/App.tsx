import { useEffect, useRef, useState, type ComponentType, type MouseEvent } from 'react'
import { SCREENS } from './screens/registry'

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
  const Screen: ComponentType = SCREENS[screen] ?? SCREENS.Main

  useEffect(() => { location.hash = screen }, [screen])

  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a')
    const href = a?.getAttribute('href')
    if (!a || !href) return
    e.preventDefault()
    const m = href.match(/^([A-Za-z0-9]+)\.dc\.html$/)
    if (m && SCREENS[m[1]]) setScreen(m[1])
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      <div ref={ref} onClick={onClick} style={{ width: W * scale, height: H * scale }}>
        <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <Screen />
        </div>
      </div>
    </div>
  )
}
