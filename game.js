import { Player } from "./player.js";
import { ObstacleManager } from "./obstacles.js";

const SAVE_KEY = "ozscape-save-v2";

const SEGMENT_CONFIG = {
  id: "sector-a",
  name: "Abyssal Freight Lane",
  briefing:
    "Move critical reactor cores through a fractured mining corridor. Refuel at the Leviathan Station, then continue to the extraction gate.",
  destinationLabel: "Extraction Gate Theta",
  stationLabel: "Leviathan Refuel Station",
  length: 5200,
  dockingDuration: 1.9,
  debrisFields: [
    { startX: 700, endX: 1500, top: 110, bottom: 610, count: 18 },
    { startX: 1700, endX: 2400, top: 150, bottom: 570, count: 16 },
    { startX: 3000, endX: 4200, top: 90, bottom: 630, count: 24 },
    { startX: 4350, endX: 4920, top: 120, bottom: 600, count: 18 }
  ],
  movingAsteroids: [
    { worldX: 1240, worldY: 520, radius: 28, velocityY: -72, minY: 160, maxY: 560, spin: 0.8 },
    { worldX: 2060, worldY: 200, radius: 24, velocityY: 86, minY: 160, maxY: 520, spin: -0.9 },
    { worldX: 3440, worldY: 500, radius: 32, velocityY: -95, minY: 120, maxY: 600, spin: 1.1 },
    { worldX: 3950, worldY: 190, radius: 22, velocityY: 80, minY: 150, maxY: 540, spin: -0.7 },
    { worldX: 4580, worldY: 420, radius: 30, velocityY: -92, minY: 180, maxY: 560, spin: 1.3 }
  ],
  gravityZone: {
    worldX: 3400,
    worldY: 360,
    radius: 190,
    strength: 160
  },
  station: {
    worldX: 2580,
    worldY: 200,
    bodyRadius: 82,
    zoneOffsetX: 178,
    zoneWidth: 110,
    zoneHeight: 110
  },
  gate: {
    worldX: 5060,
    worldY: 360,
    width: 90,
    height: 240
  }
};

const UPGRADE_DEFS = [
  {
    key: "engine",
    name: "Engine",
    description: "Raises thrust output and convoy cruise speed.",
    baseCost: 140
  },
  {
    key: "durability",
    name: "Durability",
    description: "Improves docking stability tolerance and gravity resistance.",
    baseCost: 130
  },
  {
    key: "fuelTank",
    name: "Fuel Tank",
    description: "Increases total fuel reserves for longer runs.",
    baseCost: 125
  },
  {
    key: "handling",
    name: "Handling",
    description: "Improves drift recovery and steering response.",
    baseCost: 135
  }
];

const defaultSave = () => ({
  credits: 0,
  bestCredits: 0,
  completedRuns: 0,
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
    this.segment = SEGMENT_CONFIG;
    this.player = new Player(190, height / 2);
    this.obstacles = new ObstacleManager(width, height);
    this.running = false;
    this.lastTime = 0;
    this.backgroundOffset = 0;
    this.save = this.loadSave();
    this.run = this.createEmptyRun();
    this.summary = null;
    this.panelUpgradeMode = false;
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
      this.state = "briefing";
      this.renderPanel();
      return;
    }

    if (this.state === "briefing") {
      this.startSegment();
      return;
    }

    if (this.state === "hangar") {
      this.state = "briefing";
      this.panelUpgradeMode = false;
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
      this.renderPanel();
      return;
    }

    if (this.state === "briefing") {
      this.state = "menu";
      this.renderPanel();
      return;
    }

    if (this.state === "hangar") {
      this.state = "menu";
      this.panelUpgradeMode = false;
      this.renderPanel();
      return;
    }

    if (this.state === "gameOver") {
      this.state = "menu";
      this.renderPanel();
    }
  }

  startSegment() {
    this.player = new Player(190, this.height / 2);
    this.obstacles.loadSegment(this.segment);
    this.run = {
      ...this.createEmptyRun(),
      fuel: this.getDerivedStats().maxFuel
    };
    this.state = "segment";
    this.running = true;
    this.lastTime = performance.now();
    this.backgroundOffset = 0;
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
    } else {
      this.running = false;
    }
  }

  updateSegment(deltaTime) {
    const stats = this.getDerivedStats();
    const movement = this.player.update(this.input, deltaTime, {
      width: this.width,
      height: this.height
    }, stats);

    const gravity = this.obstacles.getGravityInfluence(
      this.player,
      this.run.routeProgress,
      this.save.upgrades.durability
    );
    if (gravity.active) {
      this.player.applyForce(gravity.force, deltaTime);
      this.run.hazardExposure += deltaTime;
    }

    const thrustBonus = movement.thrusting ? 85 + this.save.upgrades.engine * 10 : 0;
    const cruiseSpeed = 112 + this.save.upgrades.engine * 12;
    const slowPenalty = gravity.active ? 20 : 0;
    const routeSpeed = Math.max(75, cruiseSpeed + thrustBonus - slowPenalty);
    this.run.routeProgress += routeSpeed * deltaTime;
    this.backgroundOffset += (50 + routeSpeed * 0.18) * deltaTime;

    this.obstacles.update(deltaTime, this.run.routeProgress);

    const passiveDrain = 0.95;
    const thrustDrain = movement.thrusting ? 1.45 : 0;
    this.run.fuel = clamp(
      this.run.fuel - (passiveDrain + thrustDrain + gravity.fuelPenalty) * deltaTime,
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
          this.run.dockingProgress + deltaTime * (0.65 + docking.alignment),
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

  completeSegment() {
    const fuelBonus = Math.round(this.run.fuel * 2.4);
    const dockingBonus = Math.round(65 * this.run.dockingQuality);
    const hazardBonus = Math.max(0, Math.round(50 - this.run.hazardExposure * 10));
    const baseReward = 180;
    const total = baseReward + fuelBonus + dockingBonus + hazardBonus;

    this.summary = {
      title: "Delivery Complete",
      result: "success",
      baseReward,
      fuelBonus,
      dockingBonus,
      hazardBonus,
      total
    };

    this.save.credits += total;
    this.save.bestCredits = Math.max(this.save.bestCredits, total);
    this.save.completedRuns += 1;
    this.persistSave();

    this.state = "hangar";
    this.running = false;
    this.panelUpgradeMode = true;
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

    if (this.state === "segment" || this.state === "docking") {
      this.drawSegmentScene();
      return;
    }

    this.drawBackdrop();
    if (this.state === "menu") {
      this.drawCenterCard("Ozscape", "Launch long-haul cargo runs through deep-space hazards.");
    } else if (this.state === "briefing") {
      this.drawCenterCard(this.segment.name, "Route briefing uploaded. Depart when ready.");
    } else if (this.state === "hangar") {
      this.drawCenterCard("Hangar", "Upgrade the freighter before the next run.");
    } else if (this.state === "gameOver") {
      this.drawCenterCard("Route Failed", this.summary?.reason ?? "The cargo run was lost.");
    }
  }

  drawSegmentScene() {
    this.drawBackdrop();
    this.drawRouteBands();
    this.obstacles.draw(this.ctx, this.run.routeProgress, this.run.stationCompleted);
    this.player.draw(this.ctx, {
      thrusting: this.input.w || this.input.a || this.input.s || this.input.d,
      highlight: this.state === "docking"
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

    this.ctx.fillStyle = "rgba(226, 232, 240, 0.75)";
    for (let index = 0; index < 120; index += 1) {
      let x = (index * 149 - this.backgroundOffset * (0.24 + (index % 6) * 0.035)) % (this.width + 60);
      if (x < -4) {
        x += this.width + 60;
      }
      const y = (index * 79) % this.height;
      this.ctx.fillRect(x, y, 2, 2);
    }

    this.ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
    this.ctx.beginPath();
    this.ctx.arc(this.width * 0.78, this.height * 0.22, 180, 0, Math.PI * 2);
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

    this.ctx.fillStyle = "rgba(6, 18, 34, 0.82)";
    this.ctx.fillRect(18, 18, 388, 126);
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    this.ctx.strokeRect(18, 18, 388, 126);

    this.drawMeter("Fuel", fuelRatio, 108, 38, "#38bdf8");
    this.drawMeter("Route", progressRatio, 108, 72, "#22c55e");

    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "15px Trebuchet MS";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Credits: ${this.save.credits}`, 32, 106);
    this.ctx.fillText(
      `Objective: ${this.run.stationCompleted ? "Reach destination gate" : "Dock at refuel station"}`,
      132,
      106
    );

    if (!this.run.stationCompleted) {
      this.ctx.fillText(
        `Dock lock: ${Math.round(this.run.dockingProgress / this.segment.dockingDuration * 100)}%`,
        32,
        130
      );
    } else {
      this.ctx.fillText("Station refuel complete.", 32, 130);
    }
  }

  drawMeter(label, ratio, y, width, color) {
    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "15px Trebuchet MS";
    this.ctx.textAlign = "left";
    this.ctx.fillText(label, 32, y);

    this.ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    this.ctx.fillRect(118, y - 11, 250, 12);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(118, y - 11, 250 * ratio, 12);
    this.ctx.strokeStyle = "rgba(226, 232, 240, 0.2)";
    this.ctx.strokeRect(118, y - 11, 250, 12);
  }

  drawCenterCard(title, copy) {
    this.ctx.fillStyle = "rgba(6, 18, 34, 0.84)";
    this.ctx.fillRect(this.width / 2 - 260, this.height / 2 - 82, 520, 164);
    this.ctx.strokeStyle = "rgba(125, 211, 252, 0.42)";
    this.ctx.strokeRect(this.width / 2 - 260, this.height / 2 - 82, 520, 164);
    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "40px Trebuchet MS";
    this.ctx.textAlign = "center";
    this.ctx.fillText(title, this.width / 2, this.height / 2 - 18);
    this.ctx.font = "20px Trebuchet MS";
    this.wrapCenterText(copy, this.width / 2, this.height / 2 + 24, 420, 28);
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
    const { titleEl, copyEl, statusLabel, scoreLabel, objectiveLabel, detailsEl, upgradesEl, startButton, restartButton } =
      this.controls;

    scoreLabel.textContent = `Credits: ${this.save.credits}`;
    upgradesEl.innerHTML = "";
    detailsEl.innerHTML = "";

    if (this.state === "menu") {
      titleEl.textContent = "Ozscape";
      copyEl.textContent =
        "Take a deep-space cargo freighter through dangerous sectors, dock for refueling, and return to the hangar with enough credits to upgrade your ship.";
      statusLabel.textContent = "Command link stable. One route available.";
      objectiveLabel.textContent = "Objective: Review the next freight mission.";
      this.addDetail(detailsEl, `Completed runs: ${this.save.completedRuns}`);
      this.addDetail(detailsEl, `Best payout: ${this.save.bestCredits} credits`);
      this.addDetail(detailsEl, `Upgrades: Engine ${this.save.upgrades.engine} | Durability ${this.save.upgrades.durability} | Fuel ${this.save.upgrades.fuelTank} | Handling ${this.save.upgrades.handling}`);
      startButton.textContent = "Mission Briefing";
      startButton.disabled = false;
      restartButton.textContent = "Reset Save";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "briefing") {
      titleEl.textContent = this.segment.name;
      copyEl.textContent = this.segment.briefing;
      statusLabel.textContent = "Mission packet received.";
      objectiveLabel.textContent = `Objective: Dock at ${this.segment.stationLabel}, then reach ${this.segment.destinationLabel}.`;
      this.addDetail(detailsEl, "Route beats: entry corridor, debris field, moving asteroid lane, gravity anomaly, station stop, extraction gate.");
      this.addDetail(detailsEl, `Freighter stats: cruise ${this.getDerivedStats().cruiseSpeed}, fuel ${this.getDerivedStats().maxFuel}, handling ${this.getDerivedStats().handlingFactor.toFixed(2)}.`);
      this.addDetail(detailsEl, "Warning: any solid collision immediately fails the segment.");
      startButton.textContent = "Launch Route";
      startButton.disabled = false;
      restartButton.textContent = "Back";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "segment") {
      titleEl.textContent = this.segment.name;
      copyEl.textContent = "Stay clear of debris, manage fuel, and keep the cargo ship stable through hazardous space.";
      statusLabel.textContent = this.run.stationCompleted
        ? "Refuel complete. Continue to the destination gate."
        : "Approach the station docking zone and hold a stable alignment.";
      objectiveLabel.textContent = this.run.stationCompleted
        ? `Objective: Reach ${this.segment.destinationLabel}.`
        : `Objective: Dock at ${this.segment.stationLabel}.`;
      this.addDetail(detailsEl, `Route progress: ${Math.round(clamp(this.run.routeProgress / this.segment.length, 0, 1) * 100)}%`);
      this.addDetail(detailsEl, `Fuel remaining: ${Math.round(this.run.fuel)} / ${this.getDerivedStats().maxFuel}`);
      this.addDetail(detailsEl, `Gravity exposure: ${this.run.hazardExposure.toFixed(1)}s`);
      startButton.textContent = "In Flight";
      startButton.disabled = true;
      restartButton.textContent = "Route Active";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "docking") {
      titleEl.textContent = "Docking";
      copyEl.textContent = "Hold formation while the station locks the freighter in place, refuels the ship, and refreshes the cargo systems.";
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

    if (this.state === "hangar") {
      titleEl.textContent = "Hangar";
      copyEl.textContent =
        "Delivery complete. Spend credits to prepare the cargo ship for the next route and tighten the margins on fuel, thrust, and control.";
      statusLabel.textContent = `Run complete. Earned ${this.summary.total} credits.`;
      objectiveLabel.textContent = "Objective: Upgrade the freighter or launch another delivery.";
      this.addDetail(detailsEl, `Base reward: ${this.summary.baseReward}`);
      this.addDetail(detailsEl, `Fuel efficiency bonus: ${this.summary.fuelBonus}`);
      this.addDetail(detailsEl, `Docking precision bonus: ${this.summary.dockingBonus}`);
      this.addDetail(detailsEl, `Hazard control bonus: ${this.summary.hazardBonus}`);
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
      startButton.textContent = "Next Mission";
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
      objectiveLabel.textContent = "Objective: Retry the route or return to command.";
      this.addDetail(detailsEl, `Fallback credits: ${this.summary.total}`);
      this.addDetail(detailsEl, `Route progress reached: ${Math.round(clamp(this.run.routeProgress / this.segment.length, 0, 1) * 100)}%`);
      this.addDetail(detailsEl, `Station reached: ${this.run.stationCompleted ? "Yes" : "No"}`);
      startButton.textContent = "Retry Briefing";
      startButton.disabled = false;
      restartButton.textContent = "Back to Menu";
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
      dockingTolerance: 42 + upgrades.durability * 8
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
      creditsPreview: 0
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
