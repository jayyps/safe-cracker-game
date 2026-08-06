export function SecurityGrid({ gridSize, activeKey }) {
  const totalKeys = gridSize ** 2;
  const keys = Array.from({ length: totalKeys }, (_, index) => index);

  return (
    <div
      className="security-grid"
      style={{ "--grid-size": gridSize }}
      role="group"
      aria-label={`${gridSize} by ${gridSize} security keypad`}
    >
      {keys.map((keyIndex) => {
        const keyNumber = String(keyIndex + 1).padStart(2, "0");
        const keyHue = (165 + keyIndex * 25) % 360;
        const isActive = activeKey === keyIndex;

        return (
          <button
            type="button"
            className={`security-key ${isActive ? "security-key-active" : ""}`}
            style={{ "--key-hue": keyHue }}
            aria-label={`Security signal ${keyNumber}`}
            key={keyIndex}
            disabled
          >
            <span className="key-light" aria-hidden="true" />
            <span className="key-code">{keyNumber}</span>
          </button>
        );
      })}
    </div>
  );
}
