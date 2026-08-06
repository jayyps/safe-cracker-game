const KEY_SYMBOLS = [
  '◆',
  '●',
  '▲',
  '■',
  '✦',
  '⬟',
  '✚',
  '✕',
  '◇',
  '○',
  '△',
  '□',
  '✧',
  '⬢',
  '⌁',
  '⌂',
]

const KEY_HUES = [
  166, 176, 186, 196, 206, 216, 226, 236,
  246, 256, 266, 276, 286, 296, 306, 316,
]

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
        const keyHue = KEY_HUES[keyId % KEY_HUES.length]
        const keySymbol = KEY_SYMBOLS[keyId % KEY_SYMBOLS.length]
        const isActive = activeKey === keyId
        const isCorrect =
          feedbackKey === keyId && feedbackType === 'correct'
        const isWrong =
          feedbackKey === keyId && feedbackType === 'wrong'

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
            aria-label={`Security signal ${keyNumber}, symbol ${keySymbol}`}
            key={keyId}
            disabled={!isInputEnabled}
            onClick={() => onKeyPress(keyId)}
          >
            <span className="key-light" aria-hidden="true" />
            <span className="key-symbol" aria-hidden="true">
              {keySymbol}
            </span>
            <span className="key-code">{keyNumber}</span>
          </button>
        )
      })}
    </div>
  )
}
