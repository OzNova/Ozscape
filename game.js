import { ShipPlayer, PlayerCharacter } from "./player.js";
import { ObstacleManager } from "./obstacles.js";

const SAVE_KEY = "ozscape-save-v4";

const createDeparture = (portLabel, planetLabel) => ({ portLabel, planetLabel });

const SEGMENTS = [
  {
    id: "omega-route",
    name: "Perseus Long Haul",
    subtitle: "Launch from Khepri Prime, cross the fractured belt, skim Atlas rings, punch through relay space, and finish at Helios Deep Terminal.",
    briefing:
      "Carry high-value freight across one flagship long-haul contract. Leave Khepri Prime, refuel at Leviathan, land at Atlas Relay for a transmission handshake, choose optional salvage detours in deep space, then make the final delivery at Helios Deep Terminal.",
    destinationLabel: "Helios Deep Terminal",
    stationLabel: "Leviathan Refuel Station",
    length: 56000,
    dockingDuration: 2.2,
    baseReward: 880,
    fuelRewardFactor: 0.22,
    debrisFields: [
      { startX: 1600, endX: 5200, top: 90, bottom: 640, count: 28 },
      { startX: 6400, endX: 9600, top: 120, bottom: 620, count: 30 },
      { startX: 13200, endX: 17600, top: 150, bottom: 590, count: 34 },
      { startX: 20800, endX: 25800, top: 130, bottom: 600, count: 36 },
      { startX: 31600, endX: 37200, top: 110, bottom: 620, count: 42 },
      { startX: 42800, endX: 48600, top: 140, bottom: 610, count: 40 }
    ],
    movingAsteroids: [
      { worldX: 2800, worldY: 520, radius: 28, velocityY: -72, minY: 160, maxY: 560, spin: 0.8 },
      { worldX: 7600, worldY: 200, radius: 24, velocityY: 86, minY: 160, maxY: 520, spin: -0.9 },
      { worldX: 14600, worldY: 500, radius: 32, velocityY: -95, minY: 120, maxY: 600, spin: 1.1 },
      { worldX: 22600, worldY: 240, radius: 26, velocityY: 92, minY: 150, maxY: 550, spin: -0.8 },
      { worldX: 33800, worldY: 580, radius: 34, velocityY: -102, minY: 150, maxY: 620, spin: 1.2 },
      { worldX: 45200, worldY: 210, radius: 30, velocityY: 94, minY: 120, maxY: 560, spin: -1.05 }
    ],
    gravityZones: [
      { label: "Fractured moon gravity", worldX: 12800, worldY: 360, radius: 240, strength: 160, fuelPenalty: 0.62 },
      { label: "Atlas ring pull", worldX: 28400, worldY: 220, radius: 260, strength: 150, fuelPenalty: 0.56 },
      { label: "Relay singularity", worldX: 43800, worldY: 340, radius: 220, strength: 175, fuelPenalty: 0.72 }
    ],
    ionZones: [
      { label: "Ring static", worldX: 23200, worldY: 380, width: 720, height: 280, fuelPenalty: 0.42, controlPenalty: 0.28 },
      { label: "Relay ion wash", worldX: 40400, worldY: 360, width: 840, height: 320, fuelPenalty: 0.54, controlPenalty: 0.36 }
    ],
    planets: [
      { worldX: 8600, worldY: 90, radius: 144, midColor: "#7dd3fc", darkColor: "#164e63" },
      { worldX: 21400, worldY: 180, radius: 212, midColor: "#f59e0b", darkColor: "#78350f" },
      { worldX: 31200, worldY: 620, radius: 88, midColor: "#f1f5f9", darkColor: "#64748b" },
      { worldX: 41800, worldY: 110, radius: 122, midColor: "#818cf8", darkColor: "#312e81" },
      { worldX: 52200, worldY: 580, radius: 168, midColor: "#34d399", darkColor: "#064e3b" }
    ],
    station: { worldX: 10800, worldY: 220, bodyRadius: 104, zoneOffsetX: 178, zoneWidth: 180, zoneHeight: 160 },
    wormhole: {
      worldX: 35200,
      worldY: 600,
      radius: 126,
      captureWidth: 220,
      captureHeight: 180,
      exitProgress: 45800,
      fuelBonus: 28,
      rewardBonus: 220,
      turbulenceDuration: 3.4
    },
    gate: { worldX: 53400, worldY: 320, width: 160, height: 340 },
    departure: createDeparture("Khepri Container Spire", "Khepri Prime"),
    stopovers: [
      {
        id: "leviathan-refuel",
        label: "Leviathan Refuel Station",
        kind: "refuel",
        worldX: 10800,
        worldY: 220,
        bodyRadius: 104,
        zoneWidth: 180,
        zoneHeight: 160,
        reward: 140,
        fuelBonus: 40,
        hub: {
          title: "Leviathan Supply Moon",
          subtitle: "Moonside refuel basin",
          mandatoryLabel: "Refuel Permit Console",
          optionalLabel: "Frozen Salvage Crate",
          boardLabel: "Return Ramp",
          mandatoryRewardLabel: "Refuel permit synced",
          optionalReward: 90,
          optionalFuelBonus: 18,
          bounds: { minX: -86, maxX: 94, minZ: -64, maxZ: 64 },
          characterSpawn: { x: -40, y: 1.2, z: 18 },
          shipSpawn: { x: 22, y: 3.8, z: -14 },
          mandatoryZone: { minX: -14, maxX: 18, minZ: 6, maxZ: 32 },
          optionalZone: { minX: -62, maxX: -34, minZ: -28, maxZ: -4 },
          boardZone: { minX: 12, maxX: 42, minZ: -22, maxZ: 2 },
          resumeX: 11240
        }
      },
      {
        id: "atlas-relay",
        label: "Atlas Relay Dock",
        kind: "relay",
        worldX: 28600,
        worldY: 560,
        bodyRadius: 118,
        zoneWidth: 190,
        zoneHeight: 170,
        reward: 180,
        fuelBonus: 20,
        hub: {
          title: "Atlas Relay Surface",
          subtitle: "Ring-shadow operations terrace",
          mandatoryLabel: "Relay Handshake Uplink",
          optionalLabel: "Loose Sensor Pods",
          boardLabel: "Launch Gantry",
          mandatoryRewardLabel: "Relay handshake completed",
          optionalReward: 120,
          optionalFuelBonus: 12,
          bounds: { minX: -94, maxX: 108, minZ: -70, maxZ: 72 },
          characterSpawn: { x: -46, y: 1.2, z: 22 },
          shipSpawn: { x: 26, y: 3.8, z: -16 },
          mandatoryZone: { minX: 10, maxX: 44, minZ: 8, maxZ: 34 },
          optionalZone: { minX: -72, maxX: -42, minZ: -18, maxZ: 10 },
          boardZone: { minX: 18, maxX: 50, minZ: -26, maxZ: 0 },
          resumeX: 29120
        }
      }
    ],
    optionalTasks: [
      { id: "cache-a", label: "Drift Cache", worldX: 16200, worldY: 620, radius: 140, reward: 120, fuelBonus: 18 },
      { id: "scan-b", label: "Ring Survey", worldX: 24400, worldY: 120, radius: 130, reward: 140, fuelBonus: 14 },
      { id: "cache-c", label: "Relay Salvage", worldX: 46800, worldY: 580, radius: 145, reward: 170, fuelBonus: 20 }
    ],
    arrival: {
      title: "Helios Deep Terminal",
      subtitle: "Outer-system logistics exchange",
      optionalLabel: "Customs Manifest Locker",
      optionalReward: 160
    }
  },
  {
    id: "sector-b",
    name: "Gas Giant Shepherd Run",
    subtitle: "Lift from Atlas-9 and ride the orbital slip around a ringed giant.",
    briefing:
      "Deliver agricultural condensers through ring-shadow lanes, refuel at Ravel Dock, and cut distance with a high-value wormhole line if the corridor is clean.",
    destinationLabel: "Atlas Relay Insertion",
    stationLabel: "Ravel Dock",
    length: 9300,
    dockingDuration: 2.1,
    baseReward: 220,
    fuelRewardFactor: 0.78,
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
    length: 10600,
    dockingDuration: 2.2,
    baseReward: 260,
    fuelRewardFactor: 0.84,
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
    this.scene.fog = new THREE.FogExp2(0x020617, 0.0032);

    this.camera = new THREE.PerspectiveCamera(70, 16 / 9, 0.08, 6000);
    this.cameraTarget = new THREE.Vector3();
    this.tempVectorA = new THREE.Vector3();
    this.tempVectorB = new THREE.Vector3();

    this.scene.add(new THREE.HemisphereLight(0xc7e5ff, 0x08101f, 1.5));

    this.keyLight = new THREE.DirectionalLight(0xfff4c7, 1.85);
    this.keyLight.position.set(-900, 520, -1600);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.left = -260;
    this.keyLight.shadow.camera.right = 260;
    this.keyLight.shadow.camera.top = 260;
    this.keyLight.shadow.camera.bottom = -260;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.PointLight(0x60a5fa, 1.05, 1800);
    this.fillLight.position.set(180, 220, 260);
    this.scene.add(this.fillLight);

    this.input = { w: false, a: false, s: false, d: false, space: false, shift: false, ctrl: false };
    this.interactPressed = false;
    this.helpOpen = false;
    this.pointerLocked = false;
    this.look = { yaw: 0, pitch: 0 };
    this.shipCameraModes = ["cockpit", "close", "far"];
    this.shipCameraMode = "cockpit";
    this.minimapContext = controls.minimapCanvas?.getContext("2d") ?? null;

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
    this.toastText = "";
    this.toastTimer = 0;

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
      if (event.code === "Space") {
        event.preventDefault();
        this.input.space = true;
      }
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        this.input.shift = true;
      }
      if (event.code === "ControlLeft" || event.code === "ControlRight") {
        this.input.ctrl = true;
      }
      if (key === "e" || key === "enter") {
        event.preventDefault();
        this.interactPressed = true;
      }
      if (key === "c" && this.isShipState()) {
        event.preventDefault();
        this.cycleShipCamera();
      }
      if (key === "h" || key === "f1") {
        event.preventDefault();
        this.toggleHelp();
      }
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (key in this.input) {
        event.preventDefault();
        this.input[key] = false;
      }
      if (event.code === "Space") {
        this.input.space = false;
      }
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        this.input.shift = false;
      }
      if (event.code === "ControlLeft" || event.code === "ControlRight") {
        this.input.ctrl = false;
      }
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.pointerLocked || !this.isGameplayState() || this.helpOpen) {
        return;
      }

      const isShip = this.isShipState();
      const sensitivity = isShip ? 0.0018 : 0.0022;
      this.look.yaw = this.normalizeAngle(this.look.yaw + event.movementX * sensitivity);
      this.look.pitch = clamp(
        this.look.pitch - event.movementY * sensitivity,
        isShip ? -0.42 : -0.7,
        isShip ? 0.32 : 0.7
      );
    });

    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });

    this.canvas.addEventListener("click", () => {
      if (this.isGameplayState() && !this.helpOpen) {
        this.requestPointerLock();
      }
    });
  }

  cycleShipCamera() {
    const currentIndex = this.shipCameraModes.indexOf(this.shipCameraMode);
    this.shipCameraMode = this.shipCameraModes[(currentIndex + 1) % this.shipCameraModes.length];
    this.setToast(`Camera: ${this.getShipCameraLabel()}`, 1.2);
    this.renderUI();
  }

  requestPointerLock() {
    if (!this.pointerLocked && this.canvas.requestPointerLock && this.isGameplayState() && !this.helpOpen) {
      this.canvas.requestPointerLock();
    }
  }

  toggleHelp(force) {
    this.helpOpen = typeof force === "boolean" ? force : !this.helpOpen;
    if (this.helpOpen && this.pointerLocked && document.exitPointerLock) {
      document.exitPointerLock();
    }
    this.renderUI();
  }

  isGameplayState() {
    return (
      this.state === "boarding" ||
      this.state === "launch" ||
      this.state === "routeFlight" ||
      this.state === "docking" ||
      this.state === "wormholeTransit" ||
      this.state === "hub" ||
      this.state === "arrival"
    );
  }

  isShipState() {
    return this.state === "launch" || this.state === "routeFlight" || this.state === "docking" || this.state === "wormholeTransit";
  }

  isOnFootState() {
    return this.state === "boarding" || this.state === "hub" || this.state === "arrival";
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

    if (this.isGameplayState()) {
      this.requestPointerLock();
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

    this.helpOpen = false;
    this.syncPreviewActors();
    this.updateModeVisibility();
    this.renderUI();
  }

  prepareNextContract() {
    this.segmentIndex = 0;
    this.segment = SEGMENTS[0];
    this.loadSegmentWorld();
  }

  startMission() {
    const departure = this.obstacles.getDepartureWorld();
    const stats = this.getDerivedStats();
    this.character.reset(departure.characterSpawn);
    this.character.setCargoCarried(false, true);
    this.player.reset(departure.shipSpawn, this.save.upgrades);
    this.run = {
      ...this.createEmptyRun(),
      fuel: safeNumber(stats.maxFuel, 45)
    };
    this.summary = null;
    this.helpOpen = false;
    this.shipCameraMode = "cockpit";
    this.setLookFromTarget(
      departure.characterSpawn.x,
      departure.characterSpawn.z,
      (departure.cargoZone.minX + departure.cargoZone.maxX) / 2,
      (departure.cargoZone.minZ + departure.cargoZone.maxZ) / 2,
      -0.08
    );
    this.state = "boarding";
    this.setToast("Courier deployed. Reach the cargo manifest.", 2.4);
    this.updateModeVisibility();
    this.requestPointerLock();
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
    this.toastTimer = Math.max(0, this.toastTimer - deltaTime);
    if (this.toastTimer === 0) {
      this.toastText = "";
    }

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
    } else if (this.state === "hub") {
      this.updateHub(deltaTime);
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
    this.scene.fog.density = 0.0054;
    const movement = this.character.update(this.input, deltaTime, { minX: -170, maxX: 170, minZ: -90, maxZ: 90 }, this.look);
    const cargo = this.obstacles.getCargoCheckpointInfo(this.character);
    const boarding = this.obstacles.getBoardingInfo(this.character);
    const interact = this.consumeInteract();

    this.statusText = `${this.segment.departure.planetLabel} cargo terminal`;

    if (!this.run.cargoSecured) {
      this.objectiveText = "Reach the yellow cargo zone and log the manifest.";
      this.promptText = cargo.inZone
        ? "Press E to log the cargo manifest."
        : cargo.nearZone
          ? "Move fully into the yellow cargo zone."
          : "Follow the yellow beacon to the cargo checkpoint.";
      if (cargo.inZone && interact) {
        this.run.cargoSecured = true;
        this.run.cargoLoaded = 3;
        this.run.cargoProgress = 1;
        this.character.setCargoCarried(true);
        this.setToast("Manifest secured. Carry it to the boarding ramp.", 2.2);
      }
    } else {
      this.objectiveText = "Move to the cyan ramp zone and board the freighter.";
      this.promptText = boarding.inZone
        ? "Press E to board the ship."
        : boarding.nearZone
          ? "Step fully into the cyan ramp zone."
          : "Follow the cyan beacon to the boarding ramp.";
      if (boarding.inZone && interact) {
        this.character.setCargoCarried(false, true);
        this.state = "launch";
        this.look.yaw = this.player.orientation;
        this.look.pitch = -0.04;
        this.setToast("Boarded. Press E to ignite launch.", 2.2);
        this.requestPointerLock();
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
      this.objectiveText = "Ignite launch, then climb through the corridor.";
      this.promptText = "Press E to ignite launch. Use W/S to thrust, A/D to trim, Space to rise, Shift to descend, and C to change camera.";
      if (interact) {
        this.run.launchAuthorized = true;
        this.setToast("Launch ignition confirmed. Climb out of the port.", 2);
      }
      return;
    }

    const launchForce = this.obstacles.getDepartureForce(this.player, this.run.launchProgress);

    const movement = this.player.update(
      this.input,
      deltaTime,
      {
        minX: departure.shipSpawn.x - 4,
        maxX: departure.departureLane.spaceBreakX + 24,
        minY: 3.8,
        maxY: departure.departureLane.targetY + 60,
        minZ: -52,
        maxZ: 52
      },
      this.save.upgrades,
      launchForce,
      this.look
    );

    this.run.fuel = clamp(
      safeNumber(this.run.fuel, maxFuel) - (0.05 + (movement.thrusting ? 0.12 : 0) + (launchForce.dragPenalty ?? 0)) * deltaTime,
      0,
      maxFuel
    );

    const xProgress = clamp(
      (this.player.position.x - departure.shipSpawn.x) / Math.max(departure.departureLane.spaceBreakX - departure.shipSpawn.x, 1),
      0,
      1
    );
    const yProgress = clamp(this.player.position.y / Math.max(departure.departureLane.targetY, 1), 0, 1);
    this.run.launchProgress = Math.max(this.run.launchProgress, xProgress * 0.55 + yProgress * 0.45);
    this.run.launchPhase = launchForce.phase;

    const phaseCopy =
      launchForce.phase === "surface"
        ? {
            status: "Surface departure underway.",
            objective: `Lift off from ${this.segment.departure.planetLabel} and clear the port traffic lane.`,
            prompt: "Climb gently with W and Space. Stay centered in the illuminated lane."
          }
        : launchForce.phase === "lowerAtmosphere"
          ? {
              status: "Lower atmosphere transit.",
              objective: `Push through the lower atmosphere of ${this.segment.departure.planetLabel}.`,
              prompt: "Maintain ascent. Expect heavier drag and stronger stabilization near the planet."
            }
          : launchForce.phase === "upperAtmosphere"
            ? {
                status: "Upper atmosphere transition.",
                objective: "Break through the upper haze until stars and route beacons are fully visible.",
                prompt: `Keep climbing and accelerating. ${this.segment.stationLabel} will become your primary target once you clear atmosphere.`
              }
            : {
                status: "Orbital break underway.",
                objective: `Leave the planet's atmosphere and align with the long-haul lane toward ${this.segment.stationLabel}.`,
                prompt: `Follow the blue station beacon and prepare for deep-space cruise.`
              };

    this.statusText = phaseCopy.status;
    this.objectiveText = phaseCopy.objective;
    this.promptText = this.pointerLocked
      ? phaseCopy.prompt
      : "Click the view to capture the camera, then continue the ascent.";
    this.scene.fog.density =
      launchForce.phase === "surface"
        ? 0.0064
        : launchForce.phase === "lowerAtmosphere"
          ? 0.0052
          : launchForce.phase === "upperAtmosphere"
            ? 0.0036
            : 0.0022;

    if (this.run.fuel <= 0) {
      this.failMission("Fuel reserves depleted during launch.");
      return;
    }

    if (
      this.player.position.x >= departure.departureLane.spaceBreakX &&
      this.player.position.y >= departure.departureLane.targetY * 0.88
    ) {
      this.state = "routeFlight";
      this.run.routeProgress = this.player.position.x;
      this.look.pitch = 0;
      this.setToast(`Atmosphere cleared. The long-haul route to ${this.segment.stationLabel} is now live.`, 2.8);
    }
  }

  updateRouteFlight(deltaTime) {
    this.scene.fog.density += (0.00105 - this.scene.fog.density) * clamp(deltaTime * 2.2, 0, 1);
    const stats = this.getDerivedStats();
    const maxFuel = safeNumber(stats.maxFuel, 45);
    const gravity = this.obstacles.getGravityInfluence(this.player, this.save.upgrades.durability);
    const ionStorm = this.obstacles.getIonStormEffect(this.player, this.save.upgrades.durability);
    const nextStopover = this.getActiveStopover();
    const docking = this.obstacles.getStopoverInfo(this.player, this.run.stopIndex);
    const optionalTask = this.obstacles.getOptionalTaskInfo(this.player, this.run.optionalTaskIds);

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
      {
        minX: this.obstacles.getRouteStartX() - 180,
        maxX: this.obstacles.getRouteLength() + 120,
        minY: -90,
        maxY: 210,
        minZ: -240,
        maxZ: 240
      },
      this.save.upgrades,
      environment,
      this.look
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
      safeNumber(this.run.fuel, maxFuel) -
        (0.18 + (movement.thrusting ? 0.24 : 0) + gravity.fuelPenalty * 0.45 + ionStorm.fuelPenalty * 0.45) * deltaTime,
      0,
      maxFuel
    );

    const collision = this.obstacles.getSolidCollision(this.player);
    if (collision) {
      this.failMission("Collision detected. Cargo route lost.");
      return;
    }

    const wormhole = this.obstacles.getWormholeInfo(this.player, this.run.wormholeUsed);
    const interact = this.consumeInteract();

    const currentTarget = this.getCurrentNavigationTarget();
    const targetDistance = currentTarget ? this.formatDistance3D(this.player.position, currentTarget.position) : "";

    if (docking.available && docking.inZone && movement.stable) {
      this.promptText = "Press E to engage docking clamps.";
      if (interact) {
        this.state = "docking";
        this.run.dockingTimer = this.segment.dockingDuration;
        this.run.dockingStopoverId = docking.stopover.id;
        this.setToast("Docking clamps engaged.", 1.8);
      }
    } else if (docking.available && docking.nearZone) {
      this.promptText = `Approach ${docking.stopover.label} and settle the freighter.`;
    } else if (optionalTask) {
      this.promptText = `Bonus target nearby: ${optionalTask.label}. Press E to secure it for extra credits and fuel.`;
      if (interact) {
        this.run.optionalTaskIds.push(optionalTask.id);
        this.run.bonusCredits += optionalTask.reward;
        this.run.fuel = clamp(this.run.fuel + optionalTask.fuelBonus, 0, maxFuel);
        this.setToast(`${optionalTask.label} secured. Bonus banked.`, 1.8);
      }
    } else if (this.run.stopIndex >= this.segment.stopovers.length && wormhole.available && wormhole.inZone && movement.stable) {
      this.promptText = "Press E to enter the wormhole corridor.";
      if (interact) {
        this.state = "wormholeTransit";
        this.run.wormholeTimer = this.segment.wormhole.turbulenceDuration;
        this.run.wormholeUsed = true;
        this.setToast("Wormhole transit engaged.", 1.6);
      }
    } else if (this.run.stopIndex >= this.segment.stopovers.length && wormhole.available && wormhole.nearZone) {
      this.promptText = "Wormhole corridor ahead. Align and stabilize to enter.";
    } else {
      this.promptText = nextStopover
        ? `Follow the beacon to ${nextStopover.label}${targetDistance ? ` (${targetDistance})` : ""}.`
        : `Follow the gate beacon to ${this.segment.destinationLabel}${targetDistance ? ` (${targetDistance})` : ""}.`;
    }

    if (!this.pointerLocked) {
      this.promptText = `Click the view to capture the camera. ${this.promptText}`;
    }

    this.statusText = nextStopover
      ? `Next stop: ${nextStopover.label}.`
      : "All mid-route stops complete. Final delivery window is open.";
    this.objectiveText = nextStopover
      ? `Dock at ${nextStopover.label} and complete the ground task.`
      : `Reach ${this.segment.destinationLabel}. ${this.segment.wormhole ? "Wormhole remains optional." : ""}`;

    if (this.obstacles.getGateInfo(this.player).inZone && this.run.stopIndex >= this.segment.stopovers.length) {
      this.completeMission();
      return;
    }

    if (this.run.routeProgress >= this.obstacles.getRouteLength() + 20 && nextStopover) {
      this.failMission(`Delivery failed. Mandatory stop ${nextStopover.label} was missed.`);
      return;
    }

    if (this.run.fuel <= 0) {
      this.failMission("Fuel reserves depleted before reaching the destination gate.");
    }
  }

  updateDocking(deltaTime) {
    this.scene.fog.density += (0.0019 - this.scene.fog.density) * clamp(deltaTime * 2.2, 0, 1);
    this.run.dockingTimer = Math.max(0, this.run.dockingTimer - deltaTime);
    this.statusText = "Docking clamps engaged.";
    this.objectiveText = "Hold position while the docking locks and cargo bridge settle.";
    this.promptText = "Transit lock in progress.";

    if (this.run.dockingTimer === 0) {
      this.run.dockingQuality = clamp(1 - (this.run.hazardExposure * 0.02), 0.35, 1);
      const stopover = this.segment.stopovers.find((entry) => entry.id === this.run.dockingStopoverId) ?? null;
      if (stopover) {
        if (stopover.kind === "refuel") {
          this.run.fuel = safeNumber(this.getDerivedStats().maxFuel, 45);
        } else {
          this.run.fuel = clamp(this.run.fuel + stopover.fuelBonus, 0, safeNumber(this.getDerivedStats().maxFuel, 45));
        }
        this.character.reset(stopover.hub.characterSpawn);
        this.player.reset(stopover.hub.shipSpawn, this.save.upgrades);
        this.setLookFromTarget(
          stopover.hub.characterSpawn.x,
          stopover.hub.characterSpawn.z,
          (stopover.hub.mandatoryZone.minX + stopover.hub.mandatoryZone.maxX) / 2,
          (stopover.hub.mandatoryZone.minZ + stopover.hub.mandatoryZone.maxZ) / 2,
          -0.05
        );
        this.run.hubMandatoryDone = false;
        this.run.hubOptionalDone = false;
        this.state = "hub";
        this.setToast(`${stopover.label} secured. Exit the ship and finish the stopover task.`, 2.4);
      } else {
        this.state = "routeFlight";
        this.setToast("Dock complete. Continue the route.", 1.8);
      }
    }
  }

  updateHub(deltaTime) {
    const stopover = this.getActiveStopover();
    if (!stopover) {
      this.state = "routeFlight";
      return;
    }

    const hub = stopover.hub;
    const movement = this.character.update(this.input, deltaTime, hub.bounds, this.look);
    const mandatory = this.obstacles.getHubInteractionInfo(this.character, "mandatory");
    const optional = this.obstacles.getHubInteractionInfo(this.character, "optional");
    const board = this.obstacles.getHubInteractionInfo(this.character, "board");
    const interact = this.consumeInteract();

    this.statusText = `${hub.title}`;
    if (!this.run.hubMandatoryDone) {
      this.objectiveText = `Reach ${hub.mandatoryLabel} and complete the stopover task.`;
      this.promptText = mandatory.inZone
        ? `Press E to complete ${hub.mandatoryLabel}.`
        : mandatory.nearZone
          ? `Step fully into ${hub.mandatoryLabel}.`
          : `Move to ${hub.mandatoryLabel}.`;
      if (mandatory.inZone && interact) {
        this.run.hubMandatoryDone = true;
        this.run.bonusCredits += stopover.reward;
        this.setToast(hub.mandatoryRewardLabel, 2);
      }
    } else if (!this.run.hubOptionalDone) {
      this.objectiveText = `Optional: recover ${hub.optionalLabel}, then return to the ship.`;
      this.promptText = optional.inZone
        ? `Press E to recover ${hub.optionalLabel}.`
        : board.inZone
          ? "Press E to reboard and continue the route."
          : optional.nearZone
            ? `Step into ${hub.optionalLabel} for a bonus, or return to the ship.`
            : "Optional bonus nearby. Recover it or head back to the ship.";
      if (optional.inZone && interact) {
        this.run.hubOptionalDone = true;
        this.run.bonusCredits += hub.optionalReward;
        this.run.fuel = clamp(this.run.fuel + hub.optionalFuelBonus, 0, safeNumber(this.getDerivedStats().maxFuel, 45));
        this.setToast(`${hub.optionalLabel} recovered.`, 1.8);
      } else if (board.inZone && interact) {
        this.departHub(stopover);
      }
    } else {
      this.objectiveText = "Return to the ship and continue the contract.";
      this.promptText = board.inZone ? "Press E to reboard and launch back into the route." : `Move to ${hub.boardLabel}.`;
      if (board.inZone && interact) {
        this.departHub(stopover);
      }
    }

    this.run.onFootSpeed = movement.speed;
  }

  updateWormholeTransit(deltaTime) {
    this.scene.fog.density += (0.0028 - this.scene.fog.density) * clamp(deltaTime * 2.4, 0, 1);
    this.run.wormholeTimer = Math.max(0, this.run.wormholeTimer - deltaTime);
    this.statusText = "Wormhole corridor engaged.";
    this.objectiveText = "Hold the freighter together through transit.";
    this.promptText = "Space is folding around the cockpit.";

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
      this.setToast("Transit complete. Final leg ahead.", 2.2);
    }
  }

  updateArrival(deltaTime) {
    this.scene.fog.density += (0.0038 - this.scene.fog.density) * clamp(deltaTime * 2, 0, 1);
    const movement = this.character.update(this.input, deltaTime, { minX: -74, maxX: 82, minZ: -54, maxZ: 54 }, this.look);
    const arrival = this.obstacles.getArrivalInfo(this.character);
    const optional = this.obstacles.getArrivalOptionalInfo(this.character);
    const interact = this.consumeInteract();

    this.statusText = "Ship landed at the delivery port.";
    if (!this.run.arrivalOptionalDone) {
      this.objectiveText = `Optional: secure ${this.segment.arrival.optionalLabel}, then deliver the freight.`;
      this.promptText = optional.inZone
        ? `Press E to secure ${this.segment.arrival.optionalLabel}.`
        : arrival.inZone
          ? "Press E to complete delivery."
          : optional.nearZone
            ? `Step into ${this.segment.arrival.optionalLabel} for a final bonus.`
            : "Walk to the delivery office, or grab the optional customs cache first.";
      if (optional.inZone && interact) {
        this.run.arrivalOptionalDone = true;
        this.run.bonusCredits += this.segment.arrival.optionalReward;
        this.setToast(`${this.segment.arrival.optionalLabel} secured.`, 1.8);
        return;
      }
    } else {
      this.objectiveText = "Walk to the delivery office and close the contract.";
      this.promptText = arrival.inZone
        ? "Press E to complete delivery."
        : arrival.nearZone
          ? "Step fully into the green delivery zone."
          : "Walk to the green delivery zone.";
    }
    this.run.onFootSpeed = movement.speed;

    if (arrival.inZone && interact) {
      this.state = "results";
      this.helpOpen = false;
    }
  }

  backgroundPreviewDrift(_deltaTime) {
    this.scene.fog.density += (0.0036 - this.scene.fog.density) * 0.04;
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
    const taskBonus = this.run.bonusCredits;
    const total = this.segment.baseReward + fuelBonus + dockingBonus + hazardBonus + shortcutBonus + taskBonus;

    this.summary = {
      title: "Delivery Complete",
      result: "success",
      baseReward: this.segment.baseReward,
      fuelBonus,
      dockingBonus,
      hazardBonus,
      shortcutBonus,
      taskBonus,
      total
    };

    this.save.credits += total;
    this.save.bestCredits = Math.max(this.save.bestCredits, total);
    this.save.completedRuns += 1;
    if (!this.save.completedSegmentIds.includes(this.segment.id)) {
      this.save.completedSegmentIds.push(this.segment.id);
    }
    this.save.unlockedSegments = 1;
    this.persistSave();

    const arrival = this.obstacles.getArrivalWorld();
    this.character.reset(arrival.characterSpawn);
    this.player.reset(arrival.shipSpawn, this.save.upgrades);
    this.setLookFromTarget(arrival.characterSpawn.x, arrival.characterSpawn.z, 30, 4, -0.05);
    this.state = "arrival";
    this.setToast("Exit the ship and finish the delivery.", 2.4);
  }

  failMission(reason) {
    const effectiveRouteProgress = clamp(
      (this.run.routeProgress - this.obstacles.getRouteStartX()) /
        Math.max(this.obstacles.getRouteLength() - this.obstacles.getRouteStartX(), 1),
      0,
      1
    );
    const fallback = Math.round(24 + effectiveRouteProgress * 42);
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
    this.helpOpen = false;
    this.state = "gameOver";
    this.character.setCargoCarried(false, true);
    this.syncPreviewActors();
  }

  updateModeVisibility() {
    if (this.state === "boarding") {
      this.obstacles.setMode("boarding");
      this.character.setVisible(true);
      this.character.setFirstPersonView(true);
      this.player.setVisible(true);
      this.player.setFirstPersonView(false);
    } else if (this.state === "launch") {
      this.obstacles.setMode("launch");
      this.character.setVisible(false);
      this.character.setFirstPersonView(false);
      this.player.setVisible(true);
      this.player.setFirstPersonView(true);
    } else if (this.state === "routeFlight" || this.state === "docking") {
      this.obstacles.setMode("flight");
      this.character.setVisible(false);
      this.character.setFirstPersonView(false);
      this.player.setVisible(true);
      this.player.setFirstPersonView(true);
    } else if (this.state === "wormholeTransit") {
      this.obstacles.setMode("wormhole");
      this.character.setVisible(false);
      this.character.setFirstPersonView(false);
      this.player.setVisible(true);
      this.player.setFirstPersonView(true);
    } else if (this.state === "hub") {
      this.obstacles.setMode("hub", { stopover: this.getActiveStopover() });
      this.character.setVisible(true);
      this.character.setFirstPersonView(true);
      this.player.setVisible(true);
      this.player.setFirstPersonView(false);
    } else if (this.state === "arrival" || this.state === "results") {
      this.obstacles.setMode("arrival");
      this.character.setVisible(true);
      this.character.setFirstPersonView(this.state === "arrival");
      this.player.setVisible(true);
      this.player.setFirstPersonView(false);
    } else {
      this.obstacles.setMode("preview");
      this.character.setVisible(true);
      this.character.setFirstPersonView(false);
      this.player.setVisible(true);
      this.player.setFirstPersonView(false);
    }
  }

  getActiveStopover() {
    return this.obstacles.getCurrentStopover(this.run.stopIndex ?? 0);
  }

  departHub(stopover) {
    this.player.reset({ x: stopover.flightExitX, y: 10, z: stopover.z }, this.save.upgrades);
    this.look.yaw = this.player.orientation;
    this.look.pitch = -0.02;
    this.run.routeProgress = this.player.position.x;
    this.run.completedStopovers.push(stopover.id);
    this.run.stopIndex += 1;
    this.run.stationCompleted = this.run.stopIndex > 0;
    this.state = "routeFlight";
    this.setToast(`${stopover.label} complete. Long-haul route resumed.`, 2.2);
  }

  updateCamera(deltaTime) {
    if (this.isOnFootState()) {
      this.character.cameraAnchor.getWorldPosition(this.tempVectorA);
      const direction = this.vectorFromYawPitch(this.look.yaw, this.look.pitch, this.tempVectorB);
      const eyePosition = this.tempVectorA;
      const lookAt = direction.multiplyScalar(50).add(eyePosition);
      this.camera.position.lerp(eyePosition, clamp(deltaTime * 16, 0, 1));
      this.cameraTarget.lerp(lookAt, clamp(deltaTime * 16, 0, 1));
      this.camera.lookAt(this.cameraTarget);
      return;
    }

    if (this.isShipState()) {
      const telemetry = this.player.getTelemetry();
      const direction = this.vectorFromYawPitch(this.look.yaw, this.look.pitch, this.tempVectorB);
      if (this.shipCameraMode === "cockpit") {
        this.player.cameraAnchor.getWorldPosition(this.tempVectorA);
        const lookAt = direction.multiplyScalar(160).add(this.tempVectorA);
        const cockpitSway = this.THREE.MathUtils.lerp(0, telemetry.velocity.z * 0.004, 0.35);
        this.tempVectorA.y += Math.sin(this.time * 14) * (telemetry.thrusting ? 0.007 : 0.003);
        this.tempVectorA.z += cockpitSway;
        if (this.state === "wormholeTransit") {
          this.tempVectorA.x += Math.sin(this.time * 44) * 0.08;
          this.tempVectorA.y += Math.cos(this.time * 38) * 0.08;
        }
        this.camera.position.lerp(this.tempVectorA, clamp(deltaTime * 18, 0, 1));
        this.cameraTarget.lerp(lookAt, clamp(deltaTime * 14, 0, 1));
      } else {
        const anchor = this.shipCameraMode === "close" ? this.player.closeChaseAnchor : this.player.farChaseAnchor;
        anchor.getWorldPosition(this.tempVectorA);
        this.player.cameraLookAnchor.getWorldPosition(this.tempVectorB);
        const lookAt = this.tempVectorB.clone();
        lookAt.x += telemetry.velocity.x * 0.58;
        lookAt.y += telemetry.velocity.y * 0.22;
        lookAt.z += telemetry.velocity.z * 0.36;
        this.tempVectorA.y += this.shipCameraMode === "close" ? 0.45 : 1.1;
        this.camera.position.lerp(this.tempVectorA, clamp(deltaTime * (this.shipCameraMode === "close" ? 5.8 : 4.2), 0, 1));
        this.cameraTarget.lerp(lookAt, clamp(deltaTime * 6.4, 0, 1));
      }
      this.camera.lookAt(this.cameraTarget);
      return;
    }

    if (this.state === "results") {
      const arrival = this.obstacles.getArrivalWorld();
      this.tempVectorA.set(arrival.shipSpawn.x - 18, 16, arrival.shipSpawn.z + 22);
      this.tempVectorB.set(arrival.characterSpawn.x + 18, 3.6, arrival.characterSpawn.z);
      this.camera.position.lerp(this.tempVectorA, clamp(deltaTime * 3.2, 0, 1));
      this.cameraTarget.lerp(this.tempVectorB, clamp(deltaTime * 3.6, 0, 1));
      this.camera.lookAt(this.cameraTarget);
      return;
    }

    const departure = this.obstacles.getDepartureWorld();
    this.tempVectorA.set(departure.shipSpawn.x - 26, 18, departure.shipSpawn.z + 30);
    this.tempVectorB.set(departure.shipSpawn.x + 3, 4.2, departure.shipSpawn.z);
    this.camera.position.lerp(this.tempVectorA, clamp(deltaTime * 2.8, 0, 1));
    this.cameraTarget.lerp(this.tempVectorB, clamp(deltaTime * 3.5, 0, 1));
    this.camera.lookAt(this.cameraTarget);
  }

  vectorFromYawPitch(yaw, pitch, target) {
    target.set(
      Math.cos(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.sin(yaw) * Math.cos(pitch)
    );
    return target.normalize();
  }

  normalizeAngle(angle) {
    let normalized = angle;
    while (normalized > Math.PI) {
      normalized -= Math.PI * 2;
    }
    while (normalized < -Math.PI) {
      normalized += Math.PI * 2;
    }
    return normalized;
  }

  setLookFromTarget(fromX, fromZ, toX, toZ, pitch = 0) {
    this.look.yaw = Math.atan2(toZ - fromZ, toX - fromX);
    this.look.pitch = pitch;
  }

  setToast(text, duration = 2) {
    this.toastText = text;
    this.toastTimer = duration;
  }

  getShipCameraLabel() {
    return this.shipCameraMode === "cockpit" ? "Cockpit" : this.shipCameraMode === "close" ? "Chase" : "Far Chase";
  }

  getCurrentNavigationTarget() {
    if (this.state === "boarding") {
      const departure = this.obstacles.getDepartureWorld();
      if (!this.run.cargoSecured) {
        return {
          key: "cargo",
          label: "Cargo Checkpoint",
          position: {
            x: (departure.cargoZone.minX + departure.cargoZone.maxX) / 2,
            z: (departure.cargoZone.minZ + departure.cargoZone.maxZ) / 2
          }
        };
      }
      return {
        key: "ramp",
        label: "Boarding Ramp",
        position: {
          x: (departure.boardingZone.minX + departure.boardingZone.maxX) / 2,
          z: (departure.boardingZone.minZ + departure.boardingZone.maxZ) / 2
        }
      };
    }
    if (this.state === "arrival") {
      const arrival = this.obstacles.getArrivalWorld();
      if (!this.run.arrivalOptionalDone) {
        return {
          key: "arrival-optional",
          label: this.segment.arrival.optionalLabel,
          position: {
            x: (arrival.optionalZone.minX + arrival.optionalZone.maxX) / 2,
            z: (arrival.optionalZone.minZ + arrival.optionalZone.maxZ) / 2
          }
        };
      }
      return {
        key: "delivery",
        label: "Delivery Office",
        position: {
          x: (arrival.deliveryZone.minX + arrival.deliveryZone.maxX) / 2,
          z: (arrival.deliveryZone.minZ + arrival.deliveryZone.maxZ) / 2
        }
      };
    }
    if (this.state === "hub") {
      const stopover = this.getActiveStopover();
      if (!stopover) {
        return null;
      }
      if (!this.run.hubMandatoryDone) {
        return {
          key: "hub-mandatory",
          label: stopover.hub.mandatoryLabel,
          position: {
            x: (stopover.hub.mandatoryZone.minX + stopover.hub.mandatoryZone.maxX) / 2,
            z: (stopover.hub.mandatoryZone.minZ + stopover.hub.mandatoryZone.maxZ) / 2
          }
        };
      }
      return {
        key: "hub-board",
        label: stopover.hub.boardLabel,
        position: {
          x: (stopover.hub.boardZone.minX + stopover.hub.boardZone.maxX) / 2,
          z: (stopover.hub.boardZone.minZ + stopover.hub.boardZone.maxZ) / 2
        }
      };
    }
    if (this.state === "launch") {
      const departure = this.obstacles.getDepartureWorld();
      return {
        key: "atmosphere",
        label: "Orbital Break",
        position: {
          x: departure.departureLane.spaceBreakX,
          z: 0
        }
      };
    }
    const points = this.obstacles.getNavigationPoints(this.run.wormholeUsed);
    if (this.getActiveStopover()) {
      return { key: "stopover", label: this.getActiveStopover().label, position: { x: this.getActiveStopover().x, z: this.getActiveStopover().z } };
    }
    return { key: "gate", label: this.segment.destinationLabel, position: points.gate };
  }

  formatDistance3D(from, to) {
    const distance = Math.hypot((to.x ?? 0) - (from.x ?? 0), (to.z ?? 0) - (from.z ?? 0));
    return `${Math.max(1, Math.round(distance))} km`;
  }

  drawMinimap(target) {
    if (!this.minimapContext || !this.controlsRef.minimapCanvas) {
      return;
    }

    const ctx = this.minimapContext;
    const canvas = this.controlsRef.minimapCanvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const range = this.state === "launch" ? 1400 : this.isShipState() ? 2600 : 220;
    const points = this.obstacles.getNavigationPoints(this.run.wormholeUsed);
    const trackedPosition = this.isOnFootState() ? this.character.position : this.player.position;
    const trackedYaw = this.isOnFootState() ? this.look.yaw : this.look.yaw;
    const hazards = this.isShipState() ? this.obstacles.getRadarContacts(this.player, range) : [];

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(3, 10, 21, 0.92)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(103, 232, 249, 0.18)";
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((ratio) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (width * 0.46) * ratio, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    const drawPoint = (x, z, color, size = 4) => {
      const dx = x - trackedPosition.x;
      const dz = z - trackedPosition.z;
      const cos = Math.cos(-trackedYaw + Math.PI / 2);
      const sin = Math.sin(-trackedYaw + Math.PI / 2);
      const rx = dx * cos - dz * sin;
      const rz = dx * sin + dz * cos;
      const px = centerX + clamp(rx / range, -0.9, 0.9) * (width * 0.42);
      const py = centerY + clamp(rz / range, -0.9, 0.9) * (height * 0.42);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    };

    hazards.forEach((hazard) => drawPoint(hazard.x, hazard.z, hazard.kind === "asteroid" ? "#fca5a5" : "#cbd5e1", 2.2));
    if (this.isShipState() || this.state === "launch") {
      points.stopovers?.forEach((stopover, index) => {
        drawPoint(stopover.x, stopover.z, index === 0 ? "#38bdf8" : "#f59e0b", target?.label === this.segment.stopovers?.[index]?.label ? 4.6 : 3.4);
      });
      drawPoint(points.gate.x, points.gate.z, "#4ade80", target?.key === "gate" ? 4.6 : 3.4);
    }
    if ((this.isShipState() || this.state === "launch") && points.wormhole) {
      drawPoint(points.wormhole.x, points.wormhole.z, "#f472b6", 3.5);
    }
    if (this.isShipState() || this.state === "launch") {
      points.optionalTasks
        ?.filter((task) => !this.run.optionalTaskIds.includes(task.id))
        .forEach((task) => drawPoint(task.x, task.z, "#facc15", 2.8));
    }
    if ((this.isOnFootState() || this.state === "launch") && target?.position) {
      drawPoint(target.position.x, target.position.z, target.key === "delivery" ? "#4ade80" : target.key === "cargo" ? "#fbbf24" : "#67e8f9", 4.4);
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(trackedYaw);
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  renderUI() {
    const {
      panelCard,
      hud,
      reticle,
      titleEl,
      copyEl,
      statusLabel,
      scoreLabel,
      objectiveLabel,
      promptLabel,
      helpPanel,
      helpTitle,
      helpBody,
      helpButton,
      detailsEl,
      upgradesEl,
      fuelFillEl,
      fuelValueEl,
      progressFillEl,
      progressValueEl,
      cameraModeEl,
      targetLabelEl,
      minimapModeEl,
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

    if (this.toastText) {
      this.statusText = this.toastText;
    }

    const maxFuel = safeNumber(this.getDerivedStats().maxFuel, 45);
    const routeProgress = clamp(
      (this.run.routeProgress - this.obstacles.getRouteStartX()) /
        Math.max(this.obstacles.getRouteLength() - this.obstacles.getRouteStartX(), 1),
      0,
      1
    );
    const fuelRatio = clamp(safeNumber(this.run.fuel, maxFuel) / Math.max(maxFuel, 1), 0, 1);
    const target = this.getCurrentNavigationTarget();

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
    if (cameraModeEl) {
      cameraModeEl.textContent = this.isShipState() ? this.getShipCameraLabel() : "On Foot";
    }
    if (targetLabelEl) {
      targetLabelEl.textContent = target?.label ?? "Mission";
    }
    if (minimapModeEl) {
      minimapModeEl.textContent = this.state === "launch" ? "Atmosphere Nav" : this.isShipState() ? "System Radar" : "Port Grid";
    }

    const gameplayState = this.isGameplayState();
    panelCard.classList.toggle("hidden", gameplayState);
    hud.classList.toggle("hidden", !gameplayState);
    reticle.classList.toggle("hidden", !gameplayState || this.helpOpen);
    helpPanel.classList.toggle("hidden", !this.helpOpen);
    helpButton.textContent = this.helpOpen ? "Resume" : "Help";
    helpTitle.textContent = this.isShipState() ? "Cockpit Guide" : this.isOnFootState() ? "Courier Guide" : "Ozscape Controls";
    helpBody.innerHTML = this.buildHelpMarkup();
    this.drawMinimap(target);

    if (gameplayState) {
      return;
    }

    detailsEl.innerHTML = "";
    upgradesEl.innerHTML = "";

    if (this.state === "menu") {
      titleEl.textContent = this.segment.name;
      copyEl.textContent = "Launch from Khepri Prime, cross one giant star-system contract, complete stopovers, and finish the delivery at Helios Deep Terminal.";
      this.addDetail(detailsEl, `Departure world: ${this.segment.departure.planetLabel}`);
      this.addDetail(detailsEl, `Contract: ${this.segment.subtitle}`);
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
      copyEl.textContent = "Board on foot, launch through the atmosphere, hit the required stopovers, grab optional bonuses if you want them, and finish the contract at Helios.";
      this.addDetail(detailsEl, `Scaled distance: ${Math.round(this.obstacles.getRouteLength() - this.obstacles.getRouteStartX())} km`);
      this.addDetail(detailsEl, `Mandatory stop 1: ${this.segment.stopovers[0].label}`);
      this.addDetail(detailsEl, `Mandatory stop 2: ${this.segment.stopovers[1].label}`);
      this.addDetail(detailsEl, `Destination: ${this.segment.destinationLabel}`);
      this.addDetail(detailsEl, `Optional space bonuses: ${this.segment.optionalTasks.length}`);
      this.addDetail(detailsEl, `Wormhole bonus: ${this.segment.wormhole ? `${this.segment.wormhole.rewardBonus} credits` : "None"}`);
      this.addDetail(detailsEl, "Controls: WASD, Shift sprint/descend, Space rise, E interact, C camera");
      startButton.textContent = "Begin Boarding";
      startButton.disabled = false;
      restartButton.textContent = "Back";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "results") {
      titleEl.textContent = this.summary.title;
      copyEl.textContent = "The route is complete. Review the payout, then tune the freighter for the next contract.";
      this.addDetail(detailsEl, `Base reward: ${this.summary.baseReward}`);
      this.addDetail(detailsEl, `Fuel bonus: ${this.summary.fuelBonus}`);
      this.addDetail(detailsEl, `Docking bonus: ${this.summary.dockingBonus}`);
      this.addDetail(detailsEl, `Hazard bonus: ${this.summary.hazardBonus}`);
      this.addDetail(detailsEl, `Wormhole bonus: ${this.summary.shortcutBonus}`);
      this.addDetail(detailsEl, `Task bonus: ${this.summary.taskBonus ?? 0}`);
      this.addDetail(detailsEl, `Total payout: ${this.summary.total}`);
      startButton.textContent = "Open Hangar";
      startButton.disabled = false;
      restartButton.textContent = "Next Briefing";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "hangar") {
      titleEl.textContent = "Hangar";
      copyEl.textContent = "Invest in the freighter before another full-system contract attempt.";
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
      startButton.textContent = "Replay Contract";
      startButton.disabled = false;
      restartButton.textContent = "Back to Menu";
      restartButton.disabled = false;
      return;
    }

    if (this.state === "gameOver") {
      titleEl.textContent = "Route Failed";
      copyEl.textContent = "The cargo run collapsed before delivery. Retry the route with a cleaner line and steadier docking.";
      this.addDetail(detailsEl, this.summary.reason);
      this.addDetail(detailsEl, `Fallback credits: ${this.summary.total}`);
      this.addDetail(detailsEl, `Route progress: ${Math.round(routeProgress * 100)}%`);
      this.addDetail(detailsEl, `Mandatory stops cleared: ${this.run.completedStopovers.length} / ${this.segment.stopovers.length}`);
      startButton.textContent = "Retry Briefing";
      startButton.disabled = false;
      restartButton.textContent = "Back to Menu";
      restartButton.disabled = false;
    }
  }

  buildHelpMarkup() {
    const stateCard = this.isShipState()
      ? `<div class="help-card"><h3>Current Phase</h3><p>Ship flight: use <strong>C</strong> to cycle cockpit, chase, and far-chase cameras. Fly with <strong>W/S</strong>, trim with <strong>A/D</strong>, rise with <strong>Space</strong>, descend with <strong>Shift</strong>, and press <strong>E</strong> to dock or secure nearby bonus caches. The radar tracks stopovers, side tasks, and major hazards.</p></div>`
      : this.isOnFootState()
        ? `<div class="help-card"><h3>Current Phase</h3><p>Courier first-person: click the view to capture the mouse, use <strong>WASD</strong> to move, hold <strong>Shift</strong> to sprint, follow the floor guides and radar, and press <strong>E</strong> when you are fully inside the highlighted interaction zone.</p></div>`
        : `<div class="help-card"><h3>Current Phase</h3><p>Use the command card to begin or continue the current contract. Once you are in gameplay, click the view to capture the mouse and press <strong>H</strong> anytime to reopen this help panel.</p></div>`;

    return `
      ${stateCard}
      <div class="help-card">
        <h3>Core Controls</h3>
        <p><strong>WASD</strong> move or fly, <strong>Mouse</strong> look, <strong>Shift</strong> sprints on foot or descends in the ship, <strong>Space</strong> rises in the ship, <strong>C</strong> cycles ship cameras, <strong>E</strong> interacts, docks, boards, and secures optional caches, <strong>H</strong> or <strong>F1</strong> opens help, and <strong>Esc</strong> releases the mouse.</p>
      </div>
      <div class="help-card">
        <h3>Contract Flow</h3>
        <p>At the port, walk to the yellow cargo zone and press <strong>E</strong> to pick up the manifest case. Board the ship, launch off-world, complete the mandatory stopovers, take optional bonuses when it makes sense, then finish the delivery at Helios Deep Terminal.</p>
      </div>
      <div class="help-card">
        <h3>Route Rules</h3>
        <p>Collisions fail the route. Fuel drains during launch and flight. Follow the radar to the next mandatory stop, leave the ship when required, finish the ground objective, then reboard to keep the contract moving.</p>
      </div>
      <div class="help-card">
        <h3>Bonuses And Finish</h3>
        <p>Optional caches and salvage targets reward extra credits and sometimes fuel. The wormhole is also optional. At the final terminal, land, check any last bonus locker if you want it, then walk to the delivery office to finish the contract.</p>
      </div>
    `;
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
      cruiseSpeed: 112 + engine * 12,
      maxFuel: Math.max(1, 520 + fuelTank * 80),
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
      arrivalOptionalDone: false,
      dockingTimer: 0,
      dockingQuality: 1,
      stationCompleted: false,
      stopIndex: 0,
      dockingStopoverId: "",
      hubMandatoryDone: false,
      hubOptionalDone: false,
      completedStopovers: [],
      optionalTaskIds: [],
      bonusCredits: 0,
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
        unlockedSegments: 1,
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
