import test from 'node:test'
import assert from 'node:assert/strict'

import {
  GAME_RULES,
  calculateAchievements,
  calculateFinalTimeBonus,
  calculateStageReward,
  derange,
  generateSequence,
  getMistakePenalty,
  getScoreAfterWrongSelection,
} from '../src/engine/gameRules.js'

test('generateSequence returns valid keys without adjacent repeats', () => {
  const sequence = generateSequence(4, 12, () => 0)

  assert.equal(sequence.length, 12)
  assert.ok(sequence.every((keyId) => keyId >= 0 && keyId < 4))

  for (let index = 1; index < sequence.length; index += 1) {
    assert.notEqual(sequence[index], sequence[index - 1])
  }
})

test('derange moves every keypad item to a new position', () => {
  const original = Array.from({ length: 16 }, (_, index) => index)
  const moved = derange(original, () => 0.999999)

  assert.deepEqual([...moved].sort((a, b) => a - b), original)
  assert.ok(moved.every((value, index) => value !== original[index]))
})

test('mistake penalties match the normal and outage rules', () => {
  assert.equal(
    getMistakePenalty(false),
    GAME_RULES.normalMistakePenalty,
  )
  assert.equal(
    getMistakePenalty(true),
    GAME_RULES.outageMistakePenalty,
  )
})

test('a failed trace rolls back only points earned in that trace', () => {
  assert.equal(
    getScoreAfterWrongSelection({ score: 240, currentInputIndex: 3 }),
    210,
  )
  assert.equal(
    getScoreAfterWrongSelection({ score: 10, currentInputIndex: 3 }),
    0,
  )
})

test('final stage reward includes perfect, quick and generator bonuses', () => {
  const reward = calculateStageReward({
    stageMistakes: 0,
    inputSeconds: 5,
    quickClearSeconds: 12,
    isFinalStage: true,
    outageSurvived: true,
  })

  assert.deepEqual(reward, {
    perfectBonus: 50,
    quickBonus: true,
    quickBonusSeconds: 5,
    generatorBoostSeconds: 15,
    pointsAwarded: 150,
  })
})

test('final time bonus uses whole seconds only', () => {
  assert.equal(calculateFinalTimeBonus(12.9), 60)
  assert.equal(calculateFinalTimeBonus(-4), 0)
})

test('achievements accurately reflect an exceptional run', () => {
  const achievements = calculateAchievements({
    mistakes: 0,
    perfectStages: 3,
    quickClears: 3,
    timeLeft: 4,
    outageSurvived: false,
    hazardShutdown: true,
    finalScore: 900,
  })

  assert.deepEqual(
    achievements.map((achievement) => achievement.id),
    [
      'vault-cracker',
      'flawless-operator',
      'perfect-clearance',
      'speed-breach',
      'hazard-controller',
      'last-second-escape',
      'master-cracker',
    ],
  )
})
