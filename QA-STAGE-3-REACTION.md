# Stage 3 Reaction QA

Stage 3 no longer generates, previews, stores, rearranges, or validates a sequence.

Expected flow:
1. Stage 3 begins immediately in `hazard` phase.
2. Exactly one keypad node is highlighted.
3. Clicking that node increments shutdown progress and chooses a different target.
4. Clicking any other node removes 3 seconds without resetting progress.
5. Ten correct targets complete the stage and win the game.

Validation completed:
- JavaScript syntax checks passed for the engine, rules, stage data, and store.
- Nine dependency-free rule and difficulty tests passed.
- The full browser build should be validated locally with `npm install` and `npm run check`.
