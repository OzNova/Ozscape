import type { LevelConfig } from "./types";

export const LEVELS: LevelConfig[] = [
  {
    id: "abyssal-lane",
    title: "Abyssal Freight Lane",
    subtitle: "Escort medical cargo through a collapsed mining corridor.",
    length: 5500,
    obstacleSeed: 1337,
    debrisFields: [
      { startX: 500, endX: 1600, count: 18 },
      { startX: 2100, endX: 3300, count: 22 },
      { startX: 3700, endX: 5000, count: 28 }
    ],
    movingAsteroids: [
      { x: 1400, y: 180, velocityX: -30, velocityY: 28, scale: 0.8 },
      { x: 2450, y: 520, velocityX: -45, velocityY: -22, scale: 1 },
      { x: 3100, y: 270, velocityX: 35, velocityY: 20, scale: 0.9 },
      { x: 4300, y: 450, velocityX: -50, velocityY: 24, scale: 1.1 }
    ],
    stations: [
      { x: 2850, y: 110, radius: 90, fuelPerSecond: 26 }
    ],
    gravityHazards: [
      { x: 3550, y: 360, radius: 210, strength: 100 }
    ],
    rewardTuning: {
      distanceFactor: 0.018,
      efficiencyFactor: 26,
      noDamageBonus: 45
    },
    objective: {
      id: "clean-flight",
      label: "Deliver with no boost usage",
      reward: 35
    },
    available: true
  }
];
