import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_DIFFICULTY_ID,
  DIFFICULTIES,
  getDifficulty,
} from '../src/data/difficulties.js'

test('difficulty levels change only the configured starting time', () => {
  assert.deepEqual(
    DIFFICULTIES.map(({ id, timeSeconds }) => ({ id, timeSeconds })),
    [
      { id: 'easy', timeSeconds: 180 },
      { id: 'normal', timeSeconds: 120 },
      { id: 'hard', timeSeconds: 90 },
    ],
  )
})

test('normal is the default and invalid IDs safely fall back to it', () => {
  assert.equal(DEFAULT_DIFFICULTY_ID, 'normal')
  assert.equal(getDifficulty().id, 'normal')
  assert.equal(getDifficulty('unknown').id, 'normal')
})
