# BLACK GLASS

High-detail first-person immersive-sim thriller vertical slice.

## Project intent
BLACK GLASS is being built as a **small but production-quality browser-first vertical slice** that can later expand into a larger game.
The goal is not to build a huge content set up front. The goal is to ship the most impressive, stable, atmospheric playable slice possible in the browser with real, reusable systems.

## Current build target
- **Platform:** Browser-first desktop web
- **Engine:** Babylon.js
- **Rendering target:** WebGL2-safe baseline with optional higher-end enhancements where practical
- **Perspective:** First-person
- **Target playtime:** 15–25 minutes for the initial slice
- **Primary focus:** atmosphere, interaction density, investigation, stealth tension, branching finale

## Core premise
You are trapped inside a luxury biotech penthouse-lab during a storm.
Power is unstable, a security system has been compromised, one active threat is stalking the space, and the only way out is to reconstruct what happened and make a final decision about the truth you uncover.

## Design rule
**One level of content, but real systems.**

That means:
- one environment, but real level flow
- one enemy archetype, but real AI/state patterns
- a small evidence/tool set, but reusable interaction logic
- a short campaign length, but a real checkpoint and branching-state model

## Repo expectations
This repo should always contain:
- `docs/spec.md`
- `docs/milestones.md`
- `docs/architecture.md`
- `docs/assets.md`
- `docs/bugs.md`
- `docs/playtest-notes.md`
- `docs/claude-execution-brief.md`

## Non-negotiable development rules
1. Do not build throwaway “demo-only” architecture.
2. Do not overengineer for hypothetical future features.
3. Do not expand content scope before the current slice is stable and readable.
4. Every milestone must be playable or directly testable in a browser.
5. Debugging must use reproducible symptoms, not vague guesses.
6. All assets must be tracked with source and license notes.
7. Any architectural change that affects future expansion must be documented in `docs/architecture.md`.
8. Visual ambition must not outrun browser performance and input reliability.
9. Build the slice so it runs on a solid baseline before layering premium effects.

## Local run

Requirements:
- Node.js 18+ (20 LTS recommended)
- A modern desktop browser with WebGL2

Install and run the dev server:

```bash
npm install
npm run dev
```

Vite prints a local URL (default `http://localhost:5173`). Open it in a browser
and **click the canvas** to enter pointer lock. Controls:

- Move: **WASD** (or arrows)
- Sprint: **Shift**
- Look: **mouse** (while pointer-locked)
- Interact: **E**
- Evidence board: **Tab**
- Pause / release pointer: **Esc**

The M2 room contains five interactables: a shift-log terminal (read +
logs evidence), a wall switch (toggle the ceiling lamp), a data shard on
the desk (pickup + logs evidence), a south-wall HVAC vent (read + logs
evidence), and a sealed maintenance panel on the east wall (progression
gate — unlocks once all three evidence items are logged). Press **Tab** to
open the evidence board.

Type check + production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project layout

```text
index.html          # browser entry
src/
  main.ts           # DOM entry, status label, starts the app
  app/
    bootstrap.ts    # engine, render loop, resize handling
    config.ts       # app-level constants
  scenes/
    RootScene.ts    # M2 first room + evidence + gate
  styles.css
  gameplay/
    player/         # M1: PlayerController, input
    interaction/    # M1: Interactable, InteractionSystem, types
    ui/             # M1–M2: InteractionPrompt, PauseMenu, EvidenceBoard
    inventory/      # reserved — future (M2 uses EvidenceStore directly)
    evidence/       # M2: EvidenceRegistry, EvidenceStore, types
    worldState/     # reserved — M3
    ai/             # reserved — M4
  systems/          # reserved — input/audio/assets (M1+)
  render/           # reserved — pipeline/post (M1+)
  data/
    evidence/       # M2: authored evidence entries
  debug/            # reserved — debug overlays
  assets/           # reserved — imported authored assets
public/             # static files served at site root
docs/               # spec, milestones, architecture, assets, briefs
```

Milestone-gated folders are intentionally empty for now — see
`docs/architecture.md` and `docs/milestones.md` for when each comes online.

## Controls target
- Move: WASD
- Look: Mouse
- Interact: E
- Inspect evidence / alternate use: Right Mouse or Q
- Evidence board: Tab
- Pause: Esc

## Current status
**Milestone 2 — complete.** On top of the M1 shell: a data-driven evidence
registry + in-session store, three collectable evidence sources (terminal,
data shard, HVAC vent), a Tab-toggled evidence review board, and one
progression gate (sealed maintenance panel) that unlocks once all three
evidence items are logged. No AI, world-state, or multi-room systems yet.

## Next step
Begin Milestone 3 (stateful environment and spatial progression) on top of
the existing evidence model — see `docs/milestones.md`.
