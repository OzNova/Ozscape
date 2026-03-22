import Phaser from "phaser";
import type { RunState } from "../config/types";

interface HudPayload {
  runState: RunState;
  wallet: number;
  levelTitle: string;
  hazardLabel: string | null;
}

export class Hud {
  private readonly root: Phaser.GameObjects.Container;

  private readonly fuelFill: Phaser.GameObjects.Rectangle;

  private readonly hullFill: Phaser.GameObjects.Rectangle;

  private readonly distanceFill: Phaser.GameObjects.Rectangle;

  private readonly labels: {
    title: Phaser.GameObjects.Text;
    fuel: Phaser.GameObjects.Text;
    hull: Phaser.GameObjects.Text;
    coins: Phaser.GameObjects.Text;
    distance: Phaser.GameObjects.Text;
    objective: Phaser.GameObjects.Text;
    status: Phaser.GameObjects.Text;
    hazard: Phaser.GameObjects.Text;
  };

  constructor(scene: Phaser.Scene) {
    this.root = scene.add.container(0, 0).setDepth(20).setScrollFactor(0);

    const panel = scene.add.rectangle(20, 18, 330, 184, 0x03111f, 0.8).setOrigin(0).setStrokeStyle(1, 0x38bdf8, 0.4);
    this.root.add(panel);

    const title = scene.add.text(38, 32, "", {
      fontFamily: "Trebuchet MS",
      fontSize: "22px",
      color: "#e0f2fe"
    });

    const fuelLabel = scene.add.text(38, 72, "", { fontSize: "16px", color: "#bae6fd" });
    const hullLabel = scene.add.text(38, 106, "", { fontSize: "16px", color: "#bae6fd" });
    const coins = scene.add.text(38, 140, "", { fontSize: "16px", color: "#fef08a" });
    const distance = scene.add.text(38, 174, "", { fontSize: "16px", color: "#c4b5fd" });
    const objective = scene.add.text(380, 34, "", { fontSize: "18px", color: "#f0f9ff" }).setScrollFactor(0);
    const status = scene.add.text(380, 64, "", { fontSize: "15px", color: "#93c5fd" }).setScrollFactor(0);
    const hazard = scene.add.text(380, 94, "", { fontSize: "15px", color: "#fda4af" }).setScrollFactor(0);

    const barBackdropFuel = scene.add.rectangle(165, 80, 128, 12, 0x082f49, 0.95).setOrigin(0, 0.5);
    const fuelFill = scene.add.rectangle(165, 80, 128, 12, 0x22d3ee, 1).setOrigin(0, 0.5);
    const barBackdropHull = scene.add.rectangle(165, 114, 128, 12, 0x3f0d15, 0.95).setOrigin(0, 0.5);
    const hullFill = scene.add.rectangle(165, 114, 128, 12, 0x34d399, 1).setOrigin(0, 0.5);
    const barBackdropDistance = scene.add.rectangle(38, 206, 255, 10, 0x111827, 0.95).setOrigin(0, 0.5);
    const distanceFill = scene.add.rectangle(38, 206, 0, 10, 0xf59e0b, 1).setOrigin(0, 0.5);

    this.root.add([
      title,
      fuelLabel,
      hullLabel,
      coins,
      distance,
      objective,
      status,
      hazard,
      barBackdropFuel,
      fuelFill,
      barBackdropHull,
      hullFill,
      barBackdropDistance,
      distanceFill
    ]);

    this.fuelFill = fuelFill;
    this.hullFill = hullFill;
    this.distanceFill = distanceFill;
    this.labels = {
      title,
      fuel: fuelLabel,
      hull: hullLabel,
      coins,
      distance,
      objective,
      status,
      hazard
    };
  }

  update(payload: HudPayload, maxFuel: number, maxHealth: number, levelLength: number): void {
    const { runState } = payload;
    this.labels.title.setText(payload.levelTitle);
    this.labels.fuel.setText(`Fuel`);
    this.labels.hull.setText(`Hull`);
    this.labels.coins.setText(`Hangar Credits: ${payload.wallet}`);
    this.labels.distance.setText(`Distance: ${Math.round(runState.distance)} / ${levelLength}`);
    this.labels.objective.setText(`Objective: ${runState.objectiveLabel}`);
    this.labels.status.setText(runState.statusText);
    this.labels.hazard.setText(payload.hazardLabel ? `Hazard: ${payload.hazardLabel}` : "Hazard: Stable corridor");

    this.fuelFill.width = 128 * Phaser.Math.Clamp(runState.fuel / maxFuel, 0, 1);
    this.hullFill.width = 128 * Phaser.Math.Clamp(runState.health / maxHealth, 0, 1);
    this.distanceFill.width = 255 * Phaser.Math.Clamp(runState.distance / levelLength, 0, 1);
  }

  destroy(): void {
    this.root.destroy(true);
    Object.values(this.labels).forEach((label) => label.destroy());
  }
}
