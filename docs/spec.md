# BLACK GLASS — Game Spec

## 1. Game overview
- **Working title:** BLACK GLASS
- **Genre:** First-person immersive-sim thriller / investigation / light stealth
- **Platform:** Browser-first desktop web
- **Engine/framework:** Babylon.js
- **Target audience:** Players who like dense environmental storytelling, immersive sims, tense exploration, and branching endings
- **Target session length:** 15–25 minutes for the initial vertical slice

## 2. Core fantasy
The player should feel like a sharp, vulnerable investigator trapped inside a luxurious but compromised high-security environment, using observation, tools, logic, and nerve to survive long enough to uncover the truth.

## 3. Core gameplay loop

### Moment-to-moment loop
1. Enter a room or sub-space
2. Read the environment visually and aurally
3. Identify interactables, clues, locks, power dependencies, or threats
4. Use tools or evidence to unlock new information or paths
5. React to danger, misdirect, hide, or reroute around it
6. Capture progress and move deeper

### Mid-session loop
1. Explore the penthouse-lab
2. Acquire evidence and tools
3. Restore or redirect critical systems
4. Reconstruct the event chain
5. Reach the core chamber / final reveal
6. Make a final branching decision

### Long-term loop
For the initial vertical slice, the long-term loop is replayability through:
- alternate evidence order
- optional clue discovery
- multiple endings
- faster or safer routes on replay

## 4. Player verbs
- walk
- crouch
- look
- inspect
- interact
- collect
- use item/tool
- read terminal/log
- reroute power
- unlock
- hide / evade
- review evidence
- accuse / decide

## 5. Controls
- **Keyboard/mouse**
  - Move: WASD
  - Look: Mouse
  - Interact: E
  - Crouch: Ctrl
  - Sprint: Shift (optional, tune carefully)
  - Inventory / Evidence board: Tab
  - Tool swap / utility: Q or Mouse Wheel
  - Pause: Esc
- **Controller**
  - Out of scope for the first slice
- **Mobile**
  - Out of scope

## 6. Camera and presentation
- **Perspective:** First-person
- **Resolution target:** Browser-friendly desktop presentation with scalable resolution and quality settings
- **Art style:** grounded near-future realism with premium lighting, clean luxury surfaces, wet reflections, neon/emissive contrast, storm ambience
- **Audio style:** layered environmental tension, distant thunder, HVAC hum, electrical instability, sparse score, high-quality interaction foley

## 7. Systems

### Investigation / evidence
The player gathers physical and digital evidence from the environment.
Evidence is not just collectible flavor text; it is tied to progression and final interpretation.

### Interaction
A unified interaction framework should support:
- direct pickup
- inspection
- contextual use
- terminal interaction
- switch / power controls
- locks / readers / access points

### Movement
Simple and reliable first-person movement. No parkour.
Movement must prioritize feel, readability, and stealth readability over speed.

### Threat / enemy
One enemy archetype only for the slice:
- a compromised security entity or drone-assisted patrol logic
- supports patrol, investigate, pursue, search, reset
- threat should create pressure, not dominate screen time

### Power and world state
Rooms and systems may depend on:
- power availability
- access permissions
- alarm / lockdown state
- tool ownership
- evidence knowledge gates

### Progression
Progression is spatial and informational:
- find the right clue
- gain the right access
- unlock the next subspace
- understand the event chain
- survive to the finale

### Scoring
No overt score UI.
Optional hidden metrics:
- evidence completeness
- stealth cleanliness
- time
- optional discoveries
These may influence ending flavor if desired.

### Win/loss conditions
- **Win:** reach the final decision point and resolve the scenario
- **Loss:** captured/killed by threat, catastrophic environmental failure, or player abort/reset
- **Recovery:** checkpoint reload or room-level reset depending on milestone

### UI/HUD
- Minimal HUD
- contextual interaction prompts
- objective text only when necessary
- evidence board / inventory overlay
- pause/options menu
- optional subtle threat or system-status indicators if readability requires

## 8. Content scope

### Definitely in scope for v1 vertical slice
- one contiguous penthouse-lab environment
- 5–7 rooms / spaces
- one threat archetype
- 2–3 tools or key-use mechanics
- 1 core evidence chain + optional side clues
- 1 final reveal space
- 3 endings
- strong atmosphere pass
- basic menu / pause / checkpoint flow
- browser settings for quality/performance if needed

### Explicitly out of scope
- open world
- combat-heavy gameplay
- multiple enemy types
- full dialogue tree system
- procedural generation
- crafting
- multiplayer
- mobile support
- large cutscene pipeline
- voiced narrative dependency for core comprehension

## 9. Assets
- **Asset sources:** tracked in `docs/assets.md`
- **Placeholder vs final:** use quality placeholders that are close enough to final style to test mood and readability
- **Asset folder conventions:** see `docs/assets.md`
- **Naming conventions:** see `docs/assets.md`
- **Web constraint:** any asset added must justify its runtime cost

## 10. Technical architecture
See `docs/architecture.md` for the working architecture plan.
Key rule: small content footprint, reusable core systems, browser-safe rendering decisions.

## 11. Milestones
See `docs/milestones.md`.

## 12. Risks and unknowns
1. First-person interaction may feel clumsy if prompt logic and collision tuning are weak.
2. Atmosphere may look expensive before it plays well; gameplay readability must stay ahead of visual complexity.
3. AI threat can become annoying rather than tense if patrol/investigate/search loops are not tuned carefully.
4. Evidence flow can become too linear or too obscure.
5. Performance may degrade quickly once lighting, post effects, reflections, particles, and dense props are layered in.
6. Browser performance, loading, and memory budgets may constrain asset choices sooner than desktop-first assumptions would.

## 13. Debugging plan
- Repro every meaningful bug with explicit steps.
- Capture screenshots and logs for spatial, rendering, or AI bugs.
- Track all bugs in `docs/bugs.md`.
- After each fix, record:
  - actual root cause
  - why the first implementation failed
  - how to prevent recurrence
- Add debug overlays early for:
  - interactable targets
  - AI state
  - world-state flags
  - checkpoint state
  - evidence unlock state
  - browser performance snapshots where helpful

## 14. Shipping plan
- repo/deploy target: Git + public browser build
- release checklist: see final milestone and `docs/milestones.md`
- backlog after first release:
  - second environment
  - additional endings
  - expanded threat behaviors
  - richer narrative presentation
  - optional controller support
  - expanded evidence board
  - higher-end rendering path refinements

## 15. Smallest fun version
The smallest fun version of BLACK GLASS is:
- a single polished floor
- first-person movement and interaction
- one working investigation chain
- one stalking threat
- one climax
- one successful ending and one fail state

If the project cannot make that version feel good in the browser, the project must not expand.
