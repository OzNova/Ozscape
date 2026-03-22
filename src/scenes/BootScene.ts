import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload(): void {
    const graphics = this.add.graphics({ x: 0, y: 0 });
    graphics.setVisible(false);

    graphics.fillStyle(0x8be9fd, 1);
    graphics.fillTriangle(12, 18, 12, 42, 48, 30);
    graphics.fillStyle(0xe2e8f0, 1);
    graphics.fillTriangle(4, 16, 18, 26, 4, 34);
    graphics.fillStyle(0xf59e0b, 0.95);
    graphics.fillTriangle(0, 23, 0, 37, 14, 30);
    graphics.generateTexture("ship", 56, 56);
    graphics.clear();

    graphics.fillStyle(0x64748b, 1);
    graphics.fillCircle(18, 18, 18);
    graphics.fillStyle(0x94a3b8, 0.9);
    graphics.fillCircle(12, 14, 5);
    graphics.fillCircle(24, 20, 4);
    graphics.generateTexture("asteroid", 36, 36);
    graphics.clear();

    graphics.fillStyle(0x334155, 1);
    graphics.fillRect(0, 0, 36, 16);
    graphics.fillStyle(0x94a3b8, 1);
    graphics.fillRect(4, 4, 28, 8);
    graphics.generateTexture("debris", 36, 16);
    graphics.clear();

    graphics.fillStyle(0x0f172a, 1);
    graphics.fillCircle(40, 40, 36);
    graphics.lineStyle(4, 0x38bdf8, 1);
    graphics.strokeCircle(40, 40, 26);
    graphics.fillStyle(0xf8fafc, 1);
    graphics.fillCircle(40, 40, 8);
    graphics.generateTexture("station", 80, 80);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture("particle", 4, 4);
    graphics.destroy();
  }

  create(): void {
    this.scene.start("menu");
  }
}
