import { advanceWeek } from '../engine/advanceWeek'
import { useGame } from '../store/gameStore'

export default function Hub() {
  const game = useGame((s) => s.game)
  if (!game) return null
  return (
    <div>
      <h1>{game.label.name} · Semaine {game.week}</h1>
      <div className="grid" style={{ marginTop: 20 }}>
        <div className="pn"><div className="lbl">Trésorerie</div><h2 style={{ color: 'var(--gold)' }}>${game.cash.toLocaleString('fr-FR')}</h2></div>
        <div className="pn"><div className="lbl">Réputation</div><h2>{game.reputation}</h2></div>
        <div className="pn"><div className="lbl">Artistes</div><h2>{game.artists.length}</h2></div>
      </div>
      <div className="footer">
        <button className="btn" onClick={() => useGame.setState({ game: advanceWeek(game, { actions: [] }) })}>Valider la semaine</button>
      </div>
    </div>
  )
}
