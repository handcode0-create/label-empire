import { useGame } from '../store/gameStore'

const fmt = (n: number) => n.toLocaleString('fr-FR')
const compact = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(n))

/** Barre du haut, identique à la maquette mais alimentée par l'état du jeu. */
export default function Hud() {
  const game = useGame((s) => s.game)
  const cfg = useGame((s) => s.config)
  const name = game?.label.name ?? cfg.labelName
  const cash = game?.cash ?? useGame.getState().cash()
  const rep = game?.reputation ?? cfg.startReputation
  const fans = game ? game.artists.reduce((t, a) => t + Object.values(a.fans).reduce((x, y) => x + y, 0), 0) : 0
  const week = game?.week ?? 1
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <header className="hud">
      <div className="av" style={{ background: 'linear-gradient(135deg,#8B5CF6,#FF3D9A)' }}>{initials}</div>
      <div><div className="disp" style={{ fontSize: 22, lineHeight: 1 }}>{name}</div><div className="lbl" style={{ marginTop: 3 }}>Palier 1 · Label local</div></div>
      <div className="sp" />
      <div className="coin"><i style={{ background: '#FFC63D' }}>$</i><b>{fmt(cash)}</b></div>
      <div className="coin"><i style={{ background: '#8B5CF6', color: '#fff' }}>★</i><b>{rep}</b><small>Réputation</small></div>
      <div className="coin"><i style={{ background: '#35D3F0' }}>♪</i><b>{compact(fans)}</b><small>Fans</small></div>
      <div className="coin"><i style={{ background: '#3DDC97' }}>◆</i><b>4/6</b><small>Actions</small></div>
      <div style={{ textAlign: 'right' }}><div className="lbl">Semaine</div><div className="disp" style={{ fontSize: 22, lineHeight: 1 }}>{(week - 1) % 52 + 1} · An {Math.floor((week - 1) / 52) + 1}</div></div>
    </header>
  )
}
