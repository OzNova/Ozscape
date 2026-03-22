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
    this.position.x += horizontal * this.speed * deltaTime;
    this.position.y += vertical * this.speed * deltaTime;

    this.position.x = Math.max(24, Math.min(bounds.width - 24, this.position.x));
    this.position.y = Math.max(24, Math.min(bounds.height - 24, this.position.y));
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

  collidesWith(player) {
    const bounds = player.getBounds();
    return this.asteroids.some((asteroid) => {
      const nearestX = Math.max(bounds.x, Math.min(asteroid.x, bounds.x + bounds.width));
      const nearestY = Math.max(bounds.y, Math.min(asteroid.y, bounds.y + bounds.height));
      const dx = asteroid.x - nearestX;
      const dy = asteroid.y - nearestY;
      return dx * dx + dy * dy < asteroid.radius * asteroid.radius;
    });
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
    this.running = true;
    this.lastTime = performance.now();
    statusLabel.textContent = "Run active. Avoid the asteroid field.";
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
    this.player.update(this.input, deltaTime, { width: this.width, height: this.height });
    this.obstacles.update(deltaTime);
    this.distance += 140 * deltaTime;
    this.starOffset += 120 * deltaTime;
    scoreLabel.textContent = `Distance: ${Math.floor(this.distance)}`;

    if (this.obstacles.collidesWith(this.player)) {
      this.stop("Game over. Your ship was destroyed by an asteroid.");
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
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
