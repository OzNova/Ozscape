export class Player {
  constructor(x, y) {
    this.width = 48;
    this.height = 28;
    this.baseAcceleration = 560;
    this.baseMaxSpeed = 280;
    this.baseDamping = 4.8;
    this.reset({ x, y }, {
      engine: 0,
      handling: 0,
      durability: 0
    });
  }

  reset(spawn, stats) {
    this.position = { x: spawn.x, y: spawn.y };
    this.velocity = { x: 0, y: 0 };
    this.orientation = 0;
    this.lastThrusting = false;
    this.lastStats = { ...stats };
  }

  update(input, deltaTime, bounds, stats, environmentForces = []) {
    this.lastStats = { ...stats };

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
      this.orientation = Math.atan2(normalizedY, Math.max(normalizedX, 0.15));
    }

    environmentForces.forEach((force) => {
      this.velocity.x += force.x * deltaTime;
      this.velocity.y += force.y * deltaTime;
    });

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

    const minX = 72;
    const maxX = bounds.width - 72;
    const minY = 60;
    const maxY = bounds.height - 60;

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

    this.lastThrusting = thrusting;

    return {
      thrusting,
      speed: Math.hypot(this.velocity.x, this.velocity.y),
      stable: Math.hypot(this.velocity.x, this.velocity.y) < 42 + stats.durability * 8,
      driftRatio: clamp(Math.hypot(this.velocity.x, this.velocity.y) / Math.max(maxSpeed, 1), 0, 1)
    };
  }

  applyForce(force, deltaTime) {
    this.velocity.x += force.x * deltaTime;
    this.velocity.y += force.y * deltaTime;
  }

  getTelemetry() {
    return {
      speed: Math.hypot(this.velocity.x, this.velocity.y),
      velocity: { ...this.velocity },
      orientation: this.orientation,
      thrusting: this.lastThrusting
    };
  }

  draw(ctx, renderState = {}) {
    const velocityAngle = Math.atan2(this.velocity.y, Math.max(this.velocity.x, 40)) * 0.36;
    const angle = this.lastThrusting ? this.orientation * 0.48 : velocityAngle;
    const glowAlpha = renderState.highlight ? 0.25 : 0.12;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);

    ctx.fillStyle = `rgba(103, 232, 249, ${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(26, 0);
    ctx.lineTo(-18, -14);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-18, 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#67e8f9";
    ctx.fillRect(-22, -6, 10, 12);

    ctx.fillStyle = "#c084fc";
    ctx.fillRect(-4, -4, 10, 8);

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(6, -2, 8, 4);

    if (renderState.thrusting) {
      const flicker = 11 + Math.sin(renderState.time * 40) * 2;
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-22 - flicker, -6);
      ctx.lineTo(-30, 0);
      ctx.lineTo(-22 - flicker, 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-22 - flicker * 0.65, -3);
      ctx.lineTo(-28, 0);
      ctx.lineTo(-22 - flicker * 0.65, 3);
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
