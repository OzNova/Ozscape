const ANCHOR_X = 190;

const circleRectCollision = (circleX, circleY, radius, rect) => {
  const nearestX = Math.max(rect.x, Math.min(circleX, rect.x + rect.width));
  const nearestY = Math.max(rect.y, Math.min(circleY, rect.y + rect.height));
  const dx = circleX - nearestX;
  const dy = circleY - nearestY;
  return dx * dx + dy * dy < radius * radius;
};

export class ObstacleManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.segment = null;
    this.objects = [];
    this.gravityZones = [];
    this.ionZones = [];
    this.station = null;
    this.gate = null;
    this.planets = [];
    this.wormhole = null;
  }

  loadSegment(segmentConfig) {
    this.segment = segmentConfig;
    this.objects = [];

    const seededObjects = [];
    segmentConfig.debrisFields.forEach((field) => {
      for (let index = 0; index < field.count; index += 1) {
        const t = field.count === 1 ? 0.5 : index / (field.count - 1);
        const worldX = field.startX + (field.endX - field.startX) * t + this.offsetNoise(index + field.startX, 160);
        const worldY = field.top + (field.bottom - field.top) * this.normalizedNoise(index + field.endX, 0.65);
        seededObjects.push({
          kind: "debris",
          worldX,
          worldY,
          radius: 16 + this.normalizedNoise(index + field.endX, 0.82) * 18,
          rotation: this.normalizedNoise(index + 17, 0.24) * Math.PI * 2,
          spin: -0.6 + this.normalizedNoise(index + 9, 0.51) * 1.2
        });
      }
    });

    segmentConfig.movingAsteroids.forEach((asteroid, index) => {
      seededObjects.push({
        kind: "asteroid",
        worldX: asteroid.worldX,
        worldY: asteroid.worldY,
        radius: asteroid.radius,
        velocityY: asteroid.velocityY,
        minY: asteroid.minY,
        maxY: asteroid.maxY,
        rotation: index * 0.6,
        spin: asteroid.spin
      });
    });

    this.objects = seededObjects;
    this.gravityZones = segmentConfig.gravityZones ?? [];
    this.ionZones = segmentConfig.ionZones ?? [];
    this.station = segmentConfig.station;
    this.gate = segmentConfig.gate;
    this.planets = segmentConfig.planets ?? [];
    this.wormhole = segmentConfig.wormhole ?? null;
  }

  reset() {
    if (this.segment) {
      this.loadSegment(this.segment);
    }
  }

  update(deltaTime, routeProgress) {
    this.objects.forEach((object) => {
      object.rotation += object.spin * deltaTime;
      if (object.kind === "asteroid") {
        object.worldY += object.velocityY * deltaTime;
        if (object.worldY < object.minY || object.worldY > object.maxY) {
          object.velocityY *= -1;
          object.worldY = Math.max(object.minY, Math.min(object.maxY, object.worldY));
        }
      }
    });

    const cleanupThreshold = routeProgress - 500;
    this.objects = this.objects.filter((object) => object.worldX + object.radius > cleanupThreshold);
  }

  draw(ctx, routeProgress, state) {
    this.drawPlanets(ctx, routeProgress);
    this.drawIonZones(ctx, routeProgress);
    this.drawGravityZones(ctx, routeProgress);
    this.drawWormhole(ctx, routeProgress, state.wormholeUsed);
    this.drawStation(ctx, routeProgress, state.stationCompleted);
    this.drawGate(ctx, routeProgress, state.stationCompleted);

    this.objects.forEach((object) => {
      const screenX = this.toScreenX(object.worldX, routeProgress);
      if (screenX < -120 || screenX > this.width + 120) {
        return;
      }

      ctx.save();
      ctx.translate(screenX, object.worldY);
      ctx.rotate(object.rotation);
      ctx.fillStyle = object.kind === "asteroid" ? "#cbd5e1" : "#94a3b8";
      ctx.beginPath();
      ctx.arc(0, 0, object.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = object.kind === "asteroid" ? "#f1f5f9" : "#cbd5e1";
      ctx.beginPath();
      ctx.arc(-object.radius * 0.25, -object.radius * 0.16, object.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  getSolidCollision(player, routeProgress) {
    const bounds = player.getBounds();

    const obstacleHit = this.objects.find((object) => {
      const screenX = this.toScreenX(object.worldX, routeProgress);
      return circleRectCollision(screenX, object.worldY, object.radius, bounds);
    });
    if (obstacleHit) {
      return obstacleHit;
    }

    const docking = this.getDockingInfo(player, routeProgress);
    if (this.station && !docking.inZone) {
      const stationX = this.toScreenX(this.station.worldX, routeProgress);
      if (circleRectCollision(stationX, this.station.worldY, this.station.bodyRadius, bounds)) {
        return { kind: "station" };
      }
    }

    return null;
  }

  getDockingInfo(player, routeProgress) {
    if (!this.station) {
      return { inZone: false, alignment: 0 };
    }

    const screenX = this.toScreenX(this.station.worldX, routeProgress);
    const zone = {
      x: screenX - this.station.zoneOffsetX,
      y: this.station.worldY - this.station.zoneHeight / 2,
      width: this.station.zoneWidth,
      height: this.station.zoneHeight
    };

    const playerBounds = player.getBounds();
    const overlap = !(
      playerBounds.x + playerBounds.width < zone.x ||
      playerBounds.x > zone.x + zone.width ||
      playerBounds.y + playerBounds.height < zone.y ||
      playerBounds.y > zone.y + zone.height
    );

    const centerY = player.position.y;
    const distanceFromCenter = Math.abs(centerY - this.station.worldY);
    const alignment = Math.max(0, 1 - distanceFromCenter / (this.station.zoneHeight / 2));

    return {
      inZone: overlap,
      alignment,
      zone,
      screenX
    };
  }

  getGateInfo(player, routeProgress) {
    if (!this.gate) {
      return { inZone: false, screenX: 0 };
    }

    const screenX = this.toScreenX(this.gate.worldX, routeProgress);
    const playerBounds = player.getBounds();
    const inHorizontalRange = playerBounds.x + playerBounds.width >= screenX - this.gate.width / 2 &&
      playerBounds.x <= screenX + this.gate.width / 2;
    const inVerticalRange = player.position.y >= this.gate.worldY - this.gate.height / 2 &&
      player.position.y <= this.gate.worldY + this.gate.height / 2;

    return {
      inZone: inHorizontalRange && inVerticalRange,
      screenX
    };
  }

  getGravityInfluence(player, routeProgress, resistance) {
    for (const zone of this.gravityZones) {
      const screenX = this.toScreenX(zone.worldX, routeProgress);
      const dx = screenX - player.position.x;
      const dy = zone.worldY - player.position.y;
      const distance = Math.hypot(dx, dy);
      if (distance > zone.radius) {
        continue;
      }

      const pullFactor = 1 - distance / zone.radius;
      const normalizedX = dx / Math.max(distance, 1);
      const normalizedY = dy / Math.max(distance, 1);
      const resistanceFactor = Math.max(0.35, 1 - resistance * 0.1);
      const forceStrength = zone.strength * pullFactor * resistanceFactor;

      return {
        active: true,
        label: zone.label,
        force: {
          x: normalizedX * forceStrength,
          y: normalizedY * forceStrength
        },
        fuelPenalty: zone.fuelPenalty * pullFactor * resistanceFactor
      };
    }

    return { active: false, label: "", force: { x: 0, y: 0 }, fuelPenalty: 0 };
  }

  getIonStormEffect(player, routeProgress, resistance) {
    for (const zone of this.ionZones) {
      const screenX = this.toScreenX(zone.worldX, routeProgress);
      const dx = Math.abs(screenX - player.position.x);
      const dy = Math.abs(zone.worldY - player.position.y);
      if (dx <= zone.width / 2 && dy <= zone.height / 2) {
        const resistanceFactor = Math.max(0.45, 1 - resistance * 0.08);
        return {
          active: true,
          label: zone.label,
          fuelPenalty: zone.fuelPenalty * resistanceFactor,
          controlPenalty: zone.controlPenalty * resistanceFactor
        };
      }
    }

    return {
      active: false,
      label: "",
      fuelPenalty: 0,
      controlPenalty: 0
    };
  }

  getWormholeInfo(player, routeProgress, used) {
    if (!this.wormhole || used) {
      return {
        available: false,
        inZone: false,
        screenX: 0,
        alignment: 0
      };
    }

    const screenX = this.toScreenX(this.wormhole.worldX, routeProgress);
    const dx = Math.abs(screenX - player.position.x);
    const dy = Math.abs(this.wormhole.worldY - player.position.y);
    const inZone = dx <= this.wormhole.captureWidth / 2 && dy <= this.wormhole.captureHeight / 2;
    const alignment = Math.max(0, 1 - dy / (this.wormhole.captureHeight / 2));

    return {
      available: true,
      inZone,
      screenX,
      alignment
    };
  }

  drawPlanets(ctx, routeProgress) {
    this.planets.forEach((planet) => {
      const screenX = this.toScreenX(planet.worldX, routeProgress * planet.parallax);
      const y = planet.worldY;
      if (screenX < -planet.radius * 1.6 || screenX > this.width + planet.radius * 1.6) {
        return;
      }

      ctx.save();
      const glow = ctx.createRadialGradient(screenX, y, planet.radius * 0.3, screenX, y, planet.radius * 1.6);
      glow.addColorStop(0, planet.glowColor);
      glow.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(screenX, y, planet.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      const planetGradient = ctx.createRadialGradient(
        screenX - planet.radius * 0.3,
        y - planet.radius * 0.35,
        planet.radius * 0.2,
        screenX,
        y,
        planet.radius
      );
      planetGradient.addColorStop(0, planet.lightColor);
      planetGradient.addColorStop(0.55, planet.midColor);
      planetGradient.addColorStop(1, planet.darkColor);
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(screenX, y, planet.radius, 0, Math.PI * 2);
      ctx.fill();

      if (planet.ring) {
        ctx.strokeStyle = planet.ring.color;
        ctx.lineWidth = planet.ring.width;
        ctx.beginPath();
        ctx.ellipse(screenX, y, planet.radius * 1.45, planet.radius * 0.4, planet.ring.rotation, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  drawGravityZones(ctx, routeProgress) {
    this.gravityZones.forEach((zone) => {
      const screenX = this.toScreenX(zone.worldX, routeProgress);
      if (screenX < -zone.radius || screenX > this.width + zone.radius) {
        return;
      }

      ctx.save();
      const gradient = ctx.createRadialGradient(screenX, zone.worldY, 16, screenX, zone.worldY, zone.radius);
      gradient.addColorStop(0, "rgba(96, 165, 250, 0.32)");
      gradient.addColorStop(0.45, "rgba(59, 130, 246, 0.14)");
      gradient.addColorStop(1, "rgba(30, 64, 175, 0.02)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, zone.worldY, zone.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(125, 211, 252, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, zone.worldY, zone.radius - 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  drawIonZones(ctx, routeProgress) {
    this.ionZones.forEach((zone) => {
      const screenX = this.toScreenX(zone.worldX, routeProgress);
      if (screenX < -zone.width || screenX > this.width + zone.width) {
        return;
      }

      ctx.save();
      const gradient = ctx.createLinearGradient(
        screenX - zone.width / 2,
        zone.worldY,
        screenX + zone.width / 2,
        zone.worldY
      );
      gradient.addColorStop(0, "rgba(34, 197, 94, 0)");
      gradient.addColorStop(0.5, "rgba(74, 222, 128, 0.18)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(screenX - zone.width / 2, zone.worldY - zone.height / 2, zone.width, zone.height);
      ctx.strokeStyle = "rgba(134, 239, 172, 0.25)";
      ctx.strokeRect(screenX - zone.width / 2, zone.worldY - zone.height / 2, zone.width, zone.height);
      ctx.restore();
    });
  }

  drawWormhole(ctx, routeProgress, used) {
    if (!this.wormhole || used) {
      return;
    }

    const screenX = this.toScreenX(this.wormhole.worldX, routeProgress);
    if (screenX < -240 || screenX > this.width + 240) {
      return;
    }

    ctx.save();
    const gradient = ctx.createRadialGradient(screenX, this.wormhole.worldY, 18, screenX, this.wormhole.worldY, this.wormhole.radius);
    gradient.addColorStop(0, "rgba(244, 114, 182, 0.8)");
    gradient.addColorStop(0.4, "rgba(168, 85, 247, 0.45)");
    gradient.addColorStop(1, "rgba(59, 7, 100, 0.02)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, this.wormhole.worldY, this.wormhole.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 114, 182, 0.55)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(screenX, this.wormhole.worldY, this.wormhole.radius - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([8, 10]);
    ctx.strokeStyle = "rgba(244, 114, 182, 0.35)";
    ctx.strokeRect(
      screenX - this.wormhole.captureWidth / 2,
      this.wormhole.worldY - this.wormhole.captureHeight / 2,
      this.wormhole.captureWidth,
      this.wormhole.captureHeight
    );
    ctx.setLineDash([]);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "18px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("Wormhole Shortcut", screenX, this.wormhole.worldY + this.wormhole.radius + 24);
    ctx.restore();
  }

  drawStation(ctx, routeProgress, stationCompleted) {
    if (!this.station) {
      return;
    }

    const screenX = this.toScreenX(this.station.worldX, routeProgress);
    if (screenX < -220 || screenX > this.width + 220) {
      return;
    }

    ctx.save();
    ctx.translate(screenX, this.station.worldY);
    ctx.fillStyle = stationCompleted ? "#0f766e" : "#0f172a";
    ctx.beginPath();
    ctx.arc(0, 0, this.station.bodyRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = stationCompleted ? "#5eead4" : "#38bdf8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, this.station.bodyRadius - 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(56, 189, 248, 0.24)";
    ctx.fillRect(-this.station.zoneOffsetX, -this.station.zoneHeight / 2, this.station.zoneWidth, this.station.zoneHeight);
    ctx.strokeStyle = "rgba(125, 211, 252, 0.65)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.station.zoneOffsetX, -this.station.zoneHeight / 2, this.station.zoneWidth, this.station.zoneHeight);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "18px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(stationCompleted ? "Refueled Station" : "Docking Station", 0, this.station.bodyRadius + 28);
    ctx.restore();
  }

  drawGate(ctx, routeProgress, stationCompleted) {
    if (!this.gate) {
      return;
    }

    const screenX = this.toScreenX(this.gate.worldX, routeProgress);
    if (screenX < -220 || screenX > this.width + 220) {
      return;
    }

    ctx.save();
    ctx.translate(screenX, this.gate.worldY);
    ctx.strokeStyle = stationCompleted ? "#a7f3d0" : "#7dd3fc";
    ctx.lineWidth = 6;
    ctx.strokeRect(-12, -this.gate.height / 2, 24, this.gate.height);
    ctx.fillStyle = stationCompleted ? "rgba(16, 185, 129, 0.18)" : "rgba(14, 165, 233, 0.14)";
    ctx.fillRect(-30, -this.gate.height / 2, 60, this.gate.height);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "18px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("Destination Gate", 0, -this.gate.height / 2 - 14);
    ctx.restore();
  }

  toScreenX(worldX, routeProgress) {
    return worldX - routeProgress + ANCHOR_X;
  }

  normalizedNoise(seed, salt) {
    const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  offsetNoise(seed, range) {
    return (this.normalizedNoise(seed, 0.41) - 0.5) * range;
  }
}
