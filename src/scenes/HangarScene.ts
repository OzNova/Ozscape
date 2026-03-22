import Phaser from "phaser";
import { deriveShipStats } from "../config/balance";
import type { UpgradeDefinition } from "../config/types";
import { gameStateStore } from "../core/GameStateStore";

export class HangarScene extends Phaser.Scene {
  constructor() {
    super("hangar");
  }

  create(): void {
    const summary = gameStateStore.getLastSummary();
    const stats = gameStateStore.getShipStats();
    const derived = deriveShipStats(stats);
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#06111d");
    this.add.rectangle(width / 2, height / 2, width, height, 0x06111d, 1);
    this.add.circle(width * 0.78, height * 0.22, 190, 0x38bdf8, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.add.circle(width * 0.22, height * 0.72, 220, 0x14b8a6, 0.05).setBlendMode(Phaser.BlendModes.ADD);

    this.add.text(84, 56, "Hangar", {
      fontFamily: "Trebuchet MS",
      fontSize: "60px",
      color: "#f8fafc"
    });

    if (summary) {
      this.add.text(88, 132, `${summary.reason}`, {
        fontSize: "24px",
        color: "#86efac"
      });
      this.add.text(88, 168, `Distance payout: ${summary.rewards.distance}`, { fontSize: "18px", color: "#e2e8f0" });
      this.add.text(88, 194, `Efficiency payout: ${summary.rewards.efficiency}`, { fontSize: "18px", color: "#e2e8f0" });
      this.add.text(88, 220, `Condition bonus: ${summary.rewards.condition}`, { fontSize: "18px", color: "#e2e8f0" });
      this.add.text(88, 246, `Objective bonus: ${summary.rewards.objective}`, { fontSize: "18px", color: "#e2e8f0" });
      this.add.text(88, 282, `Credits earned: ${summary.rewards.total}`, { fontSize: "24px", color: "#facc15" });
    }

    this.add.text(88, 336, `Wallet: ${gameStateStore.getWallet()} credits`, {
      fontSize: "22px",
      color: "#fde68a"
    });
    this.add.text(88, 372, `Hull ${derived.maxHealth}  |  Fuel ${Math.round(derived.maxFuel)}  |  Speed ${Math.round(derived.maxSpeed)}`, {
      fontSize: "18px",
      color: "#cbd5e1"
    });

    const upgrades = gameStateStore.getUpgradeDefinitions();
    upgrades.forEach((upgrade, index) => {
      this.renderUpgradeCard(upgrade, index, stats[upgrade.key]);
    });

    const launchButton = this.createButton(width - 220, height - 110, "Next Launch");
    launchButton.on("pointerup", () => this.scene.start("flight"));

    const menuButton = this.createButton(width - 220, height - 42, "Back to Menu", 0x1d4ed8);
    menuButton.on("pointerup", () => this.scene.start("menu"));
  }

  private renderUpgradeCard(upgrade: UpgradeDefinition, index: number, currentLevel: number): void {
    const x = 88 + (index % 2) * 360;
    const y = 430 + Math.floor(index / 2) * 138;
    const cost = gameStateStore.getUpgradeCost(upgrade.key);
    const canAfford = gameStateStore.getWallet() >= cost;

    const card = this.add.rectangle(x, y, 320, 116, 0x0f172a, 0.9).setOrigin(0).setStrokeStyle(1, 0x38bdf8, 0.35);
    this.add.text(x + 18, y + 16, `${upgrade.label} Mk.${currentLevel}`, {
      fontSize: "22px",
      color: "#f8fafc"
    });
    this.add.text(x + 18, y + 46, upgrade.description, {
      fontSize: "16px",
      color: "#cbd5e1",
      wordWrap: { width: 200 }
    });

    const button = this.createButton(x + 244, y + 58, `${cost} cr`, canAfford ? 0x0f766e : 0x334155, 104, 42);
    if (canAfford) {
      button.on("pointerup", () => {
        gameStateStore.applyUpgrade(upgrade.key);
        this.scene.restart();
      });
    }

    this.add.existing(card);
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    fill = 0x0f766e,
    width = 180,
    height = 52
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const rect = this.add.rectangle(0, 0, width, height, fill, 0.95).setOrigin(0.5).setStrokeStyle(2, 0xe2e8f0, 0.22);
    const text = this.add.text(0, 0, label, {
      fontSize: "20px",
      color: "#f8fafc"
    }).setOrigin(0.5);
    container.add([rect, text]);
    container.setSize(width, height);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    container.on("pointerover", () => rect.setAlpha(1));
    container.on("pointerout", () => rect.setAlpha(0.95));
    return container;
  }
}
