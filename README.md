# Vault Rush: Beat the Lockdown

A browser-based memory and reaction game created by **Code Breakers** for the **TORIS Beat the Clock** challenge.

## Team

- Mpho Buthelezi
- JP De Jager

## Objective

Unlock the digital vault by clearing three security stages before the selected master lockdown timer reaches zero. Each stage displays a generated sequence of coloured security signals. Memorise the order, then select the same signals correctly.

## Completed features

- React interface built with Vite
- Framework-independent JavaScript game engine
- Zustand vanilla store bridging the engine and React
- Three timer-only difficulty modes: Easy 180 seconds, Normal 120 seconds, and Hard 90 seconds
- Persistent master timer that continues through stages and the Power Outage
- Three increasingly difficult stages
- Random sequences with no immediate duplicate signals
- Random keypad layouts
- Correct-input scoring and wrong-input time penalties
- Failed-trace score rollback to prevent score farming
- Perfect-stage and quick-clear bonuses
- Final score bonus based on time remaining
- Stage 3 Power Outage lasting approximately two seconds
- Guaranteed 16-key derangement: every key moves to a new position
- Original sequence preserved through the outage
- Six-second penalty for the first wrong post-outage selection
- Ten-second Generator Boost after successful outage recovery
- Generated Web Audio sound effects with a mute control
- Victory achievements and full result statistics
- Keyboard-accessible keypad buttons
- Symbols as well as colours for signal identification
- Responsive desktop, tablet, and mobile layouts
- Reduced-motion support
- Automated gameplay-rule and full-engine integration tests
- GitHub Pages deployment workflow

## Difficulty modes

Difficulty changes only the starting clock. Grid sizes, sequence lengths, preview durations, scoring, penalties, bonuses, and the Stage 3 Power Outage remain identical.

The timer continues during previews, stage transitions, and the outage. The larger clock budgets make Easy suitable for first-time players while preserving the same memory challenge.

| Mode | Starting time |
| --- | ---: |
| Easy | 180 seconds |
| Normal | 120 seconds |
| Hard | 90 seconds |

Play Again keeps the selected mode. Return Home also remembers it so the player can review or change the selection. Because the final score includes points for time remaining, future leaderboards should be separated by difficulty rather than mixing all modes together.

## Rules and scoring

| Event | Reward or penalty |
| --- | ---: |
| Correct security key | +10 points |
| Stage completion | +100 points |
| Perfect stage | +50 points |
| Quick stage completion | +5 seconds |
| Normal wrong selection | -3 seconds |
| First wrong selection after the outage | -6 seconds |
| Successful Stage 3 outage recovery | +10 seconds |
| Final time bonus | 5 points per whole second remaining |

A wrong selection resets the current trace. Points earned during that failed trace are removed so repeatedly selecting the first correct signal cannot inflate the score.

## Stages

| Stage | Grid | Sequence | Preview | Special rule |
| --- | ---: | ---: | ---: | --- |
| Basic Access | 3 × 3 | 4 signals | 5 seconds | Introduces core controls |
| Security Override | 4 × 4 | 6 signals | 4 seconds | Similar security colours |
| Executive Lockdown | 4 × 4 | 8 signals | 3 seconds | Power Outage and rearranged keypad |

## Run locally

On Windows, double-click `SETUP-AND-RUN.bat`, or use the terminal commands below.

Node.js 22.12 or newer is required. The team machine already uses Node.js 24.

```bash
npm install
npm run dev
```

Open the local address displayed by Vite, normally `http://localhost:5173/`.

## Validate the project

```bash
npm run check
```

That command runs:

1. ESLint
2. Node gameplay-rule tests
3. Vite production build

Individual commands:

```bash
npm run lint
npm test
npm run build
npm run preview
```

## Architecture

```text
React components
      ↓ selectors
Zustand vanilla store
      ↑ state updates
Vanilla JavaScript game engine
```

- `src/components/` renders the start screen, HUD, keypad, overlays, and results.
- `src/engine/gameEngine.js` owns timing, stage flow, sequences, input validation, scoring, bonuses, outage behaviour, victory, and loss.
- `src/engine/gameRules.js` contains reusable pure rules with automated tests.
- `src/audio/audioEngine.js` generates original sound effects using the Web Audio API.
- `src/store/` connects game-engine state to React.
- `src/data/difficulties.js` centralises timer-only difficulty modes.
- `src/data/stages.js` centralises stage progression and sequence settings.

## GitHub Pages

The project includes `.github/workflows/deploy.yml`. After pushing to `main`:

1. Open the new repository on GitHub.
2. Select **Settings → Pages**.
3. Select **GitHub Actions** as the deployment source.
4. Open **Actions** and confirm the workflow passes.
5. Test the published link in a private browser window and on a phone.

The Vite configuration uses relative production paths, so the game works from a repository subpath on GitHub Pages.

## Competition integrity

This is an AI-assisted starting implementation based on the team’s original concept. Both team members must review, understand, test, modify, and commit meaningful work before submission. Keep genuine prompt screenshots, code annotations, test results, and Git commit history. Do not claim unreviewed AI-generated code as manually authored work.


## v1.3 Visual Upgrade

- The security keypad is displayed inside a cartoon 3D laptop.
- Decorative laptop, mascot, glass, keyboard and hazard layers never receive pointer events.
- The actual SecurityGrid is isolated in the highest interaction layer.
- Stage 3 activates a red/orange hazard environment with warning beacons and scan effects.
- A CSS-built Vault Rush security robot reacts visually during the final stage.
- Reduced-motion preferences disable continuous hazard animation.


## Stage 3: Emergency Shutdown

The final level is now a reaction challenge, not a memory sequence. One live hazard node flashes at a time. Disable 10 nodes to complete the vault run. Wrong nodes remove 3 seconds but never reset shutdown progress.
