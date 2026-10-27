import { palierFor } from '../data/world'
import { useGame } from '../store/gameStore'
import { totalFans } from '../engine/util'
import { compact, fmt, initials } from '../lib'

/** Barre du haut, identique à la maquette mais alimentée par l'état du jeu. */
export default function Hud() {
  const game = useGame((s) => s.game)
  const cfg = useGame((s) => s.config)
  const name = game?.label.name ?? cfg.labelName
  const cash = game?.cash ?? useGame.getState().cash()
  const rep = game?.reputation ?? cfg.startReputation
  const fans = game ? totalFans(game) : 0
  const week = game?.week ?? 1
  const pal = palierFor(rep)
  return (
    <header className="hud">
      <div className="av" style={{ background: 'linear-gradient(135deg,#8B5CF6,#FF3D9A)' }}>{initials(name)}</div>
      <div><div className="disp" style={{ fontSize: 22, lineHeight: 1 }}>{name}</div><div className="lbl" style={{ marginTop: 3 }}>Palier {pal.n} · {pal.name}</div></div>
      <div className="sp" />
      <div className="coin" title="Trésorerie"><i style={{ background: '#FFC63D' }}>$</i><b style={cash < 0 ? { color: '#FF5470' } : undefined}>{cash < 0 ? '−' : ''}{fmt(Math.abs(cash))}</b></div>
      <div className="coin" title="Réputation (100 = victoire)"><i style={{ background: '#8B5CF6', color: '#fff' }}>★</i><b>{Math.floor(rep)}</b><small>Réputation</small></div>
      <div className="coin" title="Fans de tous vos artistes"><i style={{ background: '#35D3F0' }}>♪</i><b>{compact(fans)}</b><small>Fans</small></div>
      <div className="coin" title="Actions restantes cette semaine"><i style={{ background: '#3DDC97' }}>◆</i><b>{game?.ap ?? 6}/6</b><small>Actions</small></div>
      <div style={{ textAlign: 'right' }}><div className="lbl">Semaine</div><div className="disp" style={{ fontSize: 22, lineHeight: 1 }}>{(week - 1) % 52 + 1} · An {Math.floor((week - 1) / 52) + 1}</div></div>
    </header>
  )
}
