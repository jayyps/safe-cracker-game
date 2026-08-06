import { getStage } from "../data/stages.js";
import { gameEngine } from "../engine/gameEngine.js";
import { useGameStore } from "../store/useGameStore.js";
import { Hud } from "./Hud.jsx";
import { SecurityGrid } from "./SecurityGrid.jsx";

export function GameScreen() {
  const stageNumber = useGameStore((state) => state.stage);
  const activeKey = useGameStore((state) => state.activeKey);
  const status = useGameStore((state) => state.status);
  const message = useGameStore((state) => state.message);
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  const stage = getStage(stageNumber);

  return (
    <section className="screen game-screen">
      <header className="game-topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            VR
          </span>

          <div>
            <strong>Vault Rush</strong>
            <span>Secure Operations Terminal</span>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => gameEngine.toggleSound()}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? "Sound On" : "Sound Off"}
          </button>

          <button
            type="button"
            className="ghost-button"
            onClick={() => gameEngine.returnToStart()}
          >
            Exit Run
          </button>
        </div>
      </header>

      <Hud />

      <div className="game-layout">
        <aside className="stage-panel">
          <p className="stage-kicker">{stage.code}</p>
          <h1>{stage.name}</h1>
          <p className="stage-description">{stage.description}</p>

          <dl className="stage-details">
            <div>
              <dt>Grid</dt>
              <dd>
                {stage.gridSize} × {stage.gridSize}
              </dd>
            </div>

            <div>
              <dt>Sequence</dt>
              <dd>{stage.sequenceLength} signals</dd>
            </div>

            <div>
              <dt>Preview</dt>
              <dd>{stage.previewSeconds} seconds</dd>
            </div>

            <div>
              <dt>Penalty</dt>
              <dd>-3 seconds</dd>
            </div>
          </dl>

          <div className="mission-note">
            <span>Operator Directive</span>
            <p>
              Watch the full signal sequence before entering your response.
              Speed matters, but accuracy protects your clock.
            </p>
          </div>
        </aside>

        <main className="grid-panel">
          <div className="grid-panel-heading">
            <div>
              <p>Security Matrix</p>
              <h2>Access Keypad</h2>
            </div>

            <span
              className={`connection-badge ${
                status === "testing" ? "connection-badge-testing" : ""
              }`}
            >
              {status === "testing" ? "Testing" : "Connected"}
            </span>
          </div>

          <div className="grid-frame">
            <SecurityGrid gridSize={stage.gridSize} activeKey={activeKey} />
          </div>

          <div className="system-message" aria-live="polite">
            <span className="message-prompt" aria-hidden="true">
              &gt;
            </span>
            <span>{message}</span>
          </div>

          <div className="panel-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => gameEngine.runInterfaceTest()}
              disabled={status === "testing"}
            >
              {status === "testing" ? "Testing Signal..." : "Run Signal Test"}
            </button>

            <span className="build-status">
              Sequence module: pending integration
            </span>
          </div>
        </main>
      </div>
    </section>
  );
}
