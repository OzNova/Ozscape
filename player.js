export class Player {
  constructor(x, y) {
    this.width = 48;
    this.height = 28;
    this.baseAcceleration = 470;
    this.baseMaxSpeed = 252;
    this.baseDamping = 3.75;
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
    this.renderAngle = 0;
    this.lastThrusting = false;
    this.lastStats = { ...stats };
  }

  update(input, deltaTime, bounds, stats, environmentForces = []) {
    this.lastStats = { ...stats };

    const horizontal = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const vertical = (input.s ? 1 : 0) - (input.w ? 1 : 0);
    const intensity = Math.hypot(horizontal, vertical);
    const thrusting = intensity > 0;

    const handlingFactor = 1 + stats.handling * 0.1;
    const acceleration = this.baseAcceleration + stats.engine * 28;
    const maxSpeed = this.baseMaxSpeed + stats.engine * 16 + stats.handling * 6;
    const damping = Math.max(2.3, this.baseDamping - stats.handling * 0.16);

    if (thrusting) {
      const normalizedX = horizontal / intensity;
      const normalizedY = vertical / intensity;
      const lateralPenalty = normalizedX < 0.1 ? 0.88 : 1;
      this.velocity.x += normalizedX * acceleration * handlingFactor * lateralPenalty * deltaTime;
      this.velocity.y += normalizedY * acceleration * handlingFactor * deltaTime;
      this.orientation = Math.atan2(normalizedY, Math.max(normalizedX, 0.1));
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

    const driftAngle = speed > 6 ? Math.atan2(this.velocity.y, Math.max(this.velocity.x, 0.1)) : this.orientation;
    const targetAngle = thrusting ? this.orientation : driftAngle;
    this.renderAngle = lerpAngle(this.renderAngle, targetAngle, clamp(deltaTime * 7.5, 0, 1));
    this.lastThrusting = thrusting;

    return {
      thrusting,
      speed,
      stable: speed < 40 + stats.durability * 8,
      driftRatio: clamp(speed / Math.max(maxSpeed, 1), 0, 1)
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
      orientation: this.renderAngle,
      thrusting: this.lastThrusting
    };
  }

  draw(ctx, renderState = {}) {
    const glowAlpha = renderState.highlight ? 0.34 : 0.2;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.renderAngle);

    ctx.fillStyle = `rgba(56, 189, 248, ${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(226, 232, 240, 0.78)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(-18, -20);
    ctx.lineTo(-30, 0);
    ctx.lineTo(-18, 20);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(-18, -20);
    ctx.lineTo(-30, 0);
    ctx.lineTo(-18, 20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(-12, -14);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-12, 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(-2, -5);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-2, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-21, -16);
    ctx.lineTo(-15, -4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.lineTo(-21, 16);
    ctx.lineTo(-15, 4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(14, 165, 233, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.stroke();

    if (renderState.thrusting) {
      const flicker = 14 + Math.sin(renderState.time * 40) * 3;
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(-25 - flicker, -8);
      ctx.lineTo(-38, 0);
      ctx.lineTo(-25 - flicker, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(-24 - flicker * 0.68, -4);
      ctx.lineTo(-32, 0);
      ctx.lineTo(-24 - flicker * 0.68, 4);
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

function lerpAngle(current, target, alpha) {
  let delta = target - current;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return current + delta * alpha;
}
