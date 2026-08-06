export function SecurityGrid({
  gridSize,
  gridOrder,
  activeKey,
  feedbackKey,
  feedbackType,
  isInputEnabled,
  onKeyPress,
}) {
  const totalKeys = gridSize ** 2
  const keys =
    gridOrder.length === totalKeys
      ? gridOrder
      : Array.from({ length: totalKeys }, (_, index) => index)

  return (
    <div
      className="security-grid"
      style={{ '--grid-size': gridSize }}
      role="group"
      aria-label={`${gridSize} by ${gridSize} security keypad`}
    >
      {keys.map((keyId) => {
        const keyNumber = String(keyId + 1).padStart(2, '0')
        const keyHue = (165 + keyId * 25) % 360
        const isActive = activeKey === keyId
        const isCorrect = feedbackKey === keyId && feedbackType === 'correct'
        const isWrong = feedbackKey === keyId && feedbackType === 'wrong'

        const classNames = [
          'security-key',
          isActive ? 'security-key-active' : '',
          isCorrect ? 'security-key-correct' : '',
          isWrong ? 'security-key-wrong' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            type="button"
            className={classNames}
            style={{ '--key-hue': keyHue }}
            aria-label={`Security signal ${keyNumber}`}
            key={keyId}
            disabled={!isInputEnabled}
            onClick={() => onKeyPress(keyId)}
          >
            <span className="key-light" aria-hidden="true" />
            <span className="key-code">{keyNumber}</span>
          </button>
        )
      })}
    </div>
  )
}
