# Vault Rush: Beat the Lockdown

A browser-based memory and reaction game created by **Code Breakers** for the **TORIS Beat the Clock** challenge.

**Team members:** Mpho Buthelezi and JP De Jager

## Objective

Clear all three security levels and unlock the vault before the 60-second master lockdown timer reaches zero. Each level flashes a sequence of security signals. Memorise the order, then enter it accurately on the keypad.

## Final gameplay features

- 60-second master timer that continues between stages and during the outage
- Three increasingly difficult security stages
- Random sequences and keypad layouts on every run
- Correct-input scoring and mistake penalties
- Perfect-stage and quick-clear bonuses
- Stage 3 Power Outage with a two-second blackout
- Guaranteed keypad rearrangement after power recovery
- Six-second penalty for the first wrong input after the outage
- Ten-second Generator Boost after completing the final outage stage
- Web Audio API sound effects with a mute control
- Victory achievements and complete final statistics
- Responsive desktop and mobile interface
- Play Again and Return Home flows

## Scoring

| Action | Reward |
| --- | ---: |
| Correct security key | +10 points |
| Stage completion | +100 points |
| Perfect stage | +50 points |
| Quick stage completion | +5 seconds |
| Final Generator Boost | +10 seconds |
| Final time bonus | 5 points per whole second remaining |

A normal mistake removes 3 seconds. The first mistake after the Stage 3 Power Outage removes 6 seconds.

## Architecture

- **React** renders the interface and screens.
- **Vanilla JavaScript** controls sequences, scoring, timing, stages and the outage event.
- **Zustand** bridges the game engine and React UI.
- **Web Audio API** produces original generated sound effects.
- **Vite** provides development and production builds.

## Run locally

```bash
npm install
npm run dev
```

Open the local address displayed by Vite, normally `http://localhost:5173/`.

## Validate the project

```bash
npm run check
```

That command runs ESLint, the Node test suite and the production Vite build.

## Deploy to GitHub Pages

1. Push the project to the `main` branch.
2. Open **Settings > Pages** in the GitHub repository.
3. Select **GitHub Actions** as the deployment source.
4. Open the **Actions** tab and confirm that `Test and deploy Vault Rush` passes.
5. Open the public Pages address shown by the deployment job.

## Team ownership

Mpho owns the React interface, CSS, responsive design, animations and visual polish. JP owns the game engine, Zustand integration, tests, repository configuration and GitHub Pages deployment. Both team members must review, test and understand the full game before the live demonstration.

## AI disclosure

This project began from AI-assisted starter code. All retained code must be reviewed, understood, tested and meaningfully modified by the team. Preserve screenshots of prompts, code changes, test output and separate Git commits as truthful evidence of AI use and human contribution.
