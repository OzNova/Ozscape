import Phaser from "phaser";
import type { DerivedShipStats, RunState } from "../config/types";

export class FuelSystem {
  consume(runState: RunState, stats: DerivedShipStats, deltaSeconds: number, boosting: boolean): RunState {
    const drain = boosting ? stats.fuelDrainBoost : stats.fuelDrainBase;
    return {
      ...runState,
      fuel: Phaser.Math.Clamp(runState.fuel - drain * deltaSeconds, 0, stats.maxFuel),
      usedBoost: runState.usedBoost || boosting
    };
  }

  refuel(runState: RunState, stats: DerivedShipStats, deltaSeconds: number, rate: number): RunState {
    const nextFuel = Phaser.Math.Clamp(runState.fuel + rate * deltaSeconds, 0, stats.maxFuel);
    return {
      ...runState,
      fuel: nextFuel,
      refuels: runState.refuels + 1
    };
  }
}
