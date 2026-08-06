import { getStage } from '../data/stages.js'
import { gameEngine } from '../engine/gameEngine.js'
import { useGameStore } from '../store/useGameStore.js'
import { Hud } from './Hud.jsx'
import { SecurityGrid } from './SecurityGrid.jsx'

const PHASE_LABELS = {
  preparing: 'Initialising',
  preview: 'Memorise',
  outage: 'Power Failure',
  input: 'Your Turn',
  verifying: 'Verifying',
  'stage-complete': 'Level Cleared',
  won: 'Vault Open',
  lost: 'Locked Down',
}

function StageCompleteOverlay({ summary }) {
  if (!summary) {
    return null
  }

  return (
    <div className="game-overlay" role="status">
      <div className="overlay-card">
        <p className="overlay-kicker">Security Level Cleared</p>
        <h2>{summary.stageName}</h2>
        <strong className="overlay-score">+{summary.pointsAwarded} points</strong>

        <div className="bonus-list">
          {summary.perfectBonus > 0 && <span>Perfect stage +50</span>}
          {summary.quickBonus && <span>Quick clear +5 seconds</span>}
        </div>

        <p>Loading the next security level...</p>
      </div>
    </div>
  )
}

function PowerOutageOverlay() {
  return (
    <div className="power-outage-overlay" role="alert" aria-live="assertive">
      <div className="power-outage-symbol" aria-hidden="true">
        ⚡
      </div>
      <p>Critical Event</p>
      <h2>Power Outage</h2>
      <span>Emergency generator switching online...</span>
    </div>
  )
}

function ResultOverlay({
  phase,
  score,
  mistakes,
  timeLeft,
  stage,
  completedStages,
  achievements,
  stageSummary,
}) {
  const isVictory = phase === 'won'

  return (
    <div className="game-overlay" role="dialog" aria-modal="true">
      <div className="overlay-card result-card">
        <p className="overlay-kicker">
          {isVictory ? 'Access Granted' : 'Security Lockdown'}
        </p>

        <h2>{isVictory ? 'Vault Unlocked' : 'Run Terminated'}</h2>

        {isVictory && stageSummary?.generatorBoost && (
          <div className="generator-boost-banner">
            <strong>Generator Boost</strong>
            <span>+10 seconds recovered after the outage</span>
          </div>
        )}

        <div className="result-grid">
          <div>
            <span>Final Score</span>
            <strong>{score}</strong>
          </div>

          <div>
            <span>Stages Cleared</span>
            <strong>{completedStages} / 3</strong>
          </div>

          <div>
            <span>Mistakes</span>
            <strong>{mistakes}</strong>
          </div>

          <div>
            <span>Time Left</span>
            <strong>{Math.max(0, Math.floor(timeLeft))}s</strong>
          </div>
        </div>

        {isVictory && stageSummary?.finalTimeBonus > 0 && (
          <p className="time-bonus-line">
            Final time bonus: +{stageSummary.finalTimeBonus} points
          </p>
        )}

        {isVictory && achievements.length > 0 && (
          <section className="achievement-section" aria-label="Achievements">
            <p className="achievement-heading">Achievements Unlocked</p>

            <div className="achievement-list">
              {achievements.map((achievement) => (
                <article className="achievement-card" key={achievement.id}>
                  <span aria-hidden="true">◆</span>
                  <div>
                    <strong>{achievement.title}</strong>
                    <p>{achievement.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!isVictory && (
          <p className="result-message">
            The timer expired during Stage {stage}. Review the sequence and try
            another run.
          </p>
        )}

        <div className="result-actions">
          <button
            type="button"
            className="primary-action"
            onClick={() => gameEngine.restartGame()}
          >
            Play Again
          </button>

          <button
            type="button"
            className="ghost-button"
            onClick={() => gameEngine.returnToStart()}
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  )
}

export function GameScreen() {
  const stageNumber = useGameStore((state) => state.stage)
  const activeKey = useGameStore((state) => state.activeKey)
  const feedbackKey = useGameStore((state) => state.feedbackKey)
  const feedbackType = useGameStore((state) => state.feedbackType)
  const gridOrder = useGameStore((state) => state.gridOrder)
  const isInputEnabled = useGameStore((state) => state.isInputEnabled)
  const phase = useGameStore((state) => state.phase)
  const message = useGameStore((state) => state.message)
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const sequence = useGameStore((state) => state.sequence)
  const currentInputIndex = useGameStore((state) => state.currentInputIndex)
  const stageSummary = useGameStore((state) => state.stageSummary)
  const score = useGameStore((state) => state.score)
  const mistakes = useGameStore((state) => state.mistakes)
  const timeLeft = useGameStore((state) => state.timeLeft)
  const completedStages = useGameStore((state) => state.completedStages)
  const achievements = useGameStore((state) => state.achievements)
  const outagePenaltyArmed = useGameStore(
    (state) => state.outagePenaltyArmed,
  )

  const stage = getStage(stageNumber)
  const phaseLabel = PHASE_LABELS[phase] ?? 'Connected'
  const outageActive = phase === 'outage'

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
            {soundEnabled ? 'Sound On' : 'Sound Off'}
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
              <dd>{outagePenaltyArmed ? '-6 seconds armed' : '-3 seconds'}</dd>
            </div>
          </dl>

          {stage.id === 3 && (
            <div className="stage-special">
              <span>Special Threat</span>
              <strong>Power Outage</strong>
              <p>
                The keypad will lose power and return in a different order.
                The signal sequence itself will not change.
              </p>
            </div>
          )}

          <div className="mission-note">
            <span>Operator Directive</span>
            <p>
              Watch the full signal sequence before entering your response. A
              wrong entry resets the current trace and removes time.
            </p>
          </div>
        </aside>

        <main className={`grid-panel ${outageActive ? 'grid-panel-outage' : ''}`}>
          <div className="grid-panel-heading">
            <div>
              <p>Security Matrix</p>
              <h2>Access Keypad</h2>
            </div>

            <span
              className={`connection-badge ${
                phase === 'preview' || phase === 'verifying'
                  ? 'connection-badge-testing'
                  : ''
              } ${outageActive ? 'connection-badge-danger' : ''}`}
            >
              {phaseLabel}
            </span>
          </div>

          <div className={`grid-frame ${outageActive ? 'grid-frame-dark' : ''}`}>
            <SecurityGrid
              gridSize={stage.gridSize}
              gridOrder={gridOrder}
              activeKey={activeKey}
              feedbackKey={feedbackKey}
              feedbackType={feedbackType}
              isInputEnabled={isInputEnabled}
              onKeyPress={(keyId) => gameEngine.selectKey(keyId)}
            />
          </div>

          <div className="sequence-status">
            <span>Sequence Progress</span>

            <div className="sequence-dots" aria-hidden="true">
              {sequence.map((_, index) => (
                <span
                  className={
                    index < currentInputIndex
                      ? 'sequence-dot sequence-dot-complete'
                      : 'sequence-dot'
                  }
                  key={index}
                />
              ))}
            </div>

            <strong>
              {currentInputIndex} / {sequence.length || stage.sequenceLength}
            </strong>
          </div>

          <div className="system-message" aria-live="polite">
            <span className="message-prompt" aria-hidden="true">
              &gt;
            </span>
            <span>{message}</span>
          </div>

          <div className="panel-actions">
            <span className="input-state">
              {isInputEnabled
                ? 'Keypad unlocked — enter the sequence'
                : 'Keypad locked by security protocol'}
            </span>

            <span className="build-status">
              Timer // Sequence // Outage systems online
            </span>
          </div>

          {outageActive && <PowerOutageOverlay />}

          {phase === 'stage-complete' && (
            <StageCompleteOverlay summary={stageSummary} />
          )}

          {(phase === 'won' || phase === 'lost') && (
            <ResultOverlay
              phase={phase}
              score={score}
              mistakes={mistakes}
              timeLeft={timeLeft}
              stage={stageNumber}
              completedStages={completedStages}
              achievements={achievements}
              stageSummary={stageSummary}
            />
          )}
        </main>
      </div>
    </section>
  )
}
