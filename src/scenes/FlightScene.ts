import Phaser from "phaser";
import { deriveShipStats } from "../config/balance";
import type { LevelConfig, StationConfig } from "../config/types";
import { gameStateStore } from "../core/GameStateStore";
import { FuelSystem } from "../core/FuelSystem";
import { InputController } from "../core/InputController";
import { ProgressionSystem } from "../core/ProgressionSystem";
import { Ship } from "../entities/Ship";
import { GravityHazardSystem } from "../hazards/GravityHazardSystem";
import type { HazardSystem } from "../hazards/HazardSystem";
import { Hud } from "../ui/Hud";

export class FlightScene extends Phaser.Scene {
  private ship!: Ship;

  private level!: LevelConfig;

  private inputController!: InputController;

  private hud!: Hud;

  private fuelSystem!: FuelSystem;

  private progressionSystem!: ProgressionSystem;

  private hazards: HazardSystem[] = [];

  private obstacleGroup!: Phaser.Physics.Arcade.StaticGroup;

  private asteroidGroup!: Phaser.Physics.Arcade.Group;

  private stationGroup!: Phaser.Physics.Arcade.StaticGroup;

  private thrusterEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private maxFuel = 0;

  private maxHealth = 0;

  private runFinished = false;

  private isDocked = false;

  constructor() {
    super("flight");
  }

  create(): void {
    this.level = gameStateStore.getCurrentLevel();
    const runState = gameStateStore.startRun(this.level.id);
    const derived = deriveShipStats(gameStateStore.getShipStats());
    this.maxFuel = derived.maxFuel;
    this.maxHealth = derived.maxHealth;
    this.runFinished = false;
    this.isDocked = false;

    this.cameras.main.setBackgroundColor("#020617");
    this.physics.world.setBounds(0, 0, this.level.length + 400, this.scale.height);

    this.createBackground();
    this.createGroups();
    this.createLevelGeometry();

    this.ship = new Ship(this, 120, this.scale.height / 2);
    this.cameras.main.startFollow(this.ship, true, 0.06, 0.06);
    this.cameras.main.setBounds(0, 0, this.level.length + 300, this.scale.height);

    this.inputController = new InputController(this);
    this.fuelSystem = new FuelSystem();
    this.progressionSystem = new ProgressionSystem();
    this.hud = new Hud(this);

    this.createCollisions();
    this.createThrusters();
    this.hazards = [new GravityHazardSystem(this, this.level.gravityHazards)];
    this.hazards.forEach((hazard) => hazard.setup());

    gameStateStore.patchRun({
      ...runState,
      statusText: "Convoy cleared. Cruise window open."
    });
  }

  private createBackground(): void {
    const starfieldFar = this.add.tileSprite(0, 0, this.level.length + 1400, this.scale.height, "__WHITE").setOrigin(0).setTint(0x030712);
    starfieldFar.setAlpha(0.95);
    starfieldFar.setScrollFactor(0.15);

    const stars = this.add.graphics();
    for (let i = 0; i < 260; i += 1) {
      const x = Phaser.Math.Between(0, this.level.length + 300);
      const y = Phaser.Math.Between(0, this.scale.height);
      const radius = Phaser.Math.FloatBetween(0.4, 1.8);
      const alpha = Phaser.Math.FloatBetween(0.25, 0.95);
      stars.fillStyle(0xe2e8f0, alpha);
      stars.fillCircle(x, y, radius);
    }
    stars.setDepth(-5);

    const nebula = this.add.graphics();
    nebula.fillStyle(0x0ea5e9, 0.08);
    nebula.fillCircle(900, 180, 220);
    nebula.fillStyle(0x9333ea, 0.06);
    nebula.fillCircle(2900, 540, 280);
    nebula.fillStyle(0xf97316, 0.05);
    nebula.fillCircle(4700, 260, 240);
    nebula.setDepth(-4);
  }

  private createGroups(): void {
    this.obstacleGroup = this.physics.add.staticGroup();
    this.asteroidGroup = this.physics.add.group();
    this.stationGroup = this.physics.add.staticGroup();
  }

  private createLevelGeometry(): void {
    const seededRandom = new Phaser.Math.RandomDataGenerator([this.level.obstacleSeed.toString()]);

    this.level.debrisFields.forEach((field) => {
      for (let i = 0; i < field.count; i += 1) {
        const x = seededRandom.between(field.startX, field.endX);
        const y = seededRandom.between(82, this.scale.height - 82);
        const sprite = this.obstacleGroup.create(x, y, "debris") as Phaser.Physics.Arcade.Sprite;
        sprite.setRotation(seededRandom.realInRange(-0.7, 0.7));
        sprite.setScale(seededRandom.realInRange(0.8, 1.35));
        sprite.refreshBody();
      }
    });

    this.level.movingAsteroids.forEach((asteroidConfig) => {
      const asteroid = this.asteroidGroup.create(
        asteroidConfig.x,
        asteroidConfig.y,
        "asteroid"
      ) as Phaser.Physics.Arcade.Sprite;
      asteroid.setScale(asteroidConfig.scale ?? 1);
      asteroid.setCircle(16, 2, 2);
      asteroid.setVelocity(asteroidConfig.velocityX, asteroidConfig.velocityY);
      asteroid.setBounce(1, 1);
      asteroid.setCollideWorldBounds(true);
    });

    this.level.stations.forEach((station) => {
      const sprite = this.stationGroup.create(station.x, station.y, "station") as Phaser.Physics.Arcade.Sprite;
      sprite.setCircle(station.radius * 0.45, 4, 4);
      sprite.setScale(station.radius / 90);
      sprite.refreshBody();

      const label = this.add.text(station.x, station.y + 70, "Refuel", {
        fontSize: "18px",
        color: "#a5f3fc"
      }).setOrigin(0.5).setDepth(4);
      label.setScrollFactor(1);
    });

    const finishGate = this.add.rectangle(this.level.length + 40, this.scale.height / 2, 16, this.scale.height - 120, 0x22d3ee, 0.65);
    finishGate.setBlendMode(Phaser.BlendModes.ADD);
    finishGate.setDepth(3);
    const finishText = this.add.text(this.level.length - 22, 56, "Delivery Gate", {
      fontSize: "20px",
      color: "#cffafe"
    }).setOrigin(1, 0).setDepth(4);
    finishText.setScrollFactor(1);
  }

  private createCollisions(): void {
    this.physics.add.collider(this.ship, this.obstacleGroup, () => {
      this.onCollision("Cargo impact with debris.", 22);
    });
    this.physics.add.collider(this.ship, this.asteroidGroup, () => {
      this.onCollision("Asteroid strike on the cargo hull.", 28);
    });
    this.physics.add.collider(this.asteroidGroup, this.obstacleGroup);
  }

  private createThrusters(): void {
    const particles = this.add.particles(0, 0, "particle", {
      speed: { min: 10, max: 60 },
      scale: { start: 0.9, end: 0 },
      lifespan: 350,
      blendMode: Phaser.BlendModes.ADD,
      tint: [0xf97316, 0xfacc15, 0xfb7185],
      emitting: false
    });
    particles.setDepth(2);
    this.thrusterEmitter = particles;
  }

  update(_: number, delta: number): void {
    if (this.runFinished) {
      return;
    }

    const deltaSeconds = delta / 1000;
    const derived = deriveShipStats(gameStateStore.getShipStats());
    let runState = gameStateStore.getRunState();

    const horizontal = this.inputController.getHorizontal();
    const vertical = this.inputController.getVertical();
    const boosting = this.inputController.isBoosting() && runState.fuel > 0.5;

    this.ship.applyMovement(horizontal, vertical, derived, boosting);
    this.emitThruster(boosting);

    runState = this.fuelSystem.consume(runState, derived, deltaSeconds, boosting);
    runState = this.progressionSystem.updateDistance(runState, this.ship.x, this.level);

    const station = this.getNearbyStation(this.ship.x, this.ship.y);
    if (station) {
      const preFuel = runState.fuel;
      runState = this.fuelSystem.refuel(runState, derived, deltaSeconds, station.fuelPerSecond);
      if (preFuel < runState.fuel && !this.isDocked) {
        runState.refuels += 1;
      }
      this.isDocked = true;
      runState.statusText = preFuel < runState.fuel ? "Docking beam active. Refueling cargo ship." : "Station in range.";
    } else if (boosting) {
      this.isDocked = false;
      runState.statusText = "Boost engaged. Fuel draw elevated.";
    } else {
      this.isDocked = false;
      runState.statusText = "Holding course through the freight lane.";
    }

    let hazardLabel: string | null = null;
    this.hazards.forEach((hazard) => {
      const status = hazard.update(this.ship, deltaSeconds);
      if (status?.active) {
        hazardLabel = status.label;
        runState.statusText = `${status.label} tug detected. Correcting drift.`;
      }
    });

    gameStateStore.patchRun(runState);
    this.hud.update(
      {
        runState,
        wallet: gameStateStore.getWallet(),
        levelTitle: this.level.title,
        hazardLabel
      },
      this.maxFuel,
      this.maxHealth,
      this.level.length
    );

    if (runState.fuel <= 0) {
      this.finishFailure("Fuel reserves depleted.");
      return;
    }

    if (runState.health <= 0) {
      this.finishFailure("Hull integrity lost.");
      return;
    }

    if (this.progressionSystem.isComplete(runState, this.level)) {
      gameStateStore.patchRun({
        ...runState,
        completed: true,
        statusText: "Delivery corridor secured."
      });
      gameStateStore.finishRun("success", "Cargo delivered successfully.");
      this.runFinished = true;
      this.scene.start("hangar");
    }
  }

  private emitThruster(boosting: boolean): void {
    const body = this.ship.body as Phaser.Physics.Arcade.Body;
    const moving = body.acceleration.lengthSq() > 0;
    this.thrusterEmitter.setPosition(this.ship.x - 18, this.ship.y);
    this.thrusterEmitter.startFollow(this.ship, -18, 0, false);
    this.thrusterEmitter.setFrequency(moving ? (boosting ? 30 : 60) : 200);
    if (moving) {
      this.thrusterEmitter.start();
    } else {
      this.thrusterEmitter.stop();
    }
  }

  private onCollision(statusText: string, damage: number): void {
    if (this.runFinished) {
      return;
    }
    const currentRun = gameStateStore.getRunState();
    const reducedDamage = Math.max(6, damage - gameStateStore.getShipStats().shield * 3);
    this.cameras.main.shake(120, 0.005);
    this.ship.setTintFill(0xf87171);
    this.time.delayedCall(90, () => this.ship.clearTint());
    gameStateStore.patchRun({
      ...currentRun,
      health: Math.max(0, currentRun.health - reducedDamage),
      damageTaken: currentRun.damageTaken + reducedDamage,
      statusText
    });
  }

  private finishFailure(reason: string): void {
    if (this.runFinished) {
      return;
    }
    const runState = gameStateStore.getRunState();
    gameStateStore.patchRun({
      ...runState,
      failed: true,
      failureReason: reason,
      statusText: reason
    });
    gameStateStore.finishRun("failure", reason);
    this.runFinished = true;
    this.scene.start("game-over");
  }

  private getNearbyStation(x: number, y: number): StationConfig | null {
    const station = this.level.stations.find((entry) => Phaser.Math.Distance.Between(entry.x, entry.y, x, y) <= entry.radius);
    return station ?? null;
  }
}
