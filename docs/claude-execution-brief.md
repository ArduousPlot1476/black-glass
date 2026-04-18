# BLACK GLASS — Claude Execution Brief

This file exists to keep Claude Code aligned and reduce drift.

## Claude's job
Implement the next approved milestone cleanly and report back accurately.

## Claude must always optimize for
- readable architecture
- small, testable diffs
- stable browser behavior
- milestone discipline
- future expansion only where explicitly justified

## Claude must not do
- add future milestones early
- invent extra features that were not requested
- replace the agreed game direction
- build placeholder architecture that fights later milestones
- silently change controls, genre, camera, or progression structure
- overcomplicate systems before the current scope needs it
- optimize purely for screenshots at the expense of runtime stability

## Priority order
1. Keep the milestone scoped.
2. Do not break existing working behavior.
3. Make the milestone playable/testable in browser.
4. Keep systems readable.
5. Leave useful notes in docs when architecture changes.

## Project-specific rules
- This project is a **production-quality browser-first vertical slice**, not a fake demo.
- Content scope stays small.
- Core systems must be reusable:
  - app bootstrap shell
  - player controller
  - interaction framework
  - evidence tracking
  - world state
  - AI state framework
  - checkpoint flow
  - UI shell
- Content breadth stays intentionally narrow:
  - one environment
  - one enemy archetype
  - a few tools
  - a few endings
- Treat visual effects as optional layers unless the current build proves they are stable.

## Required report-back format
When Claude completes a task, report back in this exact structure:

1. Files created/edited
2. What was implemented
3. Any assumptions made
4. Any known issues or risks
5. Exact local run/test steps
6. Recommended next milestone or fix

## Required implementation behavior
When changing architecture, Claude must state:
- why the change was needed
- whether it improves or harms future expansion
- whether any docs should be updated

When fixing a bug, Claude must state:
- actual root cause
- why the original implementation failed
- how to prevent the bug class from recurring

## Milestone safety rules
Before adding a new system, Claude should ask internally:
- Is this required for the current milestone?
- Can this be solved by extending an existing system?
- Will this create rework later?
- Is there a narrower implementation that still satisfies acceptance criteria?

If the answer suggests overbuild, Claude should not do it.

## Done means
Work is only “done” when:
- acceptance criteria are met
- the build runs in-browser
- no blocker regression was introduced
- docs are updated if the architecture or milestone status changed
