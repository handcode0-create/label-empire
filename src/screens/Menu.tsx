import { useGame } from '../store/gameStore'
export default function Menu() {
  const go = useGame((s) => s.go)
  return (
    <div style={{ textAlign: 'center', paddingTop: 120 }}>
      <h1 style={{ fontSize: 96, color: 'var(--gold)' }}>LABEL EMPIRE</h1>
      <p className="mut">Bâtissez un label de musique à l'échelle du monde.</p>
      <button className="btn" onClick={() => go('new1')}>Nouvelle partie</button>
    </div>
  )
}
