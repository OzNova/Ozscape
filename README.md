# Ozscape

Ozscape is a modular Phaser + TypeScript prototype for a space cargo delivery game. The current build includes a playable freight run, fuel management, hazard handling, collision damage, a post-run hangar with upgrades, and scene transitions for restart/progression flow.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`

## Current Prototype

- One handcrafted + semi-random level segment
- Smooth keyboard ship controls with boost
- Fuel, hull, distance, and hazard UI
- Debris, moving asteroids, gravity anomaly, and refuel station
- Coin rewards and a hangar upgrade loop

## Architecture

- `src/config`: game data contracts and balance config
- `src/core`: reusable gameplay state and systems
- `src/entities`: ship entity implementation
- `src/hazards`: hazard contracts and active hazard systems
- `src/scenes`: Phaser scenes for boot/menu/flight/hangar/failure
- `src/ui`: HUD rendering helpers
