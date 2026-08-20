# Cozy World handoff

Last updated: 2026-08-19

This document is the live starting point for a new contributor or AI tool.
Update it at the end of each meaningful milestone.

## Current state

The game is integrated into the existing Astro site at `/cozy-world/`. The
active development branch at the time of this update is
`feature/cozy-world-player`.

The current implementation:

- Loads Phaser from a browser-side TypeScript module.
- Mounts one Phaser canvas inside the Astro page.
- Creates one `clearing` scene in a fixed 1200 by 800 world.
- Uses a responsive `RESIZE` canvas for phone and laptop screens.
- Draws the clearing, cottage, trees, player, and development labels with
  primitive Phaser shapes.
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

The collision lesson is implemented locally but not yet committed. Its debug
visuals are still enabled in `src/games/cozy-world/main.ts`:

- `DEBUG_COLLIDERS` is `true`, so the custom obstacle rectangles are visible.
- Arcade Physics `debug` is `true`, so Phaser also draws physics outlines.

Set both values to `false` after collision behavior has been inspected and
before committing the finished lesson.

## What has been validated

On 2026-08-19, with the collision changes present:

- `git diff --check` passes.
- `npx tsc --noEmit` passes.
- `npm run build` succeeds.
- Astro generates `/cozy-world/index.html`.
- The game mounts one canvas without browser console warnings or errors.
- At a 1440 by 900 browser viewport, the canvas fits its container and the page
  has no horizontal overflow.
- At a 390 by 844 browser viewport, the canvas fits its container and the page
  has no horizontal overflow.

The production build reports a large JavaScript chunk warning from bundling
Phaser. This is expected and is not a blocker for the current phase.

Collision feel still requires direct play testing. Before committing, verify
with both keyboard and touch controls that:

1. The player cannot cross the cottage or lower tree trunks.
2. The player can move beneath the tree canopies.
3. The player slides predictably along obstacle edges and corners.
4. World-bound collision still works.

## Key decisions

- Astro owns the page shell; Phaser owns only the game canvas.
- The game world is fixed while the camera viewport adapts to the device.
- Keyboard and touch controls feed one shared movement-intent abstraction.
- Visible scenery and invisible collision geometry are separate objects.
- Static scenery uses simple Arcade Physics bodies until the world demonstrates
  a need for more detailed geometry.
- Primitive graphics remain intentional until movement, collisions, and scene
  transitions are stable.
- Depth sorting is deferred until visual assets are introduced.
- v0.1 has no local or cloud saving; refreshing starts a fresh session.
- GitHub Pages is the v0.1 host, so runtime behavior remains static and
  browser-based.

See `ARCHITECTURE.md` for the technical model behind these decisions.

## Next milestone

Lesson 6 makes the cottage enterable and introduces a genuinely different game
space.

The lesson should cover:

1. The difference between a collider, which blocks movement, and an overlap,
   which detects contact without physically separating objects.
2. Replacing the cottage's single obstacle with geometry that leaves a usable
   doorway or threshold.
3. Creating a separate `CottageScene` for the one-room interior.
4. Entering through an overlap zone or explicit interaction near the door.
5. Passing a sensible spawn position when moving between scenes.
6. Returning to the clearing without immediately retriggering the entrance.
7. Reusing the existing keyboard and touch movement behavior in both scenes.

Keep the interior made from primitive shapes. Do not introduce final art,
depth sorting, saving, or a generalized scene framework in this lesson.

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
