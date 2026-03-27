import { ShipPlayer, PlayerCharacter } from "./player.js";
import { ObstacleManager } from "./obstacles.js";

const SAVE_KEY = "ozscape-save-v4";

const createDeparture = (portLabel, planetLabel) => ({
  portLabel,
  planetLabel
});

const SEGMENTS = [
  {
    id: "sector-a",
    name: "Abyssal Freight Lane",
    subtitle: "Launch from Khepri Prime and thread a fractured mining corridor.",
    briefing:
      "Carry reactor cores off-world, refuel at Leviathan Station, then decide whether the wormhole bypass is worth the turbulence.",
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
      { label: "Fractured moon gravity", worldX: 3380, worldY: 360, radius: 190, strength: 160, fuelPenalty: 0.65 }
    ],
    ionZones: [],
    planets: [
      { worldX: 2860, worldY: 110, radius: 136, midColor: "#7dd3fc", darkColor: "#164e63" },
      { worldX: 4550, worldY: 610, radius: 104, midColor: "#fb923c", darkColor: "#7c2d12" }
    ],
    station: { worldX: 2580, worldY: 200, bodyRadius: 82, zoneOffsetX: 178, zoneWidth: 110, zoneHeight: 110 },
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
    gate: { worldX: 5440, worldY: 360, width: 90, height: 240 },
    departure: createDeparture("Khepri Container Spire", "Khepri Prime")
  },
  {
    id: "sector-b",
    name: "Gas Giant Shepherd Run",
    subtitle: "Lift from Atlas-9 and ride the orbital slip around a ringed giant.",
    briefing:
      "Deliver agricultural condensers through ring-shadow lanes, refuel at Ravel Dock, and cut distance with a high-value wormhole line if the corridor is clean.",
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
      { label: "Gas giant pull", worldX: 3220, worldY: 240, radius: 230, strength: 145, fuelPenalty: 0.55 }
    ],
    ionZones: [
      { label: "Ring static", worldX: 4860, worldY: 360, width: 520, height: 220, fuelPenalty: 0.42, controlPenalty: 0.3 }
    ],
    planets: [
      { worldX: 3340, worldY: 160, radius: 188, midColor: "#f59e0b", darkColor: "#78350f" }
    ],
    station: { worldX: 3720, worldY: 530, bodyRadius: 86, zoneOffsetX: 170, zoneWidth: 118, zoneHeight: 118 },
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
    gate: { worldX: 5960, worldY: 420, width: 90, height: 250 },
    departure: createDeparture("Atlas Surface Ringport", "Atlas-9")
  },
  {
    id: "sector-c",
    name: "Relay Fracture Corridor",
    subtitle: "Depart Ymir and punch through unstable relay space.",
    briefing:
      "Move quantum relay cores through ion-washed relay fractures, dock at Ymir Array, and risk the experimental wormhole for a premium finish.",
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
      { label: "Relay singularity", worldX: 4510, worldY: 340, radius: 210, strength: 170, fuelPenalty: 0.72 }
    ],
    ionZones: [
      { label: "Ion storm wall", worldX: 2960, worldY: 360, width: 600, height: 240, fuelPenalty: 0.5, controlPenalty: 0.36 }
    ],
    planets: [
      { worldX: 1380, worldY: 80, radius: 110, midColor: "#818cf8", darkColor: "#312e81" },
      { worldX: 5080, worldY: 620, radius: 134, midColor: "#34d399", darkColor: "#064e3b" }
    ],
    station: { worldX: 3500, worldY: 180, bodyRadius: 88, zoneOffsetX: 178, zoneWidth: 112, zoneHeight: 116 },
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
    gate: { worldX: 6460, worldY: 330, width: 96, height: 260 },
    departure: createDeparture("Ymir Relay Drydock", "Ymir Outpost World")
  }
];

const UPGRADE_DEFS = [
  { key: "engine", name: "Engine", description: "Raises thrust output and route speed.", baseCost: 140 },
  { key: "durability", name: "Durability", description: "Improves docking tolerance and hazard resistance.", baseCost: 130 },
  { key: "fuelTank", name: "Fuel Tank", description: "Increases reserves for longer lanes.", baseCost: 125 },
  { key: "handling", name: "Handling", description: "Sharpens ship response and courier agility.", baseCost: 135 }
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
const safeNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};
const safeInteger = (value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  clamp(Math.floor(safeNumber(value, fallback)), min, max);

export class Game {
  constructor({ THREE, renderer, canvas, controls }) {
    this.THREE = THREE;
    this.renderer = renderer;
    this.canvas = canvas;
    this.controls = controls;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.0035);

    this.camera = new THREE.PerspectiveCamera(56, 16 / 9, 0.1, 6000);
    this.cameraTarget = new THREE.Vector3();

    this.ambientLight = new THREE.AmbientLight(0xbcd7ff, 1.4);
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.45);
    this.sunLight.position.set(80, 140, 70);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.left = -180;
    this.sunLight.shadow.camera.right = 180;
    this.sunLight.shadow.camera.top = 180;
    this.sunLight.shadow.camera.bottom = -180;
    this.scene.add(this.ambientLight, this.sunLight);

    this.controlsRef = controls;
    this.input = { w: false, a: false, s: false, d: false };
    this.state = "menu";
    this.segmentIndex = 0;
    this.segment = SEGMENTS[0];
    this.save = this.loadSave();
    this.summary = null;
    this.time = 0;
    this.lastTime = performance.now();

    this.player = new ShipPlayer(THREE, 0, 0);
    this.character = new PlayerCharacter(THREE, 0, 0);
    this.player.addTo(this.scene);
    this.character.addTo(this.scene);

    this.obstacles = new ObstacleManager(THREE, this.scene);
    this.run = this.createEmptyRun();

    this.bindInput();
    this.loadSegmentWorld();
    this.renderPanel();
  }

  start() {
    requestAnimationFrame((time) => this.loop(time));
  }

  handleResize() {
    const width = this.canvas.clientWidth || this.canvas.width;
    const height = this.canvas.clientHeight || this.canvas.height;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
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
    } else if (this.state === "campaignMap") {
      this.state = "briefing";
    } else if (this.state === "briefing") {
      this.startMission();
    } else if (this.state === "results") {
      this.state = "hangar";
    } else if (this.state === "hangar") {
      this.state = "campaignMap";
    } else if (this.state === "gameOver") {
      this.state = "briefing";
    }

    this.syncPreviewActors();
    this.renderPanel();
  }

  handleSecondaryAction() {
    if (this.state === "menu") {
      this.resetSave();
      this.segmentIndex = 0;
      this.segment = SEGMENTS[0];
      this.loadSegmentWorld();
      return;
    }

    if (this.state === "campaignMap") {
      this.segmentIndex = (this.segmentIndex + 1) % this.save.unlockedSegments;
      this.segment = SEGMENTS[this.segmentIndex];
      this.loadSegmentWorld();
      return;
    }

    if (this.state === "briefing") {
      this.state = "campaignMap";
    } else if (this.state === "results") {
      this.state = "campaignMap";
    } else if (this.state === "hangar") {
      this.state = "menu";
    } else if (this.state === "gameOver") {
      this.state = "campaignMap";
    }

    this.syncPreviewActors();
    this.renderPanel();
  }

  startMission() {
    const departure = this.obstacles.getDepartureWorld();
    const stats = this.getDerivedStats();
    this.character.reset(departure.characterSpawn);
    this.player.reset(departure.shipSpawn, this.save.upgrades);
    this.run = {
      ...this.createEmptyRun(),
      fuel: safeNumber(stats.maxFuel, 45)
    };
    this.state = "boarding";
    this.renderPanel();
  }

  loadSegmentWorld() {
    this.obstacles.loadSegment(this.segment);
    this.syncPreviewActors();
    this.renderPanel();
  }

  syncPreviewActors() {
    const departure = this.obstacles.getDepartureWorld();
    const arrival = this.obstacles.getArrivalWorld();

    if (this.state === "arrival" || this.state === "results") {
      this.character.reset(arrival.characterSpawn);
      this.player.reset(arrival.shipSpawn, this.save.upgrades);
    } else {
      this.character.reset(departure.characterSpawn);
      this.player.reset(departure.shipSpawn, this.save.upgrades);
    }
  }

  loop(currentTime) {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.033);
    this.lastTime = currentTime;
    this.time += deltaTime;

    this.update(deltaTime);
    this.render();
    requestAnimationFrame((time) => this.loop(time));
  }

  update(deltaTime) {
    if (this.state === "boarding") {
      this.updateBoarding(deltaTime);
    } else if (this.state === "launch") {
      this.updateLaunch(deltaTime);
    } else if (this.state === "routeFlight") {
      this.updateRouteFlight(deltaTime);
    } else if (this.state === "docking") {
      this.updateDocking(deltaTime);
    } else if (this.state === "wormholeTransit") {
      this.updateWormholeTransit(deltaTime);
    } else if (this.state === "arrival") {
      this.updateArrival(deltaTime);
    } else if (this.state === "menu" || this.state === "campaignMap" || this.state === "briefing" || this.state === "hangar" || this.state === "gameOver" || this.state === "results") {
      this.backgroundPreviewDrift(deltaTime);
    }

    this.obstacles.update(deltaTime, this.run.routeProgress, { time: this.time, wormholeUsed: this.run.wormholeUsed });
    this.updateModeVisibility();
    this.updateCamera(deltaTime);
  }

  updateBoarding(deltaTime) {
    this.character.update(this.input, deltaTime, { minX: -70, maxX: 70, minZ: -42, maxZ: 42 });
    const cargo = this.obstacles.getCargoCheckpointInfo(this.character);
    const boarding = this.obstacles.getBoardingInfo(this.character);

    if (!this.run.cargoSecured && cargo.inZone) {
      this.run.cargoProgress = clamp(this.run.cargoProgress + deltaTime, 0, 1.2);
      if (this.run.cargoProgress >= 1.2) {
        this.run.cargoSecured = true;
      }
    } else if (!this.run.cargoSecured) {
      this.run.cargoProgress = Math.max(0, this.run.cargoProgress - deltaTime * 0.6);
    }

    if (this.run.cargoSecured && boarding.inZone) {
      this.run.boardingProgress = clamp(this.run.boardingProgress + deltaTime * 1.15, 0, 1.15);
      if (this.run.boardingProgress >= 1.15) {
        this.run.cargoLoaded = 3;
        this.state = "launch";
      }
    } else if (this.run.cargoSecured) {
      this.run.boardingProgress = Math.max(0, this.run.boardingProgress - deltaTime * 0.65);
    }

    this.renderPanel();
  }

  updateLaunch(deltaTime) {
    const stats = this.getDerivedStats();
    const maxFuel = safeNumber(stats.maxFuel, 45);
    const departure = this.obstacles.getDepartureWorld();
    const launchForce = this.obstacles.getDepartureForce(this.player, this.run.launchProgress);
    const movement = this.player.update(
      this.input,
      deltaTime,
      { minX: departure.shipSpawn.x, maxX: departure.departureLane.clearX + 12, minY: 2.8, maxY: 24, minZ: -16, maxZ: 16 },
      stats,
      [launchForce]
    );

    this.run.fuel = clamp(
      safeNumber(this.run.fuel, maxFuel) - (0.32 + (movement.thrusting ? 0.48 : 0)) * deltaTime,
      0,
      maxFuel
    );

    const xProgress = clamp(
      (this.player.position.x - departure.shipSpawn.x) / Math.max(departure.departureLane.clearX - departure.shipSpawn.x, 1),
      0,
      1
    );
    const yProgress = clamp(this.player.position.y / Math.max(departure.departureLane.targetY, 1), 0, 1);
    this.run.launchProgress = Math.max(this.run.launchProgress, xProgress * 0.7 + yProgress * 0.3);

    if (this.player.position.x >= departure.departureLane.clearX || this.run.launchProgress >= 1) {
      this.state = "routeFlight";
      this.player.position.x = 26;
      this.player.position.y = 6;
      this.player.syncSceneObject();
      this.run.routeProgress = this.player.position.x;
    }

    if (this.run.fuel <= 0) {
      this.failMission("Fuel reserves depleted during launch.");
      return;
    }

    this.renderPanel();
  }

  updateRouteFlight(deltaTime) {
    const stats = this.getDerivedStats();
    const maxFuel = safeNumber(stats.maxFuel, 45);
    const gravity = this.obstacles.getGravityInfluence(this.player, this.save.upgrades.durability);
    const ionStorm = this.obstacles.getIonStormEffect(this.player, this.save.upgrades.durability);
    const movement = this.player.update(
      this.input,
      deltaTime,
      { minX: 0, maxX: this.obstacles.getRouteLength() + 30, minY: -16, maxY: 26, minZ: -58, maxZ: 58 },
      stats,
      gravity.active ? [gravity.force] : []
    );

    const passiveForward = 9.5 + stats.cruiseSpeed * 0.06;
    this.player.position.x += passiveForward * deltaTime;
    this.player.syncSceneObject();
    this.run.routeProgress = this.player.position.x;

    if (gravity.active) {
      this.run.hazardExposure += deltaTime;
    }
    if (ionStorm.active) {
      this.run.hazardExposure += deltaTime * 0.7;
      this.run.softPenalty += deltaTime * ionStorm.controlPenalty;
    }

    const currentFuel = safeNumber(this.run.fuel, maxFuel);
    this.run.fuel = clamp(
      currentFuel - (0.9 + (movement.thrusting ? 1.2 : 0) + gravity.fuelPenalty + ionStorm.fuelPenalty) * deltaTime,
      0,
      maxFuel
    );

    const collision = this.obstacles.getSolidCollision(this.player);
    if (collision) {
      this.failMission("Collision detected. Cargo route lost.");
      return;
    }

    const docking = this.obstacles.getDockingInfo(this.player);
    if (!this.run.stationCompleted && docking.inZone) {
      if (movement.stable) {
        this.run.dockingProgress = clamp(
          this.run.dockingProgress + deltaTime * (0.55 + docking.alignment + stats.dockingAssist * 0.15),
          0,
          this.segment.dockingDuration
        );
      } else {
        this.run.dockingProgress = Math.max(0, this.run.dockingProgress - deltaTime * 0.5);
      }
      if (this.run.dockingProgress >= this.segment.dockingDuration) {
        this.state = "docking";
        this.run.dockingTimer = 1.8;
      }
    } else if (!this.run.stationCompleted) {
      this.run.dockingProgress = Math.max(0, this.run.dockingProgress - deltaTime * 0.45);
    }

    const wormhole = this.obstacles.getWormholeInfo(this.player, this.run.wormholeUsed);
    if (this.run.stationCompleted && wormhole.available && wormhole.inZone && movement.stable) {
      this.run.wormholeAlignment = clamp(
        this.run.wormholeAlignment + deltaTime * (0.8 + wormhole.alignment + stats.wormholeAssist * 0.16),
        0,
        1.5
      );
      if (this.run.wormholeAlignment >= 1.5) {
        this.state = "wormholeTransit";
        this.run.wormholeTimer = this.segment.wormhole.turbulenceDuration;
        this.run.wormholeUsed = true;
      }
    } else {
      this.run.wormholeAlignment = Math.max(0, this.run.wormholeAlignment - deltaTime * 0.7);
    }

    if (this.obstacles.getGateInfo(this.player).inZone && this.run.stationCompleted) {
      this.completeMission();
      return;
    }

    if (this.run.routeProgress >= this.obstacles.getRouteLength() + 20 && !this.run.stationCompleted) {
      this.failMission("Delivery failed. Mandatory station refuel was missed.");
      return;
    }

    if (this.run.fuel <= 0) {
      this.failMission("Fuel reserves depleted before reaching the destination gate.");
      return;
    }

    this.renderPanel();
  }

  updateDocking(deltaTime) {
    this.run.dockingTimer = Math.max(0, this.run.dockingTimer - deltaTime);
    this.run.fuel = safeNumber(this.getDerivedStats().maxFuel, 45);
    if (this.run.dockingTimer === 0) {
      this.run.stationCompleted = true;
      this.run.dockingQuality = clamp(1 - (this.run.hazardExposure * 0.02), 0.35, 1);
      this.run.dockingProgress = 0;
      this.state = "routeFlight";
    }
    this.renderPanel();
  }

  updateWormholeTransit(deltaTime) {
    this.run.wormholeTimer = Math.max(0, this.run.wormholeTimer - deltaTime);
    if (this.run.wormholeTimer === 0) {
      const maxFuel = safeNumber(this.getDerivedStats().maxFuel, 45);
      this.player.position.x = this.obstacles.wormhole.exitProgress;
      this.player.position.z = 0;
      this.player.syncSceneObject();
      this.run.routeProgress = this.player.position.x;
      this.run.fuel = clamp(safeNumber(this.run.fuel, maxFuel) + this.segment.wormhole.fuelBonus, 0, maxFuel);
      this.run.shortcutBonus = this.segment.wormhole.rewardBonus;
      this.state = "routeFlight";
    }
    this.renderPanel();
  }

  updateArrival(deltaTime) {
    this.character.update(this.input, deltaTime, { minX: -40, maxX: 42, minZ: -24, maxZ: 26 });
    const arrival = this.obstacles.getArrivalInfo(this.character);
    if (arrival.inZone) {
      this.run.arrivalProgress = clamp(this.run.arrivalProgress + deltaTime, 0, 1.1);
      if (this.run.arrivalProgress >= 1.1) {
        this.state = "results";
      }
    } else {
      this.run.arrivalProgress = Math.max(0, this.run.arrivalProgress - deltaTime * 0.4);
    }
    this.renderPanel();
  }

  backgroundPreviewDrift(deltaTime) {
    const departure = this.obstacles.getDepartureWorld();
    this.player.position.x = departure.shipSpawn.x + Math.sin(this.time * 0.35) * 1.2;
    this.player.position.z = departure.shipSpawn.z + Math.cos(this.time * 0.4) * 0.8;
    this.player.syncSceneObject();
    this.character.position.x = departure.characterSpawn.x + Math.sin(this.time * 0.7) * 0.4;
    this.character.position.z = departure.characterSpawn.z + Math.cos(this.time * 0.6) * 0.4;
    this.character.syncSceneObject();
  }

  completeMission() {
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
    this.save.unlockedSegments = clamp(Math.max(this.save.unlockedSegments, this.segmentIndex + 2), 1, SEGMENTS.length);
    this.persistSave();

    const arrival = this.obstacles.getArrivalWorld();
    this.character.reset(arrival.characterSpawn);
    this.player.reset(arrival.shipSpawn, this.save.upgrades);
    this.state = "arrival";
    this.renderPanel();
  }

  failMission(reason) {
    const fallback = Math.round(24 + (this.run.routeProgress / Math.max(this.obstacles.getRouteLength(), 1)) * 42);
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
    this.syncPreviewActors();
    this.renderPanel();
  }

  updateModeVisibility() {
    if (this.state === "boarding" || this.state === "menu" || this.state === "campaignMap" || this.state === "briefing" || this.state === "hangar" || this.state === "gameOver") {
      this.obstacles.setMode(this.state === "boarding" ? "boarding" : "preview");
      this.character.setVisible(true);
      this.player.setVisible(true);
    } else if (this.state === "launch") {
      this.obstacles.setMode("launch");
      this.character.setVisible(false);
      this.player.setVisible(true);
    } else if (this.state === "routeFlight" || this.state === "docking") {
      this.obstacles.setMode("flight");
      this.character.setVisible(false);
      this.player.setVisible(true);
    } else if (this.state === "wormholeTransit") {
      this.obstacles.setMode("wormhole");
      this.character.setVisible(false);
      this.player.setVisible(true);
    } else if (this.state === "arrival" || this.state === "results") {
      this.obstacles.setMode("arrival");
      this.character.setVisible(true);
      this.player.setVisible(true);
    }
  }

  updateCamera(deltaTime) {
    const targetPosition = new this.THREE.Vector3();
    const lookAt = new this.THREE.Vector3();

    if (this.state === "boarding") {
      targetPosition.set(this.character.position.x - 10, 14, this.character.position.z + 14);
      lookAt.set(this.character.position.x, 1.6, this.character.position.z);
    } else if (this.state === "launch" || this.state === "routeFlight" || this.state === "docking") {
      targetPosition.set(this.player.position.x - 26, this.player.position.y + 13, this.player.position.z + 16);
      lookAt.set(this.player.position.x + 14, this.player.position.y + 2, this.player.position.z);
    } else if (this.state === "wormholeTransit") {
      targetPosition.set(this.player.position.x - 20, this.player.position.y + 10, this.player.position.z + 12);
      lookAt.set(this.player.position.x + 8, this.player.position.y + 1, this.player.position.z);
    } else if (this.state === "arrival" || this.state === "results") {
      targetPosition.set(this.character.position.x - 10, 14, this.character.position.z + 14);
      lookAt.set(this.character.position.x, 1.6, this.character.position.z);
    } else {
      const departure = this.obstacles.getDepartureWorld();
      targetPosition.set(departure.shipSpawn.x + 18, 24, departure.shipSpawn.z + 34);
      lookAt.set(departure.shipSpawn.x + 6, 4, departure.shipSpawn.z);
    }

    this.camera.position.lerp(targetPosition, clamp(deltaTime * 3.2, 0, 1));
    this.cameraTarget.lerp(lookAt, clamp(deltaTime * 4.2, 0, 1));
    this.camera.lookAt(this.cameraTarget);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
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
    } = this.controlsRef;

    scoreLabel.textContent = `Credits: ${this.save.credits}`;
    detailsEl.innerHTML = "";
    upgradesEl.innerHTML = "";

    if (this.state === "menu") {
      titleEl.textContent = "Ozscape";
      copyEl.textContent = "Walk the cargo port as a courier, board your freighter, then fly dangerous 3D long-haul routes across deep space.";
      statusLabel.textContent = "Freight command online.";
      objectiveLabel.textContent = "Objective: Open the campaign map.";
      this.addDetail(detailsEl, `Unlocked routes: ${this.save.unlockedSegments} / ${SEGMENTS.length}`);
      this.addDetail(detailsEl, `Completed runs: ${this.save.completedRuns}`);
      this.addDetail(detailsEl, `Best payout: ${this.save.bestCredits} credits`);
      this.addDetail(detailsEl, `Current departure world: ${this.segment.departure.planetLabel}`);
      startButton.textContent = "Open Campaign";
      startButton.disabled = false;
      restartButton.textContent = "Reset Command";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "campaignMap") {
      titleEl.textContent = "Campaign Map";
      copyEl.textContent = this.segment.subtitle;
      statusLabel.textContent = `Selected route: ${this.segment.name}`;
      objectiveLabel.textContent = "Objective: Cycle routes or enter briefing.";
      this.addDetail(detailsEl, `Base reward: ${this.segment.baseReward} credits`);
      this.addDetail(detailsEl, `Departure: ${this.segment.departure.portLabel}`);
      this.addDetail(detailsEl, `Refuel station: ${this.segment.stationLabel}`);
      this.addDetail(detailsEl, `Destination: ${this.segment.destinationLabel}`);
      startButton.textContent = "Mission Briefing";
      startButton.disabled = false;
      restartButton.textContent = "Next Route";
      restartButton.disabled = this.save.unlockedSegments <= 1;
      return;
    }

    if (this.state === "briefing") {
      titleEl.textContent = this.segment.name;
      copyEl.textContent = `${this.segment.briefing} First, cross ${this.segment.departure.portLabel} on foot and board the ship.`;
      statusLabel.textContent = "Mission packet received.";
      objectiveLabel.textContent = `Objective: Courier boarding, ship launch, station refuel, then ${this.segment.destinationLabel}.`;
      this.addDetail(detailsEl, `Departure world: ${this.segment.departure.planetLabel}`);
      this.addDetail(detailsEl, `Planets on route: ${this.segment.planets.length}`);
      this.addDetail(detailsEl, `Hazard zones: ${this.segment.gravityZones.length + this.segment.ionZones.length}`);
      this.addDetail(detailsEl, `Wormhole: ${this.segment.wormhole ? "Available after station" : "None"}`);
      startButton.textContent = "Start Boarding";
      startButton.disabled = false;
      restartButton.textContent = "Back";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "boarding") {
      titleEl.textContent = this.segment.departure.portLabel;
      copyEl.textContent = "You are on foot in a basic 3D cargo port. Walk to cargo check, secure the package manifest, then board the parked freighter.";
      statusLabel.textContent = this.run.cargoSecured ? "Cargo signed off. Move to the ramp." : "Courier has not secured the cargo yet.";
      objectiveLabel.textContent = this.run.cargoSecured ? "Objective: Reach the boarding ramp." : "Objective: Reach cargo check.";
      this.addDetail(detailsEl, `World: ${this.segment.departure.planetLabel}`);
      this.addDetail(detailsEl, `Cargo progress: ${Math.round(clamp(this.run.cargoProgress / 1.2, 0, 1) * 100)}%`);
      this.addDetail(detailsEl, `Boarding progress: ${Math.round(clamp(this.run.boardingProgress / 1.15, 0, 1) * 100)}%`);
      this.addDetail(detailsEl, `Visible ship: Parked on the pad`);
      startButton.textContent = "Boarding";
      startButton.disabled = true;
      restartButton.textContent = "Boarding";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "launch") {
      titleEl.textContent = "Launch Corridor";
      copyEl.textContent = "You are in the ship now. Lift off through the departure lane and push into open space.";
      statusLabel.textContent = "Launch clearance granted.";
      objectiveLabel.textContent = "Objective: Clear the port and enter the route.";
      this.addDetail(detailsEl, `Launch progress: ${Math.round(this.run.launchProgress * 100)}%`);
      this.addDetail(detailsEl, `Fuel: ${Math.round(this.run.fuel)} / ${Math.round(this.getDerivedStats().maxFuel)}`);
      this.addDetail(detailsEl, `Courier status: Boarded`);
      startButton.textContent = "Launching";
      startButton.disabled = true;
      restartButton.textContent = "Launching";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "routeFlight") {
      const maxFuel = this.getDerivedStats().maxFuel;
      titleEl.textContent = this.segment.name;
      copyEl.textContent = "Fly the freighter through the 3D route, avoid debris, refuel at station, and decide whether to gamble on the wormhole.";
      statusLabel.textContent = this.run.stationCompleted ? "Station complete. Destination gate active." : `Approach ${this.segment.stationLabel} for refuel.`;
      objectiveLabel.textContent = this.run.stationCompleted ? `Objective: Reach ${this.segment.destinationLabel}.` : `Objective: Dock at ${this.segment.stationLabel}.`;
      this.addDetail(detailsEl, `Route progress: ${Math.round(clamp(this.run.routeProgress / this.obstacles.getRouteLength(), 0, 1) * 100)}%`);
      this.addDetail(detailsEl, `Fuel remaining: ${Math.round(this.run.fuel)} / ${Math.round(maxFuel)}`);
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
      copyEl.textContent = "Hold position while the station refuels the ship.";
      statusLabel.textContent = "Docking clamps engaged.";
      objectiveLabel.textContent = "Objective: Await refuel completion.";
      this.addDetail(detailsEl, `Refuel cycle: ${this.run.dockingTimer.toFixed(1)}s`);
      this.addDetail(detailsEl, `Route progress: ${Math.round(clamp(this.run.routeProgress / this.obstacles.getRouteLength(), 0, 1) * 100)}%`);
      startButton.textContent = "Docking";
      startButton.disabled = true;
      restartButton.textContent = "Docking";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "wormholeTransit") {
      titleEl.textContent = "Wormhole Transit";
      copyEl.textContent = "The ship is compressing through unstable space. Hold course while the corridor spits you back out farther down the route.";
      statusLabel.textContent = "Wormhole corridor engaged.";
      objectiveLabel.textContent = "Objective: Survive transit.";
      this.addDetail(detailsEl, `Transit time: ${this.run.wormholeTimer.toFixed(1)}s`);
      this.addDetail(detailsEl, `Projected bonus: ${this.segment.wormhole.rewardBonus} credits`);
      startButton.textContent = "Transit";
      startButton.disabled = true;
      restartButton.textContent = "Transit";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "arrival") {
      titleEl.textContent = "Arrival Hub";
      copyEl.textContent = "The ship has landed. Step out as the courier and walk to the delivery office to finalize the contract.";
      statusLabel.textContent = "Ship landed. Final handoff pending.";
      objectiveLabel.textContent = "Objective: Walk to the delivery office.";
      this.addDetail(detailsEl, `Arrival progress: ${Math.round(this.run.arrivalProgress * 100)}%`);
      this.addDetail(detailsEl, `Contract value: ${this.summary.total} credits`);
      this.addDetail(detailsEl, `Destination: ${this.segment.destinationLabel}`);
      startButton.textContent = "Delivering";
      startButton.disabled = true;
      restartButton.textContent = "Delivering";
      restartButton.disabled = true;
      return;
    }

    if (this.state === "results") {
      titleEl.textContent = "Results";
      copyEl.textContent = "The drop is complete. Review the payout and move into hangar prep for the next run.";
      statusLabel.textContent = `Run complete. Earned ${this.summary.total} credits.`;
      objectiveLabel.textContent = "Objective: Review rewards or continue to hangar.";
      this.addDetail(detailsEl, `Base reward: ${this.summary.baseReward}`);
      this.addDetail(detailsEl, `Fuel efficiency bonus: ${this.summary.fuelBonus}`);
      this.addDetail(detailsEl, `Docking bonus: ${this.summary.dockingBonus}`);
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
      copyEl.textContent = "Spend credits to improve the ship before the next 3D route.";
      statusLabel.textContent = `Available credits: ${this.save.credits}`;
      objectiveLabel.textContent = "Objective: Upgrade the freighter or return to the map.";
      UPGRADE_DEFS.forEach((upgrade) => {
        const card = document.createElement("div");
        card.className = "upgrade-card";
        const level = this.save.upgrades[upgrade.key];
        const cost = this.getUpgradeCost(upgrade.key);
        const canAfford = this.save.credits >= cost;
        card.innerHTML = `<h3>${upgrade.name} Mk.${level + 1}</h3><p>${upgrade.description}</p>`;
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
      copyEl.textContent = "The cargo run was lost before delivery. Review the summary, then relaunch with a cleaner route.";
      statusLabel.textContent = this.summary.reason;
      objectiveLabel.textContent = "Objective: Retry the route or return to campaign command.";
      this.addDetail(detailsEl, `Fallback credits: ${this.summary.total}`);
      this.addDetail(detailsEl, `Route progress: ${Math.round(clamp(this.run.routeProgress / Math.max(this.obstacles.getRouteLength(), 1), 0, 1) * 100)}%`);
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
    const engine = safeInteger(upgrades.engine);
    const durability = safeInteger(upgrades.durability);
    const fuelTank = safeInteger(upgrades.fuelTank);
    const handling = safeInteger(upgrades.handling);
    return {
      cruiseSpeed: 104 + engine * 11,
      maxFuel: Math.max(1, 45 + fuelTank * 12),
      handlingFactor: 1 + handling * 0.1,
      dockingAssist: durability * 0.24 + handling * 0.1,
      wormholeAssist: engine * 0.13 + handling * 0.1
    };
  }

  getUpgradeCost(key) {
    const definition = UPGRADE_DEFS.find((entry) => entry.key === key);
    const level = this.save.upgrades[key];
    return Math.round(definition.baseCost * Math.pow(1.42, level));
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

  createEmptyRun() {
    return {
      routeProgress: 0,
      fuel: 0,
      cargoProgress: 0,
      cargoLoaded: 0,
      cargoSecured: false,
      boardingProgress: 0,
      launchProgress: 0,
      arrivalProgress: 0,
      dockingProgress: 0,
      dockingTimer: 0,
      dockingQuality: 1,
      stationCompleted: false,
      hazardExposure: 0,
      softPenalty: 0,
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
        credits: safeInteger(parsed.credits, 0),
        bestCredits: safeInteger(parsed.bestCredits, 0),
        completedRuns: safeInteger(parsed.completedRuns, 0),
        unlockedSegments: safeInteger(parsed.unlockedSegments, 1, 1, SEGMENTS.length),
        completedSegmentIds: Array.isArray(parsed.completedSegmentIds) ? parsed.completedSegmentIds : [],
        upgrades: {
          engine: safeInteger(parsed.upgrades?.engine, 0),
          durability: safeInteger(parsed.upgrades?.durability, 0),
          fuelTank: safeInteger(parsed.upgrades?.fuelTank, 0),
          handling: safeInteger(parsed.upgrades?.handling, 0)
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
    this.renderPanel();
  }
}
