import Phaser from "phaser";
import { gameStateStore } from "../core/GameStateStore";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#020617");

    this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 1);
    this.add.circle(width * 0.78, height * 0.22, 160, 0x38bdf8, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.add.circle(width * 0.18, height * 0.76, 220, 0xf59e0b, 0.05).setBlendMode(Phaser.BlendModes.ADD);

    this.add.text(88, 90, "Ozscape", {
      fontFamily: "Trebuchet MS",
      fontSize: "74px",
      color: "#f8fafc"
    });

    this.add.text(92, 168, "Space cargo runs through collapsing deep-space sectors.", {
      fontSize: "26px",
      color: "#bae6fd"
    });

    const level = gameStateStore.getCurrentLevel();
    const wallet = gameStateStore.getWallet();
    const summary = gameStateStore.getLastSummary();

    this.add.text(92, 244, `Current Route: ${level.title}`, {
      fontSize: "28px",
      color: "#fef3c7"
    });
    this.add.text(92, 284, level.subtitle, {
      fontSize: "20px",
      color: "#cbd5e1",
      wordWrap: { width: 530 }
    });
    this.add.text(92, 360, `Hangar Credits: ${wallet}`, {
      fontSize: "22px",
      color: "#facc15"
    });
    this.add.text(92, 396, "Controls: WASD / Arrows to steer, Shift or Space to boost.", {
      fontSize: "20px",
      color: "#c4b5fd"
    });
    this.add.text(92, 430, "Reach the end of the segment, manage fuel, and avoid debris.", {
      fontSize: "20px",
      color: "#93c5fd"
    });

    if (summary) {
      const resultColor = summary.result === "success" ? "#86efac" : "#fda4af";
      this.add.text(92, 494, `Last Run: ${summary.reason}`, {
        fontSize: "20px",
        color: resultColor
      });
      this.add.text(92, 524, `Last Reward: ${summary.rewards.total} credits`, {
        fontSize: "18px",
        color: "#e2e8f0"
      });
    }

    const startButton = this.createButton(width - 250, height - 180, "Launch Route");
    startButton.on("pointerup", () => {
      this.scene.start("flight");
    });

    const resetButton = this.createButton(width - 250, height - 104, "Reset Progress", 0x3f0d15);
    resetButton.on("pointerup", () => {
      gameStateStore.resetProgress();
      this.scene.restart();
    });
  }

  private createButton(x: number, y: number, label: string, fill = 0x0f766e): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const rect = this.add.rectangle(0, 0, 220, 56, fill, 0.95).setOrigin(0.5).setStrokeStyle(2, 0xe2e8f0, 0.25);
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
    container.on("pointerover", () => rect.setFillStyle(fill + 0x111111, 1));
    container.on("pointerout", () => rect.setFillStyle(fill, 0.95));
    return container;
  }
}
