# Cozy World

For the current implementation status and the next development milestone, see
[`HANDOFF.md`](./HANDOFF.md). For technical boundaries and decisions, see
[`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Vision

Cozy World is a tiny, peaceful browser game set in an autumn clearing.

The player can walk around a cottage, enjoy changing weather and light,
enter the cottage, interact with a lamp or fireplace, and plant a tree.

The game has no combat, failure state, monetization, or pressure.

## v0.1 scope

- One compact outdoor map
- One controllable character
- One cottage interior
- Keyboard movement
- Day-to-night cycle
- Rain
- One lamp or fireplace interaction
- Tree planting
- Device-local saving

## Explicitly out of scope

- Accounts
- Backend services
- Cloud saving
- Multiplayer
- Combat
- Inventory and crafting systems
- Procedural world generation
- Mobile app packaging
- Monetization

## Platform

The game is part of the `xuanyuwang.github.io` Astro site.

Planned URL:

https://www.xuanyuwang.com/cozy-world/

The site is statically built and deployed through GitHub Pages.

## Technical direction

- Astro provides the page and deployment structure.
- TypeScript contains the game logic.
- Phaser provides rendering, input, scenes, collisions, animation, and audio.
- Browser local storage preserves small amounts of player state.
- Game assets live under `public/cozy-world/`.

## First playable milestone

A visitor can open `/cozy-world/`, see an autumn clearing and cottage,
and move a character with WASD or the arrow keys.

## Design principles

1. Visible progress in every development session
2. Prefer simple implementations over general-purpose systems
3. Add abstractions only after repeated code makes them useful
4. Keep the game playable after every milestone
5. Treat atmosphere as a core feature, not final polish
6. Keep documentation synchronized with important decisions
