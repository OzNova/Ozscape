export class Player {
  constructor(x, y) {
    this.width = 40;
    this.height = 24;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.baseAcceleration = 560;
    this.baseMaxSpeed = 280;
    this.baseDamping = 4.8;
  }

  update(input, deltaTime, bounds, stats) {
    const horizontal = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const vertical = (input.s ? 1 : 0) - (input.w ? 1 : 0);
    const intensity = Math.hypot(horizontal, vertical);
    const thrusting = intensity > 0;

    const handlingFactor = 1 + stats.handling * 0.12;
    const acceleration = this.baseAcceleration + stats.engine * 34;
    const maxSpeed = this.baseMaxSpeed + stats.engine * 18 + stats.handling * 8;
    const damping = Math.max(2.8, this.baseDamping - stats.handling * 0.22);

    if (thrusting) {
      const normalizedX = horizontal / intensity;
      const normalizedY = vertical / intensity;
      this.velocity.x += normalizedX * acceleration * handlingFactor * deltaTime;
      this.velocity.y += normalizedY * acceleration * handlingFactor * deltaTime;
    }

    const dampingFactor = Math.exp(-damping * deltaTime);
    this.velocity.x *= dampingFactor;
    this.velocity.y *= dampingFactor;

    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    const minX = 56;
    const maxX = bounds.width - 56;
    const minY = 52;
    const maxY = bounds.height - 52;

    if (this.position.x < minX) {
      this.position.x = minX;
      this.velocity.x = 0;
    } else if (this.position.x > maxX) {
      this.position.x = maxX;
      this.velocity.x = 0;
    }

    if (this.position.y < minY) {
      this.position.y = minY;
      this.velocity.y = 0;
    } else if (this.position.y > maxY) {
      this.position.y = maxY;
      this.velocity.y = 0;
    }

    return {
      thrusting,
      speed: Math.hypot(this.velocity.x, this.velocity.y),
      stable: Math.hypot(this.velocity.x, this.velocity.y) < 42 + stats.durability * 8
    };
  }

  applyForce(force, deltaTime) {
    this.velocity.x += force.x * deltaTime;
    this.velocity.y += force.y * deltaTime;
  }

  draw(ctx, renderState = {}) {
    const angle = Math.atan2(this.velocity.y, Math.max(this.velocity.x, 40)) * 0.42;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);

    if (renderState.highlight) {
      ctx.fillStyle = "rgba(103, 232, 249, 0.18)";
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-18, -12);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-18, 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(-20, -5, 9, 10);

    ctx.fillStyle = "#c084fc";
    ctx.fillRect(-4, -3, 8, 6);

    if (renderState.thrusting) {
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-32, -5);
      ctx.lineTo(-30, 0);
      ctx.lineTo(-32, 5);
      ctx.closePath();
      ctx.fill();
    }

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
