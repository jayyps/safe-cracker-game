import { gameEngine } from '../../engine/gameEngine.js'

export function ResultOverlay({
  phase,
  score,
  mistakes,
  timeLeft,
  stage,
  completedStages,
  achievements,
  stageSummary,
  difficultyName,
  startingTimeSeconds,
}) {
  const isVictory = phase === 'won'

  return (
    <div className="game-overlay" role="dialog" aria-modal="true">
      <div className="overlay-card result-card">
        <p className="overlay-kicker">
          {isVictory ? 'Access Granted' : 'Security Lockdown'}
        </p>

        <h2>{isVictory ? 'Vault Unlocked' : 'Run Terminated'}</h2>

        {isVictory && stageSummary?.generatorBoostSeconds > 0 && (
          <div className="generator-boost-banner">
            <strong>Generator Boost</strong>
            <span>
              +{stageSummary.generatorBoostSeconds} seconds recovered
              after the outage
            </span>
          </div>
        )}

        <div className="result-grid">
          <div>
            <span>Final Score</span>
            <strong>{score}</strong>
          </div>

          <div>
            <span>Difficulty</span>
            <strong>{difficultyName}</strong>
          </div>

          <div>
            <span>Stages Cleared</span>
            <strong>{completedStages} / 3</strong>
          </div>

          <div>
            <span>Stage Reached</span>
            <strong>{stage} / 3</strong>
          </div>

          <div>
            <span>Mistakes</span>
            <strong>{mistakes}</strong>
          </div>

          <div>
            <span>Time Left</span>
            <strong>{Math.max(0, Math.floor(timeLeft))}s</strong>
          </div>

          <div>
            <span>Starting Time</span>
            <strong>{startingTimeSeconds}s</strong>
          </div>

          <div>
            <span>Time Bonus</span>
            <strong>+{stageSummary?.finalTimeBonus ?? 0}</strong>
          </div>
        </div>

        {isVictory && achievements.length > 0 && (
          <section
            className="achievement-section"
            aria-label="Achievements"
          >
            <p className="achievement-heading">
              Achievements Unlocked
            </p>

            <div className="achievement-list">
              {achievements.map((achievement) => (
                <article
                  className="achievement-card"
                  key={achievement.id}
                >
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
            The timer expired during Stage {stage}. Review the challenge and try another run.
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
