import { createStore } from "zustand/vanilla";

export function createInitialGameState() {
  return {
    screen: "start",
    status: "idle",

    stage: 1,
    score: 0,
    timeLeft: 60,
    mistakes: 0,
    clearance: 0,

    activeKey: null,
    soundEnabled: true,

    message: "Security terminal standing by.",
  };
}

export const gameStore = createStore(() => createInitialGameState());
