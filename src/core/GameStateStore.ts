import Phaser from "phaser";
import { BASE_SHIP_STATS, deriveShipStats } from "../config/balance";
import { LEVELS } from "../config/levels";
import { UPGRADES } from "../config/upgrades";
import type {
  LevelConfig,
  RunState,
  RunSummary,
  ShipStats,
  UpgradeDefinition,
  UpgradeKey
} from "../config/types";

interface PersistedState {
  wallet: number;
  stats: ShipStats;
  unlockedLevelIndex: number;
}

const STORAGE_KEY = "ozscape-save-v1";

const createDefaultState = (): PersistedState => ({
  wallet: 0,
  stats: { ...BASE_SHIP_STATS },
  unlockedLevelIndex: 0
});

export class GameStateStore {
  private persistedState: PersistedState;

  private currentRun: RunState | null = null;

  private lastSummary: RunSummary | null = null;

  constructor() {
    this.persistedState = this.load();
  }

  private load(): PersistedState {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    try {
      const parsed = JSON.parse(raw) as PersistedState;
      return {
        wallet: parsed.wallet ?? 0,
        stats: parsed.stats ?? { ...BASE_SHIP_STATS },
        unlockedLevelIndex: parsed.unlockedLevelIndex ?? 0
      };
    } catch {
      return createDefaultState();
    }
  }

  private persist(): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.persistedState));
  }

  getShipStats(): ShipStats {
    return { ...this.persistedState.stats };
  }

  getDerivedStats() {
    return deriveShipStats(this.persistedState.stats);
  }

  getWallet(): number {
    return this.persistedState.wallet;
  }

  getUnlockedLevelIndex(): number {
    return this.persistedState.unlockedLevelIndex;
  }

  getCurrentLevel(): LevelConfig {
    const availableLevels = LEVELS.filter((level) => level.available);
    return availableLevels[Math.min(this.persistedState.unlockedLevelIndex, availableLevels.length - 1)];
  }

  getLevels(): LevelConfig[] {
    return LEVELS;
  }

  startRun(levelId = this.getCurrentLevel().id): RunState {
    const derived = this.getDerivedStats();
    const level = this.getLevels().find((entry) => entry.id === levelId) ?? this.getCurrentLevel();
    this.currentRun = {
      levelId: level.id,
      health: derived.maxHealth,
      fuel: derived.maxFuel,
      distance: 0,
      coinsEarned: 0,
      damageTaken: 0,
      refuels: 0,
      usedBoost: false,
      objectiveComplete: false,
      objectiveLabel: level.objective.label,
      statusText: "Cargo systems green.",
      completed: false,
      failed: false,
      failureReason: null
    };
    return this.getRunState();
  }

  getRunState(): RunState {
    if (!this.currentRun) {
      return this.startRun();
    }
    return { ...this.currentRun };
  }

  patchRun(patch: Partial<RunState>): RunState {
    if (!this.currentRun) {
      this.startRun();
    }
    this.currentRun = { ...(this.currentRun as RunState), ...patch };
    return this.getRunState();
  }

  finishRun(outcome: "success" | "failure", reason: string): RunSummary {
    const run = this.getRunState();
    const level = this.getLevels().find((entry) => entry.id === run.levelId) ?? this.getCurrentLevel();
    const distanceReward = Math.round(run.distance * level.rewardTuning.distanceFactor);
    const efficiencyRatio = Phaser.Math.Clamp(run.fuel / Math.max(1, this.getDerivedStats().maxFuel), 0, 1);
    const efficiencyReward = Math.round(level.rewardTuning.efficiencyFactor * efficiencyRatio);
    const conditionReward = run.damageTaken <= 0 ? level.rewardTuning.noDamageBonus : 0;
    const objectiveReward = run.objectiveComplete ? level.objective.reward : 0;
    const total = outcome === "success"
      ? distanceReward + efficiencyReward + conditionReward + objectiveReward
      : Math.max(0, Math.round(distanceReward * 0.35));

    if (outcome === "success") {
      this.persistedState.wallet += total;
      const availableLevels = LEVELS.filter((level) => level.available);
      this.persistedState.unlockedLevelIndex = Math.min(
        this.persistedState.unlockedLevelIndex + 1,
        availableLevels.length - 1
      );
      this.persist();
    } else {
      this.persistedState.wallet += total;
      this.persist();
    }

    this.lastSummary = {
      title: level.title,
      result: outcome,
      reason,
      rewards: {
        distance: distanceReward,
        efficiency: efficiencyReward,
        objective: objectiveReward,
        condition: conditionReward,
        total
      },
      snapshot: {
        ...run,
        coinsEarned: total,
        completed: outcome === "success",
        failed: outcome === "failure",
        failureReason: outcome === "failure" ? reason : null
      }
    };

    this.currentRun = null;
    return this.lastSummary;
  }

  getLastSummary(): RunSummary | null {
    return this.lastSummary;
  }

  getUpgradeDefinitions(): UpgradeDefinition[] {
    return UPGRADES;
  }

  getUpgradeCost(key: UpgradeKey): number {
    const upgrade = UPGRADES.find((entry) => entry.key === key);
    if (!upgrade) {
      return Number.POSITIVE_INFINITY;
    }
    const currentLevel = this.persistedState.stats[key];
    return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel - 1));
  }

  applyUpgrade(key: UpgradeKey): { success: boolean; cost: number } {
    const upgrade = UPGRADES.find((entry) => entry.key === key);
    if (!upgrade) {
      return { success: false, cost: 0 };
    }

    const cost = this.getUpgradeCost(key);
    if (this.persistedState.wallet < cost) {
      return { success: false, cost };
    }

    this.persistedState.wallet -= cost;
    this.persistedState.stats = upgrade.apply(this.persistedState.stats);
    this.persist();
    return { success: true, cost };
  }

  resetProgress(): void {
    this.persistedState = createDefaultState();
    this.currentRun = null;
    this.lastSummary = null;
    this.persist();
  }
}

export const gameStateStore = new GameStateStore();
