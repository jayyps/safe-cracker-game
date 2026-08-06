# Stage 3 Sequence Fix

Version 1.3.1 uses a single immutable sequence snapshot owned by the game engine.
The exact same snapshot is used to:

1. Flash the preview keys.
2. Validate every player input.
3. Determine sequence completion.

The visual keypad may still rearrange during the Power Outage, but key identity, number,
symbol, and expected order remain fixed.
