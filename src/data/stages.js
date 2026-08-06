export const STAGES = Object.freeze([
  Object.freeze({
    id: 1,
    code: 'LEVEL 01',
    name: 'Basic Access',
    mode: 'sequence',
    gridSize: 3,
    sequenceLength: 4,
    previewSeconds: 5,
    quickClearSeconds: 7,
    description:
      'Establish the first security connection and memorise four access signals.',
  }),
  Object.freeze({
    id: 2,
    code: 'LEVEL 02',
    name: 'Security Override',
    mode: 'sequence',
    gridSize: 4,
    sequenceLength: 6,
    previewSeconds: 4,
    quickClearSeconds: 9,
    description:
      'Override the secondary lock using a longer sequence and similar security colours.',
  }),
  Object.freeze({
    id: 3,
    code: 'LEVEL 03',
    name: 'Emergency Shutdown',
    mode: 'hazard',
    gridSize: 4,
    hazardTargets: 10,
    quickClearSeconds: 20,
    description:
      'The executive system is overheating. Hit each live hazard node as it appears and shut the vault down before total failure.',
  }),
])

export function getStage(stageNumber) {
  return STAGES.find((stage) => stage.id === stageNumber) ?? STAGES[0]
}
