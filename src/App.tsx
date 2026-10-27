import Hub from './screens/Hub'
import Menu from './screens/Menu'
import { NewGameStep1, NewGameStep2 } from './screens/NewGame'
import { useGame } from './store/gameStore'

export default function App() {
  const screen = useGame((s) => s.screen)
  return (
    <main className="app">
      {screen === 'menu' && <Menu />}
      {screen === 'new1' && <NewGameStep1 />}
      {screen === 'new2' && <NewGameStep2 />}
      {screen === 'hub' && <Hub />}
    </main>
  )
}
