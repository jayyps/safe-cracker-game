import { useStore } from "zustand";
import { gameStore } from "./gameStore.js";

export function useGameStore(selector) {
  return useStore(gameStore, selector);
}
