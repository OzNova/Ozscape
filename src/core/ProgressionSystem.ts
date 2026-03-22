import Phaser from "phaser";
import type { LevelConfig, RunState } from "../config/types";

export class ProgressionSystem {
  updateDistance(runState: RunState, shipX: number, level: LevelConfig): RunState {
    const distance = Phaser.Math.Clamp(shipX - 120, 0, level.length);
    return {
      ...runState,
      distance,
      objectiveComplete: !runState.usedBoost && distance >= level.length
    };
  }

  isComplete(runState: RunState, level: LevelConfig): boolean {
    return runState.distance >= level.length;
  }
}
