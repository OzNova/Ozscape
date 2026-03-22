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

window.ObstacleManager = ObstacleManager;
