const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const statusLabel = document.getElementById("status");
const scoreLabel = document.getElementById("score");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

class Player {
  constructor(x, y) {
    this.width = 34;
    this.height = 22;
    this.position = { x, y };
    this.speed = 280;
  }

  update(input, deltaTime, bounds) {
    const horizontal = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const vertical = (input.s ? 1 : 0) - (input.w ? 1 : 0);
    const moved = horizontal !== 0 || vertical !== 0;

    this.position.x += horizontal * this.speed * deltaTime;
    this.position.y += vertical * this.speed * deltaTime;

    this.position.x = Math.max(24, Math.min(bounds.width - 24, this.position.x));
    this.position.y = Math.max(24, Math.min(bounds.height - 24, this.position.y));

    return moved;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-16, -11);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-16, 11);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(-18, -4, 8, 8);
    ctx.restore();
  }

  getBounds() {
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }
}

class ObstacleManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.asteroids = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.9;
  }

  reset() {
    this.asteroids = [];
    this.spawnTimer = 0;
  }

  update(deltaTime) {
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnAsteroid();
    }

    this.asteroids.forEach((asteroid) => {
      asteroid.x -= asteroid.speed * deltaTime;
      asteroid.y += asteroid.drift * deltaTime;
    });

    this.asteroids = this.asteroids.filter((asteroid) => asteroid.x + asteroid.radius > 0);
  }

  draw(ctx) {
    this.asteroids.forEach((asteroid) => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(0, 0, asteroid.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(-asteroid.radius * 0.25, -asteroid.radius * 0.15, asteroid.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  spawnAsteroid() {
    const radius = 16 + Math.random() * 20;
    this.asteroids.push({
      x: this.width + radius,
      y: 30 + Math.random() * (this.height - 60),
      radius,
      speed: 200 + Math.random() * 140,
      drift: -35 + Math.random() * 70
    });
  }

  getCollidingAsteroid(player) {
    const bounds = player.getBounds();
    return this.asteroids.find((asteroid) => {
      const nearestX = Math.max(bounds.x, Math.min(asteroid.x, bounds.x + bounds.width));
      const nearestY = Math.max(bounds.y, Math.min(asteroid.y, bounds.y + bounds.height));
      const dx = asteroid.x - nearestX;
      const dy = asteroid.y - nearestY;
      return dx * dx + dy * dy < asteroid.radius * asteroid.radius;
    }) ?? null;
  }
}

class Game {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.input = { w: false, a: false, s: false, d: false };
    this.player = new Player(120, height / 2);
    this.obstacles = new ObstacleManager(width, height);
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
    this.player = new Player(120, this.height / 2);
    this.obstacles.reset();
    this.distance = 0;
    this.starOffset = 0;
    this.fuel = this.maxFuel;
    this.health = this.maxHealth;
    this.collisionTimer = 0;
    this.running = true;
    this.lastTime = performance.now();
    statusLabel.textContent = "Run active. Avoid the asteroid field.";
    scoreLabel.textContent = "Distance: 0";
    startButton.disabled = true;
    restartButton.disabled = true;
    requestAnimationFrame((time) => this.loop(time));
  }

  stop(message) {
    this.running = false;
    statusLabel.textContent = message;
    startButton.disabled = false;
    restartButton.disabled = false;
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
    scoreLabel.textContent = `Distance: ${Math.floor(this.distance)}`;

    this.collisionTimer = Math.max(0, this.collisionTimer - deltaTime);

    const collidingAsteroid = this.obstacles.getCollidingAsteroid(this.player);
    if (collidingAsteroid && this.collisionTimer === 0) {
      this.health = Math.max(0, this.health - this.collisionDamage);
      this.collisionTimer = this.collisionCooldown;
      collidingAsteroid.x = -collidingAsteroid.radius;
      statusLabel.textContent = this.health > 0
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

const game = new Game(context, canvas.width, canvas.height);
game.render();

startButton.addEventListener("click", () => game.start());
restartButton.addEventListener("click", () => game.start());
