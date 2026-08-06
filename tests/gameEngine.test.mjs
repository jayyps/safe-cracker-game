import test from 'node:test'
import assert from 'node:assert/strict'

function createFakeClock() {
  let currentTime = 0
  let nextTimerId = 1
  const timers = new Map()

  function schedule(callback, delay, interval) {
    const id = nextTimerId
    nextTimerId += 1
    timers.set(id, {
      callback,
      at: currentTime + Math.max(0, delay),
      interval,
    })
    return id
  }

  function clear(id) {
    timers.delete(id)
  }

  function advance(milliseconds) {
    const target = currentTime + milliseconds

    while (true) {
      let nextId = null
      let nextTimer = null

      for (const [id, timer] of timers) {
        if (
          timer.at <= target &&
          (nextTimer === null || timer.at < nextTimer.at)
        ) {
          nextId = id
          nextTimer = timer
        }
      }

      if (nextTimer === null) {
        break
      }

      currentTime = nextTimer.at

      if (nextTimer.interval === null) {
        timers.delete(nextId)
      } else {
        nextTimer.at += nextTimer.interval
      }

      nextTimer.callback()
    }

    currentTime = target
  }

  return {
    now: () => currentTime,
    advance,
    window: {
      setTimeout(callback, delay) {
        return schedule(callback, delay, null)
      },
      clearTimeout: clear,
      setInterval(callback, delay) {
        return schedule(callback, delay, delay)
      },
      clearInterval: clear,
    },
  }
}

function chooseWrongKey(expectedKey, totalKeys) {
  return (expectedKey + 1) % totalKeys
}

test('engine completes sequence stages and the reaction shutdown, resets, and loses cleanly', async () => {
  const originalWindow = globalThis.window
  const originalDateNow = Date.now
  const clock = createFakeClock()

  globalThis.window = clock.window
  Date.now = clock.now

  const { gameEngine } = await import('../src/engine/gameEngine.js')
  const { gameStore } = await import('../src/store/gameStore.js')

  try {
    gameEngine.setDifficulty('hard')
    assert.equal(gameStore.getState().difficultyId, 'hard')
    assert.equal(gameStore.getState().startingTimeSeconds, 90)
    assert.equal(gameStore.getState().timeLeft, 90)

    gameEngine.startGame()
    assert.equal(gameStore.getState().phase, 'preparing')
    assert.equal(gameStore.getState().difficultyId, 'hard')
    assert.equal(gameStore.getState().timeLeft, 90)

    clock.advance(650)
    assert.equal(gameStore.getState().stage, 1)
    assert.equal(gameStore.getState().phase, 'preview')

    clock.advance(5160)
    assert.equal(gameStore.getState().phase, 'input')

    let state = gameStore.getState()
    gameEngine.selectKey(state.sequence[0])
    state = gameStore.getState()
    assert.equal(state.score, 10)

    gameEngine.selectKey(
      chooseWrongKey(state.sequence[1], 9),
    )
    state = gameStore.getState()
    assert.equal(state.score, 0)
    assert.equal(state.mistakes, 1)
    assert.equal(state.currentInputIndex, 0)

    for (const keyId of state.sequence) {
      gameEngine.selectKey(keyId)
    }
    clock.advance(600)
    assert.equal(gameStore.getState().phase, 'stage-complete')

    clock.advance(2100)
    assert.equal(gameStore.getState().stage, 2)
    clock.advance(4160)

    state = gameStore.getState()
    for (const keyId of state.sequence) {
      gameEngine.selectKey(keyId)
    }
    clock.advance(600)
    clock.advance(2100)

    assert.equal(gameStore.getState().stage, 3)
    state = gameStore.getState()
    assert.equal(state.phase, 'hazard')
    assert.equal(state.hazardGoal, 10)
    assert.equal(state.sequence.length, 0)

    const wrongTarget = chooseWrongKey(state.activeKey, 16)
    const timeBeforeHazardMistake = state.timeLeft
    gameEngine.selectKey(wrongTarget)
    state = gameStore.getState()
    assert.equal(state.hazardHits, 0)
    assert.ok(
      Math.abs(
        state.timeLeft - (timeBeforeHazardMistake - 3),
      ) < 0.001,
    )

    while (gameStore.getState().phase === 'hazard') {
      gameEngine.selectKey(gameStore.getState().activeKey)
    }
    clock.advance(500)

    state = gameStore.getState()
    assert.equal(state.phase, 'won')
    assert.equal(state.completedStages, 3)
    assert.equal(state.clearance, 100)
    assert.equal(state.generatorBoostAwarded, false)
    assert.equal(state.hazardHits, 10)

    gameEngine.restartGame()
    state = gameStore.getState()
    assert.equal(state.stage, 1)
    assert.equal(state.score, 0)
    assert.equal(state.mistakes, 0)
    assert.equal(state.difficultyId, 'hard')
    assert.equal(state.startingTimeSeconds, 90)
    assert.equal(state.timeLeft, 90)

    clock.advance(90000)
    assert.equal(gameStore.getState().phase, 'lost')
    assert.equal(gameStore.getState().timeLeft, 0)

    gameEngine.returnToStart()
    state = gameStore.getState()
    assert.equal(state.screen, 'start')
    assert.equal(state.phase, 'idle')
    assert.equal(state.difficultyId, 'hard')
    assert.equal(state.timeLeft, 90)

    gameEngine.setDifficulty('easy')
    state = gameStore.getState()
    assert.equal(state.difficultyId, 'easy')
    assert.equal(state.startingTimeSeconds, 180)
    assert.equal(state.timeLeft, 180)
  } finally {
    gameEngine.stopEverything()
    Date.now = originalDateNow

    if (originalWindow === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = originalWindow
    }
  }
})
