import Phaser from "phaser";
import type { GravityHazardConfig } from "../config/types";
import type { Ship } from "../entities/Ship";
import type { HazardStatus, HazardSystem } from "./HazardSystem";

export class GravityHazardSystem implements HazardSystem {
  private readonly pulses: Phaser.GameObjects.Arc[];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly hazards: GravityHazardConfig[]
  ) {
    this.pulses = [];
  }

  setup(): void {
    this.hazards.forEach((hazard) => {
      const pulse = this.scene.add.circle(hazard.x, hazard.y, hazard.radius, 0x38bdf8, 0.08);
      pulse.setStrokeStyle(2, 0x7dd3fc, 0.4);
      pulse.setBlendMode(Phaser.BlendModes.ADD);
      pulse.setDepth(1);
      this.scene.tweens.add({
        targets: pulse,
        alpha: { from: 0.06, to: 0.18 },
        duration: 1400,
        yoyo: true,
        repeat: -1
      });
      this.pulses.push(pulse);
    });
  }

  update(ship: Ship, deltaSeconds: number): HazardStatus | null {
    let active = false;
    this.hazards.forEach((hazard) => {
      const affected = ship.applyGravityPull(
        new Phaser.Math.Vector2(hazard.x, hazard.y),
        hazard.radius,
        hazard.strength,
        deltaSeconds
      );
      active = active || affected;
    });

    return {
      label: "Gravity anomaly",
      active
    };
  }

  destroy(): void {
    this.pulses.forEach((pulse) => pulse.destroy());
    this.pulses.length = 0;
  }
}
