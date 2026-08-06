export const GAME_RULES = Object.freeze({
  normalMistakePenalty: 3,
  outageMistakePenalty: 4,
  generatorBoostSeconds: 15,
  correctKeyPoints: 10,
  stageClearPoints: 100,
  perfectStagePoints: 50,
  quickClearTimeBonus: 5,
  finalTimePointMultiplier: 5,
  outageDurationMs: 1200,
  outageReorderMs: 500,
})

export function shuffle(values, random = Math.random) {
  const result = [...values]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1))
    const temporaryValue = result[index]

    result[index] = result[randomIndex]
    result[randomIndex] = temporaryValue
  }

  return result
}

/**
 * Returns a new order in which every item moves to a different position.
 * The keypad uses unique numeric IDs, so a rotated fallback is a valid
 * derangement when repeated random attempts do not produce one.
 */
export function derange(values, random = Math.random) {
  const original = [...values]

  if (original.length < 2) {
    return original
  }

  for (let attempt = 0; attempt < 32; attempt += 1) {
    const candidate = shuffle(original, random)
    const everyItemMoved = candidate.every(
      (value, index) => value !== original[index],
    )

    if (everyItemMoved) {
      return candidate
    }
  }

  const offset = 1 + Math.floor(random() * (original.length - 1))

  return original.map(
    (_, index) => original[(index + offset) % original.length],
  )
}

export function generateSequence(totalKeys, length, random = Math.random) {
  if (!Number.isInteger(totalKeys) || totalKeys < 2) {
    throw new RangeError('totalKeys must be an integer of at least 2')
  }

  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError('length must be a positive integer')
  }

  const sequence = []

  while (sequence.length < length) {
    let candidate = Math.floor(random() * totalKeys)
    const previous = sequence.at(-1)

    if (candidate === previous) {
      const offset = 1 + Math.floor(random() * (totalKeys - 1))
      candidate = (candidate + offset) % totalKeys
    }

    sequence.push(candidate)
  }

  return sequence
}

export function getMistakePenalty(outagePenaltyArmed) {
  return outagePenaltyArmed
    ? GAME_RULES.outageMistakePenalty
    : GAME_RULES.normalMistakePenalty
}

export function getScoreAfterWrongSelection({
  score,
  currentInputIndex,
}) {
  const rollbackPoints =
    currentInputIndex * GAME_RULES.correctKeyPoints

  return Math.max(0, score - rollbackPoints)
}

export function calculateStageReward({
  stageMistakes,
  inputSeconds,
  quickClearSeconds,
  isFinalStage,
  outageSurvived,
}) {
  const perfectBonus =
    stageMistakes === 0 ? GAME_RULES.perfectStagePoints : 0
  const quickBonus = inputSeconds <= quickClearSeconds
  const quickBonusSeconds = quickBonus
    ? GAME_RULES.quickClearTimeBonus
    : 0
  const generatorBoostSeconds =
    isFinalStage && outageSurvived
      ? GAME_RULES.generatorBoostSeconds
      : 0

  return {
    perfectBonus,
    quickBonus,
    quickBonusSeconds,
    generatorBoostSeconds,
    pointsAwarded: GAME_RULES.stageClearPoints + perfectBonus,
  }
}

export function calculateFinalTimeBonus(timeLeft) {
  const safeTime = Number.isFinite(timeLeft)
    ? Math.max(0, timeLeft)
    : 0

  return (
    Math.floor(safeTime) * GAME_RULES.finalTimePointMultiplier
  )
}

export function calculateAchievements({
  mistakes,
  perfectStages,
  quickClears,
  timeLeft,
  outageSurvived = false,
  hazardShutdown = false,
  finalScore,
}) {
  const achievements = [
    {
      id: 'vault-cracker',
      title: 'Vault Cracker',
      description: 'Cleared all three security levels.',
    },
  ]

  if (mistakes === 0) {
    achievements.push({
      id: 'flawless-operator',
      title: 'Flawless Operator',
      description: 'Unlocked the vault without a single mistake.',
    })
  }

  if (perfectStages === 3) {
    achievements.push({
      id: 'perfect-clearance',
      title: 'Perfect Clearance',
      description: 'Earned the perfect-stage bonus on every level.',
    })
  }

  if (quickClears === 3) {
    achievements.push({
      id: 'speed-breach',
      title: 'Speed Breach',
      description: 'Earned the quick-clear bonus on every level.',
    })
  }

  if (hazardShutdown) {
    achievements.push({
      id: 'hazard-controller',
      title: 'Hazard Controller',
      description: 'Disabled every live node during Emergency Shutdown.',
    })
  } else if (outageSurvived) {
    achievements.push({
      id: 'outage-survivor',
      title: 'Outage Survivor',
      description: 'Recovered the rearranged keypad after the power failure.',
    })
  }

  if (timeLeft > 0 && timeLeft <= 5) {
    achievements.push({
      id: 'last-second-escape',
      title: 'Last-Second Escape',
      description: 'Opened the vault with five seconds or less remaining.',
    })
  }

  if (finalScore >= 800) {
    achievements.push({
      id: 'master-cracker',
      title: 'Master Cracker',
      description: 'Finished the run with at least 800 points.',
    })
  }

  return achievements
}
