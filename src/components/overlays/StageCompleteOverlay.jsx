export function StageCompleteOverlay({ summary }) {
  if (!summary) {
    return null
  }

  return (
    <div className="game-overlay" role="status" aria-live="polite">
      <div className="overlay-card">
        <p className="overlay-kicker">Security Level Cleared</p>
        <h2>{summary.stageName}</h2>
        <strong className="overlay-score">
          +{summary.pointsAwarded} points
        </strong>

        <div className="bonus-list">
          {summary.perfectBonus > 0 && (
            <span>Perfect stage +{summary.perfectBonus}</span>
          )}
          {summary.quickBonus && (
            <span>
              Quick clear +{summary.quickBonusSeconds} seconds
            </span>
          )}
        </div>

        <p>Loading the next security level...</p>
      </div>
    </div>
  )
}
