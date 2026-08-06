# Final Testing Checklist

Run `npm run check`, then verify the following in the browser.

- [ ] Start screen loads and Start Vault Run begins a clean 60-second game.
- [ ] Stage 1 shows four signals on a 3x3 keypad.
- [ ] Stage 2 shows six signals on a 4x4 keypad.
- [ ] Stage 3 shows eight signals on a 4x4 keypad.
- [ ] Input is locked during every preview.
- [ ] Correct inputs award 10 points.
- [ ] Normal mistakes remove 3 seconds and reset trace progress.
- [ ] Stage 3 displays a two-second Power Outage.
- [ ] The keypad order changes after power returns.
- [ ] The sequence remains unchanged after the outage.
- [ ] The first post-outage mistake removes 6 seconds.
- [ ] Completing Stage 3 awards the 10-second Generator Boost.
- [ ] The final time bonus uses the boosted remaining time.
- [ ] Achievements appear on the victory screen.
- [ ] Sound effects play when Sound is On and stop when Sound is Off.
- [ ] Timer expiration opens the loss result.
- [ ] Play Again resets score, timer, stage, mistakes, sequence and achievements.
- [ ] Desktop and mobile layouts have no horizontal overflow.
- [ ] The deployed GitHub Pages link works in a private browser window.
