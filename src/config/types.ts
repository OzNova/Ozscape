export type UpgradeKey = "engine" | "shield" | "fuelTank" | "handling";

export interface ShipStats {
  engine: number;
  shield: number;
  fuelTank: number;
  handling: number;
}

export interface DerivedShipStats {
  maxSpeed: number;
  acceleration: number;
  maxFuel: number;
  maxHealth: number;
  boostMultiplier: number;
  fuelDrainBase: number;
  fuelDrainBoost: number;
  steeringPower: number;
}

export interface ObjectiveDefinition {
  id: string;
  label: string;
  reward: number;
}

export interface RewardTuning {
  distanceFactor: number;
  efficiencyFactor: number;
  noDamageBonus: number;
}

export interface GravityHazardConfig {
  x: number;
  y: number;
  radius: number;
  strength: number;
}

export interface StationConfig {
  x: number;
  y: number;
  radius: number;
  fuelPerSecond: number;
}

export interface MovingAsteroidConfig {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  scale?: number;
}

export interface DebrisFieldConfig {
  startX: number;
  endX: number;
  count: number;
}

export interface LevelConfig {
  id: string;
  title: string;
  subtitle: string;
  length: number;
  obstacleSeed: number;
  debrisFields: DebrisFieldConfig[];
  movingAsteroids: MovingAsteroidConfig[];
  stations: StationConfig[];
  gravityHazards: GravityHazardConfig[];
  rewardTuning: RewardTuning;
  objective: ObjectiveDefinition;
  available: boolean;
}

export interface RunState {
  levelId: string;
  health: number;
  fuel: number;
  distance: number;
  coinsEarned: number;
  damageTaken: number;
  refuels: number;
  usedBoost: boolean;
  objectiveComplete: boolean;
  objectiveLabel: string;
  statusText: string;
  completed: boolean;
  failed: boolean;
  failureReason: string | null;
}

export interface UpgradeDefinition {
  key: UpgradeKey;
  label: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  apply: (stats: ShipStats) => ShipStats;
}

export interface RunSummary {
  title: string;
  result: "success" | "failure";
  reason: string;
  rewards: {
    distance: number;
    efficiency: number;
    objective: number;
    condition: number;
    total: number;
  };
  snapshot: RunState;
}
