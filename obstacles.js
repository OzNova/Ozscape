const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class ObstacleManager {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;

    this.root = new THREE.Group();
    this.departureGroup = new THREE.Group();
    this.flightGroup = new THREE.Group();
    this.arrivalGroup = new THREE.Group();
    this.root.add(this.departureGroup, this.flightGroup, this.arrivalGroup);
    this.scene.add(this.root);

    this.routeScale = 0.2;
    this.depthScale = 0.18;

    this.objects = [];
    this.gravityZones = [];
    this.ionZones = [];
    this.planets = [];
    this.station = null;
    this.gate = null;
    this.wormhole = null;
    this.navigationBeacons = {};
    this.segment = null;
    this.segmentWorld = null;
  }

  clearGroup(group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      this.disposeNode(child);
    }
  }

  disposeNode(node) {
    node.traverse?.((child) => {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose?.());
      } else {
        child.material?.dispose?.();
      }
      child.material?.map?.dispose?.();
    });
  }

  loadSegment(segmentConfig) {
    this.segment = segmentConfig;
    this.segmentWorld = this.createSegmentWorld(segmentConfig);
    this.objects = [];
    this.gravityZones = [];
    this.ionZones = [];
    this.planets = [];
    this.station = null;
    this.gate = null;
    this.wormhole = null;
    this.navigationBeacons = {};

    this.clearGroup(this.departureGroup);
    this.clearGroup(this.flightGroup);
    this.clearGroup(this.arrivalGroup);

    this.createDepartureWorld();
    this.createFlightWorld();
    this.createArrivalWorld();
    this.setMode("preview");
  }

  createSegmentWorld(segment) {
    const departure = {
      portLabel: segment.departure.portLabel,
      planetLabel: segment.departure.planetLabel,
      characterSpawn: new this.THREE.Vector3(-22, 1.2, 18),
      shipSpawn: new this.THREE.Vector3(18, 3.8, -4),
      cargoZone: { minX: -38, maxX: -14, minZ: 6, maxZ: 28 },
      boardingZone: { minX: 7, maxX: 26, minZ: -10, maxZ: 5 },
      departureLane: {
        startX: 18,
        clearX: 122,
        minZ: -10,
        maxZ: 10,
        targetY: 18
      }
    };

    const routeLength = segment.length * this.routeScale;
    const stationX = segment.station.worldX * this.routeScale;
    const gateX = segment.gate.worldX * this.routeScale;
    const wormhole = segment.wormhole
      ? {
          x: segment.wormhole.worldX * this.routeScale,
          z: this.toRouteZ(segment.wormhole.worldY),
          radius: segment.wormhole.radius * 0.17,
          captureDepth: segment.wormhole.captureWidth * 0.12,
          captureHeight: segment.wormhole.captureHeight * 0.08,
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
        bodyRadius: segment.station.bodyRadius * 0.18,
        zoneDepth: segment.station.zoneWidth * 0.12,
        zoneHeight: segment.station.zoneHeight * 0.1
      },
      gate: {
        x: gateX,
        z: this.toRouteZ(segment.gate.worldY),
        width: segment.gate.width * 0.16,
        height: segment.gate.height * 0.08
      },
      wormhole,
      arrival: {
        characterSpawn: new this.THREE.Vector3(-18, 1.2, 12),
        shipSpawn: new this.THREE.Vector3(10, 3.8, -14),
        deliveryZone: { minX: 24, maxX: 38, minZ: -2, maxZ: 12 }
      }
    };
  }

  createDepartureWorld() {
    const THREE = this.THREE;

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(190, 72),
      new THREE.MeshStandardMaterial({ color: 0x0c1322, roughness: 1, metalness: 0.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.departureGroup.add(ground);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(120, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.85,
        roughness: 1
      })
    );
    planet.position.set(170, 90, -185);
    this.departureGroup.add(planet);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(126, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.12 })
    );
    atmosphere.position.copy(planet.position);
    this.departureGroup.add(atmosphere);

    const haze = new THREE.Mesh(
      new THREE.CircleGeometry(180, 48),
      new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.09 })
    );
    haze.rotation.x = -Math.PI / 2;
    haze.position.set(30, 0.2, 0);
    this.departureGroup.add(haze);

    const horizon = new THREE.Mesh(
      new THREE.CylinderGeometry(160, 180, 10, 48, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x14233d, roughness: 1, metalness: 0.05 })
    );
    horizon.position.set(10, -4, 0);
    this.departureGroup.add(horizon);

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(54, 1.5, 26),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9, metalness: 0.1 })
    );
    pad.position.set(10, 0.8, -2);
    pad.receiveShadow = true;
    this.departureGroup.add(pad);

    const runway = new THREE.Mesh(
      new THREE.BoxGeometry(130, 0.08, 20),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.14 })
    );
    runway.position.set(76, 0.12, 0);
    this.departureGroup.add(runway);

    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.4, 5),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
    );
    ramp.rotation.z = -0.2;
    ramp.position.set(11.5, 1.6, -1.5);
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    this.departureGroup.add(ramp);

    this.addZoneFrame(this.departureGroup, this.segmentWorld.departure.cargoZone, 0xfbbf24, "Cargo");
    this.addZoneFrame(this.departureGroup, this.segmentWorld.departure.boardingZone, 0x67e8f9, "Ramp");
    this.addDepartureRouteGuides();

    this.createPortStructures();
    this.createPadLights();

    const railMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    for (let index = 0; index < 6; index += 1) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.22, 0.22), railMaterial);
      rail.position.set(-24 + index * 18, 0.5, -14);
      this.departureGroup.add(rail);
      const oppositeRail = rail.clone();
      oppositeRail.position.z = 14;
      this.departureGroup.add(oppositeRail);
    }

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(12, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x082f49, emissiveIntensity: 0.2, transparent: true, opacity: 0.94 })
    );
    dome.position.set(-54, 0, 20);
    this.departureGroup.add(dome);
  }

  createPortStructures() {
    const THREE = this.THREE;
    const structureMaterial = new THREE.MeshStandardMaterial({ color: 0x162033, roughness: 0.94 });
    const glowMaterial = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x22d3ee, emissiveIntensity: 0.6 });

    [
      [-56, 10, -22, 18, 20, 20],
      [-36, 8, -4, 18, 16, 12],
      [56, 14, 18, 24, 28, 18],
      [86, 7, -24, 18, 14, 14]
    ].forEach(([x, y, z, w, h, d]) => {
      const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), structureMaterial);
      building.position.set(x, h / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.departureGroup.add(building);
    });

    for (let index = 0; index < 9; index += 1) {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 3.2, 3.2),
        new THREE.MeshStandardMaterial({ color: index % 2 === 0 ? 0x334155 : 0x475569, roughness: 0.9 })
      );
      crate.position.set(-32 + (index % 3) * 4.2, 1.7, 11 + Math.floor(index / 3) * 4.2);
      crate.castShadow = true;
      crate.receiveShadow = true;
      this.departureGroup.add(crate);
    }

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.8, 18, 10), structureMaterial);
    tower.position.set(30, 9, -18);
    tower.castShadow = true;
    this.departureGroup.add(tower);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), glowMaterial);
    beacon.position.set(30, 18.5, -18);
    this.departureGroup.add(beacon);
  }

  addDepartureRouteGuides() {
    const THREE = this.THREE;
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.18 });
    const routeGuides = [
      { x: -20, z: 18, width: 26, depth: 2.8, color: 0xfbbf24 },
      { x: -2, z: 14, width: 20, depth: 2.2, color: 0xfbbf24 },
      { x: 10, z: 4, width: 18, depth: 2, color: 0x67e8f9 },
      { x: 24, z: 2, width: 18, depth: 1.6, color: 0x67e8f9 },
      { x: 46, z: 0, width: 32, depth: 1.2, color: 0x38bdf8 },
      { x: 78, z: 0, width: 34, depth: 1.2, color: 0x38bdf8 },
      { x: 110, z: 0, width: 28, depth: 1.2, color: 0x38bdf8 }
    ];

    routeGuides.forEach((guide) => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(guide.width, 0.04, guide.depth),
        new THREE.MeshBasicMaterial({ color: guide.color, transparent: true, opacity: 0.24 })
      );
      strip.position.set(guide.x, 0.13, guide.z);
      this.departureGroup.add(strip);
    });

    for (let index = 0; index < 7; index += 1) {
      const guideLight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.18, 10),
        lineMaterial
      );
      guideLight.position.set(-30 + index * 12, 0.22, 16 - index * 2.2);
      this.departureGroup.add(guideLight);
    }
  }

  createPadLights() {
    const THREE = this.THREE;
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const positions = [
      [-12, 0.3, -10],
      [0, 0.3, -10],
      [12, 0.3, -10],
      [-12, 0.3, 10],
      [0, 0.3, 10],
      [12, 0.3, 10],
      [36, 0.3, 0],
      [56, 0.3, 0],
      [76, 0.3, 0]
    ];

    positions.forEach(([x, y, z]) => {
      const light = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 10), glowMaterial);
      light.position.set(x, y, z);
      this.departureGroup.add(light);
    });
  }

  createFlightWorld() {
    const THREE = this.THREE;

    const starGeometryNear = new THREE.BufferGeometry();
    const starPositionsNear = [];
    for (let index = 0; index < 1600; index += 1) {
      starPositionsNear.push(
        Math.random() * (this.segmentWorld.routeLength + 400),
        (Math.random() - 0.5) * 260,
        (Math.random() - 0.5) * 240
      );
    }
    starGeometryNear.setAttribute("position", new THREE.Float32BufferAttribute(starPositionsNear, 3));
    this.flightGroup.add(
      new THREE.Points(
        starGeometryNear,
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, sizeAttenuation: true })
      )
    );

    const starGeometryFar = new THREE.BufferGeometry();
    const starPositionsFar = [];
    for (let index = 0; index < 1900; index += 1) {
      starPositionsFar.push(
        Math.random() * (this.segmentWorld.routeLength + 400),
        (Math.random() - 0.5) * 640,
        (Math.random() - 0.5) * 620
      );
    }
    starGeometryFar.setAttribute("position", new THREE.Float32BufferAttribute(starPositionsFar, 3));
    this.flightGroup.add(
      new THREE.Points(
        starGeometryFar,
        new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.86, sizeAttenuation: true, transparent: true, opacity: 0.84 })
      )
    );

    const nebula = new THREE.Mesh(
      new THREE.SphereGeometry(140, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.06 })
    );
    nebula.position.set(this.segmentWorld.routeLength * 0.38, 90, -120);
    this.flightGroup.add(nebula);

    const nebula2 = new THREE.Mesh(
      new THREE.SphereGeometry(110, 28, 28),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.05 })
    );
    nebula2.position.set(this.segmentWorld.routeLength * 0.72, -60, 130);
    this.flightGroup.add(nebula2);

    this.segment.planets.forEach((planet, index) => {
      const radius = Math.max(12, planet.radius * 0.1);
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 36, 36),
        new THREE.MeshStandardMaterial({
          color: hexFromCss(planet.midColor),
          emissive: hexFromCss(planet.darkColor),
          emissiveIntensity: 0.5,
          roughness: 0.85
        })
      );
      sphere.position.set(
        planet.worldX * this.routeScale,
        52 + radius * 0.25 + index * 8,
        this.toRouteZ(planet.worldY) * 1.55
      );
      this.flightGroup.add(sphere);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.08, 32, 32),
        new THREE.MeshBasicMaterial({ color: hexFromCss(planet.midColor), transparent: true, opacity: 0.08 })
      );
      glow.position.copy(sphere.position);
      this.flightGroup.add(glow);
      this.planets.push({ mesh: sphere, glow });
    });

    this.segment.debrisFields.forEach((field) => {
      for (let index = 0; index < field.count; index += 1) {
        const t = field.count === 1 ? 0.5 : index / (field.count - 1);
        const x = (field.startX + (field.endX - field.startX) * t + this.offsetNoise(index + field.startX, 180)) * this.routeScale;
        const z = this.toRouteZ(field.top + (field.bottom - field.top) * this.normalizedNoise(index + field.endX, 0.65));
        const radius = 1.9 + this.normalizedNoise(index + field.endX, 0.82) * 2.6;
        const mesh = new THREE.Mesh(
          new THREE.IcosahedronGeometry(radius, 0),
          new THREE.MeshStandardMaterial({ color: 0x9aa8bc, roughness: 0.98, metalness: 0.06 })
        );
        mesh.position.set(x, (this.normalizedNoise(index + 91, 0.19) - 0.5) * 12, z);
        mesh.rotation.set(index * 0.2, index * 0.1, index * 0.3);
        this.flightGroup.add(mesh);
        this.objects.push({ kind: "debris", mesh, radius, z, spin: 0.25 + index * 0.003 });
      }
    });

    this.segment.movingAsteroids.forEach((asteroid) => {
      const radius = asteroid.radius * 0.135;
      const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(radius, 0),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95, metalness: 0.06 })
      );
      const x = asteroid.worldX * this.routeScale;
      const z = this.toRouteZ(asteroid.worldY);
      mesh.position.set(x, (this.normalizedNoise(asteroid.worldX, 0.4) - 0.5) * 8, z);
      this.flightGroup.add(mesh);
      this.objects.push({
        kind: "asteroid",
        mesh,
        radius,
        x,
        z,
        minZ: this.toRouteZ(asteroid.maxY),
        maxZ: this.toRouteZ(asteroid.minY),
        velocityZ: -asteroid.velocityY * 0.022,
        spin: asteroid.spin
      });
    });

    this.segment.gravityZones.forEach((zone) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(zone.radius * 0.17, 30, 30),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.1 })
      );
      mesh.position.set(zone.worldX * this.routeScale, 0, this.toRouteZ(zone.worldY));
      this.flightGroup.add(mesh);
      this.gravityZones.push({
        x: mesh.position.x,
        z: mesh.position.z,
        radius: zone.radius * 0.17,
        strength: zone.strength * 0.018,
        fuelPenalty: zone.fuelPenalty,
        mesh,
        label: zone.label
      });
    });

    this.segment.ionZones.forEach((zone) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(zone.width * 0.18, 18, zone.height * 0.12),
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
        mesh
      });
    });

    this.station = this.createStationObject();
    this.flightGroup.add(this.station.mesh);
    this.navigationBeacons.station = this.createNavigationBeacon("Station", 0x38bdf8, 26);
    this.navigationBeacons.station.position.set(this.station.x, 18, this.station.z);
    this.flightGroup.add(this.navigationBeacons.station);

    this.gate = this.createGateObject();
    this.flightGroup.add(this.gate.mesh);
    this.navigationBeacons.gate = this.createNavigationBeacon("Gate", 0x4ade80, 28);
    this.navigationBeacons.gate.position.set(this.gate.x, 22, this.gate.z);
    this.flightGroup.add(this.navigationBeacons.gate);

    if (this.segmentWorld.wormhole) {
      this.wormhole = this.createWormholeObject();
      this.flightGroup.add(this.wormhole.mesh);
      this.navigationBeacons.wormhole = this.createNavigationBeacon("Wormhole", 0xf472b6, 26);
      this.navigationBeacons.wormhole.position.set(this.wormhole.x, 20, this.wormhole.z);
      this.flightGroup.add(this.navigationBeacons.wormhole);
    }
  }

  createArrivalWorld() {
    const THREE = this.THREE;

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(130, 72),
      new THREE.MeshStandardMaterial({ color: 0x0c1322, roughness: 1, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.arrivalGroup.add(ground);

    const port = new THREE.Mesh(
      new THREE.BoxGeometry(36, 1.4, 22),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
    );
    port.position.set(10, 0.7, -8);
    port.receiveShadow = true;
    this.arrivalGroup.add(port);

    const office = new THREE.Mesh(
      new THREE.BoxGeometry(16, 10, 14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92 })
    );
    office.position.set(30, 5, 4);
    office.castShadow = true;
    office.receiveShadow = true;
    this.arrivalGroup.add(office);

    const officeLight = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.2, 6.4),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    officeLight.position.set(30, 5, 7.1);
    this.arrivalGroup.add(officeLight);

    const street = new THREE.Mesh(
      new THREE.BoxGeometry(58, 0.05, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.08 })
    );
    street.position.set(6, 0.08, 2);
    this.arrivalGroup.add(street);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(110, 42, 42),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x1e3a8a, emissiveIntensity: 0.7 })
    );
    planet.position.set(-150, 70, -210);
    this.arrivalGroup.add(planet);

    this.addZoneFrame(this.arrivalGroup, this.segmentWorld.arrival.deliveryZone, 0x34d399, "Deliver");
  }

  createStationObject() {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.station.bodyRadius, 2.2, 14, 42),
      new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x0f766e, emissiveIntensity: 0.36 })
    );
    ring.rotation.x = 0.4;

    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(this.segmentWorld.station.bodyRadius * 0.46, 22, 22),
      new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x0ea5e9, emissiveIntensity: 0.28 })
    );

    const dock = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.4, 10),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 })
    );
    dock.position.set(this.segmentWorld.station.zoneDepth / 2 - 4, 0, 0);

    const armGeometry = new THREE.BoxGeometry(1.2, 12, 1.2);
    const armLeft = new THREE.Mesh(armGeometry, new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.84 }));
    armLeft.position.set(-this.segmentWorld.station.bodyRadius * 0.9, 0, -this.segmentWorld.station.bodyRadius * 0.8);
    const armRight = armLeft.clone();
    armRight.position.z = this.segmentWorld.station.bodyRadius * 0.8;

    group.add(ring, hub, dock, armLeft, armRight);
    group.position.set(this.segmentWorld.station.x, 0, this.segmentWorld.station.z);

    return { ...this.segmentWorld.station, mesh: group };
  }

  createGateObject() {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0x2563eb,
      emissiveIntensity: 0.45
    });
    const pillarGeometry = new THREE.BoxGeometry(3.2, this.segmentWorld.gate.height, 3.2);
    const left = new THREE.Mesh(pillarGeometry, material);
    const right = new THREE.Mesh(pillarGeometry, material);
    const top = new THREE.Mesh(new THREE.BoxGeometry(this.segmentWorld.gate.width, 3.4, 3.4), material);
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

    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.wormhole.radius, 2.6, 24, 64),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0x7e22ce, emissiveIntensity: 1 })
    );
    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.wormhole.radius * 0.66, 1.1, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 1.2 })
    );
    inner.rotation.x = Math.PI / 2;

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(this.segmentWorld.wormhole.radius * 0.68, this.segmentWorld.wormhole.radius * 0.68, 1.6, 36),
      new THREE.MeshBasicMaterial({ color: 0xd8b4fe, transparent: true, opacity: 0.3 })
    );
    core.rotation.z = Math.PI / 2;

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.wormhole.radius * 1.18, 1.2, 12, 42),
      new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0.22 })
    );
    halo.rotation.y = Math.PI / 2;

    group.add(outer, inner, core, halo);
    group.position.set(this.segmentWorld.wormhole.x, 6, this.segmentWorld.wormhole.z);

    return { ...this.segmentWorld.wormhole, mesh: group };
  }

  createNavigationBeacon(label, color, height) {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.7, height, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 })
    );
    beam.position.y = height / 2;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.22, 8, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.2;
    const sprite = this.createLabelSprite(label, color);
    sprite.position.y = height + 3.8;
    group.add(beam, ring, sprite);
    return group;
  }

  addZoneFrame(group, zone, color, label) {
    const THREE = this.THREE;
    const width = zone.maxX - zone.minX;
    const depth = zone.maxZ - zone.minZ;

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.06, depth),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14 })
    );
    floor.position.set((zone.minX + zone.maxX) / 2, 0.12, (zone.minZ + zone.maxZ) / 2);
    group.add(floor);

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 1, depth)),
      new THREE.LineBasicMaterial({ color })
    );
    frame.position.set(floor.position.x, 0.5, floor.position.z);
    group.add(frame);

    const sprite = this.createLabelSprite(label, color);
    sprite.position.set(floor.position.x, 4.5, zone.minZ - 2);
    group.add(sprite);
  }

  createLabelSprite(text, color) {
    const THREE = this.THREE;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 72;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#e2e8f0";
    context.font = "bold 28px Trebuchet MS";
    context.textAlign = "center";
    context.fillText(text, canvas.width / 2, 46);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, color });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(14, 4, 1);
    return sprite;
  }

  update(deltaTime, routeProgress, state) {
    this.objects.forEach((object, index) => {
      object.mesh.rotation.x += deltaTime * 0.25;
      object.mesh.rotation.y += deltaTime * (object.spin ?? 0.4);
      if (object.kind === "asteroid") {
        object.z += object.velocityZ * deltaTime;
        if (object.z < object.minZ || object.z > object.maxZ) {
          object.velocityZ *= -1;
          object.z = clamp(object.z, Math.min(object.minZ, object.maxZ), Math.max(object.minZ, object.maxZ));
        }
        object.mesh.position.z = object.z;
      } else {
        object.mesh.position.y = Math.sin(state.time * 0.9 + index) * 0.8;
      }
    });

    this.gravityZones.forEach((zone, index) => {
      zone.mesh.material.opacity = 0.07 + Math.sin(state.time * 1.3 + index) * 0.02;
    });

    this.ionZones.forEach((zone, index) => {
      zone.mesh.material.opacity = 0.08 + Math.sin(state.time * 1.6 + index) * 0.03;
    });

    if (this.station) {
      this.station.mesh.rotation.y += deltaTime * 0.18;
    }

    if (this.wormhole) {
      this.wormhole.mesh.rotation.x += deltaTime * 0.65;
      this.wormhole.mesh.rotation.z += deltaTime * 1.1;
      this.wormhole.mesh.visible = !state.wormholeUsed;
    }

    Object.values(this.navigationBeacons).forEach((beacon, index) => {
      if (!beacon) {
        return;
      }
      beacon.children[1].rotation.z += deltaTime * (0.45 + index * 0.08);
      beacon.children[0].material.opacity = 0.2 + Math.sin(state.time * 2 + index) * 0.06;
    });
  }

  setMode(mode) {
    this.departureGroup.visible = mode === "preview" || mode === "boarding" || mode === "launch";
    this.flightGroup.visible = mode === "flight" || mode === "wormhole" || mode === "launch";
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
    const targetY = 8 + progress * this.segmentWorld.departure.departureLane.targetY;
    return {
      force: {
        x: 18 * (1 - progress * 0.3),
        y: 8.5 * (1 - progress * 0.5),
        z: -ship.position.z * 0.38
      },
      forwardAssist: 20 * (1 - progress * 0.55),
      stabilizeZ: 0.55,
      stabilizeY: 0.42,
      targetY
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
    return {
      inZone,
      nearZone: dx <= this.station.zoneDepth * 0.85 && dz <= this.station.zoneHeight * 0.85,
      alignment
    };
  }

  getGateInfo(ship) {
    const dx = Math.abs(ship.position.x - this.gate.x);
    const dz = Math.abs(ship.position.z - this.gate.z);
    return { inZone: dx <= this.gate.width / 2 && dz <= this.gate.width * 0.38 };
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
          x: (dx / Math.max(distance, 1)) * scale,
          y: 0,
          z: (dz / Math.max(distance, 1)) * scale
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
      return { available: false, inZone: false, nearZone: false, alignment: 0 };
    }
    const dx = Math.abs(this.wormhole.x - ship.position.x);
    const dz = Math.abs(this.wormhole.z - ship.position.z);
    return {
      available: true,
      inZone: dx <= this.wormhole.captureDepth / 2 && dz <= this.wormhole.captureHeight / 2,
      nearZone: dx <= this.wormhole.captureDepth && dz <= this.wormhole.captureHeight,
      alignment: Math.max(0, 1 - dz / Math.max(this.wormhole.captureHeight / 2, 1))
    };
  }

  getRouteLength() {
    return this.segmentWorld.routeLength;
  }

  getNavigationPoints(wormholeUsed = false) {
    return {
      station: { x: this.station.x, z: this.station.z },
      gate: { x: this.gate.x, z: this.gate.z },
      wormhole: this.wormhole && !wormholeUsed ? { x: this.wormhole.x, z: this.wormhole.z } : null
    };
  }

  getRadarContacts(ship, maxDistance = 95) {
    return this.objects
      .filter((object) => {
        const dx = object.mesh.position.x - ship.position.x;
        const dz = object.mesh.position.z - ship.position.z;
        return Math.hypot(dx, dz) <= maxDistance;
      })
      .slice(0, 18)
      .map((object) => ({
        x: object.mesh.position.x,
        z: object.mesh.position.z,
        kind: object.kind
      }));
  }

  getDepartureWorld() {
    return this.segmentWorld.departure;
  }

  getArrivalWorld() {
    return this.segmentWorld.arrival;
  }

  getZoneInfo(position, zone) {
    const centerX = (zone.minX + zone.maxX) / 2;
    const centerZ = (zone.minZ + zone.maxZ) / 2;
    const dx = centerX - position.x;
    const dz = centerZ - position.z;
    const distance = Math.hypot(dx, dz);
    return {
      inZone:
        position.x >= zone.minX &&
        position.x <= zone.maxX &&
        position.z >= zone.minZ &&
        position.z <= zone.maxZ,
      nearZone: distance <= Math.max(zone.maxX - zone.minX, zone.maxZ - zone.minZ) * 0.9,
      distance
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
