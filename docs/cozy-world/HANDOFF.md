# Cozy World handoff

Last updated: 2026-09-01

This document is the live starting point for a new contributor or AI tool.
Update it at the end of each meaningful milestone.

## Current state

The game is integrated into the existing Astro site at `/cozy-world/`. The
active development branch is `main`.

The current implementation:

- Loads Phaser from a browser-side TypeScript module.
- Mounts one Phaser canvas inside the Astro page.
- Provides an outdoor clearing and a separate cottage interior scene.
- Uses a responsive `RESIZE` canvas for phone and laptop screens.
- Uses SVG art for the player and major scenery, with primitive Phaser shapes
  for the remaining foundation graphics.
- Moves the player with WASD, arrow keys, or an on-screen touch joystick.
- Converts keyboard and touch input into one shared movement intent.
- Normalizes diagonal movement and gives keyboard input priority when both
  input sources are active.
- Keeps the player inside the Arcade Physics world bounds.
- Follows the player with a bounded, gently interpolated camera.
- Uses a Static Group of simple obstacle rectangles for cottage and tree-trunk
  collision.
- Keeps tree colliders around the lower trunks so the player can move beneath
  the canopies.
- Supports scene transitions between the clearing and cottage without an
  immediate return-loop at either doorway.
- Shares a world clock, day-to-night atmosphere, changing rain, and outdoor
  forest ambience across the experience.
- Provides an in-game audio control and waits for the browser to unlock audio
  before starting ambience.
- Lets the player toggle a cottage lamp using either E or a contextual
  on-screen button.
- Uses a reusable contextual-action control for keyboard input, touch input,
  responsive positioning, and scene cleanup.

## What has been validated

On 2026-09-01, after extracting the contextual-action control:

- `git diff --check` passes.
- `npx tsc --noEmit` passes.
- `npm run build` succeeds.
- Astro generates `/cozy-world/index.html`.
- The game mounts one canvas without browser console warnings or errors.
- At a 1440 by 900 browser viewport, the lamp action button appears when the
  player approaches the lamp and toggles the lamp glow when clicked.
- At a 390 by 844 browser viewport, the joystick and contextual action button
  remain visible, correctly positioned, and do not overlap.

The production build reports a large JavaScript chunk warning from bundling
Phaser. This is expected and is not a blocker for the current phase.

## Key decisions

- Astro owns the page shell; Phaser owns only the game canvas.
- The game world is fixed while the camera viewport adapts to the device.
- Keyboard and touch controls feed one shared movement-intent abstraction.
- Visible scenery and invisible collision geometry are separate objects.
- Static scenery uses simple Arcade Physics bodies until the world demonstrates
  a need for more detailed geometry.
- Primitive graphics and SVG art coexist while gameplay remains the priority.
- Player and scenery depth use their world Y positions for top-down occlusion.
- Contextual interactions share input and responsive UI behavior without
  moving scene-specific availability or effects into a general game system.
- v0.1 has no local or cloud saving; refreshing starts a fresh session.
- GitHub Pages is the v0.1 host, so runtime behavior remains static and
  browser-based.

See `ARCHITECTURE.md` for the technical model behind these decisions.

## Next milestone

Lesson 15A adds one fixed outdoor planting spot. It should reuse the contextual
action control introduced after the lamp lesson, teach the difference between
an available interaction and its resulting world-state change, and keep the
planted tree in memory only for the current browser session.

## Remaining lesson order

The remaining roadmap is mirrored by tickets in the Linear project
`Cozy World v0.1`:

1. Lesson 6 — Make the cottage enterable
2. Lesson 7 — Organize world construction
3. Lesson 8 — Add the first player sprite
4. Lesson 9 — Replace scenery primitives with art assets
5. Lesson 10 — Add top-down depth and occlusion
6. Lesson 11 — Add a day-to-night atmosphere cycle
7. Lesson 12 — Add gentle rain weather
8. Lesson 13 — Add ambient sound
9. Lesson 14 — Add a lamp or fireplace interaction
10. Lesson 15 — Let the player plant a tree
11. Lesson 16 — Test performance and responsive behavior
12. Lesson 17 — Polish and verify the v0.1 playable loop

Local saving and a dedicated accessibility lesson are not part of this
roadmap.

## Important files

- `src/pages/cozy-world/index.astro` — Astro page and responsive game container
- `src/games/cozy-world/main.ts` — Phaser configuration and current scenes
- `src/apps/apps.ts` — Apps-page registration
- `docs/cozy-world/README.md` — product vision and v0.1 scope
- `docs/cozy-world/ARCHITECTURE.md` — technical model and boundaries
- `AGENTS.md` — repository-wide collaboration instructions

## Setup on another device

Use the default branch unless this document explicitly identifies unmerged work
on another branch:

```bash
git clone https://github.com/xuanyuwang/xuanyuwang.github.io.git
cd xuanyuwang.github.io
npm ci
npx tsc --noEmit
npm run build
```

If the repository already exists on that device:

```bash
git fetch origin
git switch main
git pull --ff-only
npm ci
```

If the current lesson is on an unmerged feature branch, fetch it and switch to
the exact branch named in the current-state section before continuing.

## Suggested first prompt in a new Codex task

> Read `AGENTS.md` and the three documents under `docs/cozy-world/` in the
> instructed order. Then inspect the current Cozy World implementation and
> recent Git history without editing anything. Summarize the current state and
> teach the next lesson described in `HANDOFF.md`.

## Handoff checklist

Before switching devices or accounts:

1. Finish and manually play-test the current lesson.
2. Run the validation commands from `AGENTS.md`.
3. Update this document if the project state or next milestone changed.
4. Commit the milestone.
5. Push the active branch.
6. Confirm the remote branch contains the latest commit.
