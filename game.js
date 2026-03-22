import { Player } from "./player.js";
import { ObstacleManager } from "./obstacles.js";

export class Game {
  constructor(ctx, width, height, controls) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.statusLabel = controls.statusLabel;
    this.scoreLabel = controls.scoreLabel;
    this.startButton = controls.startButton;
    this.restartButton = controls.restartButton;
    this.input = { w: false, a: false, s: false, d: false };
    this.player = new Player(120, height / 2);
    this.obstacles = new ObstacleManager(width, height);
    this.running = false;
    this.lastTime = 0;
    this.distance = 0;
    this.starOffset = 0;
    this.elapsedTime = 0;
    this.difficulty = 0;
    this.score = 0;
    this.maxFuel = 100;
    this.maxHealth = 100;
    this.fuel = this.maxFuel;
    this.health = this.maxHealth;
    this.idleFuelDrain = 2.6;
    this.movementFuelDrain = 4.1;
    this.collisionDamage = 20;
    this.collisionCooldown = 0.75;
    this.collisionTimer = 0;
    this.shakeTimer = 0;
    this.shakeStrength = 0;
    this.bindInput();
  }

  bindInput() {
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key in this.input) {
        event.preventDefault();
        this.input[key] = true;
      }
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (key in this.input) {
        event.preventDefault();
        this.input[key] = false;
      }
    });
  }

  start() {
    this.player = new Player(120, this.height / 2);
    this.obstacles.reset();
    this.distance = 0;
    this.starOffset = 0;
    this.elapsedTime = 0;
    this.difficulty = 0;
    this.score = 0;
    this.fuel = this.maxFuel;
    this.health = this.maxHealth;
    this.collisionTimer = 0;
    this.shakeTimer = 0;
    this.shakeStrength = 0;
    this.running = true;
    this.lastTime = performance.now();
    this.statusLabel.textContent = "Run active. Survive the deep-space debris lane.";
    this.scoreLabel.textContent = "Coins: 0";
    this.startButton.disabled = true;
    this.restartButton.disabled = true;
    requestAnimationFrame((time) => this.loop(time));
  }

  stop(message) {
    this.running = false;
    this.statusLabel.textContent = message;
    this.startButton.disabled = false;
    this.restartButton.disabled = false;
  }

  loop(currentTime) {
    if (!this.running) {
      this.draw();
      return;
    }

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.033);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    if (this.running) {
      requestAnimationFrame((time) => this.loop(time));
    }
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime;
    this.difficulty = Math.min(10, this.elapsedTime / 10);

    const didMove = this.player.update(this.input, deltaTime, {
      width: this.width,
      height: this.height
    });

    this.obstacles.update(deltaTime, this.difficulty);

    this.distance += (150 + this.difficulty * 18) * deltaTime;
    this.starOffset += (120 + this.difficulty * 10) * deltaTime;

    this.fuel -= this.idleFuelDrain * deltaTime;
    if (didMove) {
      this.fuel -= this.movementFuelDrain * deltaTime;
    }
    this.fuel = Math.max(0, this.fuel);

    this.score += (10 + this.difficulty * 3) * deltaTime;
    this.scoreLabel.textContent = `Coins: ${Math.floor(this.score)}`;

    this.collisionTimer = Math.max(0, this.collisionTimer - deltaTime);
    this.shakeTimer = Math.max(0, this.shakeTimer - deltaTime);
    if (this.shakeTimer === 0) {
      this.shakeStrength = 0;
    }

    const collidingAsteroid = this.obstacles.getCollidingAsteroid(this.player);
    if (collidingAsteroid && this.collisionTimer === 0) {
      this.health = Math.max(0, this.health - this.collisionDamage);
      this.collisionTimer = this.collisionCooldown;
      this.shakeTimer = 0.22;
      this.shakeStrength = 9;
      collidingAsteroid.x = -collidingAsteroid.radius;
      this.statusLabel.textContent = this.health > 0
        ? "Hull hit. Stabilize the ship and keep moving."
        : "Game over. Hull integrity lost.";
    } else if (this.running && this.health > 0 && this.fuel > 0) {
      this.statusLabel.textContent = `Threat level ${this.getThreatLabel()}  |  Survive and collect credits.`;
    }

    if (this.fuel === 0) {
      this.stop("Game over. Your ship ran out of fuel.");
      return;
    }

    if (this.health === 0) {
      this.stop("Game over. Hull integrity lost.");
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    if (this.shakeTimer > 0) {
      const intensity = this.shakeStrength * (this.shakeTimer / 0.22);
      const offsetX = (Math.random() - 0.5) * intensity;
      const offsetY = (Math.random() - 0.5) * intensity;
      this.ctx.translate(offsetX, offsetY);
    }

    this.drawBackground();
    this.obstacles.draw(this.ctx);
    this.player.draw(this.ctx);
    this.ctx.restore();

    this.drawHud();

    if (!this.running && this.distance === 0) {
      this.drawCenterText("Press Start");
    } else if (!this.running) {
      this.drawCenterText("Run Lost");
    }
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(1, "#0f172a");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = "rgba(226, 232, 240, 0.8)";
    for (let i = 0; i < 80; i += 1) {
      let x = (i * 137 - this.starOffset * (0.22 + (i % 5) * 0.04)) % (this.width + 40);
      if (x < -4) {
        x += this.width + 40;
      }
      const y = (i * 83) % this.height;
      this.ctx.fillRect(x, y, 2, 2);
    }
  }

  drawHud() {
    this.ctx.fillStyle = "rgba(6, 18, 34, 0.84)";
    this.ctx.fillRect(18, 18, 232, 108);
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    this.ctx.strokeRect(18, 18, 232, 108);

    this.drawMeter("Fuel", this.fuel, this.maxFuel, 38, "#38bdf8");
    this.drawMeter("Health", this.health, this.maxHealth, 70, "#34d399");

    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "15px Trebuchet MS";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Coins: ${Math.floor(this.score)}`, 32, 102);
    this.ctx.fillText(`Threat: ${this.getThreatLabel()}`, 132, 102);
  }

  drawMeter(label, value, maxValue, y, color) {
    const barX = 88;
    const barY = y - 10;
    const barWidth = 136;
    const barHeight = 12;
    const ratio = Math.max(0, Math.min(1, value / maxValue));

    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "14px Trebuchet MS";
    this.ctx.textAlign = "left";
    this.ctx.fillText(label, 32, y);

    this.ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(barX, barY, barWidth * ratio, barHeight);
    this.ctx.strokeStyle = "rgba(226, 232, 240, 0.2)";
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  drawCenterText(label) {
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    this.ctx.fillRect(this.width / 2 - 140, this.height / 2 - 34, 280, 68);
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    this.ctx.strokeRect(this.width / 2 - 140, this.height / 2 - 34, 280, 68);
    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "24px Trebuchet MS";
    this.ctx.textAlign = "center";
    this.ctx.fillText(label, this.width / 2, this.height / 2 + 8);
  }

  getThreatLabel() {
    if (this.difficulty < 2.5) {
      return "Low";
    }
    if (this.difficulty < 5.5) {
      return "Rising";
    }
    if (this.difficulty < 8) {
      return "High";
    }
    return "Critical";
  }
}
