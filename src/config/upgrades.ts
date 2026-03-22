import type { UpgradeDefinition } from "./types";

export const UPGRADES: UpgradeDefinition[] = [
  {
    key: "engine",
    label: "Engine",
    description: "Raises top speed, thrust, and boost efficiency.",
    baseCost: 55,
    costMultiplier: 1.5,
    apply: (stats) => ({ ...stats, engine: stats.engine + 1 })
  },
  {
    key: "shield",
    label: "Shield",
    description: "Raises hull integrity so collisions are more forgiving.",
    baseCost: 60,
    costMultiplier: 1.55,
    apply: (stats) => ({ ...stats, shield: stats.shield + 1 })
  },
  {
    key: "fuelTank",
    label: "Fuel Tank",
    description: "Increases fuel reserves and slightly improves efficiency.",
    baseCost: 50,
    costMultiplier: 1.45,
    apply: (stats) => ({ ...stats, fuelTank: stats.fuelTank + 1 })
  },
  {
    key: "handling",
    label: "Handling",
    description: "Sharpens movement response and control recovery.",
    baseCost: 48,
    costMultiplier: 1.4,
    apply: (stats) => ({ ...stats, handling: stats.handling + 1 })
  }
];
