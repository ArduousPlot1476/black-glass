# BLACK GLASS — Milestones

## Milestone philosophy
Every milestone must produce a playable or directly testable browser result.
We are not building a big game in parallel. We are building a narrow, believable, polished slice in sequence.

---

## M0 — Project foundation and documentation
**Status: complete.** Vite + TypeScript + Babylon.js scaffold in place,
bootstrap shell renders a minimal placeholder scene, folder structure reserved
per `architecture.md`. No gameplay systems implemented.

### Goal
Establish the repo, documentation, folder structure, build tooling, and Babylon app structure.

### Outcome
A clean, documented browser project with agreed scope and file structure.

### Systems / files touched
- app initialization
- README
- all docs
- base folder structure
- input mapping plan
- scene/bootstrap shell

### Acceptance criteria
- Repo structure exists and is clean.
- Core docs are present and coherent.
- App bootstraps in the browser.
- Input actions are planned.
- Asset tracking conventions are documented.
- No gameplay implementation yet.

### Test procedure
- Run local dev server.
- Load the browser app successfully.
- Verify docs are present.
- Verify folder structure matches architecture plan.

### Expansion safety check
Reusable foundation: repo structure, docs, bootstrap shell, naming rules.
Intentionally narrow: no gameplay features yet.
Do not generalize: no speculative systems.

---

## M1 — Movement, interaction, and first-room atmosphere
**Status: complete.** First-person `PlayerController` (UniversalCamera +
pointer lock + `_collideWithWorld`), action-mapped `InputState`, reusable
`InteractionSystem` covering inspect/toggle/pickup with single-target
prompt UI, DOM pause menu. One deliberate atmospheric room with warm desk
spot + cold accent + fog; terminal, wall switch (toggles ceiling lamp), and
pickup wired as the three interactables. No M2+ systems added.

### Goal
Create a playable first room with premium tone, reliable first-person controls, and a unified interaction base.

### Outcome
The player can move, look, interact with core objects, read one terminal/log, and experience the intended mood in-browser.

### Systems / files touched
- player controller
- camera
- interaction component/system
- basic UI prompts
- first room environment
- lighting/post baseline
- simple pause/settings shell

### Acceptance criteria
- Movement feels stable and readable.
- Interaction prompts appear reliably.
- At least 3 interaction types work.
- First room sells the visual/auditory target.
- Build runs reliably in the browser.

### Test procedure
- Run app locally.
- Move through first room.
- Interact with terminal, pickup, and switch-like object.
- Confirm no major input or collision issues.
- Confirm room communicates tone within 60 seconds.
- Confirm browser console is clean of critical errors.

### Expansion safety check
Reusable foundation: player controller, interaction framework, UI prompt logic.
Intentionally narrow: one room only.
Do not generalize: avoid building a full inventory or global puzzle system yet.

---

## M2 — Evidence loop and inventory/evidence board
### Goal
Add evidence acquisition, inspection, tracking, and one gated progression step based on gathered information or a found item.

### Outcome
The player can collect key evidence, review it, and use it to unlock meaningful progression.

### Systems / files touched
- evidence data model
- inventory or key-item handling
- evidence board / review UI
- inspect/read flow
- one gated door/system dependent on evidence or tool ownership

### Acceptance criteria
- At least 3 pieces of evidence are collectible and reviewable.
- Evidence/state is persisted in-session.
- At least 1 progression gate depends on the system.
- UI is readable and not overly heavy.
- Browser interaction flow remains responsive.

### Test procedure
- Collect evidence in different order.
- Open evidence UI and confirm tracking.
- Verify progression is blocked before required discovery and unlocked after.
- Confirm no duplicate or broken evidence states.
- Confirm performance remains acceptable with the UI open/closed.

### Expansion safety check
Reusable foundation: evidence/item data model, review UI shell, progression gate logic.
Intentionally narrow: only one core evidence chain.
Do not generalize: avoid building a giant case-board feature set yet.

---

## M3 — Stateful environment and spatial progression
### Goal
Expand the slice into the full playable floor using access, alarms, and environmental state as the backbone of progression.

### Outcome
The player can move through 5–7 spaces by manipulating world state rather than only finding keys in sequence.

### Systems / files touched
- room/subspace flow
- access control states
- alarm/lockdown logic
- environmental feedback
- checkpoint logic
- objective/update layer

### Acceptance criteria
- The level has clear but nontrivial progression.
- At least 2 world-state dependencies exist.
- Checkpoint or recovery flow works.
- The player can reach the final third of the map without external explanation.

### Test procedure
- Play full slice path from start.
- Verify dependencies change correctly.
- Reload checkpoint and confirm state restoration.
- Confirm route readability is acceptable.
- Confirm no major browser hitching when moving between spaces.

### Expansion safety check
Reusable foundation: world-state model, checkpoint logic, gated progression pattern.
Intentionally narrow: one floor only.
Do not generalize: no need for full chapter/mission framework yet.

---

## M4 — Threat AI and fail/retry loop
### Goal
Introduce the active threat and make tension a core part of the slice.

### Outcome
The player can be discovered, pressured, evade, and recover, creating real suspense.

### Systems / files touched
- AI state machine
- perception
- patrol/investigate/search/pursue logic
- fail state
- recovery / reload flow
- stealth affordances (cover/hide/readability)

### Acceptance criteria
- Threat behavior is legible.
- Discovery and pursuit work consistently.
- Fail state and retry flow are reliable.
- Threat meaningfully changes player behavior without dominating every minute.
- Performance remains acceptable when the threat is active.

### Test procedure
- Trigger discovery intentionally.
- Lose line of sight and observe search behavior.
- Trigger fail state.
- Reload and confirm state integrity.
- Validate threat pacing over a full run.
- Check browser console for errors during state transitions.

### Expansion safety check
Reusable foundation: AI state framework, fail/retry loop, stealth readability rules.
Intentionally narrow: one enemy archetype only.
Do not generalize: no combat sandbox, squad AI, or multi-enemy systems.

---

## M5 — Finale, endings, polish, and ship prep
### Goal
Complete the slice with final reveal logic, branching endings, polish, cleanup, and browser deployment validation.

### Outcome
A shippable browser vertical slice with multiple endings, clear instructions, and coherent quality.

### Systems / files touched
- finale sequence
- ending state resolution
- UI cleanup
- audio polish
- lighting/material polish
- bug fixes
- performance pass
- README and release notes
- deployment config

### Acceptance criteria
- At least 3 endings resolve correctly.
- Full slice is completable without blocker bugs.
- Performance is acceptable on target browsers/devices.
- Docs are current.
- Known issues are documented.
- Public build is clean enough to hand to external testers.

### Test procedure
- Complete the game through each ending path.
- Run clean-start playthrough and replay path.
- Verify pause/checkpoint/retry/ending transitions.
- Review docs and known issues.
- Smoke test in at least two browsers if possible.

### Expansion safety check
Reusable foundation: ending/state model, polish baseline, documentation discipline.
Intentionally narrow: only one scenario.
Do not generalize: no sequel-scope content additions before the slice is stable.

---

## Post-slice expansion path
Only after M5 is stable:
1. Add one new room or wing using existing progression/state systems.
2. Add one new evidence chain.
3. Add one new threat behavior, not a new enemy class.
4. Expand replayability and consequence tracking.
5. Consider controller support and wider options.
6. Only then evaluate a second full scenario or chapter.
