export class ObstacleManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.asteroids = [];
    this.spawnTimer = 0;
    this.baseSpawnInterval = 1.05;
    this.minimumSpawnInterval = 0.35;
  }

  reset() {
    this.asteroids = [];
    this.spawnTimer = 0;
  }

  update(deltaTime, difficulty) {
    const spawnInterval = Math.max(
      this.minimumSpawnInterval,
      this.baseSpawnInterval - difficulty * 0.055
    );

    this.spawnTimer += deltaTime;
    while (this.spawnTimer >= spawnInterval) {
      this.spawnTimer -= spawnInterval;
      this.spawnAsteroid(difficulty);
    }

    this.asteroids.forEach((asteroid) => {
      asteroid.x += asteroid.velocityX * deltaTime;
      asteroid.y += asteroid.velocityY * deltaTime;
      asteroid.rotation += asteroid.spin * deltaTime;

      if (asteroid.type === "moving") {
        if (asteroid.y < asteroid.radius || asteroid.y > this.height - asteroid.radius) {
          asteroid.velocityY *= -1;
          asteroid.y = Math.max(asteroid.radius, Math.min(this.height - asteroid.radius, asteroid.y));
        }
      }
    });

    this.asteroids = this.asteroids.filter((asteroid) => asteroid.x + asteroid.radius > 0);
  }

  draw(ctx) {
    this.asteroids.forEach((asteroid) => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);

      ctx.fillStyle = asteroid.type === "moving" ? "#cbd5e1" : "#94a3b8";
      ctx.beginPath();
      ctx.arc(0, 0, asteroid.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = asteroid.type === "moving" ? "#e2e8f0" : "#cbd5e1";
      ctx.beginPath();
      ctx.arc(-asteroid.radius * 0.25, -asteroid.radius * 0.15, asteroid.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      if (asteroid.type === "moving") {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, asteroid.radius + 3, 0, Math.PI * 1.6);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  spawnAsteroid(difficulty) {
    const movingChance = Math.min(0.18 + difficulty * 0.045, 0.65);
    const type = Math.random() < movingChance ? "moving" : "static";
    const radius = type === "moving"
      ? 14 + Math.random() * 18
      : 18 + Math.random() * 20;
    const speed = 180 + Math.random() * 90 + difficulty * 24;
    const verticalSpeed = type === "moving"
      ? (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 70 + difficulty * 8)
      : (-18 + Math.random() * 36);

    this.asteroids.push({
      type,
      x: this.width + radius + Math.random() * 120,
      y: 30 + Math.random() * (this.height - 60),
      radius,
      velocityX: -speed,
      velocityY: verticalSpeed,
      rotation: Math.random() * Math.PI * 2,
      spin: (-1 + Math.random() * 2) * (0.4 + Math.random() * 0.8)
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
