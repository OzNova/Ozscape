import Phaser from "phaser";
import { gameStateStore } from "../core/GameStateStore";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  create(): void {
    const summary = gameStateStore.getLastSummary();
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#13070b");

    this.add.rectangle(width / 2, height / 2, width, height, 0x13070b, 1);
    this.add.circle(width / 2, height / 2 - 40, 180, 0xfb7185, 0.08).setBlendMode(Phaser.BlendModes.ADD);

    this.add.text(width / 2, 110, "Route Failed", {
      fontFamily: "Trebuchet MS",
      fontSize: "64px",
      color: "#ffe4e6"
    }).setOrigin(0.5);

    this.add.text(width / 2, 200, summary?.reason ?? "Cargo run aborted.", {
      fontSize: "26px",
      color: "#fecdd3"
    }).setOrigin(0.5);

    this.add.text(width / 2, 260, `Fallback payout: ${summary?.rewards.total ?? 0} credits`, {
      fontSize: "20px",
      color: "#fde68a"
    }).setOrigin(0.5);
    this.add.text(width / 2, 292, `Distance covered: ${Math.round(summary?.snapshot.distance ?? 0)}`, {
      fontSize: "18px",
      color: "#e2e8f0"
    }).setOrigin(0.5);
    this.add.text(width / 2, 320, `Damage taken: ${Math.round(summary?.snapshot.damageTaken ?? 0)}`, {
      fontSize: "18px",
      color: "#e2e8f0"
    }).setOrigin(0.5);

    const retry = this.createButton(width / 2, 424, "Retry Route", 0xb91c1c);
    retry.on("pointerup", () => this.scene.start("flight"));
    const hangar = this.createButton(width / 2, 492, "Return to Menu", 0x1d4ed8);
    hangar.on("pointerup", () => this.scene.start("menu"));
  }

  private createButton(x: number, y: number, label: string, fill: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const rect = this.add.rectangle(0, 0, 220, 56, fill, 0.95).setOrigin(0.5).setStrokeStyle(2, 0xf8fafc, 0.2);
    const text = this.add.text(0, 0, label, {
      fontSize: "22px",
      color: "#f8fafc"
    }).setOrigin(0.5);
    container.add([rect, text]);
    container.setSize(220, 56);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-110, -28, 220, 56),
      Phaser.Geom.Rectangle.Contains
    );
    container.on("pointerover", () => rect.setAlpha(1));
    container.on("pointerout", () => rect.setAlpha(0.95));
    return container;
  }
}
