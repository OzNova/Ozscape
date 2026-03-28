import { ShipPlayer, PlayerCharacter } from "./player.js";
import { ObstacleManager } from "./obstacles.js";

const SAVE_KEY = "ozscape-save-v4";

const createDeparture = (portLabel, planetLabel) => ({ portLabel, planetLabel });

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
  { key: "engine", name: "Engine", description: "More forward thrust and smoother cruise speed.", baseCost: 140 },
  { key: "durability", name: "Durability", description: "Better resistance to gravity pull and docking instability.", baseCost: 130 },
  { key: "fuelTank", name: "Fuel Tank", description: "Higher reserve capacity for long-haul routes.", baseCost: 125 },
  { key: "handling", name: "Handling", description: "Sharper lateral control and cleaner drift recovery.", baseCost: 135 }
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
    this.controlsRef = controls;

    this.renderer.setClearColor(0x020617, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.0026);

    this.camera = new THREE.PerspectiveCamera(56, 16 / 9, 0.1, 6000);
    this.cameraTarget = new THREE.Vector3();

    this.scene.add(new THREE.HemisphereLight(0xb9e3ff, 0x0a1022, 1.4));

    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
    this.keyLight.position.set(120, 180, 80);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.left = -260;
    this.keyLight.shadow.camera.right = 260;
    this.keyLight.shadow.camera.top = 260;
    this.keyLight.shadow.camera.bottom = -260;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.PointLight(0x60a5fa, 1.2, 900);
    this.fillLight.position.set(-80, 90, 120);
    this.scene.add(this.fillLight);

    this.input = { w: false, a: false, s: false, d: false };
    this.interactPressed = false;

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
    this.promptText = "Stand by.";
    this.statusText = "Freight command online.";
    this.objectiveText = "Review mission command.";

    this.bindInput();
    this.loadSegmentWorld();
    this.syncPreviewActors();
    this.updateModeVisibility();
    this.renderUI();
  }

  start() {
    requestAnimationFrame((time) => this.loop(time));
  }

  handleResize() {
    const width = window.innerWidth || this.canvas.clientWidth || 1280;
    const height = window.innerHeight || this.canvas.clientHeight || 720;
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
      if (key === "e" || key === "enter" || key === " ") {
        event.preventDefault();
        this.interactPressed = true;
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

  consumeInteract() {
    const pressed = this.interactPressed;
    this.interactPressed = false;
    return pressed;
  }

  handlePrimaryAction() {
    if (this.state === "menu") {
      this.state = "briefing";
    } else if (this.state === "briefing") {
      this.startMission();
    } else if (this.state === "results") {
      this.state = "hangar";
    } else if (this.state === "hangar") {
      this.prepareNextContract();
      this.state = "briefing";
    } else if (this.state === "gameOver") {
      this.state = "briefing";
    }

    this.syncPreviewActors();
    this.updateModeVisibility();
    this.renderUI();
  }

  handleSecondaryAction() {
    if (this.state === "menu") {
      this.state = "hangar";
    } else if (this.state === "briefing") {
      this.state = "menu";
    } else if (this.state === "hangar") {
      this.state = "menu";
    } else if (this.state === "results") {
      this.prepareNextContract();
      this.state = "briefing";
    } else if (this.state === "gameOver") {
      this.state = "menu";
    }

    this.syncPreviewActors();
    this.updateModeVisibility();
    this.renderUI();
  }

  prepareNextContract() {
    const highestUnlockedIndex = Math.max(0, this.save.unlockedSegments - 1);
    this.segmentIndex = clamp(this.segmentIndex + 1, 0, highestUnlockedIndex);
    this.segment = SEGMENTS[this.segmentIndex];
    this.loadSegmentWorld();
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
    this.summary = null;
    this.state = "boarding";
    this.updateModeVisibility();
    this.renderUI();
  }

  loadSegmentWorld() {
    this.obstacles.loadSegment(this.segment);
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
    } else {
      this.backgroundPreviewDrift(deltaTime);
    }

    this.obstacles.update(deltaTime, this.run.routeProgress, { time: this.time, wormholeUsed: this.run.wormholeUsed });
    this.updateModeVisibility();
    this.updateCamera(deltaTime);
    this.renderUI();
  }

  updateBoarding(deltaTime) {
    const movement = this.character.update(this.input, deltaTime, { minX: -72, maxX: 72, minZ: -40, maxZ: 42 });
    const cargo = this.obstacles.getCargoCheckpointInfo(this.character);
    const boarding = this.obstacles.getBoardingInfo(this.character);
    const interact = this.consumeInteract();

    this.statusText = this.segment.departure.portLabel;

    if (!this.run.cargoSecured) {
      this.objectiveText = "Walk to the cargo zone and log the manifest.";
      this.promptText = cargo.inZone ? "Press E to secure the cargo manifest." : "WASD to move. Head to the yellow cargo zone.";
      if (cargo.inZone && interact) {
        this.run.cargoSecured = true;
        this.run.cargoLoaded = 3;
      }
    } else {
      this.objectiveText = "Move to the ramp and board the freighter.";
      this.promptText = boarding.inZone ? "Press E to board the ship." : "Cargo locked. Walk to the cyan ramp zone.";
      if (boarding.inZone && interact) {
        this.state = "launch";
      }
    }

    this.run.boardingProgress = this.run.cargoSecured && boarding.inZone ? 1 : 0;
    this.run.cargoProgress = this.run.cargoSecured ? 1 : cargo.inZone ? clamp(this.run.cargoProgress + deltaTime * 0.8, 0, 1) : 0;
    this.run.onFootSpeed = movement.speed;
  }

  updateLaunch(deltaTime) {
    const stats = this.getDerivedStats();
    const maxFuel = safeNumber(stats.maxFuel, 45);
    const departure = this.obstacles.getDepartureWorld();
    const interact = this.consumeInteract();

    if (!this.run.launchAuthorized) {
      this.statusText = "Freighter powered on.";
      this.objectiveText = "Ignite the launch sequence.";
      this.promptText = "Press E to ignite launch. Then use W/S for thrust and A/D for lateral trim.";
      if (interact) {
        this.run.launchAuthorized = true;
      }
      return;
    }

    const launchAssist = this.obstacles.getDepartureForce(this.player, this.run.launchProgress);
    const movement = this.player.update(
      this.input,
      deltaTime,
      {
        minX: departure.shipSpawn.x - 2,
        maxX: departure.departureLane.clearX + 12,
        minY: 3.8,
        maxY: 24,
        minZ: -16,
        maxZ: 16
      },
      this.save.upgrades,
      launchAssist
    );

    this.run.fuel = clamp(
      safeNumber(this.run.fuel, maxFuel) - (0.35 + (movement.thrusting ? 0.45 : 0)) * deltaTime,
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

    this.statusText = "Launch corridor active.";
    this.objectiveText = "Clear the port and break into open space.";
    this.promptText = "Hold W to drive out of the corridor. Use A/D to stay centered.";

    if (this.run.fuel <= 0) {
      this.failMission("Fuel reserves depleted during launch.");
      return;
    }

    if (this.player.position.x >= departure.departureLane.clearX || this.run.launchProgress >= 1) {
      this.state = "routeFlight";
      this.player.position.x = 22;
      this.player.position.y = 6;
      this.player.position.z = 0;
      this.player.velocity.x = 18;
      this.player.velocity.y = 0;
      this.player.velocity.z = 0;
      this.player.syncSceneObject();
      this.run.routeProgress = this.player.position.x;
    }
  }

  updateRouteFlight(deltaTime) {
    const stats = this.getDerivedStats();
    const maxFuel = safeNumber(stats.maxFuel, 45);
    const gravity = this.obstacles.getGravityInfluence(this.player, this.save.upgrades.durability);
    const ionStorm = this.obstacles.getIonStormEffect(this.player, this.save.upgrades.durability);

    const environment = {
      force: {
        x: gravity.active ? gravity.force.x : 0,
        y: gravity.active ? gravity.force.y : 0,
        z: (gravity.active ? gravity.force.z : 0) + (ionStorm.active ? Math.sin(this.time * 6.5) * ionStorm.controlPenalty * 8 : 0)
      },
      forwardAssist: stats.cruiseSpeed * 0.12,
      stabilizeZ: 0.04
    };

    const movement = this.player.update(
      this.input,
      deltaTime,
      { minX: 0, maxX: this.obstacles.getRouteLength() + 40, minY: -14, maxY: 28, minZ: -58, maxZ: 58 },
      this.save.upgrades,
      environment
    );

    this.run.routeProgress = this.player.position.x;

    if (gravity.active) {
      this.run.hazardExposure += deltaTime;
    }
    if (ionStorm.active) {
      this.run.hazardExposure += deltaTime * 0.7;
      this.run.softPenalty += deltaTime * ionStorm.controlPenalty;
    }

    this.run.fuel = clamp(
      safeNumber(this.run.fuel, maxFuel) - (0.82 + (movement.thrusting ? 1.08 : 0) + gravity.fuelPenalty + ionStorm.fuelPenalty) * deltaTime,
      0,
      maxFuel
    );

    const collision = this.obstacles.getSolidCollision(this.player);
    if (collision) {
      this.failMission("Collision detected. Cargo route lost.");
      return;
    }

    const docking = this.obstacles.getDockingInfo(this.player);
    const wormhole = this.obstacles.getWormholeInfo(this.player, this.run.wormholeUsed);
    const interact = this.consumeInteract();

    if (!this.run.stationCompleted && docking.inZone && movement.stable) {
      this.promptText = "Press E to engage docking clamps.";
      if (interact) {
        this.state = "docking";
        this.run.dockingTimer = this.segment.dockingDuration;
      }
    } else if (this.run.stationCompleted && wormhole.available && wormhole.inZone && movement.stable) {
      this.promptText = "Press E to enter the wormhole corridor.";
      if (interact) {
        this.state = "wormholeTransit";
        this.run.wormholeTimer = this.segment.wormhole.turbulenceDuration;
        this.run.wormholeUsed = true;
      }
    } else {
      this.promptText = !this.run.stationCompleted
        ? `Reach ${this.segment.stationLabel} and stabilize for docking.`
        : `Fly to ${this.segment.destinationLabel}. Wormhole is ${this.run.wormholeUsed ? "spent" : "optional"}.`;
    }

    this.statusText = this.run.stationCompleted ? "Station serviced. Route cleared for delivery." : `Refuel required at ${this.segment.stationLabel}.`;
    this.objectiveText = this.run.stationCompleted ? `Reach ${this.segment.destinationLabel}.` : `Dock at ${this.segment.stationLabel}.`;

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
    }
  }

  updateDocking(deltaTime) {
    this.run.dockingTimer = Math.max(0, this.run.dockingTimer - deltaTime);
    this.run.fuel = safeNumber(this.getDerivedStats().maxFuel, 45);
    this.statusText = "Docking clamps engaged.";
    this.objectiveText = "Hold while the station reloads fuel reserves.";
    this.promptText = "Refuel in progress.";

    if (this.run.dockingTimer === 0) {
      this.run.stationCompleted = true;
      this.run.dockingQuality = clamp(1 - (this.run.hazardExposure * 0.02), 0.35, 1);
      this.state = "routeFlight";
    }
  }

  updateWormholeTransit(deltaTime) {
    this.run.wormholeTimer = Math.max(0, this.run.wormholeTimer - deltaTime);
    this.statusText = "Wormhole corridor engaged.";
    this.objectiveText = "Hold the freighter together through transit.";
    this.promptText = "Space is folding. Stay on course.";

    if (this.run.wormholeTimer === 0) {
      const maxFuel = safeNumber(this.getDerivedStats().maxFuel, 45);
      this.player.position.x = this.obstacles.wormhole.exitProgress;
      this.player.position.z = 0;
      this.player.position.y = 4.5;
      this.player.velocity.x = 22;
      this.player.velocity.z = 0;
      this.player.velocity.y = 0;
      this.player.syncSceneObject();
      this.run.routeProgress = this.player.position.x;
      this.run.fuel = clamp(safeNumber(this.run.fuel, maxFuel) + safeNumber(this.segment.wormhole.fuelBonus, 0), 0, maxFuel);
      this.run.shortcutBonus = this.segment.wormhole.rewardBonus;
      this.state = "routeFlight";
    }
  }

  updateArrival(deltaTime) {
    this.character.update(this.input, deltaTime, { minX: -42, maxX: 42, minZ: -24, maxZ: 24 });
    const arrival = this.obstacles.getArrivalInfo(this.character);
    const interact = this.consumeInteract();

    this.statusText = "Ship landed at the delivery port.";
    this.objectiveText = "Walk to the delivery office and close the contract.";
    this.promptText = arrival.inZone ? "Press E to complete delivery." : "WASD to move. Walk to the green delivery zone.";

    if (arrival.inZone && interact) {
      this.state = "results";
    }
  }

  backgroundPreviewDrift(deltaTime) {
    const departure = this.obstacles.getDepartureWorld();
    this.player.position.x = departure.shipSpawn.x + Math.sin(this.time * 0.45) * 1.6;
    this.player.position.z = departure.shipSpawn.z + Math.cos(this.time * 0.35) * 0.9;
    this.player.syncSceneObject();
    this.character.position.x = departure.characterSpawn.x + Math.sin(this.time * 0.55) * 0.4;
    this.character.position.z = departure.characterSpawn.z + Math.cos(this.time * 0.5) * 0.5;
    this.character.syncSceneObject();

    if (this.state === "menu") {
      this.statusText = "Freight command online.";
      this.objectiveText = "Review the next contract.";
      this.promptText = "Begin when ready.";
    }
  }

  completeMission() {
    const fuelBonus = Math.round(this.run.fuel * this.segment.fuelRewardFactor);
    const dockingBonus = Math.round(65 * this.run.dockingQuality);
    const hazardBonus = Math.max(0, Math.round(50 - this.run.hazardExposure * 10 - this.run.softPenalty * 14));
    const shortcutBonus = this.run.shortcutBonus;
    const total = this.segment.baseReward + fuelBonus + dockingBonus + hazardBonus + shortcutBonus;

    this.summary = {
      title: "Delivery Complete",
      result: "success",
      baseReward: this.segment.baseReward,
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
  }

  updateModeVisibility() {
    if (this.state === "boarding") {
      this.obstacles.setMode("boarding");
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
    } else {
      this.obstacles.setMode("preview");
      this.character.setVisible(true);
      this.player.setVisible(true);
    }
  }

  updateCamera(deltaTime) {
    const targetPosition = new this.THREE.Vector3();
    const lookAt = new this.THREE.Vector3();

    if (this.state === "boarding") {
      const midpointX = (this.character.position.x + this.player.position.x) * 0.5;
      const midpointZ = (this.character.position.z + this.player.position.z) * 0.5;
      targetPosition.set(midpointX - 28, 25, midpointZ + 26);
      lookAt.set(midpointX + 4, 3.8, midpointZ - 2);
    } else if (this.state === "launch") {
      if (!this.run.launchAuthorized) {
        targetPosition.set(this.player.position.x - 24, this.player.position.y + 16, this.player.position.z + 18);
        lookAt.set(this.player.position.x + 4, this.player.position.y + 3, this.player.position.z);
      } else {
        this.getShipCamera(targetPosition, lookAt, 11, 7);
      }
    } else if (this.state === "routeFlight" || this.state === "docking") {
      this.getShipCamera(targetPosition, lookAt, 12.5, 7.5);
    } else if (this.state === "wormholeTransit") {
      this.getShipCamera(targetPosition, lookAt, 10, 6);
      targetPosition.y += Math.sin(this.time * 10) * 0.8;
    } else if (this.state === "arrival" || this.state === "results") {
      targetPosition.set(this.character.position.x - 16, 16, this.character.position.z + 18);
      lookAt.set(this.character.position.x + 8, 2.5, this.character.position.z - 2);
    } else {
      const departure = this.obstacles.getDepartureWorld();
      targetPosition.set(departure.shipSpawn.x - 24, 18, departure.shipSpawn.z + 30);
      lookAt.set(departure.shipSpawn.x + 3, 4.2, departure.shipSpawn.z);
    }

    this.camera.position.lerp(targetPosition, clamp(deltaTime * 2.8, 0, 1));
    this.cameraTarget.lerp(lookAt, clamp(deltaTime * 3.5, 0, 1));
    this.camera.lookAt(this.cameraTarget);
  }

  getShipCamera(targetPosition, lookAt, distance, height) {
    const orientation = this.player.getTelemetry().orientation;
    const directionX = Math.cos(orientation);
    const directionZ = Math.sin(orientation);
    targetPosition.set(
      this.player.position.x - directionX * distance - directionZ * 2.5,
      this.player.position.y + height,
      this.player.position.z - directionZ * distance + directionX * 2.5
    );
    lookAt.set(
      this.player.position.x + directionX * 14,
      this.player.position.y + 2.6,
      this.player.position.z + directionZ * 14
    );
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  renderUI() {
    const {
      panelCard,
      hud,
      titleEl,
      copyEl,
      statusLabel,
      scoreLabel,
      objectiveLabel,
      promptLabel,
      detailsEl,
      upgradesEl,
      fuelFillEl,
      fuelValueEl,
      progressFillEl,
      progressValueEl,
      startButton,
      restartButton
    } = this.controlsRef;

    if (this.state === "menu") {
      this.statusText = "Freight command online.";
      this.objectiveText = "Review the next contract.";
      this.promptText = "Begin when ready.";
    } else if (this.state === "briefing") {
      this.statusText = `Mission packet ready for ${this.segment.name}.`;
      this.objectiveText = "Review the route and begin boarding.";
      this.promptText = "Start when ready.";
    } else if (this.state === "results") {
      this.statusText = `Run complete. Earned ${this.summary?.total ?? 0} credits.`;
      this.objectiveText = "Move to hangar or prep the next contract.";
      this.promptText = "Mission accomplished.";
    } else if (this.state === "hangar") {
      this.statusText = `Available credits: ${this.save.credits}`;
      this.objectiveText = "Upgrade the freighter for the next route.";
      this.promptText = "Select an upgrade or continue.";
    } else if (this.state === "gameOver") {
      this.statusText = this.summary?.reason ?? "Route failed.";
      this.objectiveText = "Retry the route or return to command.";
      this.promptText = "Mission lost.";
    }

    const maxFuel = safeNumber(this.getDerivedStats().maxFuel, 45);
    const routeProgress = clamp(this.run.routeProgress / Math.max(this.obstacles.getRouteLength(), 1), 0, 1);
    const fuelRatio = clamp(safeNumber(this.run.fuel, maxFuel) / Math.max(maxFuel, 1), 0, 1);

    scoreLabel.textContent = `${this.save.credits}`;
    statusLabel.textContent = this.statusText;
    objectiveLabel.textContent = this.objectiveText;
    promptLabel.textContent = this.promptText;
    fuelValueEl.textContent = `${Math.round(safeNumber(this.run.fuel, maxFuel))} / ${Math.round(maxFuel)}`;
    progressValueEl.textContent = `${Math.round(routeProgress * 100)}%`;
    fuelFillEl.style.width = `${fuelRatio * 100}%`;
    progressFillEl.style.width = `${routeProgress * 100}%`;
    fuelFillEl.style.background =
      fuelRatio > 0.45
        ? "linear-gradient(90deg, #38bdf8, #0ea5e9)"
        : fuelRatio > 0.18
          ? "linear-gradient(90deg, #f59e0b, #f97316)"
          : "linear-gradient(90deg, #fb7185, #ef4444)";

    const gameplayState =
      this.state === "boarding" ||
      this.state === "launch" ||
      this.state === "routeFlight" ||
      this.state === "docking" ||
      this.state === "wormholeTransit" ||
      this.state === "arrival";

    panelCard.classList.toggle("hidden", gameplayState);
    hud.classList.toggle("hidden", !gameplayState);

    if (gameplayState) {
      return;
    }

    detailsEl.innerHTML = "";
    upgradesEl.innerHTML = "";

    if (this.state === "menu") {
      titleEl.textContent = this.segment.name;
      copyEl.textContent = "A cinematic freight run is standing by. Start on foot at the port, board your ship, then punch through hazards, stations, and wormholes in full-screen 3D.";
      this.addDetail(detailsEl, `Departure world: ${this.segment.departure.planetLabel}`);
      this.addDetail(detailsEl, `Unlocked routes: ${this.save.unlockedSegments} / ${SEGMENTS.length}`);
      this.addDetail(detailsEl, `Completed contracts: ${this.save.completedRuns}`);
      this.addDetail(detailsEl, `Best payout: ${this.save.bestCredits} credits`);
      startButton.textContent = "Open Briefing";
      startButton.disabled = false;
      restartButton.textContent = "Open Hangar";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "briefing") {
      titleEl.textContent = this.segment.name;
      copyEl.textContent = `${this.segment.briefing} You begin as the courier on the surface port, then launch the freighter yourself.`;
      this.addDetail(detailsEl, `Route: ${this.segment.subtitle}`);
      this.addDetail(detailsEl, `Mandatory refuel: ${this.segment.stationLabel}`);
      this.addDetail(detailsEl, `Destination: ${this.segment.destinationLabel}`);
      this.addDetail(detailsEl, `Wormhole bonus: ${this.segment.wormhole ? `${this.segment.wormhole.rewardBonus} credits` : "None"}`);
      startButton.textContent = "Begin Boarding";
      startButton.disabled = false;
      restartButton.textContent = "Back";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "results") {
      titleEl.textContent = this.summary.title;
      copyEl.textContent = "The route is complete. Review the breakdown, tune the freighter in hangar, then take the next contract.";
      this.addDetail(detailsEl, `Base reward: ${this.summary.baseReward}`);
      this.addDetail(detailsEl, `Fuel bonus: ${this.summary.fuelBonus}`);
      this.addDetail(detailsEl, `Docking bonus: ${this.summary.dockingBonus}`);
      this.addDetail(detailsEl, `Hazard bonus: ${this.summary.hazardBonus}`);
      this.addDetail(detailsEl, `Wormhole bonus: ${this.summary.shortcutBonus}`);
      this.addDetail(detailsEl, `Total payout: ${this.summary.total}`);
      startButton.textContent = "Open Hangar";
      startButton.disabled = false;
      restartButton.textContent = "Next Briefing";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "hangar") {
      titleEl.textContent = "Hangar";
      copyEl.textContent = "Spend credits on a heavier, cleaner, more capable freighter before the next route.";
      UPGRADE_DEFS.forEach((upgrade) => {
        const level = this.save.upgrades[upgrade.key];
        const cost = this.getUpgradeCost(upgrade.key);
        const canAfford = this.save.credits >= cost;
        const card = document.createElement("div");
        card.className = "upgrade-card";
        card.innerHTML = `<h3>${upgrade.name} Mk.${level + 1}</h3><p>${upgrade.description}</p>`;
        const button = document.createElement("button");
        button.textContent = `${canAfford ? "Upgrade" : "Need"} ${cost} cr`;
        button.disabled = !canAfford;
        button.addEventListener("click", () => this.purchaseUpgrade(upgrade.key));
        card.appendChild(button);
        upgradesEl.appendChild(card);
      });
      startButton.textContent = "Next Contract";
      startButton.disabled = false;
      restartButton.textContent = "Back to Menu";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "gameOver") {
      titleEl.textContent = "Route Failed";
      copyEl.textContent = "The cargo run collapsed before delivery. The freighter needs a cleaner line on the next attempt.";
      this.addDetail(detailsEl, this.summary.reason);
      this.addDetail(detailsEl, `Fallback credits: ${this.summary.total}`);
      this.addDetail(detailsEl, `Route progress: ${Math.round(routeProgress * 100)}%`);
      this.addDetail(detailsEl, `Station completed: ${this.run.stationCompleted ? "Yes" : "No"}`);
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
    const engine = safeInteger(upgrades.engine);
    const durability = safeInteger(upgrades.durability);
    const fuelTank = safeInteger(upgrades.fuelTank);
    const handling = safeInteger(upgrades.handling);
    return {
      cruiseSpeed: 96 + engine * 10,
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
    this.renderUI();
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
      launchAuthorized: false,
      arrivalProgress: 0,
      dockingTimer: 0,
      dockingQuality: 1,
      stationCompleted: false,
      hazardExposure: 0,
      softPenalty: 0,
      wormholeTimer: 0,
      wormholeUsed: false,
      shortcutBonus: 0,
      onFootSpeed: 0
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
    this.renderUI();
  }
}
