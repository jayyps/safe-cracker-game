import { createStore } from 'zustand/vanilla'

export function createInitialGameState() {
  return {
    screen: 'start',
    phase: 'idle',

    stage: 1,
    score: 0,
    timeLeft: 60,
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

    outageTriggered: false,
    outagePenaltyArmed: false,
    outageSurvived: false,
    generatorBoostAwarded: false,

    perfectStages: 0,
    quickClears: 0,
    achievements: [],

    soundEnabled: true,
    message: 'Security terminal standing by.',
    stageSummary: null,
  }
}

export const gameStore = createStore(() => createInitialGameState())
