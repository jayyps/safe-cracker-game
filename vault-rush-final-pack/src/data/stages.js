export const STAGES = Object.freeze([
  {
    id: 1,
    code: 'LEVEL 01',
    name: 'Basic Access',
    gridSize: 3,
    sequenceLength: 4,
    previewSeconds: 5,
    quickClearSeconds: 7,
    description:
      'Establish the first security connection and memorise four access signals.',
  },
  {
    id: 2,
    code: 'LEVEL 02',
    name: 'Security Override',
    gridSize: 4,
    sequenceLength: 6,
    previewSeconds: 4,
    quickClearSeconds: 9,
    description:
      'Override the secondary lock using a longer sequence and similar security colours.',
  },
  {
    id: 3,
    code: 'LEVEL 03',
    name: 'Executive Lockdown',
    gridSize: 4,
    sequenceLength: 8,
    previewSeconds: 3,
    quickClearSeconds: 12,
    description:
      'Defeat the executive lock while the security system attempts a total power outage.',
  },
])

export function getStage(stageNumber) {
  return STAGES.find((stage) => stage.id === stageNumber) ?? STAGES[0]
}
