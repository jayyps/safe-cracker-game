import { createStore } from 'zustand/vanilla'
import {
  DEFAULT_DIFFICULTY_ID,
  getDifficulty,
} from '../data/difficulties.js'

export function createInitialGameState({
  difficultyId = DEFAULT_DIFFICULTY_ID,
  soundEnabled = true,
} = {}) {
  const difficulty = getDifficulty(difficultyId)

  return {
    screen: 'start',
    phase: 'idle',

    difficultyId: difficulty.id,
    difficultyName: difficulty.name,
    startingTimeSeconds: difficulty.timeSeconds,

    stage: 1,
    score: 0,
    timeLeft: difficulty.timeSeconds,
    mistakes: 0,
    stageMistakes: 0,
    completedStages: 0,
    clearance: 0,

    sequence: [],
    currentInputIndex: 0,
    gridOrder: [],
    activeKey: null,
    feedbackKey: null,
    feedbackType: null,
    isInputEnabled: false,

    hazardHits: 0,
    hazardGoal: 0,

    outageTriggered: false,
    outageComplete: false,
    outagePenaltyArmed: false,
    outageSurvived: false,
    generatorBoostAwarded: false,

    perfectStages: 0,
    quickClears: 0,
    achievements: [],

    soundEnabled,
    message: 'Security terminal standing by.',
    stageSummary: null,
    finalTimeBonus: 0,
  }
}

export const gameStore = createStore(() => createInitialGameState())
