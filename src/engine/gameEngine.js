import { audioEngine } from '../audio/audioEngine.js'
import { getDifficulty } from '../data/difficulties.js'
import { getStage, STAGES } from '../data/stages.js'
import { createInitialGameState, gameStore } from '../store/gameStore.js'
import {
  GAME_RULES,
  calculateAchievements,
  calculateFinalTimeBonus,
  calculateStageReward,
  derange,
  generateSequence,
  getMistakePenalty,
  getScoreAfterWrongSelection,
  shuffle,
} from './gameRules.js'

class VaultRushEngine {
  constructor() {
    this.masterTimerId = null
    this.masterTimerEndsAt = null
    this.stageTimeoutIds = new Set()
    this.stageInputStartedAt = null
    this.stageInputCompletedAt = null
    this.currentSequence = Object.freeze([])
    this.hazardTarget = null
  }

  startGame() {
    const { difficultyId, soundEnabled } = gameStore.getState()
    const initialState = createInitialGameState({
      difficultyId,
      soundEnabled,
    })

    this.stopEverything()
    audioEngine.setEnabled(soundEnabled)
    audioEngine.unlock()

    gameStore.setState(
      {
        ...initialState,
        screen: 'game',
        phase: 'preparing',
        message: `Initialising ${initialState.difficultyName.toLowerCase()} lockdown clock...`,
      },
      true,
    )

    audioEngine.play('start')
    this.startMasterTimer(initialState.startingTimeSeconds)
    this.schedule(() => this.startStage(1), 650)
  }

  restartGame() {
    this.startGame()
  }

  returnToStart() {
    const { difficultyId, soundEnabled } = gameStore.getState()

    this.stopEverything()
    gameStore.setState(
      createInitialGameState({ difficultyId, soundEnabled }),
      true,
    )
  }

  setDifficulty(difficultyId) {
    const state = gameStore.getState()

    if (state.screen !== 'start') {
      return
    }

    const difficulty = getDifficulty(difficultyId)

    gameStore.setState({
      difficultyId: difficulty.id,
      difficultyName: difficulty.name,
      startingTimeSeconds: difficulty.timeSeconds,
      timeLeft: difficulty.timeSeconds,
      message: `${difficulty.name} difficulty selected: ${difficulty.timeSeconds} seconds.`,
    })
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

    if (
      currentState.screen !== 'game' ||
      currentState.phase === 'lost' ||
      currentState.phase === 'won'
    ) {
      return
    }

    const stage = getStage(stageNumber)
    const totalKeys = stage.gridSize ** 2
    const keyIds = Array.from(
      { length: totalKeys },
      (_, index) => index,
    )
    const gridOrder = shuffle(keyIds)
    this.clearStageTimeouts()
    this.stageInputStartedAt = null
    this.stageInputCompletedAt = null

    if (stage.mode === 'hazard') {
      this.currentSequence = Object.freeze([])
      this.startHazardStage(stage, gridOrder)
      return
    }

    const sequence = Object.freeze(
      generateSequence(totalKeys, stage.sequenceLength),
    )
    this.currentSequence = sequence

    gameStore.setState({
      stage: stageNumber,
      phase: 'preview',
      stageMistakes: 0,
      sequence: [...sequence],
      currentInputIndex: 0,
      gridOrder,
      activeKey: null,
      feedbackKey: null,
      feedbackType: null,
      isInputEnabled: false,
      outageTriggered: false,
      outageComplete: false,
      outagePenaltyArmed: false,
      generatorBoostAwarded: false,
      stageSummary: null,
      finalTimeBonus: 0,
      message: `${stage.name}: memorise the ${stage.sequenceLength}-signal sequence.`,
    })

    this.playSequence(stage, sequence)
  }

  startHazardStage(stage, gridOrder) {
    this.clearStageTimeouts()
    this.stageInputStartedAt = Date.now()
    this.stageInputCompletedAt = null

    const target = this.chooseHazardTarget(stage.gridSize ** 2, null)
    this.hazardTarget = target

    gameStore.setState({
      stage: stage.id,
      phase: 'hazard',
      stageMistakes: 0,
      sequence: [],
      currentInputIndex: 0,
      gridOrder,
      activeKey: target,
      feedbackKey: null,
      feedbackType: null,
      isInputEnabled: true,
      hazardHits: 0,
      hazardGoal: stage.hazardTargets,
      outageTriggered: false,
      outageComplete: false,
      outagePenaltyArmed: false,
      generatorBoostAwarded: false,
      stageSummary: null,
      finalTimeBonus: 0,
      message: `Emergency shutdown active. Hit ${stage.hazardTargets} live hazard nodes.`,
    })
  }

  chooseHazardTarget(totalKeys, previousTarget) {
    let target = Math.floor(Math.random() * totalKeys)

    if (target === previousTarget) {
      target = (target + 1) % totalKeys
    }

    return target
  }

  handleHazardKey(keyId, state) {
    if (keyId !== this.hazardTarget) {
      audioEngine.play('wrong')
      gameStore.setState({
        mistakes: state.mistakes + 1,
        stageMistakes: state.stageMistakes + 1,
        feedbackKey: keyId,
        feedbackType: 'wrong',
        message: `Wrong node. -${GAME_RULES.normalMistakePenalty} seconds. Hit the flashing hazard node.`,
      })
      this.changeTime(-GAME_RULES.normalMistakePenalty)

      if (gameStore.getState().phase !== 'lost') {
        this.schedule(() => this.clearKeyFeedback(keyId), 420)
      }
      return
    }

    const nextHits = state.hazardHits + 1
    const complete = nextHits >= state.hazardGoal

    audioEngine.play('correct')
    gameStore.setState({
      score: state.score + GAME_RULES.correctKeyPoints,
      hazardHits: nextHits,
      currentInputIndex: nextHits,
      feedbackKey: keyId,
      feedbackType: 'correct',
      isInputEnabled: !complete,
      phase: complete ? 'verifying' : 'hazard',
      message: complete
        ? 'All hazard nodes disabled. Verifying emergency shutdown...'
        : `Hazard node disabled. ${nextHits} of ${state.hazardGoal} secured.`,
    })

    this.schedule(() => this.clearKeyFeedback(keyId), 220)

    if (complete) {
      this.stageInputCompletedAt = Date.now()
      this.freezeMasterTimer()
      this.schedule(() => this.completeHazardStage(), 500)
      return
    }

    const nextTarget = this.chooseHazardTarget(
      getStage(state.stage).gridSize ** 2,
      this.hazardTarget,
    )
    this.hazardTarget = nextTarget
    gameStore.setState({ activeKey: nextTarget })
  }

  completeHazardStage() {
    const state = gameStore.getState()

    if (state.phase !== 'verifying' || state.stage !== STAGES.length) {
      return
    }

    const stage = getStage(state.stage)
    const completionTime = this.stageInputCompletedAt ?? Date.now()
    const inputSeconds =
      this.stageInputStartedAt === null
        ? Number.POSITIVE_INFINITY
        : (completionTime - this.stageInputStartedAt) / 1000
    const reward = calculateStageReward({
      stageMistakes: state.stageMistakes,
      inputSeconds,
      quickClearSeconds: stage.quickClearSeconds,
      isFinalStage: false,
      outageSurvived: false,
    })

    if (reward.quickBonusSeconds > 0) {
      this.addTime(reward.quickBonusSeconds)
    }

    const updatedTimeLeft = gameStore.getState().timeLeft
    const finalTimeBonus = calculateFinalTimeBonus(updatedTimeLeft)
    const nextPerfectStages =
      state.perfectStages + (reward.perfectBonus > 0 ? 1 : 0)
    const nextQuickClears =
      state.quickClears + (reward.quickBonus ? 1 : 0)
    const finalScore = state.score + reward.pointsAwarded + finalTimeBonus
    const achievements = calculateAchievements({
      mistakes: state.mistakes,
      perfectStages: nextPerfectStages,
      quickClears: nextQuickClears,
      timeLeft: updatedTimeLeft,
      outageSurvived: false,
      hazardShutdown: true,
      finalScore,
    })

    gameStore.setState({
      score: finalScore,
      completedStages: stage.id,
      clearance: 100,
      perfectStages: nextPerfectStages,
      quickClears: nextQuickClears,
      outageSurvived: false,
      outagePenaltyArmed: false,
      generatorBoostAwarded: false,
      finalTimeBonus,
      achievements,
      phase: 'won',
      isInputEnabled: false,
      activeKey: null,
      stageSummary: {
        stageName: stage.name,
        pointsAwarded: reward.pointsAwarded,
        perfectBonus: reward.perfectBonus,
        quickBonus: reward.quickBonus,
        quickBonusSeconds: reward.quickBonusSeconds,
        generatorBoostSeconds: 0,
        finalTimeBonus,
        inputSeconds,
      },
      message: 'Emergency shutdown complete. Vault access granted.',
    })

    audioEngine.play('victory')
  }

  playSequence(stage, sequence) {
    const totalPreviewMs = stage.previewSeconds * 1000
    const slotMs = totalPreviewMs / sequence.length
    const flashMs = Math.min(
      650,
      Math.max(280, slotMs * 0.58),
    )

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

      this.enablePlayerInput(false)
    }, totalPreviewMs + 160)
  }

  triggerPowerOutage() {
    const state = gameStore.getState()

    if (
      state.stage !== STAGES.length ||
      state.phase !== 'preview'
    ) {
      return
    }

    audioEngine.play('outage')
    gameStore.setState({
      phase: 'outage',
      outageTriggered: true,
      activeKey: null,
      isInputEnabled: false,
      message:
        'CRITICAL POWER FAILURE — emergency generator starting...',
    })

    this.schedule(
      () => this.rearrangeKeypadDuringOutage(),
      GAME_RULES.outageReorderMs,
    )
    this.schedule(
      () => this.restorePower(),
      GAME_RULES.outageDurationMs,
    )
  }

  rearrangeKeypadDuringOutage() {
    const state = gameStore.getState()

    if (state.phase !== 'outage') {
      return
    }

    gameStore.setState({
      gridOrder: derange(state.gridOrder),
      message:
        'Generator rerouting power. Security matrix recalibrating...',
    })
  }

  restorePower() {
    const state = gameStore.getState()

    if (state.phase !== 'outage') {
      return
    }

    this.stageInputStartedAt = Date.now()
    this.stageInputCompletedAt = null

    audioEngine.play('restore')
    gameStore.setState({
      phase: 'input',
      outageComplete: true,
      outagePenaltyArmed: true,
      isInputEnabled: true,
      message:
        'Power restored. Key positions changed — enter the original sequence.',
    })
  }

  enablePlayerInput(afterOutage) {
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
        ? 'Emergency power stable. Enter the remembered sequence.'
        : 'Sequence stored. Enter the security signals now.',
    })
  }

  selectKey(keyId) {
    this.syncMasterTimer()

    const state = gameStore.getState()

    if (
      state.screen !== 'game' ||
      !state.isInputEnabled
    ) {
      return
    }

    if (state.phase === 'hazard') {
      this.handleHazardKey(keyId, state)
      return
    }

    if (state.phase !== 'input') {
      return
    }

    const expectedKey =
      this.currentSequence[state.currentInputIndex]

    if (keyId === expectedKey) {
      this.handleCorrectKey(keyId, state)
      return
    }

    this.handleWrongKey(keyId, state)
  }

  handleCorrectKey(keyId, state) {
    const nextInputIndex = state.currentInputIndex + 1
    const sequenceComplete =
      nextInputIndex === this.currentSequence.length

    audioEngine.play('correct')
    gameStore.setState({
      score: state.score + GAME_RULES.correctKeyPoints,
      currentInputIndex: nextInputIndex,
      feedbackKey: keyId,
      feedbackType: 'correct',
      isInputEnabled: !sequenceComplete,
      phase: sequenceComplete ? 'verifying' : 'input',
      message: sequenceComplete
        ? 'Sequence accepted. Verifying security clearance...'
        : `Correct signal. ${nextInputIndex} of ${this.currentSequence.length} confirmed.`,
    })

    this.schedule(() => this.clearKeyFeedback(keyId), 260)

    if (!sequenceComplete) {
      return
    }

    this.stageInputCompletedAt = Date.now()

    if (state.stage === STAGES.length) {
      this.freezeMasterTimer()
    }

    this.schedule(() => this.completeStage(), 600)
  }

  handleWrongKey(keyId, state) {
    const penaltySeconds = getMistakePenalty(
      state.outagePenaltyArmed,
    )
    const nextScore = getScoreAfterWrongSelection({
      score: state.score,
      currentInputIndex: state.currentInputIndex,
    })
    const isOutagePenalty = state.outagePenaltyArmed

    audioEngine.play('wrong')
    gameStore.setState({
      score: nextScore,
      mistakes: state.mistakes + 1,
      stageMistakes: state.stageMistakes + 1,
      currentInputIndex: 0,
      feedbackKey: keyId,
      feedbackType: 'wrong',
      outagePenaltyArmed: false,
      message: isOutagePenalty
        ? `Generator surge error. -${penaltySeconds} seconds. Sequence progress reset.`
        : `Incorrect signal. -${penaltySeconds} seconds. Sequence progress reset.`,
    })

    this.changeTime(-penaltySeconds)

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
    const completionTime =
      this.stageInputCompletedAt ?? Date.now()
    const inputSeconds =
      this.stageInputStartedAt === null
        ? Number.POSITIVE_INFINITY
        : (completionTime - this.stageInputStartedAt) / 1000
    const isFinalStage = stage.id === STAGES.length
    const outageSurvived =
      isFinalStage && state.outageComplete
    const reward = calculateStageReward({
      stageMistakes: state.stageMistakes,
      inputSeconds,
      quickClearSeconds: stage.quickClearSeconds,
      isFinalStage,
      outageSurvived,
    })

    if (reward.quickBonusSeconds > 0) {
      this.addTime(reward.quickBonusSeconds)
    }

    if (reward.generatorBoostSeconds > 0) {
      this.addTime(reward.generatorBoostSeconds)
    }

    const updatedTimeLeft = gameStore.getState().timeLeft
    const finalTimeBonus = isFinalStage
      ? calculateFinalTimeBonus(updatedTimeLeft)
      : 0
    const nextPerfectStages =
      state.perfectStages + (reward.perfectBonus > 0 ? 1 : 0)
    const nextQuickClears =
      state.quickClears + (reward.quickBonus ? 1 : 0)
    const nextOutageSurvived =
      state.outageSurvived || outageSurvived
    const finalScore =
      state.score + reward.pointsAwarded + finalTimeBonus
    const achievements = isFinalStage
      ? calculateAchievements({
          mistakes: state.mistakes,
          perfectStages: nextPerfectStages,
          quickClears: nextQuickClears,
          timeLeft: updatedTimeLeft,
          outageSurvived: nextOutageSurvived,
          finalScore,
        })
      : []
    const clearance = Math.round(
      (stage.id / STAGES.length) * 100,
    )

    gameStore.setState({
      score: finalScore,
      completedStages: stage.id,
      clearance,
      perfectStages: nextPerfectStages,
      quickClears: nextQuickClears,
      outageSurvived: nextOutageSurvived,
      outagePenaltyArmed: false,
      generatorBoostAwarded:
        reward.generatorBoostSeconds > 0,
      finalTimeBonus,
      achievements,
      phase: isFinalStage ? 'won' : 'stage-complete',
      isInputEnabled: false,
      stageSummary: {
        stageName: stage.name,
        pointsAwarded: reward.pointsAwarded,
        perfectBonus: reward.perfectBonus,
        quickBonus: reward.quickBonus,
        quickBonusSeconds: reward.quickBonusSeconds,
        generatorBoostSeconds:
          reward.generatorBoostSeconds,
        finalTimeBonus,
        inputSeconds,
      },
      message: isFinalStage
        ? 'All security levels cleared. Vault access granted.'
        : `${stage.name} cleared. Preparing the next security level...`,
    })

    if (isFinalStage) {
      if (reward.generatorBoostSeconds > 0) {
        audioEngine.play('generator')
        this.schedule(() => audioEngine.play('victory'), 420)
      } else {
        audioEngine.play('victory')
      }

      return
    }

    audioEngine.play('stage')
    this.schedule(() => this.startStage(stage.id + 1), 2100)
  }

  startMasterTimer(startingTimeSeconds) {
    this.stopMasterTimer()
    this.masterTimerEndsAt =
      Date.now() + startingTimeSeconds * 1000

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

  addTime(seconds) {
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
      outagePenaltyArmed: false,
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
    audioEngine.stopAll()
    this.stageInputStartedAt = null
    this.stageInputCompletedAt = null
    this.currentSequence = Object.freeze([])
    this.hazardTarget = null
  }
}

export const gameEngine = new VaultRushEngine()

if (import.meta.hot) {
  import.meta.hot.dispose(() => gameEngine.stopEverything())
}
