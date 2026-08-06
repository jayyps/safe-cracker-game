# Quality Assurance Results

## Version

Vault Rush v1.1.1 — balanced timer update.

## Completed in the build environment

- **Automated suites:** 10 tests passed with zero failures.
- **Difficulty configuration:** Easy 180 seconds, Normal 120 seconds, and Hard 90 seconds passed.
- **Difficulty persistence:** Play Again and Return Home preserved the selected mode.
- **Hard-mode expiry:** the simulated master timer ended cleanly after 90 seconds.
- **Full engine simulation:** passed a three-stage Hard-mode run from start through victory.
- **Stage 3 outage:** every one of the 16 keys moved to a different position.
- **Outage penalty:** remained armed after a correct selection and applied six seconds to the first later mistake.
- **Normal penalty:** applied three seconds after the outage penalty was consumed.
- **Generator Boost:** awarded ten seconds after successful final-stage recovery.
- **Timer behaviour:** continued through previews, transitions, and outage; froze at the final correct input.
- **Result flows:** victory, loss, restart, and return-home paths passed.
- **Import audit:** all relative JavaScript and JSX imports resolved to project files.
- **JavaScript syntax audit:** all non-JSX modules passed `node --check`.
- **Stylesheet structure audit:** CSS braces were balanced.
- **JSON audit:** `package.json` and `package-lock.json` parsed successfully.

## Required on the team computer

Run this after extracting the project:

```powershell
npm install
npm run check
```

`npm run check` performs ESLint, all Node tests, and the Vite production build. The final Vite build could not be executed in the build environment because its package mirror did not provide Zustand; the project includes a complete npm lockfile for installation from the normal npm registry.

After the automated checks pass, manually confirm all three difficulty buttons, the dynamic vault timer display, Play Again persistence, results labels, and the browser checklist in `TESTING.md`.
