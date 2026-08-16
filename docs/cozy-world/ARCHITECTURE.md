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

Keyboard and touch controls will produce the same abstract movement intent.

Game logic should not contain separate movement implementations for keyboard
and touch input.

## Asset strategy

Primitive Phaser shapes are used during the foundation phase. Art assets will
be introduced after rendering, input, and scene structure are working.

This keeps visual asset problems separate from game-system problems.
