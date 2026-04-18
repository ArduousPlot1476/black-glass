# BLACK GLASS — Architecture

## Architecture goals
- Keep the codebase readable.
- Support one highly polished browser-first vertical slice.
- Ensure the core systems are reusable for future expansion.
- Avoid both throwaway demo code and premature overengineering.
- Keep the rendering path ambitious but browser-safe.

## Foundational rule
**Small content scope, real systems.**

## Recommended folder structure

```text
project_root/
  public/
  src/
    app/
    scenes/
    systems/
    gameplay/
      player/
      interaction/
      inventory/
      evidence/
      worldState/
      ai/
      ui/
    render/
    data/
      evidence/
      items/
      world/
      endings/
    debug/
    assets/
  docs/
```

## Core systems

### 1. App bootstrap
Responsibilities:
- canvas/app creation
- engine/scene initialization
- asset loading flow
- quality setting defaults
- app state transitions
- resize handling

Keep bootstrap boring and explicit.

### 2. Player controller
Must be production-quality for the slice.
Responsibilities:
- first-person movement
- pointer lock flow
- camera look
- crouch and optional sprint
- interaction ray origin
- feedback hooks if used sparingly

### 3. Interaction system
One of the most important reusable systems.
Use a common interaction contract/interface pattern.

Interaction types in slice:
- pickup
- inspect/read
- press/toggle
- terminal use
- locked interaction requiring item/state

Recommended behavior:
- one active target at a time
- clear prompt text
- optional highlight or screen-space cue if readability requires
- interaction validates state before execution

### 4. Evidence / key item system
Evidence and key items should be data-driven where practical.

Recommended minimal model:
- id
- displayName
- description
- category
- icon
- worldSource
- collectible
- required
- linked progression flags
- optional ending relevance

Do not build a massive case-board simulation now.
Build a compact, expandable evidence registry and UI.

### 5. World-state system
This is the backbone of progression.

State examples:
- alarmLevel
- wingAccess
- serverRoomUnlocked
- finalRevealAvailable
- threatEscalationStage

Requirements:
- central and readable
- easy to debug
- easy to query from interactions, AI, and room logic
- checkpoint-friendly

A single world-state store is acceptable if kept disciplined.

### 6. Inventory / tool handling
Keep narrow for the slice.
Support only what the game actually uses.

Likely tool categories:
- access tool
- power utility
- scanner or reader

No item bloat.
The player should never manage more than a small handful of key objects.

### 7. AI threat system
One enemy archetype only.

Recommended structure:
- state machine with states:
  - patrol
  - investigate
  - pursue
  - search
  - reset
- perception based on:
  - sight
  - event triggers if needed later
- explicit debug display for current state and target

The AI must feel legible before it feels smart.

### 8. UI layers
Recommended layers:
- interaction prompt
- subtitle/log/read panel
- evidence/inventory overlay
- pause/options
- ending / result screens
- optional debug overlay

UI should stay minimal and inexpensive.

### 9. Checkpoint / retry flow
The slice needs a reliable recovery loop.
Recommended:
- checkpoint snapshots for key progression moments
- reset volatile room states as needed
- preserve meaningful progression flags
- reset threat position on reload unless design says otherwise

### 10. Finale / ending resolution
Endings should resolve from tracked state, not scripted hardcoding per path.
Minimal ending decision inputs:
- core evidence found?
- optional evidence completeness?
- player choice at finale?
- threat outcome if relevant?

## Scene strategy
Use a composition pattern.

Suggested approach:
- one root playable scene
- room modules for each space
- reusable interaction objects
- reusable terminal / pickup / switch modules
- AI spawned in specific zones
- UI persistent for whole run

## Rendering strategy
- Start from a stable baseline.
- Add premium effects only after readability and performance are acceptable.
- Keep hero lighting focused in a few spaces.
- Avoid effect stacks that are beautiful in screenshots but unstable in runtime.

## Data strategy
Use lightweight data/config files for:
- evidence entries
- item definitions
- ending definitions
- room metadata
- quality settings if needed

Avoid burying progression logic in room-specific scripts.

## Save / state strategy
For the slice, checkpoint-style recovery is enough.
A full save system can wait.

Checkpoint data should include:
- current checkpoint id
- collected evidence ids
- owned items/tool states
- world-state flags
- ending-critical flags

## Debug instrumentation
Must exist early.

Recommended debug tools:
- current interactable target
- world-state flag viewer
- AI current state
- last evidence added
- checkpoint dump
- room/state transition logs
- frame timing / performance snapshot helpers if useful

## Performance rules
- Get gameplay readable before stacking expensive visual features.
- Prefer a few high-value hero spaces over visual noise everywhere.
- Dense props should support navigation and story, not clutter.
- Any major visual effect should be easy to disable for debugging.

## Expansion guardrails
The following should be reusable from day one:
- app bootstrap shell
- player controller
- interaction system
- evidence registry
- world-state model
- AI state framework
- checkpoint flow
- UI shell

The following should stay intentionally narrow:
- number of tools
- number of enemy types
- room count
- ending count
- content breadth

If a future feature requires major rewrites to the reusable systems above, document the tradeoff before implementation.
