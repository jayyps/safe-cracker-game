import { STAGES } from "../data/stages.js";
import { createInitialGameState, gameStore } from "../store/gameStore.js";

class VaultRushEngine {
  constructor() {
    this.interfaceTestTimer = null;
  }

  startGame() {
    this.clearInterfaceTest();

    const firstStage = STAGES[0];

    gameStore.setState(
      {
        ...createInitialGameState(),
        screen: "game",
        status: "ready",
        message: `${firstStage.name} ready. Security keypad connection confirmed.`,
      },
      true,
    );
  }

  returnToStart() {
    this.clearInterfaceTest();
    gameStore.setState(createInitialGameState(), true);
  }

  toggleSound() {
    gameStore.setState((state) => ({
      soundEnabled: !state.soundEnabled,
    }));
  }

  runInterfaceTest() {
    const currentState = gameStore.getState();

    if (currentState.screen !== "game" || currentState.status === "testing") {
      return;
    }

    const stage = STAGES[currentState.stage - 1] ?? STAGES[0];
    const totalKeys = stage.gridSize ** 2;
    const activeKey = Math.floor(Math.random() * totalKeys);

    this.clearInterfaceTest();

    gameStore.setState({
      status: "testing",
      activeKey,
      message: `Testing security signal ${String(activeKey + 1).padStart(
        2,
        "0",
      )}...`,
    });

    this.interfaceTestTimer = window.setTimeout(() => {
      if (gameStore.getState().screen !== "game") {
        return;
      }

      gameStore.setState({
        status: "ready",
        activeKey: null,
        message: "Signal response confirmed. Security keypad is online.",
      });

      this.interfaceTestTimer = null;
    }, 700);
  }

  clearInterfaceTest() {
    if (this.interfaceTestTimer !== null) {
      window.clearTimeout(this.interfaceTestTimer);
      this.interfaceTestTimer = null;
    }
  }
}

export const gameEngine = new VaultRushEngine();
