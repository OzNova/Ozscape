import { Player } from "./player.js";
import { ObstacleManager } from "./obstacles.js";

const SAVE_KEY = "ozscape-save-v3";

const SEGMENTS = [
  {
    id: "sector-a",
    name: "Abyssal Freight Lane",
    subtitle: "Mining corridor with a risky shortcut around a shattered moon.",
    briefing:
      "Move critical reactor cores through a fractured mining corridor. Refuel at Leviathan Station, then decide whether to take the wormhole bypass or stay on the safe line to Extraction Gate Theta.",
    destinationLabel: "Extraction Gate Theta",
    stationLabel: "Leviathan Refuel Station",
    length: 5600,
    dockingDuration: 1.9,
    baseReward: 180,
    fuelRewardFactor: 2.4,
    debrisFields: [
      { startX: 700, endX: 1500, top: 110, bottom: 610, count: 18 },
      { startX: 1700, endX: 2400, top: 150, bottom: 570, count: 16 },
      { startX: 3000, endX: 4200, top: 90, bottom: 630, count: 24 },
      { startX: 4700, endX: 5320, top: 120, bottom: 600, count: 20 }
    ],
    movingAsteroids: [
      { worldX: 1240, worldY: 520, radius: 28, velocityY: -72, minY: 160, maxY: 560, spin: 0.8 },
      { worldX: 2060, worldY: 200, radius: 24, velocityY: 86, minY: 160, maxY: 520, spin: -0.9 },
      { worldX: 3440, worldY: 500, radius: 32, velocityY: -95, minY: 120, maxY: 600, spin: 1.1 },
      { worldX: 5020, worldY: 240, radius: 26, velocityY: 92, minY: 150, maxY: 550, spin: -0.8 }
    ],
    gravityZones: [
      {
        label: "Fractured moon gravity",
        worldX: 3380,
        worldY: 360,
        radius: 190,
        strength: 160,
        fuelPenalty: 0.65
      }
    ],
    ionZones: [],
    planets: [
      {
        worldX: 2860,
        worldY: 110,
        radius: 136,
        parallax: 0.22,
        lightColor: "#f8fafc",
        midColor: "#7dd3fc",
        darkColor: "#164e63",
        glowColor: "rgba(125, 211, 252, 0.24)",
        ring: null
      },
      {
        worldX: 4550,
        worldY: 610,
        radius: 104,
        parallax: 0.3,
        lightColor: "#fde68a",
        midColor: "#fb923c",
        darkColor: "#7c2d12",
        glowColor: "rgba(251, 146, 60, 0.18)",
        ring: null
      }
    ],
    station: {
      worldX: 2580,
      worldY: 200,
      bodyRadius: 82,
      zoneOffsetX: 178,
      zoneWidth: 110,
      zoneHeight: 110
    },
    wormhole: {
      worldX: 4040,
      worldY: 540,
      radius: 86,
      captureWidth: 154,
      captureHeight: 132,
      exitProgress: 4950,
      fuelBonus: 8,
      rewardBonus: 70,
      turbulenceDuration: 2.2
    },
    gate: {
      worldX: 5440,
      worldY: 360,
      width: 90,
      height: 240
    }
  },
  {
    id: "sector-b",
    name: "Gas Giant Shepherd Run",
    subtitle: "Ride the orbital slip past a ringed fuel giant and thread the relay lanes.",
    briefing:
      "Carry agricultural condensers through the ring-shadow of Atlas-9. A refuel stop at Ravel Dock is required before the final orbit insertion gate.",
    destinationLabel: "Atlas Relay Insertion",
    stationLabel: "Ravel Dock",
    length: 6100,
    dockingDuration: 2.1,
    baseReward: 220,
    fuelRewardFactor: 2.65,
    debrisFields: [
      { startX: 860, endX: 1620, top: 160, bottom: 620, count: 16 },
      { startX: 2200, endX: 3200, top: 130, bottom: 580, count: 22 },
      { startX: 4100, endX: 5200, top: 120, bottom: 620, count: 24 }
    ],
    movingAsteroids: [
      { worldX: 1760, worldY: 240, radius: 26, velocityY: 78, minY: 150, maxY: 510, spin: 0.7 },
      { worldX: 2860, worldY: 560, radius: 30, velocityY: -82, minY: 160, maxY: 610, spin: -1.1 },
      { worldX: 4630, worldY: 210, radius: 34, velocityY: 96, minY: 150, maxY: 560, spin: 1.15 }
    ],
    gravityZones: [
      {
        label: "Gas giant pull",
        worldX: 3220,
        worldY: 240,
        radius: 230,
        strength: 145,
        fuelPenalty: 0.55
      }
    ],
    ionZones: [
      {
        label: "Ring static",
        worldX: 4860,
        worldY: 360,
        width: 520,
        height: 220,
        fuelPenalty: 0.42,
        controlPenalty: 0.3
      }
    ],
    planets: [
      {
        worldX: 3340,
        worldY: 160,
        radius: 188,
        parallax: 0.14,
        lightColor: "#fef3c7",
        midColor: "#f59e0b",
        darkColor: "#78350f",
        glowColor: "rgba(245, 158, 11, 0.18)",
        ring: {
          color: "rgba(250, 204, 21, 0.45)",
          width: 8,
          rotation: -0.22
        }
      }
    ],
    station: {
      worldX: 3720,
      worldY: 530,
      bodyRadius: 86,
      zoneOffsetX: 170,
      zoneWidth: 118,
      zoneHeight: 118
    },
    wormhole: {
      worldX: 5200,
      worldY: 180,
      radius: 92,
      captureWidth: 150,
      captureHeight: 124,
      exitProgress: 5820,
      fuelBonus: 10,
      rewardBonus: 95,
      turbulenceDuration: 2.4
    },
    gate: {
      worldX: 5960,
      worldY: 420,
      width: 90,
      height: 250
    }
  },
  {
    id: "sector-c",
    name: "Relay Fracture Corridor",
    subtitle: "An unstable relay lane with ion storms and a dangerous experimental wormhole.",
    briefing:
      "Deliver quantum relay cores through the fractured corridor. Dock at Ymir Array, avoid the ion wash, and decide whether the unstable wormhole is worth the risk.",
    destinationLabel: "Relay Gate Ymir",
    stationLabel: "Ymir Array",
    length: 6600,
    dockingDuration: 2.2,
    baseReward: 260,
    fuelRewardFactor: 2.8,
    debrisFields: [
      { startX: 740, endX: 1700, top: 150, bottom: 610, count: 20 },
      { startX: 2200, endX: 3300, top: 130, bottom: 590, count: 24 },
      { startX: 3980, endX: 5600, top: 120, bottom: 620, count: 28 }
    ],
    movingAsteroids: [
      { worldX: 1280, worldY: 510, radius: 28, velocityY: -78, minY: 160, maxY: 590, spin: 1 },
      { worldX: 2520, worldY: 200, radius: 24, velocityY: 90, minY: 140, maxY: 520, spin: -0.8 },
      { worldX: 4300, worldY: 560, radius: 30, velocityY: -102, minY: 150, maxY: 600, spin: 1.2 },
      { worldX: 6030, worldY: 260, radius: 32, velocityY: 88, minY: 150, maxY: 560, spin: -1.15 }
    ],
    gravityZones: [
      {
        label: "Relay singularity",
        worldX: 4510,
        worldY: 340,
        radius: 210,
        strength: 170,
        fuelPenalty: 0.72
      }
    ],
    ionZones: [
      {
        label: "Ion storm wall",
        worldX: 2960,
        worldY: 360,
        width: 600,
        height: 240,
        fuelPenalty: 0.5,
        controlPenalty: 0.36
      }
    ],
    planets: [
      {
        worldX: 1380,
        worldY: 80,
        radius: 110,
        parallax: 0.28,
        lightColor: "#e0e7ff",
        midColor: "#818cf8",
        darkColor: "#312e81",
        glowColor: "rgba(129, 140, 248, 0.18)",
        ring: null
      },
      {
        worldX: 5080,
        worldY: 620,
        radius: 134,
        parallax: 0.24,
        lightColor: "#d1fae5",
        midColor: "#34d399",
        darkColor: "#064e3b",
        glowColor: "rgba(52, 211, 153, 0.16)",
        ring: null
      }
    ],
    station: {
      worldX: 3500,
      worldY: 180,
      bodyRadius: 88,
      zoneOffsetX: 178,
      zoneWidth: 112,
      zoneHeight: 116
    },
    wormhole: {
      worldX: 5660,
      worldY: 520,
      radius: 94,
      captureWidth: 160,
      captureHeight: 138,
      exitProgress: 6280,
      fuelBonus: 12,
      rewardBonus: 120,
      turbulenceDuration: 2.7
    },
    gate: {
      worldX: 6460,
      worldY: 330,
      width: 96,
      height: 260
    }
  }
];

const UPGRADE_DEFS = [
  {
    key: "engine",
    name: "Engine",
    description: "Raises thrust output, cruise speed, and wormhole capture control.",
    baseCost: 140
  },
  {
    key: "durability",
    name: "Durability",
    description: "Improves docking tolerance and soft-hazard resistance.",
    baseCost: 130
  },
  {
    key: "fuelTank",
    name: "Fuel Tank",
    description: "Increases reserves for longer freight lanes.",
    baseCost: 125
  },
  {
    key: "handling",
    name: "Handling",
    description: "Sharpens drift recovery, response, and wormhole alignment.",
    baseCost: 135
  }
];

const defaultSave = () => ({
  credits: 0,
  bestCredits: 0,
  completedRuns: 0,
  unlockedSegments: 1,
  completedSegmentIds: [],
  upgrades: {
    engine: 0,
    durability: 0,
    fuelTank: 0,
    handling: 0
  }
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class Game {
  constructor(ctx, width, height, controls) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.controls = controls;
    this.input = { w: false, a: false, s: false, d: false };
    this.state = "menu";
    this.segmentIndex = 0;
    this.segment = SEGMENTS[this.segmentIndex];
    this.player = new Player(190, height / 2);
    this.obstacles = new ObstacleManager(width, height);
    this.running = false;
    this.lastTime = 0;
    this.backgroundOffset = 0;
    this.time = 0;
    this.save = this.loadSave();
    this.run = this.createEmptyRun();
    this.summary = null;
    this.bindInput();
    this.renderPanel();
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

  handlePrimaryAction() {
    if (this.state === "menu") {
      this.state = "campaignMap";
      this.renderPanel();
      return;
    }

    if (this.state === "campaignMap") {
      this.state = "briefing";
      this.renderPanel();
      return;
    }

    if (this.state === "briefing") {
      this.startSegment();
      return;
    }

    if (this.state === "results") {
      this.state = "hangar";
      this.renderPanel();
      return;
    }

    if (this.state === "hangar") {
      this.state = "campaignMap";
      this.renderPanel();
      return;
    }

    if (this.state === "gameOver") {
      this.state = "briefing";
      this.renderPanel();
    }
  }

  handleSecondaryAction() {
    if (this.state === "menu") {
      this.resetSave();
      this.segmentIndex = 0;
      this.segment = SEGMENTS[0];
      this.renderPanel();
      return;
    }

    if (this.state === "campaignMap") {
      this.segmentIndex = (this.segmentIndex + 1) % this.save.unlockedSegments;
      this.segment = SEGMENTS[this.segmentIndex];
      this.renderPanel();
      return;
    }

    if (this.state === "briefing") {
      this.state = "campaignMap";
      this.renderPanel();
      return;
    }

    if (this.state === "results") {
      this.state = "campaignMap";
      this.renderPanel();
      return;
    }

    if (this.state === "hangar") {
      this.state = "menu";
      this.renderPanel();
      return;
    }

    if (this.state === "gameOver") {
      this.state = "campaignMap";
      this.renderPanel();
    }
  }

  startSegment() {
    const stats = this.getDerivedStats();
    this.player.reset({ x: 190, y: this.height / 2 }, this.save.upgrades);
    this.obstacles.loadSegment(this.segment);
    this.run = {
      ...this.createEmptyRun(),
      fuel: stats.maxFuel
    };
    this.state = "segment";
    this.running = true;
    this.lastTime = performance.now();
    this.backgroundOffset = 0;
    this.time = 0;
    this.renderPanel();
    requestAnimationFrame((time) => this.loop(time));
  }

  loop(currentTime) {
    if (!this.running) {
      this.draw();
      return;
    }

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.033);
    this.lastTime = currentTime;
    this.time += deltaTime;

    this.update(deltaTime);
    this.draw();

    if (this.running) {
      requestAnimationFrame((time) => this.loop(time));
    }
  }

  update(deltaTime) {
    if (this.state === "segment") {
      this.updateSegment(deltaTime);
    } else if (this.state === "docking") {
      this.updateDocking(deltaTime);
    } else if (this.state === "wormholeTransit") {
      this.updateWormholeTransit(deltaTime);
    } else {
      this.running = false;
    }
  }

  updateSegment(deltaTime) {
    const stats = this.getDerivedStats();
    const gravity = this.obstacles.getGravityInfluence(
      this.player,
      this.run.routeProgress,
      this.save.upgrades.durability
    );
    const ionStorm = this.obstacles.getIonStormEffect(
      this.player,
      this.run.routeProgress,
      this.save.upgrades.durability
    );

    const movement = this.player.update(
      this.input,
      deltaTime,
      { width: this.width, height: this.height },
      stats,
      gravity.active ? [gravity.force] : []
    );

    if (gravity.active) {
      this.run.hazardExposure += deltaTime;
    }
    if (ionStorm.active) {
      this.run.hazardExposure += deltaTime * 0.7;
      this.run.softPenalty += deltaTime * ionStorm.controlPenalty;
    }

    const thrustBonus = movement.thrusting ? 85 + this.save.upgrades.engine * 10 : 0;
    const cruiseSpeed = stats.cruiseSpeed;
    const hazardPenalty = gravity.active ? 18 : 0;
    const ionPenalty = ionStorm.active ? 22 : 0;
    const routeSpeed = Math.max(78, cruiseSpeed + thrustBonus - hazardPenalty - ionPenalty);
    this.run.routeProgress += routeSpeed * deltaTime;
    this.backgroundOffset += (50 + routeSpeed * 0.18) * deltaTime;

    this.obstacles.update(deltaTime, this.run.routeProgress);

    const passiveDrain = 0.95;
    const thrustDrain = movement.thrusting ? 1.45 : 0;
    this.run.fuel = clamp(
      this.run.fuel - (passiveDrain + thrustDrain + gravity.fuelPenalty + ionStorm.fuelPenalty) * deltaTime,
      0,
      stats.maxFuel
    );

    this.run.creditsPreview = Math.floor(this.run.routeProgress / this.segment.length * 100);

    const collision = this.obstacles.getSolidCollision(this.player, this.run.routeProgress);
    if (collision) {
      this.failSegment("Collision detected. Cargo route lost.");
      return;
    }

    const docking = this.obstacles.getDockingInfo(this.player, this.run.routeProgress);
    if (!this.run.stationCompleted && docking.inZone) {
      if (movement.stable) {
        this.run.dockingProgress = clamp(
          this.run.dockingProgress + deltaTime * (0.65 + docking.alignment + stats.dockingAssist * 0.18),
          0,
          this.segment.dockingDuration
        );
      } else {
        this.run.dockingProgress = Math.max(0, this.run.dockingProgress - deltaTime * 0.6);
      }

      if (this.run.dockingProgress >= this.segment.dockingDuration) {
        this.state = "docking";
        this.run.dockingTimer = 1.8;
        this.renderPanel();
        return;
      }
    } else if (!this.run.stationCompleted) {
      this.run.dockingProgress = Math.max(0, this.run.dockingProgress - deltaTime * 0.45);
    }

    const wormhole = this.obstacles.getWormholeInfo(
      this.player,
      this.run.routeProgress,
      this.run.wormholeUsed
    );
    if (
      this.run.stationCompleted &&
      wormhole.available &&
      wormhole.inZone &&
      movement.stable &&
      this.run.routeProgress > this.segment.station.worldX
    ) {
      this.run.wormholeAlignment = clamp(
        this.run.wormholeAlignment + deltaTime * (0.85 + wormhole.alignment + stats.wormholeAssist * 0.16),
        0,
        1.6
      );
      if (this.run.wormholeAlignment >= 1.6) {
        this.state = "wormholeTransit";
        this.run.wormholeTimer = this.segment.wormhole.turbulenceDuration;
        this.run.wormholeUsed = true;
        this.renderPanel();
        return;
      }
    } else {
      this.run.wormholeAlignment = Math.max(0, this.run.wormholeAlignment - deltaTime * 0.7);
    }

    const gate = this.obstacles.getGateInfo(this.player, this.run.routeProgress);
    if (gate.inZone && this.run.stationCompleted) {
      this.completeSegment();
      return;
    }

    if (this.run.routeProgress >= this.segment.length + 180 && !this.run.stationCompleted) {
      this.failSegment("Delivery failed. Mandatory station refuel was missed.");
      return;
    }

    if (this.run.fuel <= 0) {
      this.failSegment("Fuel reserves depleted before reaching the destination gate.");
      return;
    }

    this.renderPanel();
  }

  updateDocking(deltaTime) {
    this.backgroundOffset += 22 * deltaTime;
    this.run.dockingTimer = Math.max(0, this.run.dockingTimer - deltaTime);
    this.run.fuel = this.getDerivedStats().maxFuel;

    if (this.run.dockingTimer === 0) {
      this.run.stationCompleted = true;
      this.run.dockingQuality = clamp(
        1 - (this.run.hazardExposure * 0.02 + Math.max(0, 1.9 - this.run.dockingProgress) * 0.2),
        0.3,
        1
      );
      this.run.dockingProgress = 0;
      this.state = "segment";
    }

    this.renderPanel();
  }

  updateWormholeTransit(deltaTime) {
    this.run.wormholeTimer = Math.max(0, this.run.wormholeTimer - deltaTime);
    this.backgroundOffset += 420 * deltaTime;

    if (this.run.wormholeTimer === 0) {
      this.run.routeProgress = Math.max(this.run.routeProgress, this.segment.wormhole.exitProgress);
      this.run.fuel = clamp(
        this.run.fuel + this.segment.wormhole.fuelBonus,
        0,
        this.getDerivedStats().maxFuel
      );
      this.run.shortcutBonus = this.segment.wormhole.rewardBonus;
      this.state = "segment";
    }

    this.renderPanel();
  }

  completeSegment() {
    const fuelBonus = Math.round(this.run.fuel * this.segment.fuelRewardFactor);
    const dockingBonus = Math.round(65 * this.run.dockingQuality);
    const hazardBonus = Math.max(0, Math.round(50 - this.run.hazardExposure * 10 - this.run.softPenalty * 14));
    const shortcutBonus = this.run.shortcutBonus;
    const baseReward = this.segment.baseReward;
    const total = baseReward + fuelBonus + dockingBonus + hazardBonus + shortcutBonus;

    this.summary = {
      title: "Delivery Complete",
      result: "success",
      baseReward,
      fuelBonus,
      dockingBonus,
      hazardBonus,
      shortcutBonus,
      total
    };

    this.save.credits += total;
    this.save.bestCredits = Math.max(this.save.bestCredits, total);
    this.save.completedRuns += 1;
    if (!this.save.completedSegmentIds.includes(this.segment.id)) {
      this.save.completedSegmentIds.push(this.segment.id);
    }
    this.save.unlockedSegments = clamp(
      Math.max(this.save.unlockedSegments, this.segmentIndex + 2),
      1,
      SEGMENTS.length
    );
    this.persistSave();

    this.state = "results";
    this.running = false;
    this.renderPanel();
    this.draw();
  }

  failSegment(reason) {
    const fallback = Math.round(24 + (this.run.routeProgress / this.segment.length) * 42);
    this.summary = {
      title: "Route Failed",
      result: "failure",
      baseReward: fallback,
      fuelBonus: 0,
      dockingBonus: 0,
      hazardBonus: 0,
      shortcutBonus: 0,
      total: fallback,
      reason
    };

    this.save.credits += fallback;
    this.persistSave();

    this.state = "gameOver";
    this.running = false;
    this.renderPanel();
    this.draw();
  }

  purchaseUpgrade(key) {
    if (this.state !== "hangar") {
      return;
    }

    const cost = this.getUpgradeCost(key);
    if (this.save.credits < cost) {
      return;
    }

    this.save.credits -= cost;
    this.save.upgrades[key] += 1;
    this.persistSave();
    this.renderPanel();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.state === "segment" || this.state === "docking" || this.state === "wormholeTransit") {
      this.drawSegmentScene();
      return;
    }

    this.drawBackdrop();
    if (this.state === "menu") {
      this.drawCenterCard("Ozscape", "Build a freight empire across dangerous star routes.");
    } else if (this.state === "campaignMap") {
      this.drawCenterCard("Campaign Map", this.segment.subtitle);
      this.drawCampaignMap();
    } else if (this.state === "briefing") {
      this.drawCenterCard(this.segment.name, "Route briefing uploaded. Depart when ready.");
    } else if (this.state === "results") {
      this.drawCenterCard("Results", "Review the payout and proceed to hangar operations.");
    } else if (this.state === "hangar") {
      this.drawCenterCard("Hangar", "Upgrade the freighter before the next run.");
    } else if (this.state === "gameOver") {
      this.drawCenterCard("Route Failed", this.summary?.reason ?? "The cargo run was lost.");
    }
  }

  drawSegmentScene() {
    if (this.state === "wormholeTransit") {
      this.drawWormholeTransitScene();
      return;
    }

    this.drawBackdrop();
    this.drawRouteBands();
    this.obstacles.draw(this.ctx, this.run.routeProgress, this.run);
    this.player.draw(this.ctx, {
      thrusting: this.player.getTelemetry().thrusting,
      highlight: this.state === "docking",
      time: this.time
    });
    this.drawHud();

    if (this.state === "docking") {
      this.drawCenterCard("Docking", "Refueling and cargo systems recalibration in progress.");
    }
  }

  drawBackdrop() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(1, "#091a31");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = "rgba(226, 232, 240, 0.78)";
    for (let index = 0; index < 140; index += 1) {
      let x = (index * 149 - this.backgroundOffset * (0.24 + (index % 6) * 0.035)) % (this.width + 80);
      if (x < -4) {
        x += this.width + 80;
      }
      const y = (index * 79) % this.height;
      const size = index % 9 === 0 ? 3 : 2;
      this.ctx.fillRect(x, y, size, size);
    }

    this.ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
    this.ctx.beginPath();
    this.ctx.arc(this.width * 0.78, this.height * 0.22, 180, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "rgba(129, 140, 248, 0.05)";
    this.ctx.beginPath();
    this.ctx.arc(this.width * 0.22, this.height * 0.76, 240, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawRouteBands() {
    this.ctx.strokeStyle = "rgba(125, 211, 252, 0.12)";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([8, 12]);
    for (let y = 110; y < this.height - 70; y += 120) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);
  }

  drawHud() {
    const fuelRatio = this.run.fuel / this.getDerivedStats().maxFuel;
    const progressRatio = clamp(this.run.routeProgress / this.segment.length, 0, 1);
    const fuelPercent = Math.round(fuelRatio * 100);

    this.ctx.fillStyle = "rgba(6, 18, 34, 0.82)";
    this.ctx.fillRect(18, 18, 560, 166);
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.48)";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(18, 18, 560, 166);

    this.drawMeter("Fuel", fuelRatio, 42, "#38bdf8", {
      valueText: `${Math.round(this.run.fuel)} / ${this.getDerivedStats().maxFuel}`,
      alertThreshold: 0.25,
      criticalThreshold: 0.1
    });
    this.drawMeter("Route", progressRatio, 86, "#22c55e", {
      valueText: `${Math.round(progressRatio * 100)}%`
    });

    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "16px Trebuchet MS";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Credits: ${this.save.credits}`, 32, 122);
    this.ctx.fillText(`Route: ${this.segment.name}`, 210, 122);
    this.ctx.fillText(
      `Objective: ${this.run.stationCompleted ? "Reach destination gate" : "Dock at refuel station"}`,
      32,
      148
    );

    if (!this.run.stationCompleted) {
      this.ctx.fillText(
        `Dock lock: ${Math.round(this.run.dockingProgress / this.segment.dockingDuration * 100)}%`,
        32,
        174
      );
    } else if (this.run.wormholeUsed) {
      this.ctx.fillText("Wormhole taken. Reward bonus secured.", 32, 174);
    } else {
      this.ctx.fillText("Station refuel complete. Wormhole remains optional.", 32, 174);
    }

    if (fuelRatio <= 0.25) {
      this.ctx.fillStyle = fuelRatio <= 0.1 ? "#fecaca" : "#fde68a";
      this.ctx.font = "bold 15px Trebuchet MS";
      this.ctx.fillText(
        fuelRatio <= 0.1 ? `Fuel critical: ${fuelPercent}%` : `Low fuel: ${fuelPercent}%`,
        390,
        174
      );
    }
  }

  drawMeter(label, ratio, y, color, options = {}) {
    const { valueText = "", alertThreshold = -1, criticalThreshold = -1 } = options;
    const safeRatio = clamp(ratio, 0, 1);
    const isCritical = criticalThreshold >= 0 && safeRatio <= criticalThreshold;
    const isAlert = alertThreshold >= 0 && safeRatio <= alertThreshold;
    const fillColor = isCritical ? "#ef4444" : isAlert ? "#f59e0b" : color;

    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "bold 16px Trebuchet MS";
    this.ctx.textAlign = "left";
    this.ctx.fillText(label, 32, y);

    if (valueText) {
      this.ctx.fillStyle = isCritical ? "#fecaca" : "#cbd5e1";
      this.ctx.font = "15px Trebuchet MS";
      this.ctx.textAlign = "right";
      this.ctx.fillText(valueText, 542, y);
    }

    this.ctx.fillStyle = "rgba(15, 23, 42, 0.98)";
    this.ctx.fillRect(118, y - 15, 404, 18);
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(118, y - 15, 404 * safeRatio, 18);
    this.ctx.strokeStyle = isCritical
      ? "rgba(248, 113, 113, 0.9)"
      : isAlert
        ? "rgba(251, 191, 36, 0.8)"
        : "rgba(226, 232, 240, 0.28)";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(118, y - 15, 404, 18);

    if (isAlert) {
      this.ctx.strokeStyle = isCritical ? "rgba(239, 68, 68, 0.38)" : "rgba(245, 158, 11, 0.34)";
      this.ctx.strokeRect(114, y - 19, 412, 26);
    }

    this.ctx.textAlign = "left";
  }

  drawCenterCard(title, copy) {
    this.ctx.fillStyle = "rgba(6, 18, 34, 0.84)";
    this.ctx.fillRect(this.width / 2 - 300, this.height / 2 - 92, 600, 184);
    this.ctx.strokeStyle = "rgba(125, 211, 252, 0.42)";
    this.ctx.strokeRect(this.width / 2 - 300, this.height / 2 - 92, 600, 184);
    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "42px Trebuchet MS";
    this.ctx.textAlign = "center";
    this.ctx.fillText(title, this.width / 2, this.height / 2 - 18);
    this.ctx.font = "20px Trebuchet MS";
    this.wrapCenterText(copy, this.width / 2, this.height / 2 + 24, 500, 28);
  }

  drawCampaignMap() {
    const centerY = this.height * 0.75;
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(180, centerY);
    this.ctx.lineTo(this.width - 180, centerY);
    this.ctx.stroke();

    SEGMENTS.forEach((segment, index) => {
      const x = 220 + index * 360;
      const unlocked = index < this.save.unlockedSegments;
      const selected = index === this.segmentIndex;

      this.ctx.fillStyle = unlocked ? (selected ? "#38bdf8" : "#0f172a") : "#111827";
      this.ctx.beginPath();
      this.ctx.arc(x, centerY, selected ? 34 : 28, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = unlocked ? "#67e8f9" : "#475569";
      this.ctx.lineWidth = 4;
      this.ctx.stroke();

      this.ctx.fillStyle = "#f8fafc";
      this.ctx.font = "18px Trebuchet MS";
      this.ctx.textAlign = "center";
      this.ctx.fillText(segment.name, x, centerY - 52);
      this.ctx.font = "15px Trebuchet MS";
      this.ctx.fillText(unlocked ? "Available" : "Locked", x, centerY + 56);
    });
  }

  drawWormholeTransitScene() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const intensity = 1 - this.run.wormholeTimer / Math.max(this.segment.wormhole.turbulenceDuration, 0.1);

    this.ctx.fillStyle = "#020617";
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let ring = 0; ring < 18; ring += 1) {
      const radius = 40 + ring * 28 + intensity * 90;
      this.ctx.strokeStyle = `rgba(${180 - ring * 4}, ${90 + ring * 5}, 255, ${0.45 - ring * 0.018})`;
      this.ctx.lineWidth = 6 - ring * 0.18;
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY, radius * 1.2, radius * 0.55, intensity * 2 + ring * 0.2, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "42px Trebuchet MS";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Wormhole Transit", centerX, centerY - 16);
    this.ctx.font = "20px Trebuchet MS";
    this.ctx.fillText("Holding hull integrity through unstable space-time compression.", centerX, centerY + 26);
  }

  wrapCenterText(text, centerX, topY, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let lineIndex = 0;

    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (this.ctx.measureText(test).width > maxWidth && line) {
        this.ctx.fillText(line, centerX, topY + lineIndex * lineHeight);
        line = word;
        lineIndex += 1;
      } else {
        line = test;
      }
    });

    if (line) {
      this.ctx.fillText(line, centerX, topY + lineIndex * lineHeight);
    }
  }

  renderPanel() {
    const {
      titleEl,
      copyEl,
      statusLabel,
      scoreLabel,
      objectiveLabel,
      detailsEl,
      upgradesEl,
      startButton,
      restartButton
    } = this.controls;

    scoreLabel.textContent = `Credits: ${this.save.credits}`;
    upgradesEl.innerHTML = "";
    detailsEl.innerHTML = "";

    if (this.state === "menu") {
      titleEl.textContent = "Ozscape";
      copyEl.textContent =
        "Command a deep-space freight hauler across dangerous routes, dock at remote stations, gamble on wormhole shortcuts, and turn payouts into a stronger ship.";
      statusLabel.textContent = "Command uplink stable.";
      objectiveLabel.textContent = "Objective: Open the campaign map.";
      this.addDetail(detailsEl, `Unlocked segments: ${this.save.unlockedSegments} / ${SEGMENTS.length}`);
      this.addDetail(detailsEl, `Completed runs: ${this.save.completedRuns}`);
      this.addDetail(detailsEl, `Best payout: ${this.save.bestCredits} credits`);
      startButton.textContent = "Campaign Map";
      startButton.disabled = false;
      restartButton.textContent = "Reset Save";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "campaignMap") {
      titleEl.textContent = "Campaign Map";
      copyEl.textContent = this.segment.subtitle;
      statusLabel.textContent = `Selected route: ${this.segment.name}`;
      objectiveLabel.textContent = "Objective: Cycle routes or enter mission briefing.";
      this.addDetail(detailsEl, `Route reward base: ${this.segment.baseReward} credits`);
      this.addDetail(detailsEl, `Required stop: ${this.segment.stationLabel}`);
      this.addDetail(detailsEl, `Destination: ${this.segment.destinationLabel}`);
      this.addDetail(detailsEl, `Optional shortcut: ${this.segment.wormhole ? "Wormhole corridor available" : "None"}`);
      startButton.textContent = "Mission Briefing";
      startButton.disabled = false;
      restartButton.textContent = "Next Route";
      restartButton.disabled = this.save.unlockedSegments <= 1;
      return;
    }

    if (this.state === "briefing") {
      titleEl.textContent = this.segment.name;
      copyEl.textContent = this.segment.briefing;
      statusLabel.textContent = "Mission packet received.";
      objectiveLabel.textContent = `Objective: Dock at ${this.segment.stationLabel}, then reach ${this.segment.destinationLabel}.`;
      this.addDetail(detailsEl, `Planetary landmarks: ${this.segment.planets.length}`);
      this.addDetail(detailsEl, `Soft hazards: ${this.segment.gravityZones.length + this.segment.ionZones.length}`);
      this.addDetail(detailsEl, `Shortcut: ${this.segment.wormhole ? "Optional wormhole branch" : "None"}`);
      this.addDetail(detailsEl, "Warning: any solid collision immediately fails the route.");
      startButton.textContent = "Launch Route";
      startButton.disabled = false;
      restartButton.textContent = "Back";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "segment") {
      const fuelRatio = this.run.fuel / this.getDerivedStats().maxFuel;
      const fuelState = fuelRatio <= 0.1 ? "Critical" : fuelRatio <= 0.25 ? "Low" : "Stable";

      titleEl.textContent = this.segment.name;
      copyEl.textContent = "Keep the freighter clean, manage fuel, and decide whether the wormhole shortcut is worth the risk.";
      statusLabel.textContent = this.run.stationCompleted
        ? "Refuel complete. Destination gate is active."
        : `Approach ${this.segment.stationLabel} and stabilize for docking.`;
      objectiveLabel.textContent = this.run.stationCompleted
        ? `Objective: Reach ${this.segment.destinationLabel}.`
        : `Objective: Dock at ${this.segment.stationLabel}.`;
      this.addDetail(detailsEl, `Route progress: ${Math.round(clamp(this.run.routeProgress / this.segment.length, 0, 1) * 100)}%`);
      this.addDetail(detailsEl, `Fuel remaining: ${Math.round(this.run.fuel)} / ${this.getDerivedStats().maxFuel}`);
      this.addDetail(detailsEl, `Fuel status: ${fuelState}`);
      this.addDetail(detailsEl, `Hazard exposure: ${this.run.hazardExposure.toFixed(1)}s`);
      this.addDetail(detailsEl, `Wormhole: ${this.run.wormholeUsed ? "Used" : "Available after station"}`);
      startButton.textContent = "In Flight";
      startButton.disabled = true;
      restartButton.textContent = "Route Active";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "docking") {
      titleEl.textContent = "Docking";
      copyEl.textContent = "Hold the freighter steady while the station refuels your tanks and rebalances the cargo load.";
      statusLabel.textContent = "Docking clamps engaged.";
      objectiveLabel.textContent = "Objective: Await refuel completion.";
      this.addDetail(detailsEl, `Refuel cycle: ${this.run.dockingTimer.toFixed(1)}s remaining`);
      this.addDetail(detailsEl, `Route progress: ${Math.round(clamp(this.run.routeProgress / this.segment.length, 0, 1) * 100)}%`);
      startButton.textContent = "Docking";
      startButton.disabled = true;
      restartButton.textContent = "Docking";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "wormholeTransit") {
      titleEl.textContent = "Wormhole Transit";
      copyEl.textContent =
        "The shortcut is live. Hold the cargo frame together while the ship compresses through unstable space-time.";
      statusLabel.textContent = "Wormhole corridor engaged.";
      objectiveLabel.textContent = "Objective: Survive transit and re-enter the route.";
      this.addDetail(detailsEl, `Transit time: ${this.run.wormholeTimer.toFixed(1)}s`);
      this.addDetail(detailsEl, `Projected bonus: ${this.segment.wormhole.rewardBonus} credits`);
      startButton.textContent = "Transit";
      startButton.disabled = true;
      restartButton.textContent = "Transit";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "results") {
      titleEl.textContent = "Results";
      copyEl.textContent = "Delivery complete. Review the route performance before moving into hangar operations.";
      statusLabel.textContent = `Run complete. Earned ${this.summary.total} credits.`;
      objectiveLabel.textContent = "Objective: Review rewards or continue to hangar.";
      this.addDetail(detailsEl, `Base reward: ${this.summary.baseReward}`);
      this.addDetail(detailsEl, `Fuel efficiency bonus: ${this.summary.fuelBonus}`);
      this.addDetail(detailsEl, `Docking precision bonus: ${this.summary.dockingBonus}`);
      this.addDetail(detailsEl, `Hazard control bonus: ${this.summary.hazardBonus}`);
      this.addDetail(detailsEl, `Wormhole bonus: ${this.summary.shortcutBonus}`);
      startButton.textContent = "Open Hangar";
      startButton.disabled = false;
      restartButton.textContent = "Campaign Map";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "hangar") {
      titleEl.textContent = "Hangar";
      copyEl.textContent =
        "Spend credits to sharpen thrust, soft-hazard resistance, fuel reserves, and control before the next freight run.";
      statusLabel.textContent = `Available credits: ${this.save.credits}`;
      objectiveLabel.textContent = "Objective: Upgrade the freighter or return to the campaign map.";
      UPGRADE_DEFS.forEach((upgrade) => {
        const card = document.createElement("div");
        card.className = "upgrade-card";
        const level = this.save.upgrades[upgrade.key];
        const cost = this.getUpgradeCost(upgrade.key);
        const canAfford = this.save.credits >= cost;
        card.innerHTML = `
          <h3>${upgrade.name} Mk.${level + 1}</h3>
          <p>${upgrade.description}</p>
        `;
        const button = document.createElement("button");
        button.textContent = `${canAfford ? "Upgrade" : "Need"} ${cost} cr`;
        button.disabled = !canAfford;
        button.addEventListener("click", () => this.purchaseUpgrade(upgrade.key));
        card.appendChild(button);
        upgradesEl.appendChild(card);
      });
      startButton.textContent = "Campaign Map";
      startButton.disabled = false;
      restartButton.textContent = "Back to Menu";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "gameOver") {
      titleEl.textContent = "Route Failed";
      copyEl.textContent =
        "The cargo run was lost before reaching the destination. Review the route summary, then launch again with a cleaner approach.";
      statusLabel.textContent = this.summary.reason;
      objectiveLabel.textContent = "Objective: Retry the route or return to campaign command.";
      this.addDetail(detailsEl, `Fallback credits: ${this.summary.total}`);
      this.addDetail(detailsEl, `Route progress reached: ${Math.round(clamp(this.run.routeProgress / this.segment.length, 0, 1) * 100)}%`);
      this.addDetail(detailsEl, `Station reached: ${this.run.stationCompleted ? "Yes" : "No"}`);
      this.addDetail(detailsEl, `Wormhole used: ${this.run.wormholeUsed ? "Yes" : "No"}`);
      startButton.textContent = "Retry Briefing";
      startButton.disabled = false;
      restartButton.textContent = "Campaign Map";
      restartButton.disabled = false;
    }
  }

  addDetail(container, text) {
    const element = document.createElement("div");
    element.className = "detail-card";
    element.textContent = text;
    container.appendChild(element);
  }

  getDerivedStats() {
    const upgrades = this.save.upgrades;
    return {
      cruiseSpeed: 112 + upgrades.engine * 12,
      maxFuel: 45 + upgrades.fuelTank * 12,
      handlingFactor: 1 + upgrades.handling * 0.12,
      dockingAssist: upgrades.durability * 0.22 + upgrades.handling * 0.08,
      wormholeAssist: upgrades.engine * 0.14 + upgrades.handling * 0.12
    };
  }

  getUpgradeCost(key) {
    const definition = UPGRADE_DEFS.find((entry) => entry.key === key);
    const level = this.save.upgrades[key];
    return Math.round(definition.baseCost * Math.pow(1.42, level));
  }

  createEmptyRun() {
    return {
      routeProgress: 0,
      fuel: 0,
      dockingProgress: 0,
      dockingTimer: 0,
      dockingQuality: 1,
      stationCompleted: false,
      hazardExposure: 0,
      softPenalty: 0,
      creditsPreview: 0,
      wormholeAlignment: 0,
      wormholeTimer: 0,
      wormholeUsed: false,
      shortcutBonus: 0
    };
  }

  loadSave() {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return defaultSave();
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        credits: parsed.credits ?? 0,
        bestCredits: parsed.bestCredits ?? 0,
        completedRuns: parsed.completedRuns ?? 0,
        unlockedSegments: clamp(parsed.unlockedSegments ?? 1, 1, SEGMENTS.length),
        completedSegmentIds: parsed.completedSegmentIds ?? [],
        upgrades: {
          engine: parsed.upgrades?.engine ?? 0,
          durability: parsed.upgrades?.durability ?? 0,
          fuelTank: parsed.upgrades?.fuelTank ?? 0,
          handling: parsed.upgrades?.handling ?? 0
        }
      };
    } catch {
      return defaultSave();
    }
  }

  persistSave() {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(this.save));
  }

  resetSave() {
    this.save = defaultSave();
    this.persistSave();
  }
}
