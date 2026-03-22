class Game {
  constructor(ctx, width, height, controls) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.statusLabel = controls.statusLabel;
    this.scoreLabel = controls.scoreLabel;
    this.startButton = controls.startButton;
    this.restartButton = controls.restartButton;
    this.input = { w: false, a: false, s: false, d: false };
    this.player = new window.Player(120, height / 2);
    this.obstacles = new window.ObstacleManager(width, height);
    this.running = false;
    this.lastTime = 0;
    this.distance = 0;
    this.starOffset = 0;
    this.maxFuel = 100;
    this.maxHealth = 100;
    this.fuel = this.maxFuel;
    this.health = this.maxHealth;
    this.idleFuelDrain = 3;
    this.movementFuelDrain = 4.5;
    this.collisionDamage = 25;
    this.collisionCooldown = 0.65;
    this.collisionTimer = 0;
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
    this.player = new window.Player(120, this.height / 2);
    this.obstacles.reset();
    this.distance = 0;
    this.starOffset = 0;
    this.fuel = this.maxFuel;
    this.health = this.maxHealth;
    this.collisionTimer = 0;
    this.running = true;
    this.lastTime = performance.now();
    this.statusLabel.textContent = "Run active. Avoid the asteroid field.";
    this.scoreLabel.textContent = "Distance: 0";
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
      this.render();
      return;
    }

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.033);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    if (this.running) {
      requestAnimationFrame((time) => this.loop(time));
    }
  }

  update(deltaTime) {
    const didMove = this.player.update(this.input, deltaTime, { width: this.width, height: this.height });
    this.obstacles.update(deltaTime);
    this.distance += 140 * deltaTime;
    this.starOffset += 120 * deltaTime;
    this.fuel -= this.idleFuelDrain * deltaTime;
    if (didMove) {
      this.fuel -= this.movementFuelDrain * deltaTime;
    }
    this.fuel = Math.max(0, this.fuel);
    this.scoreLabel.textContent = `Distance: ${Math.floor(this.distance)}`;

    this.collisionTimer = Math.max(0, this.collisionTimer - deltaTime);

    const collidingAsteroid = this.obstacles.getCollidingAsteroid(this.player);
    if (collidingAsteroid && this.collisionTimer === 0) {
      this.health = Math.max(0, this.health - this.collisionDamage);
      this.collisionTimer = this.collisionCooldown;
      collidingAsteroid.x = -collidingAsteroid.radius;
      this.statusLabel.textContent = this.health > 0
        ? "Hull hit. Stay clear of the asteroid field."
        : "Game over. Hull integrity lost.";
    }

    if (this.fuel === 0) {
      this.stop("Game over. Your ship ran out of fuel.");
      return;
    }

    if (this.health === 0) {
      this.stop("Game over. Hull integrity lost.");
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.drawHud();
    this.obstacles.draw(this.ctx);
    this.player.draw(this.ctx);

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
    for (let i = 0; i < 70; i += 1) {
      const x = (i * 137 - this.starOffset * (0.2 + (i % 5) * 0.04)) % (this.width + 40);
      const y = (i * 83) % this.height;
      this.ctx.fillRect(x, y, 2, 2);
    }
  }

  drawHud() {
    this.ctx.fillStyle = "rgba(6, 18, 34, 0.82)";
    this.ctx.fillRect(18, 18, 188, 74);
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    this.ctx.strokeRect(18, 18, 188, 74);

    this.drawMeter("Fuel", this.fuel, this.maxFuel, 32, "#38bdf8");
    this.drawMeter("Health", this.health, this.maxHealth, 62, "#34d399");
  }

  drawMeter(label, value, maxValue, y, color) {
    const barX = 88;
    const barY = y - 10;
    const barWidth = 96;
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
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    this.ctx.fillRect(this.width / 2 - 120, this.height / 2 - 34, 240, 68);
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    this.ctx.strokeRect(this.width / 2 - 120, this.height / 2 - 34, 240, 68);
    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "24px Trebuchet MS";
    this.ctx.textAlign = "center";
    this.ctx.fillText(label, this.width / 2, this.height / 2 + 8);
  }
}

window.Game = Game;
