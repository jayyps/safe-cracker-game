import test from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateAchievements,
  generateSequence,
  getMistakePenalty,
  NORMAL_MISTAKE_PENALTY,
  OUTAGE_MISTAKE_PENALTY,
  shuffleDifferent,
} from '../src/engine/gameRules.js'

function seededRandom(seed = 123456789) {
  let value = seed >>> 0

  return () => {
    value = (1664525 * value + 1013904223) >>> 0
    return value / 2 ** 32
  }
}

test('generateSequence returns the requested number of valid keys', () => {
  const sequence = generateSequence(16, 8, seededRandom())

  assert.equal(sequence.length, 8)
  assert.ok(sequence.every((keyId) => keyId >= 0 && keyId < 16))

  for (let index = 1; index < sequence.length; index += 1) {
    assert.notEqual(sequence[index], sequence[index - 1])
  }
})

test('shuffleDifferent always changes a multi-key order', () => {
  const original = [0, 1, 2, 3, 4, 5]
  const changed = shuffleDifferent(original, () => 0.999999)

  assert.deepEqual(original, [0, 1, 2, 3, 4, 5])
  assert.notDeepEqual(changed, original)
  assert.deepEqual([...changed].sort((a, b) => a - b), original)
})

test('outage mistake uses the six-second penalty once armed', () => {
  assert.equal(getMistakePenalty(false), NORMAL_MISTAKE_PENALTY)
  assert.equal(getMistakePenalty(true), OUTAGE_MISTAKE_PENALTY)
  assert.equal(OUTAGE_MISTAKE_PENALTY, 6)
})

test('victory achievements are calculated from final run statistics', () => {
  const achievements = calculateAchievements({
    mistakes: 0,
    perfectStages: 3,
    quickClears: 3,
    timeLeft: 4.4,
    outageSurvived: true,
  })

  assert.deepEqual(
    achievements.map((achievement) => achievement.id),
    [
      'flawless-operator',
      'perfect-clearance',
      'speed-breach',
      'outage-survivor',
      'last-second-escape',
    ],
  )
})

test('a normal victory still awards Outage Survivor', () => {
  const achievements = calculateAchievements({
    mistakes: 2,
    perfectStages: 1,
    quickClears: 1,
    timeLeft: 17,
    outageSurvived: true,
  })

  assert.deepEqual(
    achievements.map((achievement) => achievement.id),
    ['outage-survivor'],
  )
})
