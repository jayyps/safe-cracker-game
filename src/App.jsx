import { GameScreen } from './components/GameScreen.jsx'
import { StartScreen } from './components/StartScreen.jsx'
import { useGameStore } from './store/useGameStore.js'

function App() {
  const screen = useGameStore((state) => state.screen)

  return (
    <div className={`app app-screen-${screen}`}>
      <div className="app-grid" aria-hidden="true" />
      <div className="app-glow app-glow-one" aria-hidden="true" />
      <div className="app-glow app-glow-two" aria-hidden="true" />

      <div className="cartoon-alarm-world" aria-hidden="true">
        <span className="alarm-wash alarm-wash-left" />
        <span className="alarm-wash alarm-wash-right" />
        <span className="alarm-siren alarm-siren-left">
          <i />
        </span>
        <span className="alarm-siren alarm-siren-right">
          <i />
        </span>
        <span className="comic-ray comic-ray-one" />
        <span className="comic-ray comic-ray-two" />
        <span className="comic-ray comic-ray-three" />
        <span className="comic-dot-field" />
      </div>

      {screen === 'game' ? <GameScreen /> : <StartScreen />}
    </div>
  )
}

export default App
