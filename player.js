const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const lerpAngle = (current, target, alpha) => {
  let delta = target - current;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return current + delta * alpha;
};

export class PlayerCharacter {
  constructor(THREE, x, z) {
    this.THREE = THREE;
    this.width = 1.2;
    this.depth = 1.2;
    this.height = 2.35;
    this.baseAcceleration = 48;
    this.baseSpeed = 8.5;
    this.collisionRadius = 1.05;
    this.group = this.createModel();
    this.cameraAnchor = new THREE.Object3D();
    this.cameraAnchor.position.set(0, 2.18, 0.04);
    this.group.add(this.cameraAnchor);
    this.cameraAnchor.add(this.firstPersonCargo);
    this.firstPersonMode = false;
    this.carryingCargo = false;
    this.cargoCarryProgress = 0;
    this.reset({ x, y: 1.14, z });
  }

  createModel() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const shell = new THREE.MeshStandardMaterial({ color: 0x9fb6cb, roughness: 0.46, metalness: 0.42 });
    const joint = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.88, metalness: 0.08 });
    const accent = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.52, metalness: 0.16 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x67e8f9, roughness: 0.34, metalness: 0.22, emissive: 0x0ea5e9, emissiveIntensity: 0.18 });
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x67e8f9, emissiveIntensity: 0.36 });
    const cargoMat = new THREE.MeshStandardMaterial({ color: 0xd8f8ff, emissive: 0x22d3ee, emissiveIntensity: 0.28, roughness: 0.32, metalness: 0.18 });
    const cargoHandleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.74, metalness: 0.16 });

    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.36), joint);
    hips.position.y = 1.01;
    hips.castShadow = true;

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.1, 8, 12), shell);
    torso.position.y = 1.76;
    torso.castShadow = true;

    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.18, 0.18), accent);
    spine.position.set(0, 1.72, -0.16);
    spine.castShadow = true;

    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.84, 0.22), joint);
    backpack.position.set(0, 1.74, -0.22);
    backpack.castShadow = true;

    const chestRig = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.44, 0.14), accent);
    chestRig.position.set(0, 1.78, 0.18);
    chestRig.castShadow = true;

    const shoulderLeft = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), shell);
    shoulderLeft.position.set(-0.34, 2.03, 0);
    const shoulderRight = shoulderLeft.clone();
    shoulderRight.position.x = 0.34;

    const armGeometry = new THREE.CapsuleGeometry(0.09, 0.86, 4, 8);
    const armLeft = new THREE.Mesh(armGeometry, joint);
    armLeft.position.set(-0.48, 1.48, 0);
    armLeft.rotation.z = 0.1;
    armLeft.castShadow = true;
    const armRight = armLeft.clone();
    armRight.position.x = 0.48;
    armRight.rotation.z = -0.1;

    const thighGeometry = new THREE.CapsuleGeometry(0.11, 0.88, 4, 8);
    const legLeft = new THREE.Mesh(thighGeometry, joint);
    legLeft.position.set(-0.18, 0.34, 0);
    legLeft.castShadow = true;
    const legRight = legLeft.clone();
    legRight.position.x = 0.18;

    const shinLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.72, 4, 8), shell);
    shinLeft.position.set(-0.18, 0.02, 0.02);
    shinLeft.castShadow = true;
    const shinRight = shinLeft.clone();
    shinRight.position.x = 0.18;

    const bootGeometry = new THREE.BoxGeometry(0.22, 0.16, 0.38);
    const bootLeft = new THREE.Mesh(bootGeometry, trim);
    bootLeft.position.set(-0.18, -0.35, 0.04);
    const bootRight = bootLeft.clone();
    bootRight.position.x = 0.18;

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 18), shell);
    helmet.position.y = 2.46;
    helmet.castShadow = true;

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.12), visorMat);
    visor.position.set(0, 2.46, 0.2);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 10), joint);
    neck.position.y = 2.16;

    const handCase = new THREE.Group();
    const caseBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.42), cargoMat);
    caseBody.castShadow = true;
    const caseTrim = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.46), cargoHandleMat);
    caseTrim.position.y = 0.12;
    const caseHandle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 16, Math.PI), cargoHandleMat);
    caseHandle.rotation.z = Math.PI;
    caseHandle.position.y = 0.15;
    handCase.add(caseBody, caseTrim, caseHandle);
    handCase.position.set(0.42, 1.18, 0.2);
    handCase.rotation.set(0.18, 0.24, -0.24);
    handCase.visible = false;

    this.firstPersonCargo = new THREE.Group();
    const fpCaseBody = caseBody.clone();
    const fpCaseTrim = caseTrim.clone();
    const fpCaseHandle = caseHandle.clone();
    this.firstPersonCargo.add(fpCaseBody, fpCaseTrim, fpCaseHandle);
    this.firstPersonCargo.position.set(0.22, -0.4, -0.62);
    this.firstPersonCargo.rotation.set(0.12, -0.26, -0.12);
    this.firstPersonCargo.visible = false;

    this.firstPersonHidden = [helmet, visor, neck, torso, backpack, spine, chestRig, shoulderLeft, shoulderRight, armLeft, armRight];
    this.worldCargo = handCase;

    group.add(
      hips,
      torso,
      spine,
      backpack,
      chestRig,
      shoulderLeft,
      shoulderRight,
      armLeft,
      armRight,
      legLeft,
      legRight,
      shinLeft,
      shinRight,
      bootLeft,
      bootRight,
      neck,
      helmet,
      visor,
      handCase
    );

    return group;
  }

  addTo(scene) {
    scene.add(this.group);
  }

  reset(spawn) {
    this.position = {
      x: spawn.x,
      y: spawn.y ?? 1.14,
      z: spawn.z
    };
    this.velocity = { x: 0, z: 0 };
    this.facing = 0;
    this.walkCycle = 0;
    this.headBob = 0;
    this.carryingCargo = false;
    this.cargoCarryProgress = 0;
    this.syncSceneObject();
  }

  update(input, deltaTime, bounds, lookState, collisionResolver = null) {
    const yaw = lookState?.yaw ?? this.facing;
    const forwardInput = (input.w ? 1 : 0) - (input.s ? 1 : 0);
    const strafeInput = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const moveMagnitude = Math.hypot(forwardInput, strafeInput);
    const sprinting = !!input.shift;
    const acceleration = this.baseAcceleration * (sprinting ? 1.55 : 1);
    const maxSpeed = this.baseSpeed * (sprinting ? 1.9 : 1);

    if (moveMagnitude > 0) {
      const forwardX = Math.cos(yaw);
      const forwardZ = Math.sin(yaw);
      const rightX = Math.cos(yaw + Math.PI / 2);
      const rightZ = Math.sin(yaw + Math.PI / 2);
      const desiredX = (forwardX * forwardInput + rightX * strafeInput) / moveMagnitude;
      const desiredZ = (forwardZ * forwardInput + rightZ * strafeInput) / moveMagnitude;
      this.velocity.x += desiredX * acceleration * deltaTime;
      this.velocity.z += desiredZ * acceleration * deltaTime;
      this.walkCycle += deltaTime * (sprinting ? 14.5 : 9.8);
      this.headBob = Math.sin(this.walkCycle) * (sprinting ? 0.065 : 0.045);
    } else {
      this.headBob *= Math.exp(-10 * deltaTime);
    }

    const carryTarget = this.carryingCargo ? 1 : 0;
    this.cargoCarryProgress += (carryTarget - this.cargoCarryProgress) * clamp(deltaTime * 7.5, 0, 1);

    const damping = Math.exp(-9.6 * deltaTime);
    this.velocity.x *= damping;
    this.velocity.z *= damping;

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.velocity.x *= scale;
      this.velocity.z *= scale;
    }

    const attemptedPosition = {
      x: clamp(this.position.x + this.velocity.x * deltaTime, bounds.minX, bounds.maxX),
      z: clamp(this.position.z + this.velocity.z * deltaTime, bounds.minZ, bounds.maxZ)
    };
    const resolvedPosition = collisionResolver
      ? collisionResolver({ x: this.position.x, z: this.position.z }, attemptedPosition, this.collisionRadius)
      : attemptedPosition;

    this.position.x = clamp(resolvedPosition.x, bounds.minX, bounds.maxX);
    this.position.z = clamp(resolvedPosition.z, bounds.minZ, bounds.maxZ);
    this.facing = yaw;
    this.syncSceneObject();

    return {
      moving: moveMagnitude > 0,
      speed: Math.hypot(this.velocity.x, this.velocity.z),
      sprinting
    };
  }

  syncSceneObject() {
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.y = -this.facing + Math.PI / 2;
    this.cameraAnchor.position.y = 2.18 + this.headBob * 0.45;
    this.worldCargo.visible = !this.firstPersonMode && this.cargoCarryProgress > 0.03;
    this.firstPersonCargo.visible = this.firstPersonMode && this.cargoCarryProgress > 0.03;
    this.worldCargo.position.set(0.42, 1.18 + Math.abs(this.headBob) * 0.35, 0.2);
    this.worldCargo.rotation.set(0.16, 0.24, -0.22 + Math.sin(this.walkCycle) * 0.08);
    this.firstPersonCargo.position.set(
      0.22,
      -0.38 + Math.abs(this.headBob) * 0.12 + (1 - this.cargoCarryProgress) * 0.3,
      -0.62
    );
    this.firstPersonCargo.rotation.set(0.12 + Math.sin(this.walkCycle) * 0.03, -0.26, -0.12);
  }

  getBounds() {
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height / 2,
      z: this.position.z - this.depth / 2,
      width: this.width,
      height: this.height,
      depth: this.depth
    };
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  setFirstPersonView(enabled) {
    this.firstPersonMode = enabled;
    this.firstPersonHidden.forEach((mesh) => {
      mesh.visible = !enabled;
    });
    this.worldCargo.visible = !enabled && this.cargoCarryProgress > 0.03;
    this.firstPersonCargo.visible = enabled && this.cargoCarryProgress > 0.03;
  }

  setCargoCarried(enabled, immediate = false) {
    this.carryingCargo = enabled;
    if (immediate) {
      this.cargoCarryProgress = enabled ? 1 : 0;
      this.syncSceneObject();
    }
  }
}

export class ShipPlayer {
  constructor(THREE, x, z) {
    this.THREE = THREE;
    this.width = 11.4;
    this.depth = 8.4;
    this.height = 4.8;
    this.baseAcceleration = 15.9;
    this.baseLateralAcceleration = 7.6;
    this.baseVerticalAcceleration = 31.5;
    this.baseMaxForwardSpeed = 118;
    this.baseMaxLateralSpeed = 16.4;
    this.baseMaxVerticalSpeed = 32;
    this.baseLift = 23.5;
    this.collisionRadius = 4.5;
    this.group = this.createModel();
    this.reset({ x, y: 3.8, z }, { engine: 0, handling: 0, durability: 0 });
  }

  createModel() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0xdbe6f2,
      roughness: 0.46,
      metalness: 0.28,
      emissive: 0x0f172a,
      emissiveIntensity: 0.18
    });
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.84,
      metalness: 0.16
    });
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.72,
      metalness: 0.22
    });
    const trimMaterial = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.92
    });
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: 0x9bd5ff,
      roughness: 0.12,
      metalness: 0.06,
      transparent: true,
      opacity: 0.46,
      emissive: 0x0f172a,
      emissiveIntensity: 0.12
    });
    const engineMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.56,
      metalness: 0.48
    });

    const nose = new THREE.Mesh(new THREE.ConeGeometry(1.72, 6.4, 10), hullMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 7.3;
    nose.castShadow = true;

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.86, 2.24, 12.8, 18), hullMaterial);
    fuselage.rotation.z = -Math.PI / 2;
    fuselage.castShadow = true;

    const lowerHull = new THREE.Mesh(new THREE.BoxGeometry(11.8, 2.05, 4.35), plateMaterial);
    lowerHull.position.set(-0.9, -0.46, 0);
    lowerHull.castShadow = true;

    const cargoBody = new THREE.Mesh(new THREE.BoxGeometry(9.4, 3.18, 4.48), frameMaterial);
    cargoBody.position.set(-4.9, 0.28, 0);
    cargoBody.castShadow = true;

    const cargoSpine = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.18, 1.72), hullMaterial);
    cargoSpine.position.set(-4.8, 1.62, 0);
    cargoSpine.castShadow = true;

    const noseFairing = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.22, 2.08), hullMaterial);
    noseFairing.position.set(4.86, 0.18, 0);
    noseFairing.castShadow = true;

    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 2.44), frameMaterial);
    bridgeDeck.position.set(1.12, 1.96, 0);
    bridgeDeck.castShadow = true;

    const hullChineLeft = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.24, 0.92), frameMaterial);
    hullChineLeft.position.set(0.4, -0.92, -1.86);
    hullChineLeft.castShadow = true;
    const hullChineRight = hullChineLeft.clone();
    hullChineRight.position.z = 1.86;

    const cargoShoulderLeft = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.22, 0.24), hullMaterial);
    cargoShoulderLeft.position.set(-4.8, 1.06, -2.14);
    cargoShoulderLeft.castShadow = true;
    const cargoShoulderRight = cargoShoulderLeft.clone();
    cargoShoulderRight.position.z = 2.14;

    const dorsalFin = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.7, 0.36), frameMaterial);
    dorsalFin.position.set(-0.8, 1.76, 0);
    dorsalFin.castShadow = true;

    const ventralFin = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.34, 1.82), frameMaterial);
    ventralFin.position.set(-3.7, -1.38, 0);
    ventralFin.castShadow = true;

    const sideFinGeometry = new THREE.BoxGeometry(5.3, 0.32, 2.3);
    const sideFinLeft = new THREE.Mesh(sideFinGeometry, frameMaterial);
    sideFinLeft.position.set(-1.8, -0.58, -2.76);
    sideFinLeft.castShadow = true;
    const sideFinRight = sideFinLeft.clone();
    sideFinRight.position.z = 2.76;

    const enginePodGeometry = new THREE.CylinderGeometry(0.74, 0.88, 2.6, 18);
    const enginePodLeft = new THREE.Mesh(enginePodGeometry, engineMaterial);
    enginePodLeft.rotation.z = -Math.PI / 2;
    enginePodLeft.position.set(-8.9, -0.1, -1.52);
    enginePodLeft.castShadow = true;
    const enginePodRight = enginePodLeft.clone();
    enginePodRight.position.z = 1.52;

    const centerEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 1.02, 3.1, 18), engineMaterial);
    centerEngine.rotation.z = -Math.PI / 2;
    centerEngine.position.set(-9.1, 0.06, 0);
    centerEngine.castShadow = true;

    const engineShroudLeft = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.24, 1.16), frameMaterial);
    engineShroudLeft.position.set(-7.95, 0.18, -1.52);
    engineShroudLeft.castShadow = true;
    const engineShroudRight = engineShroudLeft.clone();
    engineShroudRight.position.z = 1.52;

    const engineRingLeft = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.09, 10, 18), trimMaterial);
    engineRingLeft.rotation.y = Math.PI / 2;
    engineRingLeft.position.set(-10.15, -0.1, -1.52);
    const engineRingRight = engineRingLeft.clone();
    engineRingRight.position.z = 1.52;
    const engineRingCenter = engineRingLeft.clone();
    engineRingCenter.position.set(-10.35, 0.06, 0);

    const cargoRibGeometry = new THREE.BoxGeometry(0.18, 2.6, 3.9);
    const cargoRibA = new THREE.Mesh(cargoRibGeometry, hullMaterial);
    cargoRibA.position.set(-1.7, 0.22, 0);
    const cargoRibB = cargoRibA.clone();
    cargoRibB.position.x = -4.4;
    const cargoRibC = cargoRibA.clone();
    cargoRibC.position.x = -6.8;

    const cargoRailLeft = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.18, 0.18), trimMaterial);
    cargoRailLeft.position.set(-4.3, 0.48, -2.22);
    const cargoRailRight = cargoRailLeft.clone();
    cargoRailRight.position.z = 2.22;

    const cargoBayFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.86, 0.14), frameMaterial);
    cargoBayFrame.position.set(-1.7, 0.32, -2.3);
    cargoBayFrame.castShadow = true;
    const cargoBayDoor = new THREE.Mesh(new THREE.BoxGeometry(2.32, 1.42, 0.1), plateMaterial);
    cargoBayDoor.position.set(-1.72, 0.26, -2.38);
    const cargoBayStrip = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.08, 0.08), trimMaterial);
    cargoBayStrip.position.set(-1.72, 1.08, -2.42);

    const cockpitBase = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.4, 2.1), frameMaterial);
    cockpitBase.position.set(2.75, 1.12, 0);
    cockpitBase.castShadow = true;

    const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.9), hullMaterial);
    noseBridge.position.set(4.9, 0.78, 0);
    noseBridge.castShadow = true;

    const canopyGlass = new THREE.Mesh(new THREE.BoxGeometry(2.72, 1.06, 1.78), canopyMaterial);
    canopyGlass.position.set(2.95, 1.46, 0);

    const canopyFrameFront = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.22, 1.64), hullMaterial);
    canopyFrameFront.position.set(4.18, 1.42, 0);
    const canopyFrameRear = canopyFrameFront.clone();
    canopyFrameRear.position.x = 1.72;
    const canopyFrameTop = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.14, 1.72), hullMaterial);
    canopyFrameTop.position.set(2.95, 2.0, 0);
    const canopyFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(2.48, 1.14, 0.14), hullMaterial);
    canopyFrameLeft.position.set(2.95, 1.42, -0.82);
    const canopyFrameRight = canopyFrameLeft.clone();
    canopyFrameRight.position.z = 0.82;

    const dockingCollar = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.14, 12, 24), frameMaterial);
    dockingCollar.rotation.y = Math.PI / 2;
    dockingCollar.position.set(5.62, 0.56, 0);

    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.38, 0.92), plateMaterial);
    dashboard.position.set(3.48, 0.88, 0);

    const dashboardLight = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.05, 0.24), trimMaterial);
    dashboardLight.position.set(3.58, 1.07, 0);

    const sideConsoleLeft = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.4, 0.52), plateMaterial);
    sideConsoleLeft.position.set(2.7, 0.84, -0.82);
    const sideConsoleRight = sideConsoleLeft.clone();
    sideConsoleRight.position.z = 0.82;

    const bridgeMount = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.72, 1.2), frameMaterial);
    bridgeMount.position.set(1.44, 1.02, 0);
    bridgeMount.castShadow = true;

    const landingSkidLeft = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.16, 0.22), frameMaterial);
    landingSkidLeft.position.set(-3.8, -1.86, -1.84);
    const landingSkidRight = landingSkidLeft.clone();
    landingSkidRight.position.z = 1.84;

    const skidStrutGeometry = new THREE.BoxGeometry(0.16, 1.05, 0.16);
    const skidStrutA = new THREE.Mesh(skidStrutGeometry, frameMaterial);
    skidStrutA.position.set(-2.4, -1.3, -1.84);
    const skidStrutB = skidStrutA.clone();
    skidStrutB.position.x = -5.2;
    const skidStrutC = skidStrutA.clone();
    skidStrutC.position.z = 1.84;
    const skidStrutD = skidStrutB.clone();
    skidStrutD.position.z = 1.84;

    const maneuverPodLeft = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.42, 1.36), engineMaterial);
    maneuverPodLeft.position.set(1.1, -0.12, -2.48);
    const maneuverPodRight = maneuverPodLeft.clone();
    maneuverPodRight.position.z = 2.48;

    const ventralKeel = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.28, 1.42), frameMaterial);
    ventralKeel.position.set(-4.8, -1.12, 0);
    ventralKeel.castShadow = true;

    const radiatorLeft = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 1.7), frameMaterial);
    radiatorLeft.position.set(-3.6, 0.1, -3.24);
    radiatorLeft.castShadow = true;
    const radiatorRight = radiatorLeft.clone();
    radiatorRight.position.z = 3.24;

    const attitudeThrusterLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.52, 10), trimMaterial);
    attitudeThrusterLeft.rotation.z = -Math.PI / 2;
    attitudeThrusterLeft.position.set(1.5, -0.12, -3.06);
    const attitudeThrusterRight = attitudeThrusterLeft.clone();
    attitudeThrusterRight.position.z = 3.06;

    const dorsalArray = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 2.1), trimMaterial);
    dorsalArray.position.set(-2.1, 2.28, 0);

    const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.95 });
    this.leftFlame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.7, 10), flameMaterial);
    this.leftFlame.rotation.z = Math.PI / 2;
    this.leftFlame.position.set(-10.6, -0.1, -1.52);
    this.rightFlame = this.leftFlame.clone();
    this.rightFlame.position.z = 1.52;
    this.centerFlame = this.leftFlame.clone();
    this.centerFlame.position.set(-10.9, 0.05, 0);
    this.centerFlame.scale.set(1.2, 1.2, 1.2);

    this.thrusterGlow = new THREE.PointLight(0xfb7185, 1.4, 26, 2);
    this.thrusterGlow.position.set(-11.2, 0.1, 0);

    this.cameraAnchor = new THREE.Object3D();
    this.cameraAnchor.position.set(5.4, 2.12, 0);
    this.cameraLookAnchor = new THREE.Object3D();
    this.cameraLookAnchor.position.set(32, 2.2, 0);
    this.closeChaseAnchor = new THREE.Object3D();
    this.closeChaseAnchor.position.set(-24, 8.8, 0);
    this.farChaseAnchor = new THREE.Object3D();
    this.farChaseAnchor.position.set(-44, 14.8, 0);
    this.firstPersonHidden = [cockpitBase, noseBridge, canopyGlass, canopyFrameFront, canopyFrameRear, canopyFrameTop, canopyFrameLeft, canopyFrameRight, dashboard, dashboardLight, sideConsoleLeft, sideConsoleRight, bridgeMount];
    this.firstPersonVisibleOnly = [];
    this.firstPersonMode = false;

    const runningLights = [
      [-2.8, 0.78, -2.02],
      [-2.8, 0.78, 2.02],
      [4.46, 0.52, 0],
      [-7.5, 0.5, 0]
    ];
    runningLights.forEach(([x, y, z]) => {
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), trimMaterial);
      light.position.set(x, y, z);
      group.add(light);
    });

    group.add(
      nose,
      fuselage,
      lowerHull,
      cargoBody,
      cargoSpine,
      noseFairing,
      bridgeDeck,
      hullChineLeft,
      hullChineRight,
      cargoShoulderLeft,
      cargoShoulderRight,
      dorsalFin,
      ventralFin,
      sideFinLeft,
      sideFinRight,
      enginePodLeft,
      enginePodRight,
      centerEngine,
      engineShroudLeft,
      engineShroudRight,
      engineRingLeft,
      engineRingRight,
      engineRingCenter,
      cargoRibA,
      cargoRibB,
      cargoRibC,
      cargoRailLeft,
      cargoRailRight,
      cargoBayFrame,
      cargoBayDoor,
      cargoBayStrip,
      cockpitBase,
      noseBridge,
      canopyGlass,
      canopyFrameFront,
      canopyFrameRear,
      canopyFrameTop,
      canopyFrameLeft,
      canopyFrameRight,
      dockingCollar,
      dashboard,
      dashboardLight,
      sideConsoleLeft,
      sideConsoleRight,
      bridgeMount,
      landingSkidLeft,
      landingSkidRight,
      skidStrutA,
      skidStrutB,
      skidStrutC,
      skidStrutD,
      maneuverPodLeft,
      maneuverPodRight,
      ventralKeel,
      radiatorLeft,
      radiatorRight,
      attitudeThrusterLeft,
      attitudeThrusterRight,
      dorsalArray,
      this.leftFlame,
      this.rightFlame,
      this.centerFlame,
      this.thrusterGlow,
      this.cameraAnchor,
      this.cameraLookAnchor,
      this.closeChaseAnchor,
      this.farChaseAnchor
    );

    return group;
  }

  addTo(scene) {
    scene.add(this.group);
  }

  reset(spawn, stats) {
    this.position = {
      x: spawn.x,
      y: spawn.y ?? 3.8,
      z: spawn.z
    };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.orientation = 0;
    this.pitch = 0;
    this.renderOrientation = 0;
    this.renderPitch = 0;
    this.lastThrusting = false;
    this.lastBoosting = false;
    this.lastStats = { ...stats };
    this.syncSceneObject();
  }

  update(input, deltaTime, bounds, stats, environment = {}, viewState = {}) {
    const safeStats = {
      engine: Number(stats.engine) || 0,
      handling: Number(stats.handling) || 0,
      durability: Number(stats.durability) || 0
    };
    this.lastStats = { ...safeStats };

    const targetYaw = Number.isFinite(viewState.yaw) ? viewState.yaw : this.orientation;
    const targetPitch = clamp(Number.isFinite(viewState.pitch) ? viewState.pitch : 0, -0.42, 0.38);
    const throttle = (input.w ? 1 : 0) - (input.s ? 0.7 : 0);
    const strafe = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const verticalInput = (input.space ? 1 : 0) - (input.ctrl ? 1 : 0);
    const boosting = !!input.shift && throttle > 0;
    const thrusting = throttle !== 0 || strafe !== 0 || verticalInput !== 0;

    this.orientation = lerpAngle(this.orientation, targetYaw, clamp(deltaTime * (1.35 + safeStats.handling * 0.08), 0, 1));
    this.pitch += (targetPitch - this.pitch) * clamp(deltaTime * 1.55, 0, 1);

    const boostFactor = boosting ? 1.68 : 1;
    const forwardAcceleration = (this.baseAcceleration + safeStats.engine * 2.8) * boostFactor;
    const lateralAcceleration = this.baseLateralAcceleration + safeStats.handling * 1.25;
    const verticalAcceleration = this.baseVerticalAcceleration + safeStats.engine * 1.5 + safeStats.handling * 0.9;
    const maxForwardSpeed = (this.baseMaxForwardSpeed + safeStats.engine * 4.6) * (boosting ? 1.48 : 1);
    const maxLateralSpeed = this.baseMaxLateralSpeed + safeStats.handling * 1.4;
    const maxVerticalSpeed = this.baseMaxVerticalSpeed + safeStats.engine * 1.3;
    const verticalLift = (this.baseLift + safeStats.engine * 1.8) * (boosting ? 1.08 : 1);

    const forwardX = Math.cos(targetYaw);
    const forwardZ = Math.sin(targetYaw);
    const rightX = Math.cos(targetYaw + Math.PI / 2);
    const rightZ = Math.sin(targetYaw + Math.PI / 2);
    const pitchLiftFactor = Math.sin(targetPitch);
    const flatPitchFactor = Math.max(0.28, Math.cos(Math.abs(targetPitch)));

    this.velocity.x += forwardX * throttle * forwardAcceleration * flatPitchFactor * deltaTime;
    this.velocity.z += forwardZ * throttle * forwardAcceleration * flatPitchFactor * deltaTime;
    this.velocity.y += throttle * verticalLift * pitchLiftFactor * deltaTime;
    this.velocity.x += rightX * strafe * lateralAcceleration * deltaTime;
    this.velocity.z += rightZ * strafe * lateralAcceleration * deltaTime;
    this.velocity.y += verticalInput * verticalAcceleration * deltaTime;

    if (environment.force) {
      this.velocity.x += (environment.force.x ?? 0) * deltaTime;
      this.velocity.y += (environment.force.y ?? 0) * deltaTime;
      this.velocity.z += (environment.force.z ?? 0) * deltaTime;
    }

    if (environment.forwardAssist) {
      this.velocity.x += forwardX * environment.forwardAssist * deltaTime;
      this.velocity.z += forwardZ * environment.forwardAssist * deltaTime;
    }

    if (environment.stabilizeZ) {
      this.velocity.z += ((environment.targetZ ?? 0) - this.position.z) * environment.stabilizeZ * deltaTime;
    }
    if (environment.stabilizeY) {
      this.velocity.y += ((environment.targetY ?? this.position.y) - this.position.y) * environment.stabilizeY * deltaTime;
    }

    if (throttle > 0 || strafe !== 0) {
      const lateralAlongRight = this.velocity.x * rightX + this.velocity.z * rightZ;
      const steerAssist = clamp(deltaTime * (1.6 + safeStats.handling * 0.12 + (boosting ? 0.28 : 0)), 0, 1);
      this.velocity.x -= rightX * lateralAlongRight * steerAssist;
      this.velocity.z -= rightZ * lateralAlongRight * steerAssist;
    }

    this.velocity.x *= Math.exp(-(0.72 + (boosting ? 0.06 : 0)) * deltaTime);
    this.velocity.z *= Math.exp(-(1.78 - safeStats.handling * 0.05) * deltaTime);
    this.velocity.y *= Math.exp(-(1.72 - safeStats.durability * 0.04) * deltaTime);

    const planarSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (planarSpeed > maxForwardSpeed) {
      const scale = maxForwardSpeed / planarSpeed;
      this.velocity.x *= scale;
      this.velocity.z *= scale;
    }
    this.velocity.y = clamp(this.velocity.y, -maxVerticalSpeed, maxVerticalSpeed);

    const lateralAlongRight = this.velocity.x * rightX + this.velocity.z * rightZ;
    if (Math.abs(lateralAlongRight) > maxLateralSpeed) {
      const excess = lateralAlongRight - clamp(lateralAlongRight, -maxLateralSpeed, maxLateralSpeed);
      this.velocity.x -= rightX * excess;
      this.velocity.z -= rightZ * excess;
    }

    this.position.x = clamp(this.position.x + this.velocity.x * deltaTime, bounds.minX, bounds.maxX);
    this.position.y = clamp(this.position.y + this.velocity.y * deltaTime, bounds.minY, bounds.maxY);
    this.position.z = clamp(this.position.z + this.velocity.z * deltaTime, bounds.minZ, bounds.maxZ);

    this.renderOrientation = lerpAngle(this.renderOrientation, this.orientation, clamp(deltaTime * 3.8, 0, 1));
    this.renderPitch += (this.pitch - this.renderPitch) * clamp(deltaTime * 3.4, 0, 1);
    this.lastThrusting = thrusting;
    this.lastBoosting = boosting;
    this.syncSceneObject();

    return {
      thrusting,
      boosting,
      speed: Math.hypot(this.velocity.x, this.velocity.z),
      stable: Math.hypot(this.velocity.x, this.velocity.z, this.velocity.y) < 22 + safeStats.durability * 1.9,
      driftRatio: clamp(Math.abs(lateralAlongRight) / Math.max(maxLateralSpeed, 1), 0, 1)
    };
  }

  syncSceneObject() {
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.y = -this.renderOrientation;
    this.group.rotation.z = clamp(-this.velocity.z * 0.0046, -0.06, 0.06);
    this.group.rotation.x = clamp(-this.renderPitch * 0.24 + this.velocity.y * 0.0075, -0.12, 0.12);
    const flameScale = this.lastBoosting ? 1.8 : this.lastThrusting ? 1.32 : 0.55;
    this.leftFlame.scale.set(1, flameScale, 1);
    this.rightFlame.scale.set(1, flameScale, 1);
    this.centerFlame.scale.set(1.15, flameScale * 1.12, 1.15);
    this.leftFlame.material.opacity = this.lastBoosting ? 1 : this.lastThrusting ? 0.98 : 0.38;
    this.rightFlame.material.opacity = this.lastBoosting ? 1 : this.lastThrusting ? 0.98 : 0.38;
    this.centerFlame.material.opacity = this.lastBoosting ? 1 : this.lastThrusting ? 0.96 : 0.34;
    this.thrusterGlow.intensity = this.lastBoosting ? 4.4 : this.lastThrusting ? 3 : 1.15;
  }

  getTelemetry() {
    return {
      speed: Math.hypot(this.velocity.x, this.velocity.z),
      velocity: { ...this.velocity },
      position: { ...this.position },
      orientation: this.renderOrientation,
      pitch: this.renderPitch,
      thrusting: this.lastThrusting,
      boosting: !!this.lastBoosting
    };
  }

  getBounds() {
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height / 2,
      z: this.position.z - this.depth / 2,
      width: this.width,
      height: this.height,
      depth: this.depth
    };
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  setFirstPersonView(enabled) {
    this.firstPersonMode = enabled;
    this.firstPersonHidden.forEach((mesh) => {
      mesh.visible = !enabled;
    });
    this.firstPersonVisibleOnly.forEach((mesh) => {
      mesh.visible = true;
      mesh.scale.setScalar(enabled ? 0.82 : 1);
    });
    this.cameraAnchor.position.set(enabled ? 5.08 : 3.1, enabled ? 2.08 : 1.5, 0);
  }
}

export { ShipPlayer as Player };
