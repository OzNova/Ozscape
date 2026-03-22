# Ozscape

Ozscape is a simple standalone HTML5 Canvas space prototype built with plain HTML, CSS, and vanilla JavaScript.

## Files

- `index.html`: entry point and canvas container
- `style.css`: basic page and HUD styling
- `script.js`: game logic, rendering, and input handling

## Current Prototype

- Player spaceship controlled with `W`, `A`, `S`, `D`
- Moving asteroid obstacles
- Basic collision detection with game over on impact
- Minimal HUD with start and restart flow

## Structure

The code stays intentionally small, but it is split into separate classes for the player, obstacles, and the main game loop so new mechanics can be added later without rewriting everything.
