# Vault Rush v1.3 QA Notes

## Gameplay retained
- Easy: 180 seconds
- Normal: 120 seconds
- Hard: 90 seconds
- Stage 3: 6 signals, 5 second preview
- Outage: 1.2 seconds
- Outage mistake penalty: 4 seconds
- Generator Boost: 15 seconds

## Interaction safety
All visual-only laptop and hazard elements use `pointer-events: none`. The SecurityGrid is rendered inside `.laptop-screen-interaction` with the highest local z-index and `touch-action: manipulation`. Disabled buttons remain intentionally non-interactive during preview, outage and verification phases.

## Automated checks
Nine dependency-free rule/difficulty tests passed in the packaging environment. The engine integration test could not run there because installed npm dependencies were unavailable. Run `npm install` and `npm run check` locally for the authoritative full validation.
