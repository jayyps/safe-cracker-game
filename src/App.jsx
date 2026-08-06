import { GameScreen } from "./components/GameScreen.jsx";
import { StartScreen } from "./components/StartScreen.jsx";
import { useGameStore } from "./store/useGameStore.js";

function App() {
  const screen = useGameStore((state) => state.screen);

  return (
    <div className="app">
      <div className="app-grid" aria-hidden="true" />
      <div className="app-glow app-glow-one" aria-hidden="true" />
      <div className="app-glow app-glow-two" aria-hidden="true" />

      {screen === "game" ? <GameScreen /> : <StartScreen />}
    </div>
  );
}

export default App;
