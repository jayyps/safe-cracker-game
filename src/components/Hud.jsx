import { useGameStore } from "../store/useGameStore.js";

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export function Hud() {
  const timeLeft = useGameStore((state) => state.timeLeft);
  const score = useGameStore((state) => state.score);
  const mistakes = useGameStore((state) => state.mistakes);
  const clearance = useGameStore((state) => state.clearance);

  return (
    <section className="hud" aria-label="Current game statistics">
      <article className="hud-card timer-card">
        <span className="hud-label">Lockdown</span>
        <strong
          className={`hud-value ${timeLeft <= 10 ? "hud-value-danger" : ""}`}
        >
          {formatTime(timeLeft)}
        </strong>
      </article>

      <article className="hud-card">
        <span className="hud-label">Score</span>
        <strong className="hud-value">{String(score).padStart(4, "0")}</strong>
      </article>

      <article className="hud-card">
        <span className="hud-label">Mistakes</span>
        <strong className="hud-value">
          {String(mistakes).padStart(2, "0")}
        </strong>
      </article>

      <article className="hud-card clearance-card">
        <div className="clearance-heading">
          <span className="hud-label">Security Clearance</span>
          <strong>{clearance}%</strong>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-label="Security clearance"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={clearance}
        >
          <span className="progress-fill" style={{ width: `${clearance}%` }} />
        </div>
      </article>
    </section>
  );
}
