export function PowerOutageOverlay() {
  return (
    <div
      className="power-outage-overlay"
      role="alert"
      aria-live="assertive"
    >
      <div className="power-outage-symbol" aria-hidden="true">
        ⚡
      </div>
      <p>Critical System Event</p>
      <h2>Power Outage</h2>
      <span>
        Emergency generator starting. Security matrix recalibrating...
      </span>
    </div>
  )
}
