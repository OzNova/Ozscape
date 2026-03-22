import Phaser from "phaser";

export class InputController {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = scene.input.keyboard!.addKeys("W,A,S,D,SHIFT,SPACE") as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
  }

  getHorizontal(): number {
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    return Number(right) - Number(left);
  }

  getVertical(): number {
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    return Number(down) - Number(up);
  }

  isBoosting(): boolean {
    return this.keys.SHIFT.isDown || this.keys.SPACE.isDown;
  }
}
