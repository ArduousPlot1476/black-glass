# BLACK GLASS — Expansion Readiness Notes

## Purpose
This file clarifies how the browser-first vertical slice should be built so it can expand later without major rewrites.

## Rule
The slice is the first real part of the game, not a pitch-only mockup.

## Systems that must scale
- app bootstrap shell
- player controller
- interaction framework
- evidence/item definitions
- world-state flags
- checkpoint data
- AI state machine shell
- ending resolution model

## Systems that should stay narrow for now
- room count
- enemy count
- tool count
- narrative breadth
- ending count
- UI complexity
- rendering complexity beyond what the browser build can hold comfortably

## Expansion test
The architecture is healthy if we can later add:
1. one new room
2. one new evidence chain
3. one new route dependency
4. one new ending
without redesigning the core systems

## Refactor trigger conditions
Document and pause before expansion if:
- new content requires copying room-specific logic everywhere
- evidence progression is hardcoded in scene-specific code
- AI behavior is entangled with specific room layouts
- checkpoint restoration breaks with basic progression changes
- UI logic is duplicated per feature instead of layered sanely

## Post-slice sequence
1. stabilize M5
2. fix blocker and readability issues
3. add one new content unit only
4. validate architecture still holds
5. then expand deliberately
