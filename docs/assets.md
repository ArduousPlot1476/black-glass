# BLACK GLASS — Assets Plan

## Asset philosophy
Use assets to validate atmosphere, readability, and production value early, but keep all sourcing disciplined.
Every asset must be traceable, and every asset must justify its browser cost.

## Source categories
- **Environment materials / HDRIs / some models:** clearly licensed sources
- **Support packs / utility assets:** allowed if style-consistent and low friction
- **Character animation rapid-start:** allowed if licensing is clear
- **Premium marketplace assets:** allowed only if style-coherent and runtime-appropriate
- **Custom / modified assets:** document origin and edits
- **AI-generated assets:** only if usage rights are clear and output quality is actually helpful

## Asset priorities by milestone

### M0–M1
Need:
- one premium room kit or modular environment baseline
- key hero props
- materials for glass, metal, stone, screens, wet surfaces
- ambience and interaction placeholder audio
- one strong lighting baseline

### M2
Need:
- evidence props
- terminals / data panels
- pickup items / icons
- inspectable props

### M3
Need:
- full room set dressing for 5–7 spaces
- signage, decals, clutter, readable route markers
- access/alarm props

### M4
Need:
- one enemy or security-entity visual direction
- movement/alert/search feedback assets
- fail/retry feedback assets

### M5
Need:
- ending-state presentation assets
- final polish audio
- optional cinematic flourishes that do not require a cutscene pipeline

## Folder conventions

```text
src/assets/
  audio/
    ambience/
    foley/
    ui/
    music/
  materials/
  models/
    environment/
    props/
    character/
    enemy/
  textures/
    trim/
    tiling/
    decals/
    ui/
  ui/
  vfx/
```

## Naming conventions
- `bg_` prefix for BLACK GLASS-specific authored assets if useful
- room names:
  - `room_lobby`
  - `room_glass_hall`
  - `room_server`
  - `room_exec_suite`
- props:
  - `prop_terminal_a`
  - `prop_keyreader_b`
  - `prop_evidence_vial`
- materials:
  - `mat_glass_smoked`
  - `mat_floor_wet_stone`
- audio:
  - `amb_storm_far_01`
  - `sfx_switch_toggle_01`

## Asset tracking table template
For each asset, track:
- asset name
- source URL or marketplace/source name
- creator/publisher
- license
- modified? yes/no
- where used
- replace later? yes/no

## Style rules
- Prefer a consistent near-future luxury/biotech look over mixed-source noise.
- Avoid obvious stylization conflicts.
- Avoid low-detail filler clutter.
- Use fewer, better assets rather than many mismatched assets.

## Technical rules
- Validate scale early.
- Validate collision or interaction boundaries on every major prop category.
- Avoid bloated texture sets on non-hero assets.
- Keep materials coherent and reusable.
- Track every imported asset batch immediately.
- Prefer assets that can be simplified or downgraded cleanly if performance demands it.

## Placeholder vs final guidance
Good placeholder:
- close in silhouette
- close in readability
- close in mood
- technically stable

Bad placeholder:
- wildly different art style
- wrong scale
- incorrect interaction expectations
- temporary junk that forces rework later

## Asset review checklist
Before approving any import batch:
- Does it fit the art direction?
- Is the license documented?
- Is the scale correct?
- Will it actually appear on screen in this slice?
- Does it improve mood, readability, or progression clarity?
- Is there a simpler substitute already in the repo?
- Is the runtime cost justified?
