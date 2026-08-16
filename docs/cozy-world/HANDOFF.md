# Cozy World handoff

Last updated: 2026-08-15

This document is the live starting point for a new contributor or AI tool.
Update it at the end of each meaningful milestone.

## Current state

The game is on the `feature/cozy-world` branch and is integrated into the
existing Astro site at `/cozy-world/`.

The current implementation:

- Loads Phaser from a browser-side TypeScript module.
- Mounts a Phaser canvas inside the Astro page.
- Creates one `clearing` scene.
- Defines a fixed 1200 by 800 game world.
- Uses a responsive `RESIZE` canvas for phone and laptop screens.
- Draws an autumn clearing, cottage, trees, and development labels with
  primitive Phaser shapes.
- Configures matching camera and Arcade Physics world bounds.
- Centers the initial camera on the clearing.
- Contains no controllable player yet.

## What has been validated

- `npx tsc --noEmit` passes.
- `npm run build` succeeds.
- Astro generates `/cozy-world/index.html`.
- Phaser mounts without browser console errors.
- The canvas resizes at phone and laptop viewport sizes.

The production build currently reports a large JavaScript chunk warning from
bundling Phaser. This is expected and is not considered a blocker for the
foundation phase.

## Key decisions

- Astro owns the page shell; Phaser owns only the game canvas.
- The game world is fixed while the camera viewport adapts to the device.
- Laptop and touch controls will feed one shared movement-intent abstraction.
- Primitive graphics are intentional during the foundation phase.
- GitHub Pages is the v0.1 host, so all runtime behavior must remain static and
  browser-based.

See `ARCHITECTURE.md` for the reasoning behind these decisions.

## Next milestone

Add a controllable player while keeping the lesson small and observable.

The next lesson should cover:

1. The Phaser scene lifecycle: `preload`, `create`, and `update`.
2. The difference between a rendered Game Object and an Arcade Physics body.
3. Creating a temporary player from primitive shapes.
4. Representing movement as a normalized direction vector.
5. Keyboard input through WASD and arrow keys.
6. A touch input adapter that produces the same movement intent.
7. Diagonal-speed normalization.
8. Camera follow and world-bound collision.

Keep collision with the cottage and trees out of the first player-movement
lesson unless the basic movement loop is already working and verified.

## Important files

- `src/pages/cozy-world/index.astro` — Astro page and responsive game container
- `src/games/cozy-world/main.ts` — current Phaser configuration and scene
- `src/apps/apps.ts` — Apps-page registration
- `docs/cozy-world/README.md` — product scope
- `docs/cozy-world/ARCHITECTURE.md` — technical model and boundaries
- `AGENTS.md` — repository-wide collaboration instructions

## Setup on another device

```bash
git clone https://github.com/xuanyuwang/xuanyuwang.github.io.git
cd xuanyuwang.github.io
git switch --track origin/feature/cozy-world
npm ci
npx tsc --noEmit
npm run build
```

If the repository already exists on that device:

```bash
git fetch origin
git switch feature/cozy-world
git pull --ff-only
npm ci
```

## Suggested first prompt in a new Codex task

> Read `AGENTS.md` and the three documents under `docs/cozy-world/` in the
> instructed order. Then inspect the current Cozy World implementation and
> recent Git history without editing anything. Summarize the current state and
> teach the next player-movement lesson described in `HANDOFF.md`.

## Handoff checklist

Before switching devices or accounts:

1. Commit the current milestone.
2. Update this document if the project state or next milestone changed.
3. Run the validation commands from `AGENTS.md`.
4. Push the active branch.
5. Confirm the remote branch contains the latest commit.
