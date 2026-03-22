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

window.Player = Player;
