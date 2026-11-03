import { useEffect, useRef, useState } from 'react'
import { CertDisc, discLabel } from './Trophies'
import { ceremonyScene } from '../data/story'
import { nextStoryScene } from '../data/story'
import { useGame } from '../store/gameStore'
import Cinematic from './Cinematic'

/** Notifications (toast) et fenêtres modales (Options, Crédits). */
export default function Overlay() {
  const toast = useGame((s) => s.toast)
  const modal = useGame((s) => s.modal)
  const setModal = useGame((s) => s.setModal)
  const options = useGame((s) => s.options)
  const setOption = useGame((s) => s.setOption)
  const game = useGame((s) => s.game)
  const scene = useGame((s) => s.scene)
  const playScene = useGame((s) => s.playScene)
  // Déclenche la prochaine scène de l'histoire, sauf pendant un battle ou une scène déjà ouverte.
  useEffect(() => {
    if (!game || scene || modal || game.outcome || location.hash === '#Battle') return
    const next = nextStoryScene(game)
    if (!next) return
    const t = setTimeout(() => playScene(next.id), 500)
    return () => clearTimeout(t)
  }, [game, scene, modal, playScene])
  const playCustomScene = useGame((s) => s.playCustomScene)
  const [alerts, setAlerts] = useState<{ key: string; level: Parameters<typeof discLabel>[0]; name: string }[]>([])
  const seenCerts = useRef<Map<string, string> | null>(null)
  const seenAwards = useRef<number | null>(null)
  // Signal à chaque nouveau disque certifié (comparé à l'état déjà connu : pas de rejeu au chargement).
  useEffect(() => {
    if (!game) return
    const cur = new Map((game.certs ?? []).map((c) => [c.id, c.level] as const))
    if (seenCerts.current) {
      const fresh: typeof alerts = []
      for (const c of game.certs ?? []) if (seenCerts.current.get(c.id) !== c.level) {
        const name = c.kind === 'titre' ? game.songs.find((x) => x.id === c.id)?.title : game.projects.find((x) => x.id === c.id)?.name
        fresh.push({ key: `${c.id}-${c.level}`, level: c.level, name: name ?? 'Disque' })
      }
      if (fresh.length) { setAlerts((a) => [...a, ...fresh]); setTimeout(() => setAlerts((a) => a.filter((x) => !fresh.includes(x))), 6500) }
    }
    seenCerts.current = cur
  }, [game])
  // Cérémonie : scène de remise des trophées quand de nouveaux awards tombent.
  useEffect(() => {
    if (!game) return
    const n = game.awards?.length ?? 0
    if (seenAwards.current !== null && n > seenAwards.current) {
      const year = game.awards[n - 1].year
      const fresh = game.awards.filter((a) => a.year === year)
      setTimeout(() => playCustomScene(ceremonyScene(game, fresh)), 800)
    }
    seenAwards.current = n
  }, [game, playCustomScene])
  return (
    <>
      <Cinematic />
      <div style={{ position: 'absolute', left: '50%', top: 18, zIndex: 55, display: 'flex', flexDirection: 'column', gap: 10, transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        {alerts.map((a) => (
          <div key={a.key} data-testid="cert-alert" role="alert" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 22px 10px 12px', borderRadius: 18, background: 'rgba(24,14,48,.96)', boxShadow: 'inset 0 0 0 2px #FFC63D, 0 12px 40px rgba(0,0,0,.55)', animation: 'alertIn .5s cubic-bezier(.2,.9,.3,1.2) both', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <CertDisc level={a.level} size={64} />
            <div><div className="lbl" style={{ color: '#FFC63D' }}>Nouvelle certification</div><div style={{ fontWeight: 800, fontSize: 18 }}>{discLabel(a.level)} · « {a.name} »</div></div>
          </div>
        ))}
      </div>
      {toast && (
        <div role="status" style={{ position: 'absolute', left: '50%', bottom: 28, fontFamily: "'DM Sans', system-ui, sans-serif", transform: 'translateX(-50%)', zIndex: 50, maxWidth: 760, padding: '12px 22px', borderRadius: 14, fontWeight: 700, fontSize: 15, color: toast.tone === 'err' ? '#FFD3DB' : '#D6FFEA', background: toast.tone === 'err' ? 'rgba(90,16,40,.96)' : 'rgba(14,64,48,.96)', boxShadow: `inset 0 0 0 2px ${toast.tone === 'err' ? '#FF5470' : '#3DDC97'}, 0 10px 40px rgba(0,0,0,.5)` }}>
          {toast.text}
        </div>
      )}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(8,4,18,.78)', display: 'grid', placeItems: 'center' }}>
          <div className="pn cut" onClick={(e) => e.stopPropagation()} style={{ width: 520, padding: '26px 30px', color: '#F2EEFF', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 16, lineHeight: 1.55 }}>
            {modal === 'options' && (<>
              <div className="h2" style={{ color: '#fff', margin: 0 }}>Options</div>
              <label style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 20, fontSize: 16, cursor: 'pointer' }}>
                <input type="checkbox" checked={options.autosave} onChange={(e) => setOption('autosave', e.target.checked)} style={{ width: 22, height: 22, accentColor: '#FF3D9A' }} />Sauvegarde automatique à chaque action
              </label>
              <label style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 14, fontSize: 16, cursor: 'pointer' }}>
                <input type="checkbox" checked={options.sound} onChange={(e) => setOption('sound', e.target.checked)} style={{ width: 22, height: 22, accentColor: '#FF3D9A' }} />Sons du jeu (à venir)
              </label>
              <div style={{ marginTop: 18, fontSize: 13, color: '#A99FCB' }}>La sauvegarde est stockée dans ce navigateur.</div>
            </>)}
            {modal === 'credits' && (<>
              <div className="h2" style={{ color: '#fff', margin: 0 }}>Crédits</div>
              <div style={{ marginTop: 18, display: 'grid', gap: 10, color: '#D9D2F2' }}>
                <div>Label Empire est un jeu de gestion de label musical imaginé et conçu par <b style={{ color: '#fff' }}>HANCODE STUDIO</b> (Abidjan).</div>
                <div>Conception : <b style={{ color: '#fff' }}>Smith Junior</b>.</div>
                <div>Les artistes, labels et marques sont fictifs ; les villes et pays sont réels.</div>
              </div>
            </>)}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}><button className="btn" style={{ height: 48, border: 0, cursor: 'pointer' }} onClick={() => setModal(null)}>Fermer</button></div>
          </div>
        </div>
      )}
    </>
  )
}
