export class Player {
  constructor(x, y) {
    this.width = 34;
    this.height = 22;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = 620;
    this.maxSpeed = 320;
    this.damping = 4.8;
  }

  update(input, deltaTime, bounds) {
    const horizontal = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const vertical = (input.s ? 1 : 0) - (input.w ? 1 : 0);
    const intensity = Math.hypot(horizontal, vertical);
    const didMove = intensity > 0;

    if (didMove) {
      const normalizedX = horizontal / intensity;
      const normalizedY = vertical / intensity;
      this.velocity.x += normalizedX * this.acceleration * deltaTime;
      this.velocity.y += normalizedY * this.acceleration * deltaTime;
    }

    const dampingFactor = Math.exp(-this.damping * deltaTime);
    this.velocity.x *= dampingFactor;
    this.velocity.y *= dampingFactor;

    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    const minX = 24;
    const maxX = bounds.width - 24;
    const minY = 24;
    const maxY = bounds.height - 24;

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

    return didMove;
  }

  draw(ctx) {
    const angle = Math.atan2(this.velocity.y, Math.max(this.velocity.x, 40)) * 0.35;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);

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

    if (Math.hypot(this.velocity.x, this.velocity.y) > 18) {
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-28, -4);
      ctx.lineTo(-28, 4);
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
