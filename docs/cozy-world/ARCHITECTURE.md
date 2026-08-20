# Cozy World Architecture

## Runtime boundary

Astro owns the document:

- Page metadata
- Site navigation
- Game heading and supporting text
- The HTML element that hosts the game
- Static-site generation

Phaser owns the game canvas:

- Rendering
- Game scenes
- Keyboard input
- Game objects
- Collision
- Animation
- Audio

Phaser is started by a browser-side TypeScript module imported from the
Cozy World Astro page.

## Mount point

The Astro page renders:

```html
<div id="cozy-world-game"></div>
```

Phaser creates its canvas inside this element.

Code outside the game should not manipulate Phaser's canvas directly.
Game code should not replace or control the surrounding site layout.

## World and viewport

The game world initially measures 1200 by 800 world units.

The canvas uses Phaser's resize scaling mode and adapts to the dimensions of
its HTML container. A phone therefore sees a narrower portion of the world,
while a laptop can see a wider portion.

The camera is responsible for selecting which part of the fixed world is
visible.

## Current scenes

- `clearing`: the initial outdoor game world

New scenes should only be introduced when the player can visit a genuinely
different game space or mode.

## Input strategy

Keyboard and touch controls produce the same abstract movement intent.

Game logic should not contain separate movement implementations for keyboard
and touch input.

## Collision strategy

The controllable player has a dynamic Arcade Physics body. Scenery that should
block movement is represented by invisible rectangles in an Arcade Physics
Static Group.

Visible scenery and collision geometry are intentionally separate:

- The cottage currently uses one simple rectangular obstacle.
- Trees use small obstacles around the lower trunk rather than the full canopy.
- The player can therefore move beneath a tree canopy while still being blocked
  by the part of the trunk that meets the ground.

Collision geometry may be rendered during development while its size and
position are being tuned. Both the custom obstacle shapes and Phaser's Arcade
Physics debug display should be disabled for normal play.

## Asset strategy

Primitive Phaser shapes are used during the foundation phase. Art assets will
be introduced after rendering, input, and scene structure are working.

This keeps visual asset problems separate from game-system problems.

## Persistence

Cozy World v0.1 does not save game state locally or remotely. Runtime changes,
including planted trees and lamp or fireplace state, reset when the page is
refreshed.
