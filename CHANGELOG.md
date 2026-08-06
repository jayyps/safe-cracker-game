# Version 1.2.2

- Restored the stable keypad interface.
- Removed experimental laptop and hazard overlay layers.
- Rebalanced Level 3 to 6 signals, a 5-second preview, a 1.2-second outage, a 4-second outage penalty, and a 15-second generator boost.
- Preserved Easy/Normal/Hard timer modes.

# Changelog

## 1.1.1

- Rebalanced timer-only difficulty modes after playtesting.
- Easy now starts at 180 seconds, Normal at 120 seconds, and Hard at 90 seconds.
- All sequences, grids, scoring, penalties, bonuses, previews, and the Power Outage remain unchanged.
- Updated automated tests and documentation for the new clock budgets.

## 1.1.0

- Added Easy, Normal, and Hard difficulty selection.
- Difficulty changes only the starting timer: 90, 60, or 45 seconds.
- Added the selected mode to the gameplay panel and final results.
- Play Again and Return Home preserve the selected difficulty.
- Added automated difficulty configuration and persistence tests.

## 1.0.0

- Built the React, Vite, Zustand, and vanilla JavaScript architecture.
- Added the 60-second master timer and three difficulty stages.
- Added scoring, penalties, perfect bonuses, quick bonuses, and final-time scoring.
- Added the Stage 3 Power Outage and full-key derangement.
- Added the six-second first post-outage mistake penalty.
- Added the ten-second Generator Boost.
- Added generated Web Audio effects and mute control.
- Added victory achievements and complete results.
- Added responsive and accessibility behaviour.
- Added automated gameplay-rule tests.
- Added GitHub Pages deployment automation.

## 1.3.1
- Fixed Stage 3 sequence mismatch by using one immutable engine-owned sequence for both preview and input validation.
- Kept laptop, cartoon robot, and hazardous background effects unchanged.

## 1.4.0 - Emergency Shutdown
- Replaced Stage 3 sequence memory and Power Outage gameplay with a reaction-based hazard shutdown.
- Players disable 10 live nodes, one at a time.
- Wrong nodes cost 3 seconds but do not reset progress.
- Retained the laptop, cartoon robot, and hazardous background.
- Added the Hazard Controller achievement.

## 1.5.0 - Cartoon Alarm Overdrive

- Added silent visual alarm sirens and sweeping warning lights.
- Added comic-style bursts, motion lines, halftone dots and chunky shadows.
- Added a larger animated cartoon operator to the start screen.
- Intensified the Stage 3 Emergency Shutdown presentation without changing its stable reaction gameplay.
- Kept all decorative layers pointer-transparent so keypad input remains unobstructed.
