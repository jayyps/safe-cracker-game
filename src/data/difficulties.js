export const DIFFICULTIES = Object.freeze([
  {
    id: 'easy',
    name: 'Easy',
    timeSeconds: 180,
    description: 'A relaxed clock for learning every security system.',
  },
  {
    id: 'normal',
    name: 'Normal',
    timeSeconds: 120,
    description: 'Balanced pressure with enough recovery time.',
  },
  {
    id: 'hard',
    name: 'Hard',
    timeSeconds: 90,
    description: 'The original high-pressure challenge.',
  },
])

export const DEFAULT_DIFFICULTY_ID = 'normal'

export function getDifficulty(difficultyId) {
  return (
    DIFFICULTIES.find(
      (difficulty) => difficulty.id === difficultyId,
    ) ??
    DIFFICULTIES.find(
      (difficulty) => difficulty.id === DEFAULT_DIFFICULTY_ID,
    )
  )
}
