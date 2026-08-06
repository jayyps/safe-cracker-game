import { gameEngine } from "../engine/gameEngine.js";
import { useGameStore } from "../store/useGameStore.js";

const briefingItems = [
  {
    number: "01",
    title: "Memorise",
    text: "Watch each security signal and remember the exact order.",
  },
  {
    number: "02",
    title: "Respond",
    text: "Enter the sequence accurately before the lockdown completes.",
  },
  {
    number: "03",
    title: "Override",
    text: "Clear all three security levels and unlock the digital vault.",
  },
];

export function StartScreen() {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  return (
    <section className="screen start-screen">
      <header className="topline">
        <span>CODE BREAKERS // TORIS BEAT THE CLOCK</span>

        <span className="system-status">
          <span className="status-dot" aria-hidden="true" />
          SYSTEM ARMED
        </span>
      </header>

      <div className="start-layout">
        <div className="hero-copy">
          <p className="eyebrow">Secure Operations Division</p>

          <h1 className="game-title">
            Vault <span>Rush</span>
          </h1>

          <p className="game-subtitle">Beat the Lockdown</p>

          <p className="hero-description">
            A secure digital vault has entered emergency lockdown. Memorise the
            security sequences and clear all three access levels before the
            60-second master timer reaches zero.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-action"
              onClick={() => gameEngine.startGame()}
            >
              <span>Start Vault Run</span>
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="sound-button"
              onClick={() => gameEngine.toggleSound()}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? "Sound: On" : "Sound: Off"}
            </button>
          </div>

          <p className="start-warning">
            Warning: incorrect entries remove time from the master clock.
          </p>
        </div>

        <div className="vault-visual" aria-hidden="true">
          <div className="vault-ring vault-ring-outer">
            <span className="ring-marker ring-marker-top" />
            <span className="ring-marker ring-marker-right" />
            <span className="ring-marker ring-marker-bottom" />
            <span className="ring-marker ring-marker-left" />

            <div className="vault-ring vault-ring-middle">
              <div className="vault-core">
                <span className="vault-core-label">SECURE</span>
                <strong>60</strong>
                <span className="vault-core-unit">SECONDS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="briefing-grid">
        {briefingItems.map((item) => (
          <article className="briefing-card" key={item.number}>
            <span className="briefing-number">{item.number}</span>

            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <footer className="start-footer">
        <span>Team: Code Breakers</span>
        <span>Mpho Buthelezi // JP De Jager</span>
      </footer>
    </section>
  );
}
