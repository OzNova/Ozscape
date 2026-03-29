const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class ObstacleManager {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;

    this.root = new THREE.Group();
    this.departureGroup = new THREE.Group();
    this.flightGroup = new THREE.Group();
    this.hubGroup = new THREE.Group();
    this.arrivalGroup = new THREE.Group();
    this.root.add(this.departureGroup, this.flightGroup, this.hubGroup, this.arrivalGroup);
    this.scene.add(this.root);

    this.routeScale = 0.24;
    this.routeDistanceScale = 5.6;
    this.depthScale = 0.34;

    this.objects = [];
    this.gravityZones = [];
    this.ionZones = [];
    this.planets = [];
    this.station = null;
    this.stopovers = [];
    this.optionalTasks = [];
    this.corridorAnchors = [];
    this.routeEvents = [];
    this.gate = null;
    this.wormhole = null;
    this.navigationBeacons = {};
    this.activeHubKey = null;
    this.activeHubWorld = null;
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
    this.stopovers = [];
    this.optionalTasks = [];
    this.corridorAnchors = [];
    this.routeEvents = [];
    this.gate = null;
    this.wormhole = null;
    this.navigationBeacons = {};
    this.activeHubKey = null;
    this.activeHubWorld = null;

    this.clearGroup(this.departureGroup);
    this.clearGroup(this.flightGroup);
    this.clearGroup(this.hubGroup);
    this.clearGroup(this.arrivalGroup);

    this.createDepartureWorld();
    this.createFlightWorld();
    this.createArrivalWorld();
    this.setMode("preview");
  }

  createSegmentWorld(segment) {
    const scaleX = (value) => value * this.routeScale * this.routeDistanceScale;
    const departure = {
      portLabel: segment.departure.portLabel,
      planetLabel: segment.departure.planetLabel,
      characterSpawn: new this.THREE.Vector3(-86, 1.2, 36),
      shipSpawn: new this.THREE.Vector3(62, 4.6, -10),
      cargoZone: { minX: -128, maxX: -54, minZ: 18, maxZ: 58 },
      boardingZone: { minX: 36, maxX: 84, minZ: -22, maxZ: 10 },
      departureLane: {
        startX: 62,
        clearX: 760,
        spaceBreakX: 2100,
        minZ: -42,
        maxZ: 42,
        lowerY: 120,
        upperY: 280,
        targetY: 520
      }
    };

    const routeStartX = departure.departureLane.spaceBreakX + 420;
    const routeLength = routeStartX + scaleX(segment.length);
    const stationX = routeStartX + scaleX(segment.station.worldX);
    const gateX = routeStartX + scaleX(segment.gate.worldX);
    const wormhole = segment.wormhole
      ? {
          x: routeStartX + scaleX(segment.wormhole.worldX),
          z: this.toRouteZ(segment.wormhole.worldY),
          radius: segment.wormhole.radius * 0.24,
          captureDepth: segment.wormhole.captureWidth * 0.18,
          captureHeight: segment.wormhole.captureHeight * 0.14,
          exitProgress: routeStartX + scaleX(segment.wormhole.exitProgress),
          fuelBonus: segment.wormhole.fuelBonus,
          rewardBonus: segment.wormhole.rewardBonus,
          turbulenceDuration: segment.wormhole.turbulenceDuration
        }
      : null;

    const stopovers = (segment.stopovers ?? []).map((stopover, index) => ({
      ...stopover,
      x: routeStartX + scaleX(stopover.worldX),
      z: this.toRouteZ(stopover.worldY),
      bodyRadius: stopover.bodyRadius * 0.28,
      zoneDepth: stopover.zoneWidth * 0.22,
      zoneHeight: stopover.zoneHeight * 0.2,
      index,
      flightExitX: routeStartX + scaleX(stopover.hub.resumeX ?? stopover.worldX + 320)
    }));

    const optionalTasks = (segment.optionalTasks ?? []).map((task) => ({
      ...task,
      x: routeStartX + scaleX(task.worldX),
      z: this.toRouteZ(task.worldY),
      radius: task.radius * 0.18
    }));

    const corridorAnchors = (segment.corridorAnchors ?? [
      { worldX: 0, worldY: 360, width: 200, sector: "Freight Lane", beat: "Transfer lane", assist: 3.8 },
      { worldX: segment.length, worldY: 360, width: 200, sector: "Freight Lane", beat: "Approach", assist: 4.2 }
    ]).map((anchor) => ({
      ...anchor,
      x: routeStartX + scaleX(anchor.worldX),
      z: this.toRouteZ(anchor.worldY),
      width: Math.max(96, anchor.width * 0.72),
      assist: anchor.assist ?? 3.6
    }));

    const routeEvents = (segment.routeEvents ?? []).map((event) => ({
      ...event,
      x: routeStartX + scaleX(event.worldX),
      z: this.toRouteZ(event.worldY),
      span: Math.max(360, scaleX(event.span ?? 1800)),
      width: Math.max(90, (event.width ?? 160) * 0.7)
    }));

    return {
      departure,
      routeStartX,
      routeLength,
      station: {
        x: stationX,
        z: this.toRouteZ(segment.station.worldY),
        bodyRadius: segment.station.bodyRadius * 0.26,
        zoneDepth: segment.station.zoneWidth * 0.22,
        zoneHeight: segment.station.zoneHeight * 0.2
      },
      gate: {
        x: gateX,
        z: this.toRouteZ(segment.gate.worldY),
        width: segment.gate.width * 0.28,
        height: segment.gate.height * 0.14
      },
      stopovers,
      optionalTasks,
      corridorAnchors,
      routeEvents,
      wormhole,
      arrival: {
        title: segment.arrival?.title ?? segment.destinationLabel,
        subtitle: segment.arrival?.subtitle ?? "Delivery Office",
        optionalLabel: segment.arrival?.optionalLabel ?? "Cargo Registry",
        optionalReward: segment.arrival?.optionalReward ?? 0,
        characterSpawn: new this.THREE.Vector3(-28, 1.2, 18),
        shipSpawn: new this.THREE.Vector3(18, 3.8, -16),
        deliveryZone: { minX: 24, maxX: 44, minZ: -2, maxZ: 14 },
        optionalZone: { minX: -56, maxX: -30, minZ: -18, maxZ: 6 },
        boardZone: { minX: 10, maxX: 34, minZ: -26, maxZ: -8 }
      }
    };
  }

  createDepartureWorld() {
    const THREE = this.THREE;

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1500, 140),
      new THREE.MeshStandardMaterial({ color: 0x0b1222, roughness: 1, metalness: 0.03 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.departureGroup.add(ground);

    const star = new THREE.Mesh(
      new THREE.SphereGeometry(180, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff1b8, transparent: true, opacity: 0.96 })
    );
    star.position.set(-1600, 980, -3600);
    this.departureGroup.add(star);

    const starGlow = new THREE.Mesh(
      new THREE.SphereGeometry(320, 28, 28),
      new THREE.MeshBasicMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.14 })
    );
    starGlow.position.copy(star.position);
    this.departureGroup.add(starGlow);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(2600, 84, 84),
      new THREE.MeshStandardMaterial({
        color: 0x4878b8,
        emissive: 0x102f63,
        emissiveIntensity: 0.72,
        roughness: 1
      })
    );
    planet.position.set(1500, -2180, -3600);
    this.departureGroup.add(planet);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2740, 84, 84),
      new THREE.MeshBasicMaterial({ color: 0x8cc8ff, transparent: true, opacity: 0.18 })
    );
    atmosphere.position.copy(planet.position);
    this.departureGroup.add(atmosphere);

    const haze = new THREE.Mesh(
      new THREE.CircleGeometry(1320, 88),
      new THREE.MeshBasicMaterial({ color: 0x2b5fae, transparent: true, opacity: 0.12 })
    );
    haze.rotation.x = -Math.PI / 2;
    haze.position.set(260, 0.25, 0);
    this.departureGroup.add(haze);

    const horizon = new THREE.Mesh(
      new THREE.CylinderGeometry(1040, 1320, 96, 84, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x13233c, roughness: 1, metalness: 0.04 })
    );
    horizon.position.set(260, -46, 0);
    this.departureGroup.add(horizon);

    const terrainRidge = new THREE.Mesh(
      new THREE.BoxGeometry(1900, 96, 260),
      new THREE.MeshStandardMaterial({ color: 0x101827, roughness: 1, metalness: 0.02 })
    );
    terrainRidge.position.set(320, 8, -180);
    this.departureGroup.add(terrainRidge);

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(180, 2.2, 72),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9, metalness: 0.1 })
    );
    pad.position.set(54, 1.1, -8);
    pad.receiveShadow = true;
    this.departureGroup.add(pad);

    const runway = new THREE.Mesh(
      new THREE.BoxGeometry(2100, 0.08, 56),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15 })
    );
    runway.position.set(1000, 0.12, 0);
    this.departureGroup.add(runway);

    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.6, 10),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
    );
    ramp.rotation.z = -0.2;
    ramp.position.set(42, 2.1, -3.4);
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    this.departureGroup.add(ramp);

    this.addZoneFrame(this.departureGroup, this.segmentWorld.departure.cargoZone, 0xfbbf24, "Cargo");
    this.addZoneFrame(this.departureGroup, this.segmentWorld.departure.boardingZone, 0x67e8f9, "Ramp");
    this.addDepartureRouteGuides();

    this.createPortStructures();
    this.createPadLights();
    this.createAtmosphereBands();

    const railMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    for (let index = 0; index < 10; index += 1) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(64, 0.22, 0.22), railMaterial);
      rail.position.set(-92 + index * 68, 0.5, -30);
      this.departureGroup.add(rail);
      const oppositeRail = rail.clone();
      oppositeRail.position.z = 30;
      this.departureGroup.add(oppositeRail);
    }

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(42, 28, 28, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x082f49, emissiveIntensity: 0.2, transparent: true, opacity: 0.94 })
    );
    dome.position.set(-220, 0, 42);
    this.departureGroup.add(dome);
  }

  createPortStructures() {
    const THREE = this.THREE;
    const structureMaterial = new THREE.MeshStandardMaterial({ color: 0x162033, roughness: 0.94 });
    const glowMaterial = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x22d3ee, emissiveIntensity: 0.6 });

    [
      [-260, 24, -58, 64, 48, 46],
      [-150, 18, -14, 42, 36, 28],
      [120, 30, 38, 70, 60, 40],
      [280, 16, -42, 48, 32, 30],
      [430, 20, 24, 58, 40, 32],
      [620, 26, -18, 72, 52, 38]
    ].forEach(([x, y, z, w, h, d]) => {
      const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), structureMaterial);
      building.position.set(x, h / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.departureGroup.add(building);
    });

    for (let index = 0; index < 15; index += 1) {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 6.8, 6.8),
        new THREE.MeshStandardMaterial({ color: index % 2 === 0 ? 0x334155 : 0x475569, roughness: 0.9 })
      );
      crate.position.set(-116 + (index % 5) * 10.5, 3.5, 22 + Math.floor(index / 5) * 10.5);
      crate.castShadow = true;
      crate.receiveShadow = true;
      this.departureGroup.add(crate);
    }

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 5.2, 74, 12), structureMaterial);
    tower.position.set(104, 37, -42);
    tower.castShadow = true;
    this.departureGroup.add(tower);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 12), glowMaterial);
    beacon.position.set(104, 74, -42);
    this.departureGroup.add(beacon);
  }

  addDepartureRouteGuides() {
    const THREE = this.THREE;
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.18 });
    const routeGuides = [
      { x: -98, z: 36, width: 58, depth: 6.8, color: 0xfbbf24 },
      { x: -28, z: 24, width: 54, depth: 5.6, color: 0xfbbf24 },
      { x: 46, z: 10, width: 42, depth: 4.4, color: 0x67e8f9 },
      { x: 122, z: 4, width: 40, depth: 4, color: 0x67e8f9 },
      { x: 320, z: 0, width: 170, depth: 2.6, color: 0x38bdf8 },
      { x: 760, z: 0, width: 240, depth: 2.4, color: 0x38bdf8 },
      { x: 1340, z: 0, width: 320, depth: 2.4, color: 0x38bdf8 },
      { x: 1840, z: 0, width: 280, depth: 2.2, color: 0x38bdf8 }
    ];

    routeGuides.forEach((guide) => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(guide.width, 0.04, guide.depth),
        new THREE.MeshBasicMaterial({ color: guide.color, transparent: true, opacity: 0.24 })
      );
      strip.position.set(guide.x, 0.13, guide.z);
      this.departureGroup.add(strip);
    });

    for (let index = 0; index < 12; index += 1) {
      const guideLight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.18, 10),
        lineMaterial
      );
      guideLight.position.set(-120 + index * 170, 0.22, 32 - Math.min(index, 6) * 4);
      this.departureGroup.add(guideLight);
    }
  }

  createAtmosphereBands() {
    const THREE = this.THREE;
    const bandSpecs = [
      { x: 240, y: 24, z: 0, w: 320, h: 18, d: 120, opacity: 0.14, color: 0xbfe2ff },
      { x: 620, y: 92, z: 0, w: 520, h: 26, d: 180, opacity: 0.12, color: 0xdbeafe },
      { x: 1080, y: 196, z: 0, w: 720, h: 34, d: 240, opacity: 0.09, color: 0xe0f2fe },
      { x: 1640, y: 324, z: 0, w: 920, h: 40, d: 320, opacity: 0.06, color: 0xe8f4ff }
    ];

    bandSpecs.forEach((band) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(band.w, band.h, band.d),
        new THREE.MeshBasicMaterial({ color: band.color, transparent: true, opacity: band.opacity })
      );
      mesh.position.set(band.x, band.y, band.z);
      this.departureGroup.add(mesh);
    });
  }

  createPadLights() {
    const THREE = this.THREE;
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const positions = [
      [-40, 0.3, -22],
      [0, 0.3, -22],
      [40, 0.3, -22],
      [-40, 0.3, 22],
      [0, 0.3, 22],
      [40, 0.3, 22],
      [120, 0.3, 0],
      [220, 0.3, 0],
      [360, 0.3, 0],
      [520, 0.3, 0],
      [760, 0.3, 0],
      [1040, 0.3, 0],
      [1380, 0.3, 0],
      [1760, 0.3, 0]
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
    for (let index = 0; index < 2800; index += 1) {
      starPositionsNear.push(
        Math.random() * (this.segmentWorld.routeLength + 2800),
        (Math.random() - 0.5) * 620,
        (Math.random() - 0.5) * 560
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
    for (let index = 0; index < 5200; index += 1) {
      starPositionsFar.push(
        Math.random() * (this.segmentWorld.routeLength + 4200),
        (Math.random() - 0.5) * 1800,
        (Math.random() - 0.5) * 1800
      );
    }
    starGeometryFar.setAttribute("position", new THREE.Float32BufferAttribute(starPositionsFar, 3));
    this.flightGroup.add(
      new THREE.Points(
        starGeometryFar,
        new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.78, sizeAttenuation: true, transparent: true, opacity: 0.82 })
      )
    );

    const starGeometryUltra = new THREE.BufferGeometry();
    const starPositionsUltra = [];
    for (let index = 0; index < 7600; index += 1) {
      starPositionsUltra.push(
        Math.random() * (this.segmentWorld.routeLength + 5200),
        (Math.random() - 0.5) * 4600,
        (Math.random() - 0.5) * 4600
      );
    }
    starGeometryUltra.setAttribute("position", new THREE.Float32BufferAttribute(starPositionsUltra, 3));
    this.flightGroup.add(
      new THREE.Points(
        starGeometryUltra,
        new THREE.PointsMaterial({ color: 0xdbeafe, size: 0.62, sizeAttenuation: true, transparent: true, opacity: 0.55 })
      )
    );

    const localStar = new THREE.Mesh(
      new THREE.SphereGeometry(150, 28, 28),
      new THREE.MeshBasicMaterial({ color: 0xfff2b5, transparent: true, opacity: 0.98 })
    );
    localStar.position.set(this.segmentWorld.routeLength * 0.92, 860, -3000);
    this.flightGroup.add(localStar);

    const localStarGlow = new THREE.Mesh(
      new THREE.SphereGeometry(280, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.12 })
    );
    localStarGlow.position.copy(localStar.position);
    this.flightGroup.add(localStarGlow);

    const nebula = new THREE.Mesh(
      new THREE.SphereGeometry(260, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.06 })
    );
    nebula.position.set(this.segmentWorld.routeLength * 0.34, 220, -620);
    this.flightGroup.add(nebula);

    const nebula2 = new THREE.Mesh(
      new THREE.SphereGeometry(220, 28, 28),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.05 })
    );
    nebula2.position.set(this.segmentWorld.routeLength * 0.76, -180, 760);
    this.flightGroup.add(nebula2);

    this.segment.planets.forEach((planet, index) => {
      const radius = Math.max(42, planet.radius * 0.28);
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
        this.segmentWorld.routeStartX + planet.worldX * this.routeScale * this.routeDistanceScale,
        180 + radius * 0.24 + index * 40,
        this.toRouteZ(planet.worldY) * 2.9
      );
      this.flightGroup.add(sphere);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.12, 32, 32),
        new THREE.MeshBasicMaterial({ color: hexFromCss(planet.midColor), transparent: true, opacity: 0.1 })
      );
      glow.position.copy(sphere.position);
      this.flightGroup.add(glow);

      if (index % 2 === 0) {
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 0.22, 20, 20),
          new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95, metalness: 0.05 })
        );
        moon.position.copy(sphere.position);
        moon.position.x += radius * 2.6;
        moon.position.y += radius * 0.35;
        moon.position.z -= radius * 1.8;
        this.flightGroup.add(moon);
      }
      this.planets.push({ mesh: sphere, glow });
    });

    this.corridorAnchors = this.segmentWorld.corridorAnchors.map((anchor) => ({ ...anchor }));
    this.routeEvents = this.segmentWorld.routeEvents.map((event) => this.createRouteEventObject(event));
    this.routeEvents.forEach((event) => {
      this.flightGroup.add(event.mesh);
    });
    this.createCorridorLaneVisuals();

    this.segment.debrisFields.forEach((field) => {
      for (let index = 0; index < field.count; index += 1) {
        const t = field.count === 1 ? 0.5 : index / (field.count - 1);
        const x =
          this.segmentWorld.routeStartX +
          (field.startX + (field.endX - field.startX) * t + this.offsetNoise(index + field.startX, 180)) *
            this.routeScale *
            this.routeDistanceScale;
        const z = this.toRouteZ(field.top + (field.bottom - field.top) * this.normalizedNoise(index + field.endX, 0.65));
        const radius = 1.15 + this.normalizedNoise(index + field.endX, 0.82) * 1.75;
        const shape = index % 3 === 0
          ? new THREE.IcosahedronGeometry(radius, 0)
          : index % 3 === 1
            ? new THREE.DodecahedronGeometry(radius, 0)
            : new THREE.OctahedronGeometry(radius, 0);
        const mesh = new THREE.Mesh(
          shape,
          new THREE.MeshStandardMaterial({
            color: index % 2 === 0 ? 0x94a3b8 : 0xb8c2cf,
            roughness: 0.98,
            metalness: 0.05
          })
        );
        mesh.position.set(x, (this.normalizedNoise(index + 91, 0.19) - 0.5) * 26, z);
        mesh.rotation.set(index * 0.2, index * 0.1, index * 0.3);
        this.flightGroup.add(mesh);
        this.objects.push({ kind: "debris", mesh, radius, z, spin: 0.25 + index * 0.003 });
      }
    });

    this.segment.movingAsteroids.forEach((asteroid) => {
      const radius = asteroid.radius * 0.105;
      const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(radius, 0),
        new THREE.MeshStandardMaterial({ color: 0xd5dee8, roughness: 0.95, metalness: 0.06 })
      );
      const x = this.segmentWorld.routeStartX + asteroid.worldX * this.routeScale * this.routeDistanceScale;
      const z = this.toRouteZ(asteroid.worldY);
      mesh.position.set(x, (this.normalizedNoise(asteroid.worldX, 0.4) - 0.5) * 20, z);
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
      mesh.position.set(this.segmentWorld.routeStartX + zone.worldX * this.routeScale * this.routeDistanceScale, 0, this.toRouteZ(zone.worldY));
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
      mesh.position.set(this.segmentWorld.routeStartX + zone.worldX * this.routeScale * this.routeDistanceScale, 0, this.toRouteZ(zone.worldY));
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

    this.stopovers = this.segmentWorld.stopovers.map((stopover, index) => {
      const object = this.createStopoverObject(stopover, index);
      this.flightGroup.add(object.mesh);
      const beacon = this.createNavigationBeacon(index === 0 ? "Refuel" : "Relay", index === 0 ? 0x38bdf8 : 0xf59e0b, 34);
      beacon.position.set(object.x, 24, object.z);
      this.flightGroup.add(beacon);
      this.navigationBeacons[`stopover-${stopover.id}`] = beacon;
      return object;
    });
    this.station = this.stopovers[0] ?? this.createStationObject();
    if (this.stopovers.length === 0) {
      this.flightGroup.add(this.station.mesh);
      this.navigationBeacons.station = this.createNavigationBeacon("Station", 0x38bdf8, 26);
      this.navigationBeacons.station.position.set(this.station.x, 18, this.station.z);
      this.flightGroup.add(this.navigationBeacons.station);
    }

    this.optionalTasks = this.segmentWorld.optionalTasks.map((task) => {
      const marker = this.createOptionalTaskMarker(task);
      this.flightGroup.add(marker.mesh);
      const beacon = this.createNavigationBeacon("Bonus", 0xfacc15, 22);
      beacon.position.set(task.x, 14, task.z);
      this.flightGroup.add(beacon);
      this.navigationBeacons[`task-${task.id}`] = beacon;
      return { ...task, mesh: marker.mesh, beacon };
    });

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
      new THREE.CircleGeometry(210, 96),
      new THREE.MeshStandardMaterial({ color: 0x0c1322, roughness: 1, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.arrivalGroup.add(ground);

    const port = new THREE.Mesh(
      new THREE.BoxGeometry(54, 1.6, 28),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
    );
    port.position.set(18, 0.8, -10);
    port.receiveShadow = true;
    this.arrivalGroup.add(port);

    const office = new THREE.Mesh(
      new THREE.BoxGeometry(28, 16, 22),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92 })
    );
    office.position.set(40, 8, 10);
    office.castShadow = true;
    office.receiveShadow = true;
    this.arrivalGroup.add(office);

    const officeLight = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.24, 12.4),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    officeLight.position.set(40, 8, 20.1);
    this.arrivalGroup.add(officeLight);

    for (let index = 0; index < 6; index += 1) {
      const container = new THREE.Mesh(
        new THREE.BoxGeometry(9, 6.2, 6.2),
        new THREE.MeshStandardMaterial({ color: index % 2 === 0 ? 0x475569 : 0x334155, roughness: 0.9 })
      );
      container.position.set(-48 + (index % 3) * 10, 3.2 + Math.floor(index / 3) * 6.6, -12);
      this.arrivalGroup.add(container);
    }

    const street = new THREE.Mesh(
      new THREE.BoxGeometry(92, 0.05, 14),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.08 })
    );
    street.position.set(10, 0.08, 2);
    this.arrivalGroup.add(street);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(180, 42, 42),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x1e3a8a, emissiveIntensity: 0.7 })
    );
    planet.position.set(-220, 110, -320);
    this.arrivalGroup.add(planet);

    this.addZoneFrame(this.arrivalGroup, this.segmentWorld.arrival.deliveryZone, 0x34d399, "Deliver");
    this.addZoneFrame(this.arrivalGroup, this.segmentWorld.arrival.optionalZone, 0xfacc15, "Locker");
  }

  buildHubWorld(stopover) {
    const THREE = this.THREE;
    const hub = stopover.hub;
    this.clearGroup(this.hubGroup);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(180, 84),
      new THREE.MeshStandardMaterial({ color: 0x0c1425, roughness: 1, metalness: 0.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.hubGroup.add(ground);

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(46, 1.8, 26),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.88 })
    );
    pad.position.set(hub.shipSpawn.x, 0.9, hub.shipSpawn.z);
    this.hubGroup.add(pad);

    const office = new THREE.Mesh(
      new THREE.BoxGeometry(24, 14, 18),
      new THREE.MeshStandardMaterial({ color: 0x162033, roughness: 0.9 })
    );
    office.position.set(26, 7, 10);
    this.hubGroup.add(office);

    const containers = [
      [-44, 3.2, -10],
      [-34, 3.2, -10],
      [-44, 9.8, -10],
      [-60, 3.2, 10]
    ];
    containers.forEach(([x, y, z], index) => {
      const container = new THREE.Mesh(
        new THREE.BoxGeometry(8.4, 6.2, 6.2),
        new THREE.MeshStandardMaterial({ color: index % 2 === 0 ? 0x475569 : 0x334155, roughness: 0.88 })
      );
      container.position.set(x, y, z);
      this.hubGroup.add(container);
    });

    const skyline = new THREE.Mesh(
      new THREE.CylinderGeometry(210, 250, 40, 84, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x13233c, roughness: 1, metalness: 0.04 })
    );
    skyline.position.set(0, -14, 0);
    this.hubGroup.add(skyline);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(140, 42, 42),
      new THREE.MeshStandardMaterial({
        color: stopover.kind === "refuel" ? 0x7c93c6 : 0xd9a441,
        emissive: stopover.kind === "refuel" ? 0x223a6a : 0x7c2d12,
        emissiveIntensity: 0.48
      })
    );
    planet.position.set(-170, 94, -260);
    this.hubGroup.add(planet);

    this.addZoneFrame(this.hubGroup, hub.mandatoryZone, 0x34d399, "Task");
    this.addZoneFrame(this.hubGroup, hub.optionalZone, 0xfacc15, "Bonus");
    this.addZoneFrame(this.hubGroup, hub.boardZone, 0x67e8f9, "Return");
    this.activeHubWorld = { ...hub, stopId: stopover.id, stopKind: stopover.kind };
    this.activeHubKey = stopover.id;
  }

  createStopoverObject(stopover, index) {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(stopover.bodyRadius, 4.2, 18, 64),
      new THREE.MeshStandardMaterial({
        color: index === 0 ? 0x7dd3fc : 0xfbbf24,
        emissive: index === 0 ? 0x0f766e : 0x92400e,
        emissiveIntensity: 0.34
      })
    );
    ring.rotation.x = 0.42;

    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(stopover.bodyRadius * 0.48, 26, 26),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x2563eb, emissiveIntensity: 0.2 })
    );

    const dock = new THREE.Mesh(
      new THREE.BoxGeometry(stopover.zoneDepth * 0.8, 2.6, stopover.zoneHeight * 0.44),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.82 })
    );
    dock.position.set(stopover.zoneDepth * 0.36, 0, 0);

    const trussMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.86 });
    for (let indexA = 0; indexA < 4; indexA += 1) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2, stopover.bodyRadius * 1.6, 2), trussMaterial);
      arm.position.set(
        -stopover.bodyRadius * 0.9 + indexA * (stopover.bodyRadius * 0.6),
        0,
        indexA % 2 === 0 ? -stopover.bodyRadius * 0.72 : stopover.bodyRadius * 0.72
      );
      group.add(arm);
    }

    group.add(ring, hub, dock);
    group.position.set(stopover.x, 0, stopover.z);
    return { ...stopover, mesh: group };
  }

  createOptionalTaskMarker(task) {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(task.radius * 0.24, 0),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xca8a04, emissiveIntensity: 0.55 })
    );
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(task.radius * 0.4, 0.9, 10, 30),
      new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.28 })
    );
    halo.rotation.x = Math.PI / 2;
    group.add(core, halo);
    group.position.set(task.x, 8, task.z);
    return { ...task, mesh: group };
  }

  createCorridorLaneVisuals() {
    const THREE = this.THREE;
    if (this.corridorAnchors.length < 2) {
      return;
    }

    const laneMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12 });
    const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.24 });
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.78 });

    for (let index = 0; index < this.corridorAnchors.length - 1; index += 1) {
      const anchor = this.corridorAnchors[index];
      const next = this.corridorAnchors[index + 1];
      const dx = next.x - anchor.x;
      const dz = next.z - anchor.z;
      const length = Math.hypot(dx, dz);
      const heading = Math.atan2(dz, dx);
      const centerX = (anchor.x + next.x) / 2;
      const centerZ = (anchor.z + next.z) / 2;
      const width = (anchor.width + next.width) / 2;
      const normalX = -Math.sin(heading) * width * 0.18;
      const normalZ = Math.cos(heading) * width * 0.18;

      const lane = new THREE.Mesh(new THREE.BoxGeometry(length, 0.05, Math.max(18, width * 0.3)), laneMaterial.clone());
      lane.position.set(centerX, -0.12, centerZ);
      lane.rotation.y = -heading;
      this.flightGroup.add(lane);

      const leftEdge = new THREE.Mesh(new THREE.BoxGeometry(length, 0.06, 1.2), edgeMaterial.clone());
      leftEdge.position.set(centerX - normalX, 0.08, centerZ - normalZ);
      leftEdge.rotation.y = -heading;
      this.flightGroup.add(leftEdge);

      const rightEdge = leftEdge.clone();
      rightEdge.position.set(centerX + normalX, 0.08, centerZ + normalZ);
      this.flightGroup.add(rightEdge);

      const markerCount = Math.max(4, Math.round(length / 260));
      for (let markerIndex = 0; markerIndex <= markerCount; markerIndex += 1) {
        const t = markerCount === 0 ? 0 : markerIndex / markerCount;
        const x = anchor.x + dx * t;
        const z = anchor.z + dz * t;
        const marker = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), markerMaterial.clone());
        marker.position.set(x, 0.4, z);
        this.flightGroup.add(marker);
      }
    }
  }

  createRouteEventObject(event) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    if (event.type === "traffic") {
      const pylonMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x2563eb, emissiveIntensity: 0.44 });
      const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.86 });
      for (let index = 0; index < 7; index += 1) {
        const offset = -event.span / 2 + (event.span / 6) * index;
        const towerLeft = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), pylonMaterial);
        towerLeft.position.set(offset, 8, -event.width * 0.32);
        const towerRight = towerLeft.clone();
        towerRight.position.z = event.width * 0.32;
        const crossLight = new THREE.Mesh(new THREE.BoxGeometry(6, 0.28, event.width * 0.56), lightMaterial);
        crossLight.position.set(offset, 1.1, 0);
        group.add(towerLeft, towerRight, crossLight);
      }
    } else if (event.type === "braid") {
      const braidMaterial = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.18 });
      const upper = new THREE.Mesh(new THREE.BoxGeometry(event.span, 0.08, 8), braidMaterial);
      upper.position.set(0, 0.24, -event.width * 0.28);
      upper.rotation.y = -0.12;
      const lower = upper.clone();
      lower.position.z = event.width * 0.28;
      lower.rotation.y = 0.12;
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(7, 0),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.95, metalness: 0.08, emissive: 0x1e293b, emissiveIntensity: 0.2 })
      );
      core.position.set(0, 8, 0);
      group.add(upper, lower, core);
    } else if (event.type === "ring") {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(event.width * 0.6, 2.4, 18, 84),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0x7c2d12, emissiveIntensity: 0.36, roughness: 0.7 })
      );
      ring.rotation.z = Math.PI / 2;
      ring.rotation.x = 0.34;
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(event.width * 0.88, 42),
        new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.12 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -0.18;
      group.add(ring, shadow);
    } else if (event.type === "relay") {
      const relayMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.84, metalness: 0.12 });
      const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.24 });
      for (let index = 0; index < 5; index += 1) {
        const x = -event.span * 0.4 + index * (event.span * 0.2);
        const pylonLeft = new THREE.Mesh(new THREE.BoxGeometry(2.8, 28, 2.8), relayMaterial);
        pylonLeft.position.set(x, 14, -event.width * 0.3);
        const pylonRight = pylonLeft.clone();
        pylonRight.position.z = event.width * 0.3;
        const beam = new THREE.Mesh(new THREE.BoxGeometry(4, 10, event.width * 0.48), beamMaterial);
        beam.position.set(x, 10, 0);
        group.add(pylonLeft, pylonRight, beam);
      }
    } else if (event.type === "terminal") {
      const guideMaterial = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.2 });
      const left = new THREE.Mesh(new THREE.BoxGeometry(event.span, 0.08, 6), guideMaterial);
      left.position.set(0, 0.15, -event.width * 0.26);
      left.rotation.y = -0.08;
      const right = left.clone();
      right.position.z = event.width * 0.26;
      right.rotation.y = 0.08;
      group.add(left, right);
    }

    const sprite = this.createLabelSprite(event.label, event.type === "relay" ? 0xa5b4fc : event.type === "ring" ? 0xfbbf24 : 0x67e8f9);
    sprite.position.set(0, 20, 0);
    group.add(sprite);
    group.position.set(event.x, 0, event.z);

    return { ...event, mesh: group };
  }

  createStationObject() {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.station.bodyRadius, 3.8, 16, 56),
      new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x0f766e, emissiveIntensity: 0.36 })
    );
    ring.rotation.x = 0.4;

    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(this.segmentWorld.station.bodyRadius * 0.5, 26, 26),
      new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x0ea5e9, emissiveIntensity: 0.28 })
    );

    const dock = new THREE.Mesh(
      new THREE.BoxGeometry(24, 2.2, 14),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 })
    );
    dock.position.set(this.segmentWorld.station.zoneDepth / 2 - 8, 0, 0);

    const armGeometry = new THREE.BoxGeometry(1.8, 20, 1.8);
    const armLeft = new THREE.Mesh(armGeometry, new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.84 }));
    armLeft.position.set(-this.segmentWorld.station.bodyRadius * 0.9, 0, -this.segmentWorld.station.bodyRadius * 0.8);
    const armRight = armLeft.clone();
    armRight.position.z = this.segmentWorld.station.bodyRadius * 0.8;

    const trussMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 });
    const trussTop = new THREE.Mesh(
      new THREE.BoxGeometry(this.segmentWorld.station.bodyRadius * 1.7, 1.1, 1.1),
      trussMaterial
    );
    trussTop.position.set(-4, this.segmentWorld.station.bodyRadius * 0.46, 0);

    const trussBottom = trussTop.clone();
    trussBottom.position.y = -this.segmentWorld.station.bodyRadius * 0.42;

    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, this.segmentWorld.station.bodyRadius * 1.8, 12),
      trussMaterial
    );
    spine.rotation.z = Math.PI / 2;
    spine.position.x = -4;

    group.add(ring, hub, dock, armLeft, armRight, trussTop, trussBottom, spine);
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
    const pillarGeometry = new THREE.BoxGeometry(5.2, this.segmentWorld.gate.height, 5.2);
    const left = new THREE.Mesh(pillarGeometry, material);
    const right = new THREE.Mesh(pillarGeometry, material);
    const top = new THREE.Mesh(new THREE.BoxGeometry(this.segmentWorld.gate.width, 5.6, 5.6), material);
    left.position.x = -this.segmentWorld.gate.width / 2;
    right.position.x = this.segmentWorld.gate.width / 2;
    top.position.y = this.segmentWorld.gate.height / 2;

    const braceGeometry = new THREE.BoxGeometry(this.segmentWorld.gate.width * 0.72, 1.4, 1.4);
    const braceA = new THREE.Mesh(braceGeometry, new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 }));
    braceA.rotation.z = 0.48;
    braceA.position.y = this.segmentWorld.gate.height * 0.18;
    const braceB = braceA.clone();
    braceB.rotation.z = -0.48;

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.gate.width * 0.42, 1.2, 14, 48),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.22 })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = this.segmentWorld.gate.height * 0.2;

    group.add(left, right, top, braceA, braceB, halo);
    group.position.set(this.segmentWorld.gate.x, this.segmentWorld.gate.height / 2, this.segmentWorld.gate.z);
    return { ...this.segmentWorld.gate, mesh: group };
  }

  createWormholeObject() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.wormhole.radius, 4.2, 24, 76),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0x7e22ce, emissiveIntensity: 1 })
    );
    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.wormhole.radius * 0.68, 1.8, 16, 56),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 1.2 })
    );
    inner.rotation.x = Math.PI / 2;

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(this.segmentWorld.wormhole.radius * 0.7, this.segmentWorld.wormhole.radius * 0.7, 3.2, 40),
      new THREE.MeshBasicMaterial({ color: 0xd8b4fe, transparent: true, opacity: 0.24 })
    );
    core.rotation.z = Math.PI / 2;

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.wormhole.radius * 1.24, 1.8, 12, 52),
      new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0.22 })
    );
    halo.rotation.y = Math.PI / 2;

    const shell = new THREE.Mesh(
      new THREE.TorusGeometry(this.segmentWorld.wormhole.radius * 1.52, 1.6, 10, 44),
      new THREE.MeshBasicMaterial({ color: 0xf5d0fe, transparent: true, opacity: 0.1 })
    );
    shell.rotation.x = Math.PI / 2;

    group.add(outer, inner, core, halo, shell);
    group.position.set(this.segmentWorld.wormhole.x, 12, this.segmentWorld.wormhole.z);

    return { ...this.segmentWorld.wormhole, mesh: group };
  }

  createNavigationBeacon(label, color, height) {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 1.1, height, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 })
    );
    beam.position.y = height / 2;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.34, 8, 32),
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
    canvas.width = 320;
    canvas.height = 88;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#e2e8f0";
    context.font = "bold 32px Trebuchet MS";
    context.textAlign = "center";
    context.fillText(text, canvas.width / 2, 46);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, color, transparent: true, opacity: 0.92 });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(18, 5.2, 1);
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

    this.optionalTasks.forEach((task, index) => {
      task.mesh.rotation.y += deltaTime * (0.7 + index * 0.04);
      task.mesh.position.y = 8 + Math.sin(state.time * 1.8 + index) * 1.6;
    });

    this.routeEvents.forEach((event, index) => {
      event.mesh.position.y = Math.sin(state.time * 0.75 + index * 0.6) * 0.5;
      if (event.type === "ring" || event.type === "relay") {
        event.mesh.rotation.y += deltaTime * (event.type === "ring" ? 0.06 : 0.1);
      }
      const labelSprite = event.mesh.children[event.mesh.children.length - 1];
      if (labelSprite?.material) {
        labelSprite.material.opacity = 0.72 + Math.sin(state.time * 2 + index) * 0.18;
      }
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

  setMode(mode, context = {}) {
    if (mode === "hub" && context.stopover) {
      if (this.activeHubKey !== context.stopover.id) {
        this.buildHubWorld(context.stopover);
      }
    }

    this.departureGroup.visible = mode === "preview" || mode === "boarding" || mode === "launch";
    this.flightGroup.visible = mode === "flight" || mode === "wormhole" || mode === "launch";
    this.hubGroup.visible = mode === "hub";
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

  getArrivalOptionalInfo(character) {
    return this.getZoneInfo(character.position, this.segmentWorld.arrival.optionalZone);
  }

  getCurrentStopover(index) {
    return this.stopovers[index] ?? null;
  }

  getStopoverInfo(ship, index) {
    const stopover = this.stopovers[index];
    if (!stopover) {
      return { available: false, inZone: false, nearZone: false, alignment: 0 };
    }
    const dx = Math.abs(ship.position.x - stopover.x);
    const dz = Math.abs(ship.position.z - stopover.z);
    const inZone = dx <= stopover.zoneDepth / 2 && dz <= stopover.zoneHeight / 2;
    return {
      available: true,
      stopover,
      inZone,
      nearZone: dx <= stopover.zoneDepth * 0.92 && dz <= stopover.zoneHeight * 0.92,
      alignment: Math.max(0, 1 - dz / Math.max(stopover.zoneHeight / 2, 1))
    };
  }

  getHubInteractionInfo(character, type) {
    if (!this.activeHubWorld) {
      return { inZone: false, nearZone: false, distance: Infinity };
    }
    const zone =
      type === "mandatory"
        ? this.activeHubWorld.mandatoryZone
        : type === "optional"
          ? this.activeHubWorld.optionalZone
          : this.activeHubWorld.boardZone;
    return this.getZoneInfo(character.position, zone);
  }

  getOptionalTaskInfo(ship, completedTaskIds = []) {
    return (
      this.optionalTasks.find((task) => {
        if (completedTaskIds.includes(task.id)) {
          return false;
        }
        const dx = task.x - ship.position.x;
        const dz = task.z - ship.position.z;
        return Math.hypot(dx, dz) <= task.radius;
      }) ?? null
    );
  }

  getDepartureForce(ship, progress = 0) {
    const lane = this.segmentWorld.departure.departureLane;
    let phase = "surface";
    let targetY = 32;
    let stabilizeY = 0.62;
    let upward = 18;
    let forwardAssist = 14;
    let dragPenalty = 0.16;

    if (ship.position.y >= lane.targetY * 0.82) {
      phase = "orbitalBreak";
      targetY = lane.targetY;
      stabilizeY = 0.12;
      upward = 5.2;
      forwardAssist = 34;
      dragPenalty = 0.015;
    } else if (ship.position.y >= lane.lowerY) {
      phase = "upperAtmosphere";
      targetY = lane.targetY * 0.72;
      stabilizeY = 0.22;
      upward = 9.2;
      forwardAssist = 28;
      dragPenalty = 0.05;
    } else if (ship.position.y >= lane.lowerY * 0.32) {
      phase = "lowerAtmosphere";
      targetY = lane.upperY * 0.72;
      stabilizeY = 0.34;
      upward = 12.5;
      forwardAssist = 22;
      dragPenalty = 0.09;
    }

    return {
      phase,
      force: {
        x: 28 * (1 - progress * 0.14),
        y: upward * (1 - progress * 0.18),
        z: -ship.position.z * 0.52
      },
      forwardAssist,
      stabilizeZ: 0.7,
      stabilizeY,
      targetY,
      dragPenalty
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

  getRouteStartX() {
    return this.segmentWorld.routeStartX;
  }

  getRouteGuidance(ship, completedTaskIds = [], stopIndex = 0, wormholeUsed = false) {
    const anchors = this.corridorAnchors.length > 0 ? this.corridorAnchors : [
      { x: this.segmentWorld.routeStartX, z: 0, width: 180, sector: "Freight Lane", beat: "Transfer lane", assist: 3.6 },
      { x: this.segmentWorld.routeLength, z: 0, width: 180, sector: "Freight Lane", beat: "Approach", assist: 4.2 }
    ];

    let previous = anchors[0];
    let next = anchors[anchors.length - 1];
    for (let index = 0; index < anchors.length - 1; index += 1) {
      if (ship.position.x >= anchors[index].x && ship.position.x <= anchors[index + 1].x) {
        previous = anchors[index];
        next = anchors[index + 1];
        break;
      }
      if (ship.position.x < anchors[0].x) {
        previous = anchors[0];
        next = anchors[1] ?? anchors[0];
        break;
      }
    }

    const segmentSpan = Math.max(next.x - previous.x, 1);
    const mix = clamp((ship.position.x - previous.x) / segmentSpan, 0, 1);
    const targetZ = previous.z + (next.z - previous.z) * mix;
    const laneWidth = previous.width + (next.width - previous.width) * mix;
    const forwardAssist = previous.assist + (next.assist - previous.assist) * mix;
    const currentEvent =
      this.routeEvents.find((event) => Math.abs(ship.position.x - event.x) <= event.span * 0.55) ?? null;
    const nextStopover = this.stopovers[stopIndex] ?? null;
    const nearbyDetour =
      this.optionalTasks.find(
        (task) =>
          !completedTaskIds.includes(task.id) &&
          task.x > ship.position.x - 120 &&
          task.x < ship.position.x + 1500 &&
          Math.abs(task.z - targetZ) > laneWidth * 0.22
      ) ?? null;

    return {
      targetZ,
      targetY: currentEvent?.type === "ring" ? 12 : currentEvent?.type === "relay" ? 8 : 0,
      verticalAssist: currentEvent?.type === "ring" ? 0.08 : currentEvent?.type === "relay" ? 0.05 : 0.02,
      laneWidth,
      laneAssist: 0.015 + (laneWidth < 150 ? 0.008 : 0.003),
      forwardAssist,
      sectorLabel: currentEvent?.sector ?? (mix < 0.55 ? previous.sector : next.sector),
      beatLabel: currentEvent?.label ?? (mix < 0.55 ? previous.beat : next.beat),
      detourLabel: nearbyDetour?.label ?? "",
      nextStopover,
      wormholeAvailable: !!(this.wormhole && !wormholeUsed)
    };
  }

  getNavigationPoints(wormholeUsed = false) {
    return {
      station: this.station ? { x: this.station.x, z: this.station.z } : null,
      stopovers: this.stopovers.map((stopover) => ({ id: stopover.id, x: stopover.x, z: stopover.z })),
      gate: { x: this.gate.x, z: this.gate.z },
      wormhole: this.wormhole && !wormholeUsed ? { x: this.wormhole.x, z: this.wormhole.z } : null,
      optionalTasks: this.optionalTasks.map((task) => ({ id: task.id, x: task.x, z: task.z })),
      corridorAnchors: this.corridorAnchors.map((anchor) => ({ x: anchor.x, z: anchor.z })),
      routeEvents: this.routeEvents.map((event) => ({ id: event.id, x: event.x, z: event.z, type: event.type }))
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
