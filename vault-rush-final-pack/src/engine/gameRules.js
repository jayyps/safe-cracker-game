export const MASTER_TIME_SECONDS = 60
export const NORMAL_MISTAKE_PENALTY = 3
export const OUTAGE_MISTAKE_PENALTY = 6
export const GENERATOR_BOOST_SECONDS = 10

export const CORRECT_KEY_POINTS = 10
export const STAGE_CLEAR_POINTS = 100
export const PERFECT_STAGE_POINTS = 50
export const QUICK_CLEAR_TIME_BONUS = 5
export const FINAL_TIME_POINT_MULTIPLIER = 5

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

export function shuffleDifferent(values, random = Math.random) {
  if (values.length < 2) {
    return [...values]
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = shuffle(values, random)
    const changed = candidate.some((value, index) => value !== values[index])

    if (changed) {
      return candidate
    }
  }

  return [...values.slice(1), values[0]]
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
    const candidate = Math.floor(random() * totalKeys)
    const previous = sequence.at(-1)

    if (candidate !== previous) {
      sequence.push(candidate)
    }
  }

  return sequence
}

export function getMistakePenalty(outagePenaltyArmed) {
  return outagePenaltyArmed
    ? OUTAGE_MISTAKE_PENALTY
    : NORMAL_MISTAKE_PENALTY
}

export function calculateAchievements({
  mistakes,
  perfectStages,
  quickClears,
  timeLeft,
  outageSurvived,
}) {
  const achievements = []

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
      description: 'Earned the perfect-stage bonus on all three levels.',
    })
  }

  if (quickClears === 3) {
    achievements.push({
      id: 'speed-breach',
      title: 'Speed Breach',
      description: 'Cleared every security level inside its quick-clear target.',
    })
  }

  if (outageSurvived) {
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
      description: 'Unlocked the vault with five seconds or less remaining.',
    })
  }

  return achievements
}
