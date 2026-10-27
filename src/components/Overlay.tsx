import { useGame } from '../store/gameStore'

/** Notifications (toast) et fenêtres modales (Options, Crédits). */
export default function Overlay() {
  const toast = useGame((s) => s.toast)
  const modal = useGame((s) => s.modal)
  const setModal = useGame((s) => s.setModal)
  const options = useGame((s) => s.options)
  const setOption = useGame((s) => s.setOption)
  return (
    <>
      {toast && (
        <div role="status" style={{ position: 'absolute', left: '50%', bottom: 28, fontFamily: "'DM Sans', system-ui, sans-serif", transform: 'translateX(-50%)', zIndex: 50, maxWidth: 760, padding: '12px 22px', borderRadius: 14, fontWeight: 700, fontSize: 15, color: toast.tone === 'err' ? '#FFD3DB' : '#D6FFEA', background: toast.tone === 'err' ? 'rgba(90,16,40,.96)' : 'rgba(14,64,48,.96)', boxShadow: `inset 0 0 0 2px ${toast.tone === 'err' ? '#FF5470' : '#3DDC97'}, 0 10px 40px rgba(0,0,0,.5)` }}>
          {toast.text}
        </div>
      )}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(8,4,18,.78)', display: 'grid', placeItems: 'center' }}>
          <div className="pn cut" onClick={(e) => e.stopPropagation()} style={{ width: 520 }}>
            {modal === 'options' && (<>
              <div className="h2">Options</div>
              <label style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 18, fontSize: 16 }}>
                <input type="checkbox" checked={options.autosave} onChange={(e) => setOption('autosave', e.target.checked)} style={{ width: 22, height: 22, accentColor: '#FF3D9A' }} />Sauvegarde automatique à chaque action
              </label>
              <label style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14, fontSize: 16 }}>
                <input type="checkbox" checked={options.sound} onChange={(e) => setOption('sound', e.target.checked)} style={{ width: 22, height: 22, accentColor: '#FF3D9A' }} />Sons du jeu (à venir)
              </label>
              <div className="mut" style={{ marginTop: 14, fontSize: 13 }}>La sauvegarde est stockée dans ce navigateur.</div>
            </>)}
            {modal === 'credits' && (<>
              <div className="h2">Crédits</div>
              <div style={{ marginTop: 16, lineHeight: 1.7 }}>Label Empire est un jeu de gestion de label musical imaginé et conçu par <b>HANCODE STUDIO</b> (Abidjan).<br />Conception : Smith Junior.<br />Les artistes, labels et marques sont fictifs ; les villes et pays sont réels.</div>
            </>)}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}><button className="btn" style={{ height: 48, border: 0, cursor: 'pointer' }} onClick={() => setModal(null)}>Fermer</button></div>
          </div>
        </div>
      )}
    </>
  )
}
