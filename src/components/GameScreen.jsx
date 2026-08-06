import { getStage } from '../data/stages.js'
import { gameEngine } from '../engine/gameEngine.js'
import { GAME_RULES } from '../engine/gameRules.js'
import { useGameStore } from '../store/useGameStore.js'
import { Hud } from './Hud.jsx'
import { SecurityGrid } from './SecurityGrid.jsx'
import { ResultOverlay } from './overlays/ResultOverlay.jsx'
import { StageCompleteOverlay } from './overlays/StageCompleteOverlay.jsx'

const PHASE_LABELS = {
  preparing: 'Initialising',
  preview: 'Memorise',
  outage: 'Power Failure',
  hazard: 'Emergency Shutdown',
  input: 'Your Turn',
  verifying: 'Verifying',
  'stage-complete': 'Level Cleared',
  won: 'Vault Open',
  lost: 'Locked Down',
}

export function GameScreen() {
  const stageNumber = useGameStore((state) => state.stage)
  const activeKey = useGameStore((state) => state.activeKey)
  const feedbackKey = useGameStore((state) => state.feedbackKey)
  const feedbackType = useGameStore((state) => state.feedbackType)
  const gridOrder = useGameStore((state) => state.gridOrder)
  const isInputEnabled = useGameStore(
    (state) => state.isInputEnabled,
  )
  const phase = useGameStore((state) => state.phase)
  const message = useGameStore((state) => state.message)
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const sequence = useGameStore((state) => state.sequence)
  const currentInputIndex = useGameStore(
    (state) => state.currentInputIndex,
  )
  const stageSummary = useGameStore((state) => state.stageSummary)
  const score = useGameStore((state) => state.score)
  const mistakes = useGameStore((state) => state.mistakes)
  const timeLeft = useGameStore((state) => state.timeLeft)
  const completedStages = useGameStore(
    (state) => state.completedStages,
  )
  const achievements = useGameStore((state) => state.achievements)
  const outagePenaltyArmed = useGameStore(
    (state) => state.outagePenaltyArmed,
  )
  const hazardHits = useGameStore((state) => state.hazardHits)
  const hazardGoal = useGameStore((state) => state.hazardGoal)
  const difficultyName = useGameStore(
    (state) => state.difficultyName,
  )
  const startingTimeSeconds = useGameStore(
    (state) => state.startingTimeSeconds,
  )

  const stage = getStage(stageNumber)
  const phaseLabel = PHASE_LABELS[phase] ?? 'Connected'
  const outageActive = phase === 'outage'
  const hazardStage = stage.id === 3

  return (
    <section
      className={`screen game-screen ${
        outageActive ? 'game-screen-outage' : ''
      } ${hazardStage ? 'game-screen-hazard' : ''}`}
    >
      {hazardStage && (
        <div className="hazard-scene hacker-hazard-scene" aria-hidden="true">
          <span className="hazard-beacon hazard-beacon-left" />
          <span className="hazard-beacon hazard-beacon-right" />
          <span className="hazard-sweep" />
          <span className="hazard-grid-glow" />
          <div className="breach-warning-stream breach-warning-stream-one">
            CRITICAL // KERNEL PANIC // NODE FAILURE // TRACE ACTIVE
          </div>
          <div className="breach-warning-stream breach-warning-stream-two">
            OVERRIDE REQUIRED // EXECUTIVE LOCKDOWN // 0xDEAD
          </div>
        </div>
      )}
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
              <dt>Difficulty</dt>
              <dd>
                {difficultyName} // {startingTimeSeconds}s
              </dd>
            </div>

            <div>
              <dt>Grid</dt>
              <dd>
                {stage.gridSize} × {stage.gridSize}
              </dd>
            </div>

            <div>
              <dt>Challenge</dt>
              <dd>
                {hazardStage
                  ? `${stage.hazardTargets} live nodes`
                  : `${stage.sequenceLength} signals`}
              </dd>
            </div>

            <div>
              <dt>Mode</dt>
              <dd>{hazardStage ? 'Reaction shutdown' : `${stage.previewSeconds}s preview`}</dd>
            </div>

            <div>
              <dt>Penalty</dt>
              <dd>
                {outagePenaltyArmed
                  ? `-${GAME_RULES.outageMistakePenalty} seconds armed`
                  : `-${GAME_RULES.normalMistakePenalty} seconds`}
              </dd>
            </div>
          </dl>

          {stage.id === 3 && (
            <div className="stage-special">
              <span>Special Threat</span>
              <strong>Emergency Shutdown</strong>
              <p>
                One live hazard node flashes at a time. Hit 10 live nodes
                to stabilise the executive system. No sequence memory required.
              </p>
            </div>
          )}

          <div className="mission-note">
            <span>Operator Directive</span>
            <p>
              {hazardStage
                ? 'Click only the flashing live node. Wrong nodes remove time, but progress is never reset.'
                : 'Watch the full sequence before entering your response. A wrong entry resets the current trace and removes time.'}
            </p>
          </div>
        </aside>

        <main
          className={`grid-panel ${
            outageActive ? 'grid-panel-outage' : ''
          }`}
        >
          <div className="grid-panel-heading">
            <div>
              <p>Encrypted Node Matrix</p>
              <h2>Root Access Console</h2>
            </div>

            <span
              className={`connection-badge ${
                phase === 'preview' || phase === 'verifying'
                  ? 'connection-badge-testing'
                  : ''
              } ${
                outageActive ? 'connection-badge-danger' : ''
              }`}
            >
              {phaseLabel}
            </span>
          </div>

          {hazardStage && (
            <div className="hazard-protocol-banner" aria-hidden="true">
              <span>⚠</span>
              <strong>Kernel Breach Protocol</strong>
              <span>sector_03 // unstable</span>
              <i className="hazard-banner-pulse" />
            </div>
          )}

          <div className={`laptop-stage ${hazardStage ? 'laptop-stage-hazard' : ''}`}>
            <div className="hacker-side-terminal" aria-hidden="true">
              <span>root@vault</span>
              <code>scan --sector 03</code>
              <code>inject --override</code>
              <code>kill lockdown.exe</code>
              <i />
            </div>

            <div className="laptop-shell">
              <div className="laptop-lid">
                <span className="laptop-camera" aria-hidden="true" />
                <div
                  className={`laptop-screen ${
                    outageActive ? 'grid-frame-dark' : ''
                  }`}
                >
                  <div className="laptop-screen-glass" aria-hidden="true" />
                  <div className="laptop-screen-interaction">
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
                </div>
              </div>

              <div className="laptop-base" aria-hidden="true">
                <div className="laptop-keyboard">
                  {Array.from({ length: 24 }, (_, index) => (
                    <span key={index} />
                  ))}
                </div>
                <span className="laptop-trackpad" />
                <span className="laptop-status-light" />
              </div>
            </div>
          </div>

          <div className="sequence-status">
            <span>{hazardStage ? 'Shutdown Progress' : 'Sequence Progress'}</span>

            <div className="sequence-dots" aria-hidden="true">
              {Array.from({
                length: hazardStage
                  ? hazardGoal || stage.hazardTargets
                  : sequence.length,
              }).map((_, index) => (
                <span
                  className={
                    index < (hazardStage ? hazardHits : currentInputIndex)
                      ? 'sequence-dot sequence-dot-complete'
                      : 'sequence-dot'
                  }
                  key={index}
                />
              ))}
            </div>

            <strong>
              {hazardStage ? hazardHits : currentInputIndex} /{' '}
              {hazardStage
                ? hazardGoal || stage.hazardTargets
                : sequence.length || stage.sequenceLength}
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
                ? hazardStage
                  ? 'Shutdown controls live — hit the flashing node'
                  : 'Keypad unlocked — enter the sequence'
                : 'Keypad locked by security protocol'}
            </span>

            <span className="build-status">
              CLOCK // TRACE // OVERRIDE DAEMONS ONLINE
            </span>
          </div>


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
              difficultyName={difficultyName}
              startingTimeSeconds={startingTimeSeconds}
            />
          )}
        </main>
      </div>
    </section>
  )
}
