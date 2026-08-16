# Repository instructions

## Project overview

This repository hosts `xuanyuwang.github.io`, an Astro site deployed through
GitHub Pages. Preserve the existing static-site architecture and deployment
workflow.

## Cozy World

Cozy World is a small Phaser browser game available under `/cozy-world/`.

Before working on it, read these files in order:

1. `docs/cozy-world/README.md` — product vision and scope
2. `docs/cozy-world/ARCHITECTURE.md` — technical boundaries and decisions
3. `docs/cozy-world/HANDOFF.md` — current status and next work

Then inspect the recent Git history and the current implementation in:

- `src/pages/cozy-world/index.astro`
- `src/games/cozy-world/main.ts`

## Collaboration style

The project owner is learning game development and is interested in the
development process.

Unless the user explicitly asks Codex to edit files:

- Let the user make the code changes.
- Teach in small, playable milestones.
- Explain the purpose of each step and the relevant graphics or Phaser concepts.
- Compare important alternatives and explain the chosen tradeoff.
- Provide exact commands and suggested code.
- Validate the user's draft without modifying it.
- Report findings with exact file and line locations when possible.

When the user explicitly authorizes edits, keep them focused and explain what
changed afterward.

## Engineering constraints

- Keep the game compatible with static GitHub Pages hosting.
- Do not introduce a backend, account system, or cloud persistence for v0.1.
- Support laptop keyboards and phone touch input through one movement-intent
  abstraction.
- Keep the fixed game world separate from the responsive camera viewport.
- Prefer primitive Phaser shapes until the core rendering and movement loop is
  working.
- Add abstractions only when the code demonstrates a concrete need for them.
- Keep Cozy World documentation synchronized with meaningful decisions.

## Validation

Run these checks after Cozy World changes:

```bash
git diff --check
npx tsc --noEmit
npm run build
```

For changes involving rendering, input, cameras, scaling, or layout, also test
`/cozy-world/` in a browser at both phone and laptop viewport sizes.

Do not commit, push, rebase, force-push, or deploy unless the user explicitly
asks for that action.
