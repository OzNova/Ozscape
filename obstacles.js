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
    this.departureSolids = [];
    this.hubSolids = [];
    this.arrivalSolids = [];
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
    this.departureSolids = [];
    this.hubSolids = [];
    this.arrivalSolids = [];
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
      bounds: { minX: -380, maxX: 920, minZ: -160, maxZ: 160 },
      workerZone: { minX: -126, maxX: -92, minZ: 10, maxZ: 38 },
      cargoZone: { minX: -128, maxX: -54, minZ: 18, maxZ: 58 },
      boardingZone: { minX: 36, maxX: 84, minZ: -22, maxZ: 10 },
      departureLane: {
        startX: 62,
        clearX: 860,
        spaceBreakX: 1320,
        minZ: -120,
        maxZ: 120,
        lowerY: 88,
        upperY: 220,
        targetY: 420
      }
    };

    const routeStartX = departure.departureLane.spaceBreakX + 240;
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
        bounds: { minX: -112, maxX: 104, minZ: -72, maxZ: 74 },
        deliveryZone: { minX: 24, maxX: 44, minZ: -2, maxZ: 14 },
        optionalZone: { minX: -56, maxX: -30, minZ: -18, maxZ: 6 },
        boardZone: { minX: 10, maxX: 34, minZ: -26, maxZ: -8 }
      }
    };
  }

  getSolidsForMode(mode) {
    if (mode === "boarding") {
      return this.departureSolids;
    }
    if (mode === "hub") {
      return this.hubSolids;
    }
    if (mode === "arrival") {
      return this.arrivalSolids;
    }
    return [];
  }

  addSolidBox(mode, centerX, centerZ, width, depth, padding = 0) {
    this.getSolidsForMode(mode).push({
      minX: centerX - width / 2 - padding,
      maxX: centerX + width / 2 + padding,
      minZ: centerZ - depth / 2 - padding,
      maxZ: centerZ + depth / 2 + padding
    });
  }

  getOnFootBounds(mode, context = null) {
    if (mode === "boarding") {
      return this.segmentWorld?.departure?.bounds ?? { minX: -170, maxX: 170, minZ: -90, maxZ: 90 };
    }
    if (mode === "arrival") {
      return this.segmentWorld?.arrival?.bounds ?? { minX: -74, maxX: 82, minZ: -54, maxZ: 54 };
    }
    if (mode === "hub") {
      return context?.hub?.bounds ?? this.activeHubWorld?.bounds ?? { minX: -90, maxX: 90, minZ: -70, maxZ: 70 };
    }
    return { minX: -170, maxX: 170, minZ: -90, maxZ: 90 };
  }

  resolveAxisMovement(currentAxis, attemptedAxis, otherAxis, radius, solids, axis) {
    const minKey = axis === "x" ? "minX" : "minZ";
    const maxKey = axis === "x" ? "maxX" : "maxZ";
    const otherMinKey = axis === "x" ? "minZ" : "minX";
    const otherMaxKey = axis === "x" ? "maxZ" : "maxX";
    let resolved = attemptedAxis;

    solids.forEach((solid) => {
      if (otherAxis + radius <= solid[otherMinKey] || otherAxis - radius >= solid[otherMaxKey]) {
        return;
      }

      const barrierMin = solid[minKey] - radius;
      const barrierMax = solid[maxKey] + radius;

      if (currentAxis <= barrierMin && resolved > barrierMin) {
        resolved = barrierMin;
      } else if (currentAxis >= barrierMax && resolved < barrierMax) {
        resolved = barrierMax;
      } else if (currentAxis > barrierMin && currentAxis < barrierMax) {
        resolved = Math.abs(resolved - barrierMin) < Math.abs(resolved - barrierMax) ? barrierMin : barrierMax;
      }
    });

    return resolved;
  }

  resolveOnFootMovement(mode, currentPosition, attemptedPosition, radius, context = null) {
    const bounds = this.getOnFootBounds(mode, context);
    const solids = this.getSolidsForMode(mode);
    let nextX = clamp(attemptedPosition.x, bounds.minX, bounds.maxX);
    let nextZ = clamp(attemptedPosition.z, bounds.minZ, bounds.maxZ);

    nextX = this.resolveAxisMovement(currentPosition.x, nextX, currentPosition.z, radius, solids, "x");
    nextZ = this.resolveAxisMovement(currentPosition.z, nextZ, nextX, radius, solids, "z");

    return {
      x: clamp(nextX, bounds.minX, bounds.maxX),
      z: clamp(nextZ, bounds.minZ, bounds.maxZ)
    };
  }

  createCargoContainer({
    width = 9.4,
    height = 6.2,
    depth = 6.2,
    bodyColor = 0x475569,
    trimColor = 0x1e293b,
    accentColor = 0x67e8f9
  } = {}) {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.84, metalness: 0.12 });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.76, metalness: 0.24 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.18, roughness: 0.36 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    [-1, 1].forEach((sideX) => {
      [-1, 1].forEach((sideZ) => {
        const corner = new THREE.Mesh(new THREE.BoxGeometry(0.34, height + 0.1, 0.34), trimMaterial);
        corner.position.set((width / 2 - 0.22) * sideX, 0, (depth / 2 - 0.22) * sideZ);
        corner.castShadow = true;
        group.add(corner);
      });
    });

    for (let index = -1; index <= 1; index += 1) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.18, height - 0.5, depth + 0.08), trimMaterial);
      rib.position.set(index * (width * 0.26), 0, 0);
      group.add(rib);
    }

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(width + 0.16, 0.22, 0.22), accentMaterial);
    topRail.position.set(0, height / 2 + 0.12, -depth / 2 + 0.28);
    const oppositeTopRail = topRail.clone();
    oppositeTopRail.position.z = depth / 2 - 0.28;
    group.add(topRail, oppositeTopRail);

    const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(width * 0.48, height * 0.84, 0.08), trimMaterial);
    doorLeft.position.set(-width * 0.24, 0, depth / 2 + 0.05);
    const doorRight = doorLeft.clone();
    doorRight.position.x = width * 0.24;
    group.add(doorLeft, doorRight);

    const lockBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, height * 0.72, 0.12), accentMaterial);
    lockBar.position.set(0, 0, depth / 2 + 0.08);
    group.add(lockBar);

    return group;
  }

  createOperationsBuilding({
    width = 32,
    height = 18,
    depth = 24,
    bodyColor = 0x162033,
    trimColor = 0x334155,
    windowColor = 0x67e8f9
  } = {}) {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.9, metalness: 0.08 });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.76, metalness: 0.18 });
    const windowMaterial = new THREE.MeshStandardMaterial({ color: windowColor, emissive: windowColor, emissiveIntensity: 0.42, roughness: 0.28 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const roofLip = new THREE.Mesh(new THREE.BoxGeometry(width + 2.4, 0.9, depth + 2.4), trimMaterial);
    roofLip.position.y = height / 2 + 0.45;
    group.add(roofLip);

    const sideModule = new THREE.Mesh(new THREE.BoxGeometry(width * 0.26, height * 0.54, depth * 0.34), trimMaterial);
    sideModule.position.set(width * 0.34, -height * 0.08, -depth * 0.34);
    group.add(sideModule);

    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(width * 0.16, height * 0.54, 0.28), trimMaterial);
    doorFrame.position.set(width * 0.32, -height * 0.22, depth / 2 + 0.16);
    const door = new THREE.Mesh(new THREE.BoxGeometry(width * 0.12, height * 0.42, 0.18), bodyMaterial);
    door.position.set(width * 0.32, -height * 0.24, depth / 2 + 0.28);
    group.add(doorFrame, door);

    const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(width * 0.52, height * 0.16, 0.18), windowMaterial);
    windowStrip.position.set(-width * 0.08, height * 0.1, depth / 2 + 0.18);
    group.add(windowStrip);

    const roofUnit = new THREE.Mesh(new THREE.BoxGeometry(width * 0.22, height * 0.12, depth * 0.18), trimMaterial);
    roofUnit.position.set(-width * 0.12, height / 2 + 1.2, 0);
    const roofUnitB = roofUnit.clone();
    roofUnitB.position.x = width * 0.2;
    group.add(roofUnit, roofUnitB);

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, height * 0.44, 8), trimMaterial);
    antenna.position.set(-width * 0.32, height / 2 + height * 0.22, -depth * 0.18);
    group.add(antenna);

    const antennaLight = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), windowMaterial);
    antennaLight.position.set(-width * 0.32, height / 2 + height * 0.44, -depth * 0.18);
    group.add(antennaLight);

    return group;
  }

  createFloodLight(height = 18) {
    const THREE = this.THREE;
    const group = new THREE.Group();
    const mastMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.82, metalness: 0.18 });
    const glowMaterial = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0x67e8f9, emissiveIntensity: 0.56, roughness: 0.22 });

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, height, 10), mastMaterial);
    mast.position.y = height / 2;
    mast.castShadow = true;
    const lightHead = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.42, 0.72), glowMaterial);
    lightHead.position.set(0, height + 0.2, 0);
    const fill = new THREE.PointLight(0x9bd6ff, 0.48, 74, 2);
    fill.position.set(0, height + 0.1, 0);
    group.add(mast, lightHead, fill);
    return group;
  }

  createDepartureWorld() {
    const THREE = this.THREE;
    this.departureSolids = [];

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2200, 160),
      new THREE.MeshStandardMaterial({ color: 0x0d1727, roughness: 1, metalness: 0.02 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.departureGroup.add(ground);

    const terrainShelf = new THREE.Mesh(
      new THREE.CylinderGeometry(1100, 1440, 84, 120, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x162033, roughness: 0.98, metalness: 0.03 })
    );
    terrainShelf.position.set(280, -34, 0);
    this.departureGroup.add(terrainShelf);

    const craterRing = new THREE.Mesh(
      new THREE.RingGeometry(220, 760, 80),
      new THREE.MeshBasicMaterial({ color: 0x0f2743, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    );
    craterRing.rotation.x = -Math.PI / 2;
    craterRing.position.set(90, 0.16, 4);
    this.departureGroup.add(craterRing);

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
      new THREE.SphereGeometry(2880, 92, 92),
      new THREE.MeshStandardMaterial({
        color: 0x4d7db9,
        emissive: 0x143c72,
        emissiveIntensity: 0.64,
        roughness: 1
      })
    );
    planet.position.set(1360, -2440, -3780);
    this.departureGroup.add(planet);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(3030, 92, 92),
      new THREE.MeshBasicMaterial({ color: 0x8cc8ff, transparent: true, opacity: 0.24 })
    );
    atmosphere.position.copy(planet.position);
    this.departureGroup.add(atmosphere);

    const atmosphereHalo = new THREE.Mesh(
      new THREE.SphereGeometry(3220, 72, 72),
      new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.09 })
    );
    atmosphereHalo.position.copy(planet.position);
    this.departureGroup.add(atmosphereHalo);

    const haze = new THREE.Mesh(
      new THREE.CircleGeometry(1620, 96),
      new THREE.MeshBasicMaterial({ color: 0x3b6fb6, transparent: true, opacity: 0.16 })
    );
    haze.rotation.x = -Math.PI / 2;
    haze.position.set(250, 0.25, 0);
    this.departureGroup.add(haze);

    const horizon = new THREE.Mesh(
      new THREE.CylinderGeometry(1260, 1680, 148, 96, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x152740, roughness: 1, metalness: 0.02 })
    );
    horizon.position.set(260, -62, 0);
    this.departureGroup.add(horizon);

    [
      [340, 26, -220, 1980, 128, 300],
      [560, 20, 210, 1760, 112, 220],
      [-180, 18, -110, 460, 72, 180],
      [670, 16, -12, 360, 58, 124]
    ].forEach(([x, y, z, w, h, d]) => {
      const terrain = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: 0x111c2e, roughness: 1, metalness: 0.02 })
      );
      terrain.position.set(x, y, z);
      this.departureGroup.add(terrain);
    });

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(212, 2.6, 88),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.88, metalness: 0.12 })
    );
    pad.position.set(54, 1.1, -8);
    pad.receiveShadow = true;
    this.departureGroup.add(pad);

    const runway = new THREE.Mesh(
      new THREE.BoxGeometry(2140, 0.08, 62),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12 })
    );
    runway.position.set(1000, 0.12, 0);
    this.departureGroup.add(runway);

    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
    );
    ramp.rotation.z = -0.2;
    ramp.position.set(46, 2.26, -4);
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    this.departureGroup.add(ramp);

    const rampLight = new THREE.Mesh(
      new THREE.BoxGeometry(40, 0.08, 4.2),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.28 })
    );
    rampLight.position.set(48, 2.62, -4);
    this.departureGroup.add(rampLight);

    this.addZoneFrame(this.departureGroup, this.segmentWorld.departure.workerZone, 0x38bdf8, "Foreman");
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

    [-280, -120, 120, 280, 460, 640].forEach((x) => {
      const floodlight = this.createFloodLight(20);
      floodlight.position.set(x, 0, x < 0 ? -76 : 76);
      this.departureGroup.add(floodlight);
    });

    const servicePipe = new THREE.Mesh(
      new THREE.BoxGeometry(180, 0.34, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.74, metalness: 0.18 })
    );
    servicePipe.position.set(-118, 8.8, -36);
    this.departureGroup.add(servicePipe);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(42, 28, 28, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x082f49, emissiveIntensity: 0.2, transparent: true, opacity: 0.94 })
    );
    dome.position.set(-220, 0, 42);
    this.departureGroup.add(dome);

    this.addSolidBox("boarding", -236, -58, 96, 54, 2);
    this.addSolidBox("boarding", 618, -18, 150, 86, 2);
    this.addSolidBox("boarding", 296, 28, 164, 92, 2);
  }

  createPortStructures() {
    const THREE = this.THREE;
    const structureSpecs = [
      { x: -256, z: -60, width: 74, height: 54, depth: 52 },
      { x: -148, z: -14, width: 48, height: 40, depth: 30 },
      { x: 126, z: 42, width: 82, height: 66, depth: 44 },
      { x: 296, z: -44, width: 56, height: 40, depth: 34 },
      { x: 438, z: 26, width: 66, height: 44, depth: 38 },
      { x: 620, z: -18, width: 86, height: 58, depth: 42 }
    ];

    structureSpecs.forEach((spec, index) => {
      const building = this.createOperationsBuilding({
        width: spec.width,
        height: spec.height,
        depth: spec.depth,
        bodyColor: index % 2 === 0 ? 0x162033 : 0x1e293b,
        trimColor: 0x334155,
        windowColor: index % 2 === 0 ? 0x67e8f9 : 0x93c5fd
      });
      building.position.set(spec.x, spec.height / 2, spec.z);
      this.departureGroup.add(building);
      this.addSolidBox("boarding", spec.x, spec.z, spec.width, spec.depth, 2);
    });

    const containerSpecs = [
      [-210, 3.2, 76, 0x475569],
      [-199, 3.2, 76, 0x334155],
      [-188, 3.2, 76, 0x475569],
      [-210, 9.7, 76, 0x334155],
      [-199, 9.7, 76, 0x475569],
      [-188, 9.7, 76, 0x334155],
      [-210, 3.2, 64, 0x3f4b5c],
      [-199, 3.2, 64, 0x475569],
      [-188, 3.2, 64, 0x334155],
      [-210, 3.2, 52, 0x475569]
    ];

    containerSpecs.forEach(([x, y, z, color], index) => {
      const container = this.createCargoContainer({
        width: 9.2,
        height: 6.2,
        depth: 6.2,
        bodyColor: color,
        trimColor: 0x1e293b,
        accentColor: index % 2 === 0 ? 0x67e8f9 : 0xf59e0b
      });
      container.position.set(x, y, z);
      this.departureGroup.add(container);
      this.addSolidBox("boarding", x, z, 9.2, 6.2, 0.8);
    });

    const craneBase = new THREE.Mesh(
      new THREE.BoxGeometry(16, 18, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.2 })
    );
    craneBase.position.set(108, 9, -44);
    const craneArm = new THREE.Mesh(
      new THREE.BoxGeometry(88, 2.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.76, metalness: 0.24 })
    );
    craneArm.position.set(144, 34, -44);
    const craneCable = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 24, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7, metalness: 0.3 })
    );
    craneCable.position.set(176, 22, -44);
    const craneHead = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x22d3ee, emissiveIntensity: 0.2 })
    );
    craneHead.position.set(176, 9.8, -44);
    this.departureGroup.add(craneBase, craneArm, craneCable, craneHead);
    this.addSolidBox("boarding", 108, -44, 16, 16, 1.5);

    const skylineMaterial = new THREE.MeshStandardMaterial({ color: 0x152235, roughness: 0.9, metalness: 0.08 });
    const skylineGlow = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.16
    });
    [
      [-520, 0, -220, 54, 120, 54],
      [-420, 0, 210, 62, 148, 62],
      [-310, 0, -260, 74, 174, 70],
      [920, 0, 240, 68, 162, 68],
      [1060, 0, -180, 84, 196, 72],
      [1180, 0, 140, 72, 180, 66]
    ].forEach(([x, y, z, w, h, d], index) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), skylineMaterial);
      tower.position.set(x, h / 2 + y, z);
      this.departureGroup.add(tower);
      const windows = new THREE.Mesh(new THREE.BoxGeometry(w * 0.62, Math.max(4, h * 0.05), d * 0.66), skylineGlow);
      windows.position.set(x, h * 0.7 + y, z);
      this.departureGroup.add(windows);
      if (index < 3) {
        this.addSolidBox("boarding", x, z, w, d, 2);
      }
    });

    const workerGroup = new THREE.Group();
    const workerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 1.02, 0.34),
      new THREE.MeshStandardMaterial({ color: 0xa8b6c8, roughness: 0.4, metalness: 0.42 })
    );
    workerBody.position.y = 1.66;
    const workerHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.28, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.36 })
    );
    workerHead.position.y = 2.34;
    const workerVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.07, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x22d3ee, emissiveIntensity: 0.36 })
    );
    workerVisor.position.set(0, 2.34, 0.16);
    const workerLegLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.86, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.84, metalness: 0.08 })
    );
    workerLegLeft.position.set(-0.12, 0.38, 0);
    const workerLegRight = workerLegLeft.clone();
    workerLegRight.position.x = 0.12;
    const workerArmLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.74, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.18 })
    );
    workerArmLeft.position.set(-0.36, 1.52, 0);
    const workerArmRight = workerArmLeft.clone();
    workerArmRight.position.x = 0.36;
    workerGroup.add(workerBody, workerHead, workerVisor, workerLegLeft, workerLegRight, workerArmLeft, workerArmRight);
    workerGroup.position.set(-108, 0, 22);
    this.departureGroup.add(workerGroup);

    const manifestConsole = new THREE.Mesh(
      new THREE.BoxGeometry(16, 9, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.72, metalness: 0.18, emissive: 0x0f172a, emissiveIntensity: 0.2 })
    );
    manifestConsole.position.set(-90, 4.6, 40);
    this.departureGroup.add(manifestConsole);
    this.addSolidBox("boarding", -90, 40, 18, 12, 1);

    [
      [-80, 3.2, 44, 0x475569],
      [-69, 3.2, 44, 0x334155],
      [-58, 3.2, 44, 0x475569],
      [-80, 9.8, 44, 0x334155],
      [-69, 9.8, 44, 0x475569]
    ].forEach(([x, y, z, color], index) => {
      const container = this.createCargoContainer({
        width: 9.2,
        height: 6.2,
        depth: 6.2,
        bodyColor: color,
        trimColor: 0x1e293b,
        accentColor: index % 2 === 0 ? 0xfbbf24 : 0x67e8f9
      });
      container.position.set(x, y, z);
      this.departureGroup.add(container);
      this.addSolidBox("boarding", x, z, 9.2, 6.2, 0.8);
    });
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
    for (let index = 0; index < 4600; index += 1) {
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
    for (let index = 0; index < 7600; index += 1) {
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
    for (let index = 0; index < 11800; index += 1) {
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
      new THREE.SphereGeometry(220, 28, 28),
      new THREE.MeshBasicMaterial({ color: 0xfff2b5, transparent: true, opacity: 0.98 })
    );
    localStar.position.set(this.segmentWorld.routeLength * 0.92, 860, -3000);
    this.flightGroup.add(localStar);

    const localStarGlow = new THREE.Mesh(
      new THREE.SphereGeometry(420, 24, 24),
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
      const radius = Math.max(58, planet.radius * 0.38);
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
        140 + radius * 0.18 + index * 54,
        this.toRouteZ(planet.worldY) * 1.9
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

    const foregroundPlanet = new THREE.Mesh(
      new THREE.SphereGeometry(210, 40, 40),
      new THREE.MeshStandardMaterial({ color: 0x164e63, emissive: 0x082f49, emissiveIntensity: 0.46, roughness: 0.92 })
    );
    foregroundPlanet.position.set(this.segmentWorld.routeStartX + 620, -260, -960);
    this.flightGroup.add(foregroundPlanet);

    const foregroundAtmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(228, 40, 40),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.12 })
    );
    foregroundAtmosphere.position.copy(foregroundPlanet.position);
    this.flightGroup.add(foregroundAtmosphere);

    const trafficMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.52, metalness: 0.3 });
    [
      [this.segmentWorld.routeStartX + 380, 26, -120],
      [this.segmentWorld.routeStartX + 1160, 42, 180],
      [this.segmentWorld.routeStartX + 1980, -22, -210]
    ].forEach(([x, y, z], index) => {
      const freighter = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(26, 6, 8), trafficMaterial);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(3.2, 8, 10), trafficMaterial);
      nose.rotation.z = -Math.PI / 2;
      nose.position.x = 16;
      freighter.add(hull, nose);
      freighter.position.set(x, y, z);
      freighter.rotation.y = index === 1 ? 0.12 : -0.08;
      this.flightGroup.add(freighter);
    });

    this.corridorAnchors = this.segmentWorld.corridorAnchors.map((anchor) => ({ ...anchor }));
    this.routeEvents = this.segmentWorld.routeEvents.map((event) => this.createRouteEventObject(event));
    this.routeEvents.forEach((event) => {
      this.flightGroup.add(event.mesh);
    });
    this.createCorridorLaneVisuals();

    this.segment.debrisFields.forEach((field, fieldIndex) => {
      const clusterCount = Math.max(2, Math.round(field.count * 0.42));
      const mid = (field.top + field.bottom) / 2;
      const clusterCenters = [
        this.toRouteZ(field.top + (mid - field.top) * 0.45),
        this.toRouteZ(mid),
        this.toRouteZ(mid + (field.bottom - mid) * 0.55)
      ];
      for (let index = 0; index < clusterCount; index += 1) {
        const x =
          this.segmentWorld.routeStartX +
          (field.startX + Math.random() * (field.endX - field.startX) + this.offsetNoise(index + field.startX, 120)) *
            this.routeScale *
            this.routeDistanceScale;
        const clusterZ = clusterCenters[(index + fieldIndex) % clusterCenters.length];
        const z = clusterZ + this.offsetNoise(index + field.endX, 34) + (Math.random() - 0.5) * 28;
        const radius = 0.92 + this.normalizedNoise(index + field.endX, 0.82) * 1.32;
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

    this.segment.movingAsteroids.forEach((asteroid, index) => {
      const radius = asteroid.radius * 0.076;
      const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(radius, 0),
        new THREE.MeshStandardMaterial({ color: 0xd5dee8, roughness: 0.95, metalness: 0.06 })
      );
      const x = this.segmentWorld.routeStartX + asteroid.worldX * this.routeScale * this.routeDistanceScale;
      const z = this.toRouteZ(asteroid.worldY) + this.offsetNoise(index + asteroid.worldX, 46);
      mesh.position.set(x, (this.normalizedNoise(asteroid.worldX, 0.4) - 0.5) * 32, z);
      this.flightGroup.add(mesh);
      this.objects.push({
        kind: "asteroid",
        mesh,
        radius,
        x,
        z,
        minZ: this.toRouteZ(asteroid.maxY) - 36,
        maxZ: this.toRouteZ(asteroid.minY) + 36,
        velocityZ: -asteroid.velocityY * 0.016,
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
    this.arrivalSolids = [];

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(260, 108),
      new THREE.MeshStandardMaterial({ color: 0x0c1322, roughness: 1, metalness: 0.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.arrivalGroup.add(ground);

    const terrainRing = new THREE.Mesh(
      new THREE.CylinderGeometry(180, 236, 34, 84, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x13243b, roughness: 1, metalness: 0.03 })
    );
    terrainRing.position.set(0, -12, 0);
    this.arrivalGroup.add(terrainRing);

    const port = new THREE.Mesh(
      new THREE.BoxGeometry(62, 1.8, 32),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
    );
    port.position.set(18, 0.8, -10);
    port.receiveShadow = true;
    this.arrivalGroup.add(port);

    const office = this.createOperationsBuilding({
      width: 34,
      height: 18,
      depth: 24,
      bodyColor: 0x182438,
      trimColor: 0x334155,
      windowColor: 0x34d399
    });
    office.position.set(60, 9, 28);
    this.arrivalGroup.add(office);
    this.addSolidBox("arrival", 60, 28, 34, 24, 2);

    [
      [-82, 3.2, -42, 0x475569],
      [-71, 3.2, -42, 0x334155],
      [-60, 3.2, -42, 0x475569],
      [-82, 9.8, -42, 0x334155],
      [-71, 9.8, -42, 0x475569],
      [-60, 9.8, -42, 0x334155],
      [-88, 3.2, -28, 0x3f4b5c]
    ].forEach(([x, y, z, color], index) => {
      const container = this.createCargoContainer({
        width: 9.4,
        height: 6.2,
        depth: 6.2,
        bodyColor: color,
        trimColor: 0x1e293b,
        accentColor: index % 2 === 0 ? 0x34d399 : 0x67e8f9
      });
      container.position.set(x, y, z);
      this.arrivalGroup.add(container);
      this.addSolidBox("arrival", x, z, 9.4, 6.2, 0.8);
    });

    const street = new THREE.Mesh(
      new THREE.BoxGeometry(108, 0.05, 16),
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.1 })
    );
    street.position.set(10, 0.08, 2);
    this.arrivalGroup.add(street);

    [-12, 18, 48].forEach((x) => {
      const light = this.createFloodLight(16);
      light.position.set(x, 0, 30);
      this.arrivalGroup.add(light);
    });

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(210, 46, 46),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x1e3a8a, emissiveIntensity: 0.64 })
    );
    planet.position.set(-250, 124, -340);
    this.arrivalGroup.add(planet);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(224, 40, 40),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.16 })
    );
    atmosphere.position.copy(planet.position);
    this.arrivalGroup.add(atmosphere);

    this.addZoneFrame(this.arrivalGroup, this.segmentWorld.arrival.deliveryZone, 0x34d399, "Deliver");
    this.addZoneFrame(this.arrivalGroup, this.segmentWorld.arrival.optionalZone, 0xfacc15, "Locker");
  }

  buildHubWorld(stopover) {
    const THREE = this.THREE;
    const hub = stopover.hub;
    this.clearGroup(this.hubGroup);
    this.hubSolids = [];

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(240, 96),
      new THREE.MeshStandardMaterial({ color: 0x0c1425, roughness: 1, metalness: 0.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.hubGroup.add(ground);

    const hubTerrain = new THREE.Mesh(
      new THREE.CylinderGeometry(170, 220, 28, 84, 1, true),
      new THREE.MeshStandardMaterial({ color: stopover.kind === "refuel" ? 0x1b2940 : 0x221a12, roughness: 1, metalness: 0.02 })
    );
    hubTerrain.position.set(0, -10, 0);
    this.hubGroup.add(hubTerrain);

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(56, 1.8, 30),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.88 })
    );
    pad.position.set(hub.shipSpawn.x, 0.9, hub.shipSpawn.z);
    this.hubGroup.add(pad);

    const office = this.createOperationsBuilding({
      width: 28,
      height: 16,
      depth: 20,
      bodyColor: stopover.kind === "refuel" ? 0x182438 : 0x241b16,
      trimColor: 0x334155,
      windowColor: stopover.kind === "refuel" ? 0x7dd3fc : 0xf59e0b
    });
    office.position.set(58, 8, 36);
    this.hubGroup.add(office);
    this.addSolidBox("hub", 58, 36, 28, 20, 2);

    const containers = [
      [-74, 3.2, 28],
      [-64, 3.2, 28],
      [-74, 9.8, 28],
      [-82, 3.2, 42],
      [-82, 9.8, 42]
    ];
    containers.forEach(([x, y, z], index) => {
      const container = this.createCargoContainer({
        width: 8.8,
        height: 6.2,
        depth: 6.2,
        bodyColor: index % 2 === 0 ? 0x475569 : 0x334155,
        trimColor: 0x1e293b,
        accentColor: stopover.kind === "refuel" ? 0x67e8f9 : 0xf59e0b
      });
      container.position.set(x, y, z);
      this.hubGroup.add(container);
      this.addSolidBox("hub", x, z, 8.8, 6.2, 0.8);
    });

    const skyline = new THREE.Mesh(
      new THREE.CylinderGeometry(240, 290, 56, 96, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x13233c, roughness: 1, metalness: 0.03 })
    );
    skyline.position.set(0, -18, 0);
    this.hubGroup.add(skyline);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(170, 44, 44),
      new THREE.MeshStandardMaterial({
        color: stopover.kind === "refuel" ? 0x7c93c6 : 0xd9a441,
        emissive: stopover.kind === "refuel" ? 0x223a6a : 0x7c2d12,
        emissiveIntensity: 0.44
      })
    );
    planet.position.set(-186, 102, -290);
    this.hubGroup.add(planet);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(182, 40, 40),
      new THREE.MeshBasicMaterial({
        color: stopover.kind === "refuel" ? 0xbcd4ff : 0xfed7aa,
        transparent: true,
        opacity: 0.12
      })
    );
    atmosphere.position.copy(planet.position);
    this.hubGroup.add(atmosphere);

    const serviceBridge = new THREE.Mesh(
      new THREE.BoxGeometry(46, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.16 })
    );
    serviceBridge.position.set(-6, 5.4, -26);
    this.hubGroup.add(serviceBridge);
    this.addSolidBox("hub", -6, -26, 46, 6, 1.2);

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

    const laneMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.05 });
    const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.14 });
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.9 });

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
        const marker = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), markerMaterial.clone());
        marker.position.set(x, 0.6, z);
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
      new THREE.CylinderGeometry(0.9, 1.6, height, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42 })
    );
    beam.position.y = height / 2;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5.2, 0.42, 8, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.6;
    const sprite = this.createLabelSprite(label, color);
    sprite.position.y = height + 5;
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
    sprite.scale.set(24, 6.4, 1);
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

  getWorkerInfo(character) {
    return this.getZoneInfo(character.position, this.segmentWorld.departure.workerZone);
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
    let targetY = 26;
    let stabilizeY = 0.42;
    let upward = 14;
    let forwardAssist = 18;
    let dragPenalty = 0.12;

    if (ship.position.y >= lane.targetY * 0.78) {
      phase = "orbitalBreak";
      targetY = lane.targetY;
      stabilizeY = 0.08;
      upward = 3.8;
      forwardAssist = 20;
      dragPenalty = 0.02;
    } else if (ship.position.y >= lane.lowerY) {
      phase = "upperAtmosphere";
      targetY = lane.targetY * 0.68;
      stabilizeY = 0.16;
      upward = 7.4;
      forwardAssist = 18;
      dragPenalty = 0.04;
    } else if (ship.position.y >= lane.lowerY * 0.32) {
      phase = "lowerAtmosphere";
      targetY = lane.upperY * 0.7;
      stabilizeY = 0.24;
      upward = 10.2;
      forwardAssist = 16;
      dragPenalty = 0.07;
    }

    return {
      phase,
      force: {
        x: 16 * (1 - progress * 0.1),
        y: upward * (1 - progress * 0.12),
        z: -ship.position.z * 0.18
      },
      forwardAssist,
      stabilizeZ: phase === "surface" ? 0.22 : phase === "lowerAtmosphere" ? 0.18 : 0.1,
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
      laneAssist: 0.007 + (laneWidth < 150 ? 0.004 : 0.0015),
      forwardAssist: forwardAssist * 0.82,
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
