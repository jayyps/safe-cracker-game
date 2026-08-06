# Vault Rush Testing Checklist

## Automated checks

Run:

```bash
npm run check
```

Expected outcome: linting passes, all Node tests pass, and Vite creates `dist/` successfully.

The automated suites verify both pure rules and a complete simulated three-stage engine run:

- Sequence length and valid key range
- No adjacent duplicate sequence signals
- Every keypad key changes position during the outage
- Three-second normal penalty
- Six-second outage penalty
- Failed-trace score rollback
- Perfect, quick, and generator rewards
- Final-time bonus calculation
- Achievement selection
- Easy, Normal, and Hard starting-time configuration
- Selected difficulty persistence across Play Again and Return Home

## Manual gameplay tests

### Start and reset

- [ ] Start screen shows the title, instructions, team name, and both members.
- [ ] Sound control changes between On and Off.
- [ ] Easy starts at 180 seconds.
- [ ] Normal starts at 120 seconds.
- [ ] Hard starts at 90 seconds.
- [ ] Changing difficulty does not alter stages, sequences, scoring, penalties, bonuses, or the Power Outage.
- [ ] Start Vault Run begins a clean run using the selected time.
- [ ] Play Again resets stage, score, mistakes, sequence, grid, and timer while keeping the selected difficulty.
- [ ] Return Home stops the active run.

### Stage 1

- [ ] Grid contains 9 keys in a 3 × 3 layout.
- [ ] Four signals flash over approximately five seconds.
- [ ] Keypad is locked during the preview.
- [ ] Correct selection awards 10 points.
- [ ] Wrong selection removes three seconds and resets trace progress.
- [ ] Stage completion awards 100 points.
- [ ] A mistake-free stage awards 50 bonus points.
- [ ] A fast clear awards five seconds.

### Stage 2

- [ ] Grid contains 16 keys in a 4 × 4 layout.
- [ ] Six signals flash over approximately four seconds.
- [ ] Similar colours remain distinguishable through symbols and numbers.
- [ ] Timer, score, and mistakes carry over from Stage 1.
- [ ] Master timer continues through the stage transition.

### Stage 3

- [ ] Eight signals flash over approximately three seconds.
- [ ] Power Outage appears after the preview.
- [ ] Blackout lasts approximately two seconds.
- [ ] Master timer continues during the outage.
- [ ] Input stays disabled during the outage.
- [ ] Every one of the 16 keys moves to a new position.
- [ ] Signal identity and sequence remain unchanged.
- [ ] First wrong selection after the outage removes six seconds.
- [ ] Later wrong selections remove three seconds.
- [ ] Completing the sequence awards the ten-second Generator Boost.

### Results

- [ ] Completing Stage 3 with time remaining opens Victory.
- [ ] Final score includes five points per whole second remaining.
- [ ] Results show difficulty, starting time, score, stages, mistakes, time, and time bonus.
- [ ] Earned achievements are displayed.
- [ ] Timer reaching zero opens Lockdown.
- [ ] No key presses alter state after victory or loss.

## Responsive and accessibility tests

- [ ] Desktop at 1440 × 900
- [ ] Laptop at 1366 × 768
- [ ] Tablet at 768 × 1024
- [ ] Mobile at 390 × 844
- [ ] No horizontal page scrolling
- [ ] Every keypad button is reachable using Tab
- [ ] Enter and Space activate focused keys
- [ ] Focus outline is visible
- [ ] Status changes are announced through live regions
- [ ] Signals are identifiable without colour alone
- [ ] Reduced-motion operating-system setting suppresses long animation
- [ ] Interface remains usable at 200% browser zoom
