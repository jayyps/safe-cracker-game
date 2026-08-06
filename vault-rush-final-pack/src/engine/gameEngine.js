import { audioEngine } from '../audio/audioEngine.js'
import { getStage, STAGES } from '../data/stages.js'
import {
  calculateAchievements,
  CORRECT_KEY_POINTS,
  FINAL_TIME_POINT_MULTIPLIER,
  GENERATOR_BOOST_SECONDS,
  generateSequence,
  getMistakePenalty,
  MASTER_TIME_SECONDS,
  PERFECT_STAGE_POINTS,
  QUICK_CLEAR_TIME_BONUS,
  shuffle,
  shuffleDifferent,
  STAGE_CLEAR_POINTS,
} from './gameRules.js'
import { createInitialGameState, gameStore } from '../store/gameStore.js'

const OUTAGE_DURATION_MS = 2000

class VaultRushEngine {
  constructor() {
    this.masterTimerId = null
    this.masterTimerEndsAt = null
    this.stageTimeoutIds = new Set()
    this.stageInputStartedAt = null
    this.stageInputCompletedAt = null
  }

  startGame() {
    this.stopEverything()

    const soundEnabled = gameStore.getState().soundEnabled
    audioEngine.setEnabled(soundEnabled)
    audioEngine.unlock()
    audioEngine.play('start')

    gameStore.setState(
      {
        ...createInitialGameState(),
        screen: 'game',
        phase: 'preparing',
        soundEnabled,
        timeLeft: MASTER_TIME_SECONDS,
        message: 'Initialising master lockdown clock...',
      },
      true,
    )

    this.startMasterTimer()
    this.schedule(() => this.startStage(1), 650)
  }

  restartGame() {
    this.startGame()
  }

  returnToStart() {
    const soundEnabled = gameStore.getState().soundEnabled
    this.stopEverything()

    gameStore.setState(
      {
        ...createInitialGameState(),
        soundEnabled,
      },
      true,
    )
  }

  toggleSound() {
    const nextEnabled = !gameStore.getState().soundEnabled

    gameStore.setState({ soundEnabled: nextEnabled })
    audioEngine.setEnabled(nextEnabled)

    if (nextEnabled) {
      audioEngine.play('toggle')
    }
  }

  startStage(stageNumber) {
    const currentState = gameStore.getState()

    if (currentState.phase === 'lost' || currentState.phase === 'won') {
      return
    }

    const stage = getStage(stageNumber)
    const totalKeys = stage.gridSize ** 2
    const gridOrder = shuffle(
      Array.from({ length: totalKeys }, (_, index) => index),
    )
    const sequence = generateSequence(totalKeys, stage.sequenceLength)

    this.clearStageTimeouts()
    this.stageInputStartedAt = null
    this.stageInputCompletedAt = null

    gameStore.setState({
      stage: stageNumber,
      phase: 'preview',
      stageMistakes: 0,
      sequence,
      currentInputIndex: 0,
      gridOrder,
      activeKey: null,
      feedbackKey: null,
      feedbackType: null,
      isInputEnabled: false,
      outageTriggered: false,
      outagePenaltyArmed: false,
      stageSummary: null,
      message: `${stage.name}: memorise the ${stage.sequenceLength}-signal sequence.`,
    })

    this.playSequence(stage, sequence)
  }

  playSequence(stage, sequence) {
    const totalPreviewMs = stage.previewSeconds * 1000
    const slotMs = totalPreviewMs / sequence.length
    const flashMs = Math.min(650, Math.max(280, slotMs * 0.58))

    sequence.forEach((keyId, sequenceIndex) => {
      const flashStart = sequenceIndex * slotMs

      this.schedule(() => {
        if (gameStore.getState().phase !== 'preview') {
          return
        }

        audioEngine.play('signal', keyId)
        gameStore.setState({
          activeKey: keyId,
          message: `Signal ${sequenceIndex + 1} of ${sequence.length}`,
        })
      }, flashStart)

      this.schedule(() => {
        if (gameStore.getState().phase === 'preview') {
          gameStore.setState({ activeKey: null })
        }
      }, flashStart + flashMs)
    })

    this.schedule(() => {
      if (stage.id === STAGES.length) {
        this.triggerPowerOutage()
        return
      }

      this.enablePlayerInput()
    }, totalPreviewMs + 180)
  }

  triggerPowerOutage() {
    const state = gameStore.getState()

    if (state.stage !== STAGES.length || state.phase !== 'preview') {
      return
    }

    audioEngine.play('outage')
    gameStore.setState({
      phase: 'outage',
      outageTriggered: true,
      activeKey: null,
      isInputEnabled: false,
      message: 'POWER FAILURE. Emergency generator attempting recovery...',
    })

    this.schedule(() => this.restorePower(), OUTAGE_DURATION_MS)
  }

  restorePower() {
    const state = gameStore.getState()

    if (state.phase !== 'outage') {
      return
    }

    const rearrangedOrder = shuffleDifferent(state.gridOrder)

    audioEngine.play('restore')
    gameStore.setState({
      gridOrder: rearrangedOrder,
      outagePenaltyArmed: true,
      message:
        'Generator online. Keypad positions changed — the sequence is unchanged.',
    })

    this.schedule(() => this.enablePlayerInput(true), 650)
  }

  enablePlayerInput(afterOutage = false) {
    const expectedPhase = afterOutage ? 'outage' : 'preview'

    if (gameStore.getState().phase !== expectedPhase) {
      return
    }

    this.stageInputStartedAt = Date.now()
    this.stageInputCompletedAt = null

    gameStore.setState({
      phase: 'input',
      activeKey: null,
      isInputEnabled: true,
      message: afterOutage
        ? 'Emergency power stable. Enter the remembered sequence on the rearranged keypad.'
        : 'Sequence stored. Enter the security signals now.',
    })
  }

  selectKey(keyId) {
    this.syncMasterTimer()

    const state = gameStore.getState()

    if (
      state.screen !== 'game' ||
      state.phase !== 'input' ||
      !state.isInputEnabled
    ) {
      return
    }

    const expectedKey = state.sequence[state.currentInputIndex]

    if (keyId === expectedKey) {
      this.handleCorrectKey(keyId, state)
      return
    }

    this.handleWrongKey(keyId, state)
  }

  handleCorrectKey(keyId, state) {
    const nextInputIndex = state.currentInputIndex + 1
    const sequenceComplete = nextInputIndex === state.sequence.length

    audioEngine.play('correct')
    gameStore.setState({
      score: state.score + CORRECT_KEY_POINTS,
      currentInputIndex: nextInputIndex,
      feedbackKey: keyId,
      feedbackType: 'correct',
      isInputEnabled: !sequenceComplete,
      phase: sequenceComplete ? 'verifying' : 'input',
      message: sequenceComplete
        ? 'Sequence accepted. Verifying security clearance...'
        : `Correct signal. ${nextInputIndex} of ${state.sequence.length} confirmed.`,
    })

    this.schedule(() => this.clearKeyFeedback(keyId), 260)

    if (sequenceComplete) {
      this.stageInputCompletedAt = Date.now()

      if (state.stage === STAGES.length) {
        this.freezeMasterTimer()
      }

      this.schedule(() => this.completeStage(), 650)
    }
  }

  handleWrongKey(keyId, state) {
    const rollbackPoints = state.currentInputIndex * CORRECT_KEY_POINTS
    const penalty = getMistakePenalty(state.outagePenaltyArmed)

    audioEngine.play('wrong')
    gameStore.setState({
      score: Math.max(0, state.score - rollbackPoints),
      mistakes: state.mistakes + 1,
      stageMistakes: state.stageMistakes + 1,
      currentInputIndex: 0,
      feedbackKey: keyId,
      feedbackType: 'wrong',
      outagePenaltyArmed: false,
      message:
        `Incorrect signal. -${penalty} seconds. ` +
        'Sequence progress reset.',
    })

    this.changeTime(-penalty)

    if (gameStore.getState().phase !== 'lost') {
      this.schedule(() => this.clearKeyFeedback(keyId), 450)
    }
  }

  completeStage() {
    const state = gameStore.getState()

    if (state.phase !== 'verifying') {
      return
    }

    const stage = getStage(state.stage)
    const completionTime = this.stageInputCompletedAt ?? Date.now()
    const inputSeconds =
      this.stageInputStartedAt === null
        ? Number.POSITIVE_INFINITY
        : (completionTime - this.stageInputStartedAt) / 1000

    const perfectBonus =
      state.stageMistakes === 0 ? PERFECT_STAGE_POINTS : 0
    const quickBonus = inputSeconds <= stage.quickClearSeconds
    const pointsAwarded = STAGE_CLEAR_POINTS + perfectBonus
    const clearance = Math.floor((stage.id / STAGES.length) * 100)
    const isFinalStage = stage.id === STAGES.length
    const generatorBoost = isFinalStage && state.outageTriggered

    if (quickBonus) {
      this.addFrozenOrRunningTime(QUICK_CLEAR_TIME_BONUS)
    }

    if (generatorBoost) {
      this.addFrozenOrRunningTime(GENERATOR_BOOST_SECONDS)
    }

    const updatedTimeLeft = gameStore.getState().timeLeft
    const finalTimeBonus = isFinalStage
      ? Math.floor(updatedTimeLeft) * FINAL_TIME_POINT_MULTIPLIER
      : 0
    const nextPerfectStages =
      state.perfectStages + (perfectBonus > 0 ? 1 : 0)
    const nextQuickClears = state.quickClears + (quickBonus ? 1 : 0)
    const nextOutageSurvived = state.outageSurvived || generatorBoost
    const achievements = isFinalStage
      ? calculateAchievements({
          mistakes: state.mistakes,
          perfectStages: nextPerfectStages,
          quickClears: nextQuickClears,
          timeLeft: updatedTimeLeft,
          outageSurvived: nextOutageSurvived,
        })
      : []

    audioEngine.play(isFinalStage ? 'victory' : 'stage')
    gameStore.setState((currentState) => ({
      score: currentState.score + pointsAwarded + finalTimeBonus,
      completedStages: stage.id,
      clearance,
      perfectStages: nextPerfectStages,
      quickClears: nextQuickClears,
      outageSurvived: nextOutageSurvived,
      generatorBoostAwarded: generatorBoost,
      achievements,
      phase: isFinalStage ? 'won' : 'stage-complete',
      isInputEnabled: false,
      stageSummary: {
        stageName: stage.name,
        pointsAwarded,
        perfectBonus,
        quickBonus,
        generatorBoost,
        finalTimeBonus,
        inputSeconds,
      },
      message: isFinalStage
        ? 'All security levels cleared. Vault access granted.'
        : `${stage.name} cleared. Preparing the next security level...`,
    }))

    if (!isFinalStage) {
      this.schedule(() => this.startStage(stage.id + 1), 2200)
    }
  }

  startMasterTimer() {
    this.stopMasterTimer()
    this.masterTimerEndsAt = Date.now() + MASTER_TIME_SECONDS * 1000

    this.masterTimerId = window.setInterval(() => {
      this.syncMasterTimer()
    }, 100)
  }

  syncMasterTimer() {
    if (this.masterTimerEndsAt === null) {
      return
    }

    const timeLeft = Math.max(
      0,
      (this.masterTimerEndsAt - Date.now()) / 1000,
    )

    gameStore.setState({ timeLeft })

    if (timeLeft <= 0) {
      this.finishLoss()
    }
  }

  addFrozenOrRunningTime(seconds) {
    if (this.masterTimerEndsAt === null) {
      gameStore.setState((state) => ({
        timeLeft: state.timeLeft + seconds,
      }))
      return
    }

    this.masterTimerEndsAt += seconds * 1000
    this.syncMasterTimer()
  }

  changeTime(seconds) {
    if (this.masterTimerEndsAt === null) {
      return
    }

    this.masterTimerEndsAt += seconds * 1000
    this.syncMasterTimer()
  }

  finishLoss() {
    const state = gameStore.getState()

    if (state.phase === 'lost' || state.phase === 'won') {
      return
    }

    this.stopMasterTimer()
    this.clearStageTimeouts()
    audioEngine.play('loss')

    gameStore.setState({
      phase: 'lost',
      timeLeft: 0,
      activeKey: null,
      feedbackKey: null,
      feedbackType: null,
      isInputEnabled: false,
      message:
        'Master timer expired. The vault has entered permanent lockdown.',
    })
  }

  clearKeyFeedback(keyId) {
    const state = gameStore.getState()

    if (state.feedbackKey === keyId) {
      gameStore.setState({
        feedbackKey: null,
        feedbackType: null,
      })
    }
  }

  schedule(callback, delayMs) {
    const timeoutId = window.setTimeout(() => {
      this.stageTimeoutIds.delete(timeoutId)
      callback()
    }, delayMs)

    this.stageTimeoutIds.add(timeoutId)
    return timeoutId
  }

  clearStageTimeouts() {
    this.stageTimeoutIds.forEach((timeoutId) => {
      window.clearTimeout(timeoutId)
    })

    this.stageTimeoutIds.clear()
  }

  freezeMasterTimer() {
    if (this.masterTimerEndsAt === null) {
      return
    }

    const timeLeft = Math.max(
      0,
      (this.masterTimerEndsAt - Date.now()) / 1000,
    )

    if (this.masterTimerId !== null) {
      window.clearInterval(this.masterTimerId)
      this.masterTimerId = null
    }

    this.masterTimerEndsAt = null
    gameStore.setState({ timeLeft })
  }

  stopMasterTimer() {
    if (this.masterTimerId !== null) {
      window.clearInterval(this.masterTimerId)
      this.masterTimerId = null
    }

    this.masterTimerEndsAt = null
  }

  stopEverything() {
    this.clearStageTimeouts()
    this.stopMasterTimer()
    this.stageInputStartedAt = null
    this.stageInputCompletedAt = null
  }
}

export const gameEngine = new VaultRushEngine()
