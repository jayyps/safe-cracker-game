import {
  DIFFICULTIES,
  getDifficulty,
} from '../data/difficulties.js'
import { gameEngine } from '../engine/gameEngine.js'
import { useGameStore } from '../store/useGameStore.js'

const briefingItems = [
  {
    number: '01',
    title: 'Trace',
    text: 'Capture each encrypted signal and preserve the exact access order.',
  },
  {
    number: '02',
    title: 'Inject',
    text: 'Replay the access pattern before the lockdown process completes.',
  },
  {
    number: '03',
    title: 'Terminate',
    text: 'Neutralise live hazard nodes during the final emergency shutdown.',
  },
]

const terminalLines = [
  '[SYS] vault perimeter online',
  '[AUTH] operator token accepted',
  '[NET] encrypted tunnel established',
  '[WARN] lockdown daemon detected',
  '[TASK] breach three security layers',
]

export function StartScreen() {
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const difficultyId = useGameStore((state) => state.difficultyId)
  const startingTimeSeconds = useGameStore(
    (state) => state.startingTimeSeconds,
  )
  const selectedDifficulty = getDifficulty(difficultyId)

  return (
    <section className="screen start-screen hacker-start-screen">
      <div className="hacker-rain" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span style={{ '--rain-index': index }} key={index}>
            01 10 0x7F AUTH ROOT AES NODE TRACE
          </span>
        ))}
      </div>

      <header className="topline hacker-topline">
        <span>CODE_BREAKERS://TORIS_BEAT_THE_CLOCK</span>

        <span className="system-status">
          <span className="status-dot" aria-hidden="true" />
          ROOT ACCESS READY
        </span>
      </header>

      <div className="start-layout hacker-start-layout">
        <div className="hero-copy hacker-hero-copy">
          <div className="terminal-path" aria-hidden="true">
            root@vault-rush:~/secure-ops$
          </div>

          <p className="eyebrow">Encrypted Operations Console</p>

          <h1 className="game-title hacker-game-title">
            Vault <span>Rush</span>
          </h1>

          <p className="game-subtitle hacker-subtitle">
            Breach the Lockdown
          </p>

          <p className="hero-description">
            Infiltrate a secure digital vault, replay encrypted access traces,
            and terminate the final hazard protocol before the
            {startingTimeSeconds}-second master clock reaches zero.
          </p>

          <div className="terminal-log" aria-label="System status log">
            {terminalLines.map((line, index) => (
              <span style={{ '--line-delay': `${index * 120}ms` }} key={line}>
                <i aria-hidden="true">›</i> {line}
              </span>
            ))}
            <span className="terminal-cursor-line">
              <i aria-hidden="true">›</i> awaiting operator command<span className="terminal-cursor" />
            </span>
          </div>

          <fieldset className="difficulty-selector hacker-difficulty-selector">
            <legend>Select Clock Profile</legend>

            <div
              className="difficulty-options"
              role="radiogroup"
              aria-label="Difficulty level"
            >
              {DIFFICULTIES.map((difficulty) => {
                const isSelected = difficulty.id === difficultyId

                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`difficulty-option ${
                      isSelected ? 'difficulty-option-selected' : ''
                    }`}
                    onClick={() => gameEngine.setDifficulty(difficulty.id)}
                    key={difficulty.id}
                  >
                    <span>PROFILE::{difficulty.name}</span>
                    <strong>{difficulty.timeSeconds}s</strong>
                    <small>{difficulty.description}</small>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="selected-difficulty-summary" aria-live="polite">
            <span>Active profile</span>
            <strong>
              {selectedDifficulty.name} // {selectedDifficulty.timeSeconds}s
            </strong>
          </div>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-action hacker-primary-action"
              onClick={() => gameEngine.startGame()}
            >
              <span>Execute Breach</span>
              <span aria-hidden="true">[ENTER]</span>
            </button>

            <button
              type="button"
              className="sound-button"
              onClick={() => gameEngine.toggleSound()}
              aria-pressed={soundEnabled}
            >
              AUDIO::{soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <p className="start-warning">
            Clock profiles affect starting time only. Security logic remains unchanged.
          </p>
        </div>

        <div className="vault-visual hacker-vault-visual" aria-hidden="true">
          <div className="breach-console">
            <div className="breach-console-bar">
              <span>VAULT://GATEWAY_03</span>
              <span>ENCRYPTED</span>
            </div>

            <div className="breach-console-body">
              <div className="vault-ring vault-ring-outer hacker-vault-ring">
                <span className="ring-marker ring-marker-top" />
                <span className="ring-marker ring-marker-right" />
                <span className="ring-marker ring-marker-bottom" />
                <span className="ring-marker ring-marker-left" />

                <div className="vault-ring vault-ring-middle">
                  <div className="vault-core">
                    <span className="vault-core-label">
                      {selectedDifficulty.name}
                    </span>
                    <strong>{startingTimeSeconds}</strong>
                    <span className="vault-core-unit">SECONDS</span>
                  </div>
                </div>
              </div>

              <div className="console-readout">
                <span>PORT 443 // OPEN</span>
                <span>CIPHER // AES-256</span>
                <span>TRACE // 00.0%</span>
                <span>STATUS // ARMED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="briefing-grid hacker-briefing-grid">
        {briefingItems.map((item) => (
          <article className="briefing-card" key={item.number}>
            <span className="briefing-number">0x{item.number}</span>

            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <footer className="start-footer">
        <span>TEAM://CODE_BREAKERS</span>
        <span>MPHO_BUTHELEZI // JP_DE_JAGER</span>
      </footer>
    </section>
  )
}
