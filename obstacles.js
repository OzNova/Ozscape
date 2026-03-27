const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class ObstacleManager {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;
    this.segment = null;
    this.segmentWorld = null;
    this.root = new THREE.Group();
    this.departureGroup = new THREE.Group();
    this.flightGroup = new THREE.Group();
    this.arrivalGroup = new THREE.Group();
    this.root.add(this.departureGroup, this.flightGroup, this.arrivalGroup);
    this.scene.add(this.root);

    this.routeScale = 0.2;
    this.depthScale = 0.18;
    this.heightScale = 0.12;

    this.objects = [];
    this.gravityZones = [];
    this.ionZones = [];
    this.planets = [];
    this.station = null;
    this.gate = null;
    this.wormhole = null;
    this.starfield = null;
  }

  clearGroup(group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) {
        child.geometry.dispose?.();
      }
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose?.());
      } else {
        child.material?.dispose?.();
      }
    }
  }

  loadSegment(segmentConfig) {
    this.segment = segmentConfig;
    this.objects = [];
    this.gravityZones = [];
    this.ionZones = [];
    this.planets = [];
    this.station = null;
    this.gate = null;
    this.wormhole = null;

    this.clearGroup(this.departureGroup);
    this.clearGroup(this.flightGroup);
    this.clearGroup(this.arrivalGroup);

    this.segmentWorld = this.createSegmentWorld(segmentConfig);
    this.createDepartureWorld();
    this.createFlightWorld();
    this.createArrivalWorld();
    this.setMode("preview");
  }

  createSegmentWorld(segment) {
    const departure = {
      portLabel: segment.departure.portLabel,
      planetLabel: segment.departure.planetLabel,
      shipSpawn: new this.THREE.Vector3(26, 2.8, -4),
      characterSpawn: new this.THREE.Vector3(-30, 1.4, 18),
      cargoZone: {
        minX: -44,
        maxX: -20,
        minZ: 6,
        maxZ: 28
      },
      boardingZone: {
        minX: 8,
        maxX: 26,
        minZ: -12,
        maxZ: 4
      },
      departureLane: {
        startX: 24,
        clearX: 120,
        minZ: -10,
        maxZ: 10,
        targetY: 16
      },
      gravity: {
        x: 14,
        y: 7,
        z: 0
      }
    };

    const routeLength = segment.length * this.routeScale;
    const stationX = segment.station.worldX * this.routeScale;
    const gateX = segment.gate.worldX * this.routeScale;
    const wormhole = segment.wormhole
      ? {
          x: segment.wormhole.worldX * this.routeScale,
          z: this.toRouteZ(segment.wormhole.worldY),
          radius: segment.wormhole.radius * 0.18,
          captureDepth: segment.wormhole.captureWidth * 0.12,
          captureHeight: segment.wormhole.captureHeight * 0.06,
          exitProgress: segment.wormhole.exitProgress * this.routeScale,
          fuelBonus: segment.wormhole.fuelBonus,
          rewardBonus: segment.wormhole.rewardBonus,
          turbulenceDuration: segment.wormhole.turbulenceDuration
        }
      : null;

    return {
      departure,
      routeLength,
      station: {
        x: stationX,
        z: this.toRouteZ(segment.station.worldY),
        bodyRadius: segment.station.bodyRadius * 0.16,
        zoneDepth: segment.station.zoneWidth * 0.12,
        zoneHeight: segment.station.zoneHeight * 0.08
      },
      gate: {
        x: gateX,
        z: this.toRouteZ(segment.gate.worldY),
        width: segment.gate.width * 0.15,
        height: segment.gate.height * 0.08
      },
      wormhole,
      arrival: {
        characterSpawn: new this.THREE.Vector3(-20, 1.4, 10),
        shipSpawn: new this.THREE.Vector3(14, 2.8, -12),
        deliveryZone: {
          minX: 22,
          maxX: 40,
          minZ: -2,
          maxZ: 12
        }
      }
    };
  }

  createDepartureWorld() {
    const THREE = this.THREE;
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(120, 64),
      new THREE.MeshStandardMaterial({ color: 0x111b2d, roughness: 1, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.departureGroup.add(ground);

    const horizon = new THREE.Mesh(
      new THREE.SphereGeometry(120, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x2455d6, emissive: 0x163a8f, emissiveIntensity: 0.6 })
    );
    horizon.position.set(140, 80, -180);
    this.departureGroup.add(horizon);

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(34, 1.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.2, roughness: 0.8 })
    );
    pad.position.set(12, 0.6, -4);
    pad.receiveShadow = true;
    this.departureGroup.add(pad);

    const lane = new THREE.Mesh(
      new THREE.BoxGeometry(120, 0.05, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12 })
    );
    lane.position.set(70, 0.08, 0);
    this.departureGroup.add(lane);

    this.addZoneFrame(this.departureGroup, this.segmentWorld.departure.cargoZone, 0xfbbf24, "Cargo Check");
    this.addZoneFrame(this.departureGroup, this.segmentWorld.departure.boardingZone, 0x67e8f9, "Board Ramp");

    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 });
    [
      [-62, 12, -26, 14, 24, 18],
      [-42, 8, -10, 18, 16, 12],
      [64, 16, 24, 20, 32, 18],
      [86, 10, -28, 14, 20, 14]
    ].forEach(([x, y, z, w, h, d]) => {
      const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildingMaterial);
      building.position.set(x, h / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.departureGroup.add(building);
    });

    for (let index = 0; index < 6; index += 1) {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.15, roughness: 0.9 })
      );
      crate.position.set(-42 + (index % 3) * 5, 2, 10 + Math.floor(index / 3) * 6);
      crate.castShadow = true;
      crate.receiveShadow = true;
      this.departureGroup.add(crate);
    }
  }

  createFlightWorld() {
    const THREE = this.THREE;

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let index = 0; index < 1100; index += 1) {
      starPositions.push(
        Math.random() * this.segmentWorld.routeLength + 20,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 240
      );
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    this.starfield = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.9, sizeAttenuation: true })
    );
    this.flightGroup.add(this.starfield);

    const routeFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(this.segmentWorld.routeLength + 240, 220),
      new THREE.MeshBasicMaterial({ color: 0x0b1424, transparent: true, opacity: 0.2 })
    );
    routeFloor.rotation.x = -Math.PI / 2;
    routeFloor.position.set(this.segmentWorld.routeLength / 2, -5, 0);
    this.flightGroup.add(routeFloor);

    this.segment.planets.forEach((planet) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(8, planet.radius * 0.08), 28, 28),
        new THREE.MeshStandardMaterial({
          color: hexFromCss(planet.midColor),
          emissive: hexFromCss(planet.darkColor),
          emissiveIntensity: 0.45
        })
      );
      mesh.position.set(planet.worldX * this.routeScale, 50 + planet.radius * 0.05, this.toRouteZ(planet.worldY) * 1.4);
      this.flightGroup.add(mesh);
      this.planets.push({ mesh });
    });

    this.segment.debrisFields.forEach((field) => {
      for (let index = 0; index < field.count; index += 1) {
        const t = field.count === 1 ? 0.5 : index / (field.count - 1);
        const x = (field.startX + (field.endX - field.startX) * t + this.offsetNoise(index + field.startX, 160)) * this.routeScale;
        const z = this.toRouteZ(field.top + (field.bottom - field.top) * this.normalizedNoise(index + field.endX, 0.65));
        const radius = 2.8 + this.normalizedNoise(index + field.endX, 0.82) * 2.6;
        const mesh = new THREE.Mesh(
          new THREE.IcosahedronGeometry(radius, 0),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 1, metalness: 0.05 })
        );
        mesh.position.set(x, (this.normalizedNoise(index + 91, 0.19) - 0.5) * 10, z);
        mesh.rotation.set(index * 0.2, index * 0.1, index * 0.3);
        this.flightGroup.add(mesh);
        this.objects.push({ kind: "debris", mesh, radius, x, z, y: mesh.position.y, spin: 0.25 + index * 0.001 });
      }
    });

    this.segment.movingAsteroids.forEach((asteroid, index) => {
      const radius = asteroid.radius * 0.16;
      const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(radius, 0),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95, metalness: 0.04 })
      );
      const x = asteroid.worldX * this.routeScale;
      const z = this.toRouteZ(asteroid.worldY);
      mesh.position.set(x, 0, z);
      this.flightGroup.add(mesh);
      this.objects.push({
        kind: "asteroid",
        mesh,
        radius,
        x,
        z,
        y: 0,
        minZ: this.toRouteZ(asteroid.maxY),
        maxZ: this.toRouteZ(asteroid.minY),
        velocityZ: -asteroid.velocityY * 0.02,
        spin: asteroid.spin
      });
    });

    this.segment.gravityZones.forEach((zone) => {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(zone.radius * 0.16, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.08 })
      );
      sphere.position.set(zone.worldX * this.routeScale, 0, this.toRouteZ(zone.worldY));
      this.flightGroup.add(sphere);
      this.gravityZones.push({
        x: sphere.position.x,
        z: sphere.position.z,
        radius: zone.radius * 0.16,
        strength: zone.strength * 0.02,
        fuelPenalty: zone.fuelPenalty,
        mesh: sphere,
        label: zone.label
      });
    });

    this.segment.ionZones.forEach((zone) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(zone.width * 0.18, 14, zone.height * 0.12),
        new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.12 })
      );
      mesh.position.set(zone.worldX * this.routeScale, 0, this.toRouteZ(zone.worldY));
      this.flightGroup.add(mesh);
      this.ionZones.push({
        x: mesh.position.x,
        z: mesh.position.z,
        width: zone.width * 0.18,
        depth: zone.height * 0.12,
        fuelPenalty: zone.fuelPenalty,
        controlPenalty: zone.controlPenalty,
        label: zone.label,
        mesh
      });
    });

    this.station = this.createStationObject();
    this.flightGroup.add(this.station.mesh);

    this.gate = this.createGateObject();
    this.flightGroup.add(this.gate.mesh);

    if (this.segmentWorld.wormhole) {
      this.wormhole = this.createWormholeObject();
      this.flightGroup.add(this.wormhole.mesh);
    }
  }

  createArrivalWorld() {
    const THREE = this.THREE;
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(120, 64),
      new THREE.MeshStandardMaterial({ color: 0x101826, roughness: 1, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    this.arrivalGroup.add(ground);

    const office = new THREE.Mesh(
      new THREE.BoxGeometry(16, 10, 14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92 })
    );
    office.position.set(30, 5, 4);
    office.castShadow = true;
    office.receiveShadow = true;
    this.arrivalGroup.add(office);

    const hangar = new THREE.Mesh(
      new THREE.BoxGeometry(28, 5, 18),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.95 })
    );
    hangar.position.set(12, 2.5, -12);
    hangar.castShadow = true;
    hangar.receiveShadow = true;
    this.arrivalGroup.add(hangar);

    this.addZoneFrame(this.arrivalGroup, this.segmentWorld.arrival.deliveryZone, 0x34d399, "Delivery");
  }

  createStationObject() {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const station = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.station.bodyRadius, 1.5, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0f766e, emissiveIntensity: 0.35 })
    );
    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(this.segmentWorld.station.bodyRadius * 0.5, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x0ea5e9, emissiveIntensity: 0.2 })
    );
    group.add(station, hub);
    group.position.set(this.segmentWorld.station.x, 0, this.segmentWorld.station.z);
    return {
      ...this.segmentWorld.station,
      mesh: group
    };
  }

  createGateObject() {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x2563eb, emissiveIntensity: 0.25 });
    const left = new THREE.Mesh(new THREE.BoxGeometry(2.5, this.segmentWorld.gate.height, 2.5), mat);
    const right = left.clone();
    const top = new THREE.Mesh(new THREE.BoxGeometry(this.segmentWorld.gate.width, 2.5, 2.5), mat);
    left.position.x = -this.segmentWorld.gate.width / 2;
    right.position.x = this.segmentWorld.gate.width / 2;
    top.position.y = this.segmentWorld.gate.height / 2;
    group.add(left, right, top);
    group.position.set(this.segmentWorld.gate.x, this.segmentWorld.gate.height / 2, this.segmentWorld.gate.z);
    return { ...this.segmentWorld.gate, mesh: group };
  }

  createWormholeObject() {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.wormhole.radius, 2.2, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0x7e22ce, emissiveIntensity: 0.9 })
    );
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(this.segmentWorld.wormhole.radius * 0.72, this.segmentWorld.wormhole.radius * 0.72, 1.2, 36),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.35 })
    );
    core.rotation.z = Math.PI / 2;
    group.add(ring, core);
    group.position.set(this.segmentWorld.wormhole.x, 8, this.segmentWorld.wormhole.z);
    return { ...this.segmentWorld.wormhole, mesh: group };
  }

  addZoneFrame(group, zone, color, label) {
    const THREE = this.THREE;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(zone.maxX - zone.minX, 0.2, zone.maxZ - zone.minZ),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16 })
    );
    frame.position.set((zone.minX + zone.maxX) / 2, 0.12, (zone.minZ + zone.maxZ) / 2);
    group.add(frame);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(zone.maxX - zone.minX, 1.2, zone.maxZ - zone.minZ)),
      new THREE.LineBasicMaterial({ color })
    );
    edges.position.set(frame.position.x, 0.6, frame.position.z);
    group.add(edges);

    const labelSprite = this.createLabelSprite(label, color);
    labelSprite.position.set(frame.position.x, 4, zone.minZ - 2);
    group.add(labelSprite);
  }

  createLabelSprite(text, color) {
    const THREE = this.THREE;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "24px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, 42);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, color });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(18, 4.5, 1);
    return sprite;
  }

  update(deltaTime, routeProgress, state) {
    this.objects.forEach((object, index) => {
      object.mesh.rotation.x += deltaTime * 0.35;
      object.mesh.rotation.y += deltaTime * (object.spin ?? 0.4);
      if (object.kind === "asteroid") {
        object.z += object.velocityZ * deltaTime;
        if (object.z < object.minZ || object.z > object.maxZ) {
          object.velocityZ *= -1;
          object.z = clamp(object.z, Math.min(object.minZ, object.maxZ), Math.max(object.minZ, object.maxZ));
        }
        object.mesh.position.z = object.z;
      } else {
        object.mesh.position.y = Math.sin(state.time * 0.8 + index) * 0.6;
      }
    });

    this.gravityZones.forEach((zone) => {
      zone.mesh.material.opacity = 0.05 + Math.sin(state.time * 1.4 + zone.x * 0.01) * 0.02;
    });

    if (this.wormhole) {
      this.wormhole.mesh.rotation.x += deltaTime * 0.7;
      this.wormhole.mesh.rotation.z += deltaTime * 1.1;
      this.wormhole.mesh.visible = !state.wormholeUsed;
    }

    if (this.station?.mesh) {
      this.station.mesh.rotation.y += deltaTime * 0.2;
    }
  }

  setMode(mode) {
    this.departureGroup.visible = mode === "preview" || mode === "boarding" || mode === "launch";
    this.flightGroup.visible = mode === "flight" || mode === "wormhole";
    this.arrivalGroup.visible = mode === "arrival";
  }

  getCargoCheckpointInfo(character) {
    return this.getZoneInfo(character.position, this.segmentWorld.departure.cargoZone);
  }

  getBoardingInfo(character) {
    return this.getZoneInfo(character.position, this.segmentWorld.departure.boardingZone);
  }

  getArrivalInfo(character) {
    return this.getZoneInfo(character.position, this.segmentWorld.arrival.deliveryZone);
  }

  getDepartureForce(ship, progress = 0) {
    return {
      x: this.segmentWorld.departure.gravity.x * (1 - progress * 0.4),
      y: this.segmentWorld.departure.gravity.y * (1 - progress * 0.55),
      z: -ship.position.z * 0.22
    };
  }

  getSolidCollision(ship) {
    return this.objects.find((object) => {
      const dx = object.mesh.position.x - ship.position.x;
      const dy = object.mesh.position.y - ship.position.y;
      const dz = object.mesh.position.z - ship.position.z;
      return Math.hypot(dx, dy, dz) < object.radius + ship.collisionRadius;
    }) ?? null;
  }

  getDockingInfo(ship) {
    const dx = Math.abs(ship.position.x - this.station.x);
    const dz = Math.abs(ship.position.z - this.station.z);
    const inZone = dx <= this.station.zoneDepth / 2 && dz <= this.station.zoneHeight / 2;
    const alignment = Math.max(0, 1 - dz / Math.max(this.station.zoneHeight / 2, 1));
    return { inZone, alignment };
  }

  getGateInfo(ship) {
    const dx = Math.abs(ship.position.x - this.gate.x);
    const dz = Math.abs(ship.position.z - this.gate.z);
    return {
      inZone: dx <= this.gate.width / 2 && dz <= this.gate.width * 0.45
    };
  }

  getGravityInfluence(ship, resistance) {
    for (const zone of this.gravityZones) {
      const dx = zone.x - ship.position.x;
      const dz = zone.z - ship.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > zone.radius) {
        continue;
      }
      const pullFactor = 1 - distance / zone.radius;
      const resistanceFactor = Math.max(0.35, 1 - resistance * 0.1);
      const scale = zone.strength * pullFactor * resistanceFactor;
      return {
        active: true,
        force: {
          x: dx / Math.max(distance, 1) * scale,
          y: 0,
          z: dz / Math.max(distance, 1) * scale
        },
        fuelPenalty: zone.fuelPenalty * pullFactor * resistanceFactor
      };
    }
    return { active: false, force: { x: 0, y: 0, z: 0 }, fuelPenalty: 0 };
  }

  getIonStormEffect(ship, resistance) {
    for (const zone of this.ionZones) {
      const dx = Math.abs(zone.x - ship.position.x);
      const dz = Math.abs(zone.z - ship.position.z);
      if (dx <= zone.width / 2 && dz <= zone.depth / 2) {
        const resistanceFactor = Math.max(0.45, 1 - resistance * 0.08);
        return {
          active: true,
          fuelPenalty: zone.fuelPenalty * resistanceFactor,
          controlPenalty: zone.controlPenalty * resistanceFactor
        };
      }
    }
    return { active: false, fuelPenalty: 0, controlPenalty: 0 };
  }

  getWormholeInfo(ship, used) {
    if (!this.wormhole || used) {
      return { available: false, inZone: false, alignment: 0 };
    }
    const dx = Math.abs(this.wormhole.x - ship.position.x);
    const dz = Math.abs(this.wormhole.z - ship.position.z);
    return {
      available: true,
      inZone: dx <= this.wormhole.captureDepth / 2 && dz <= this.wormhole.captureHeight / 2,
      alignment: Math.max(0, 1 - dz / Math.max(this.wormhole.captureHeight / 2, 1))
    };
  }

  getRouteLength() {
    return this.segmentWorld.routeLength;
  }

  getDepartureWorld() {
    return this.segmentWorld.departure;
  }

  getArrivalWorld() {
    return this.segmentWorld.arrival;
  }

  getZoneInfo(position, zone) {
    return {
      inZone:
        position.x >= zone.minX &&
        position.x <= zone.maxX &&
        position.z >= zone.minZ &&
        position.z <= zone.maxZ
    };
  }

  toRouteZ(worldY) {
    return (360 - worldY) * this.depthScale;
  }

  normalizedNoise(seed, salt) {
    const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  offsetNoise(seed, range) {
    return (this.normalizedNoise(seed, 0.41) - 0.5) * range;
  }
}

function hexFromCss(value) {
  return Number.parseInt(value.replace("#", "0x"), 16);
}
