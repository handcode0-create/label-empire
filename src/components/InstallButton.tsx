import { useEffect, useState } from 'react'
import { useGame } from '../store/gameStore'

interface InstallPrompt extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
let deferred: InstallPrompt | null = null
const listeners = new Set<() => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as InstallPrompt; listeners.forEach((f) => f()) })
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach((f) => f()) })
}
const standalone = () => typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true)

/** Bouton « Installer sur mon ordinateur » : propose l'installation du navigateur quand elle est disponible, sinon explique comment faire. */
export default function InstallButton({ className = 'btn s sm', style }: { className?: string; style?: React.CSSProperties }) {
  const [, tick] = useState(0)
  const say = useGame((s) => s.say)
  useEffect(() => { const f = () => tick((n) => n + 1); listeners.add(f); return () => { listeners.delete(f) } }, [])
  if (standalone()) return <span className="tag tg">Application installée</span>
  const click = async () => {
    if (!deferred) { say("Dans Chrome ou Edge : menu ⋮ puis « Installer Label Empire » (ou l'icône d'installation dans la barre d'adresse). Sur Safari : Partager puis « Sur l'écran d'accueil ».", 'ok'); return }
    const p = deferred
    deferred = null
    await p.prompt()
    const r = await p.userChoice
    say(r.outcome === 'accepted' ? 'Label Empire s’installe sur votre ordinateur.' : 'Installation annulée.', r.outcome === 'accepted' ? 'ok' : 'err')
    tick((n) => n + 1)
  }
  return <button type="button" className={className} style={{ cursor: 'pointer', ...style }} onClick={click}>Installer l’application</button>
}
