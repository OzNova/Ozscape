import Phaser from "phaser";
import type { DerivedShipStats } from "../config/types";

export class Ship extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "ship");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);
    this.setDamping(true);
    this.setDrag(0.92, 0.92);
    this.setMaxVelocity(500, 400);
    this.setCollideWorldBounds(true);
    this.setCircle(18, 6, 6);
  }

  applyMovement(horizontal: number, vertical: number, stats: DerivedShipStats, boosting: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const direction = new Phaser.Math.Vector2(horizontal, vertical);
    const thrust = stats.acceleration * (boosting ? stats.boostMultiplier : 1);
    if (direction.lengthSq() > 0) {
      direction.normalize().scale(thrust);
      body.acceleration.set(direction.x * stats.steeringPower, direction.y * stats.steeringPower);
    } else {
      body.acceleration.set(0);
    }

    const maxVelocity = stats.maxSpeed * (boosting ? stats.boostMultiplier : 1);
    body.setMaxVelocity(maxVelocity, maxVelocity * 0.72);
    this.setRotation(body.velocity.angle());
  }

  applyGravityPull(source: Phaser.Math.Vector2, radius: number, strength: number, deltaSeconds: number): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const offset = source.clone().subtract(this.getCenter());
    const distance = offset.length();
    if (distance > radius || distance <= 1) {
      return false;
    }

    const force = (1 - distance / radius) * strength * deltaSeconds;
    offset.normalize().scale(force);
    body.velocity.add(offset);
    return true;
  }
}
