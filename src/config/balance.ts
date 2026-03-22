import type { DerivedShipStats, ShipStats } from "./types";

export const BASE_SHIP_STATS: ShipStats = {
  engine: 1,
  shield: 1,
  fuelTank: 1,
  handling: 1
};

export const deriveShipStats = (stats: ShipStats): DerivedShipStats => ({
  maxSpeed: 270 + stats.engine * 28,
  acceleration: 330 + stats.engine * 42,
  maxFuel: 95 + stats.fuelTank * 30,
  maxHealth: 85 + stats.shield * 20,
  boostMultiplier: 1.55 + stats.engine * 0.04,
  fuelDrainBase: 3.8 - stats.fuelTank * 0.1,
  fuelDrainBoost: 11.5 - stats.fuelTank * 0.15,
  steeringPower: 1 + stats.handling * 0.12
});
