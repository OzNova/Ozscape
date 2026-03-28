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

  update(input, deltaTime, bounds, lookState) {
    const yaw = lookState?.yaw ?? this.facing;
    const forwardInput = (input.w ? 1 : 0) - (input.s ? 1 : 0);
    const strafeInput = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const moveMagnitude = Math.hypot(forwardInput, strafeInput);

    if (moveMagnitude > 0) {
      const forwardX = Math.cos(yaw);
      const forwardZ = Math.sin(yaw);
      const rightX = Math.cos(yaw + Math.PI / 2);
      const rightZ = Math.sin(yaw + Math.PI / 2);
      const desiredX = (forwardX * forwardInput + rightX * strafeInput) / moveMagnitude;
      const desiredZ = (forwardZ * forwardInput + rightZ * strafeInput) / moveMagnitude;
      this.velocity.x += desiredX * this.baseAcceleration * deltaTime;
      this.velocity.z += desiredZ * this.baseAcceleration * deltaTime;
      this.walkCycle += deltaTime * 9.8;
      this.headBob = Math.sin(this.walkCycle) * 0.045;
    } else {
      this.headBob *= Math.exp(-10 * deltaTime);
    }

    const carryTarget = this.carryingCargo ? 1 : 0;
    this.cargoCarryProgress += (carryTarget - this.cargoCarryProgress) * clamp(deltaTime * 7.5, 0, 1);

    const damping = Math.exp(-9.6 * deltaTime);
    this.velocity.x *= damping;
    this.velocity.z *= damping;

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > this.baseSpeed) {
      const scale = this.baseSpeed / speed;
      this.velocity.x *= scale;
      this.velocity.z *= scale;
    }

    this.position.x = clamp(this.position.x + this.velocity.x * deltaTime, bounds.minX, bounds.maxX);
    this.position.z = clamp(this.position.z + this.velocity.z * deltaTime, bounds.minZ, bounds.maxZ);
    this.facing = yaw;
    this.syncSceneObject();

    return {
      moving: moveMagnitude > 0,
      speed: Math.hypot(this.velocity.x, this.velocity.z)
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
    this.width = 10;
    this.depth = 7.2;
    this.height = 4.2;
    this.baseAcceleration = 30;
    this.baseLateralAcceleration = 14;
    this.baseVerticalAcceleration = 24;
    this.baseMaxForwardSpeed = 60;
    this.baseMaxLateralSpeed = 18;
    this.baseMaxVerticalSpeed = 16;
    this.baseLift = 18;
    this.collisionRadius = 4.2;
    this.group = this.createModel();
    this.reset({ x, y: 3.8, z }, { engine: 0, handling: 0, durability: 0 });
  }

  createModel() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9e6f7,
      roughness: 0.42,
      metalness: 0.26,
      emissive: 0x0f172a,
      emissiveIntensity: 0.22
    });
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.82,
      metalness: 0.18
    });
    const trimMaterial = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.15
    });

    const nose = new THREE.Mesh(new THREE.ConeGeometry(1.8, 6.2, 8), hullMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 6.3;
    nose.castShadow = true;

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 10.8, 16), hullMaterial);
    fuselage.rotation.z = -Math.PI / 2;
    fuselage.castShadow = true;

    const lowerHull = new THREE.Mesh(new THREE.BoxGeometry(9.8, 1.9, 3.8), plateMaterial);
    lowerHull.position.set(-0.4, -0.5, 0);
    lowerHull.castShadow = true;

    const cargoBody = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.7, 3.4), plateMaterial);
    cargoBody.position.set(-3.5, 0.2, 0);
    cargoBody.castShadow = true;

    const dorsalFin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.4, 0.32), plateMaterial);
    dorsalFin.position.set(-1.1, 1.55, 0);
    dorsalFin.castShadow = true;

    const sideFinGeometry = new THREE.BoxGeometry(4.8, 0.28, 2.2);
    const sideFinLeft = new THREE.Mesh(sideFinGeometry, plateMaterial);
    sideFinLeft.position.set(-1.6, -0.6, -2.55);
    sideFinLeft.castShadow = true;
    const sideFinRight = sideFinLeft.clone();
    sideFinRight.position.z = 2.55;

    const enginePodGeometry = new THREE.CylinderGeometry(0.62, 0.62, 2.1, 16);
    const enginePodLeft = new THREE.Mesh(enginePodGeometry, plateMaterial);
    enginePodLeft.rotation.z = -Math.PI / 2;
    enginePodLeft.position.set(-7.8, -0.15, -1.35);
    enginePodLeft.castShadow = true;
    const enginePodRight = enginePodLeft.clone();
    enginePodRight.position.z = 1.35;

    const cockpitBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.25, 1.8), trimMaterial);
    cockpitBase.position.set(2.45, 1.05, 0);
    cockpitBase.castShadow = true;

    const canopyFrameFront = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 1.55), hullMaterial);
    canopyFrameFront.position.set(3.55, 1.3, 0);
    const canopyFrameRear = canopyFrameFront.clone();
    canopyFrameRear.position.x = 1.65;
    const canopyFrameTop = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.12, 1.55), hullMaterial);
    canopyFrameTop.position.set(2.6, 1.85, 0);
    const canopyFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.05, 0.12), hullMaterial);
    canopyFrameLeft.position.set(2.6, 1.3, -0.72);
    const canopyFrameRight = canopyFrameLeft.clone();
    canopyFrameRight.position.z = 0.72;

    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.8), plateMaterial);
    dashboard.position.set(3.05, 0.82, 0);

    const dashboardLight = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.05, 0.24), trimMaterial);
    dashboardLight.position.set(3.3, 1.01, 0);

    const sideConsoleLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.45), plateMaterial);
    sideConsoleLeft.position.set(2.5, 0.8, -0.66);
    const sideConsoleRight = sideConsoleLeft.clone();
    sideConsoleRight.position.z = 0.66;

    const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.95 });
    this.leftFlame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.7, 10), flameMaterial);
    this.leftFlame.rotation.z = Math.PI / 2;
    this.leftFlame.position.set(-9.2, -0.15, -1.35);
    this.rightFlame = this.leftFlame.clone();
    this.rightFlame.position.z = 1.35;

    this.thrusterGlow = new THREE.PointLight(0xfb7185, 1.4, 26, 2);
    this.thrusterGlow.position.set(-10.2, 0.1, 0);

    this.cameraAnchor = new THREE.Object3D();
    this.cameraAnchor.position.set(4.15, 1.86, 0);
    this.cameraLookAnchor = new THREE.Object3D();
    this.cameraLookAnchor.position.set(12.4, 1.8, 0);
    this.closeChaseAnchor = new THREE.Object3D();
    this.closeChaseAnchor.position.set(-11.5, 5.8, 0);
    this.farChaseAnchor = new THREE.Object3D();
    this.farChaseAnchor.position.set(-20.5, 9.4, 0);
    this.firstPersonHidden = [cockpitBase, canopyFrameRear, canopyFrameTop, canopyFrameLeft, canopyFrameRight, dashboard, dashboardLight, sideConsoleLeft, sideConsoleRight];
    this.firstPersonVisibleOnly = [canopyFrameFront];
    this.firstPersonMode = false;

    const runningLights = [
      [-2.6, 0.72, -1.8],
      [-2.6, 0.72, 1.8],
      [4.1, 0.42, 0]
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
      dorsalFin,
      sideFinLeft,
      sideFinRight,
      enginePodLeft,
      enginePodRight,
      cockpitBase,
      canopyFrameFront,
      canopyFrameRear,
      canopyFrameTop,
      canopyFrameLeft,
      canopyFrameRight,
      dashboard,
      dashboardLight,
      sideConsoleLeft,
      sideConsoleRight,
      this.leftFlame,
      this.rightFlame,
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
    const verticalInput = (input.space ? 1 : 0) - ((input.shift || input.ctrl) ? 1 : 0);
    const thrusting = throttle !== 0 || strafe !== 0 || verticalInput !== 0;

    this.orientation = lerpAngle(this.orientation, targetYaw, clamp(deltaTime * (2.3 + safeStats.handling * 0.12), 0, 1));
    this.pitch += (targetPitch - this.pitch) * clamp(deltaTime * 2.4, 0, 1);

    const forwardAcceleration = this.baseAcceleration + safeStats.engine * 3.1;
    const lateralAcceleration = this.baseLateralAcceleration + safeStats.handling * 1.6;
    const verticalAcceleration = this.baseVerticalAcceleration + safeStats.engine * 1.8 + safeStats.handling * 0.8;
    const maxForwardSpeed = this.baseMaxForwardSpeed + safeStats.engine * 3.3;
    const maxLateralSpeed = this.baseMaxLateralSpeed + safeStats.handling * 1.6;
    const maxVerticalSpeed = this.baseMaxVerticalSpeed + safeStats.engine * 1.2;
    const verticalLift = this.baseLift + safeStats.engine * 1.6;

    const forwardX = Math.cos(this.orientation);
    const forwardZ = Math.sin(this.orientation);
    const rightX = Math.cos(this.orientation + Math.PI / 2);
    const rightZ = Math.sin(this.orientation + Math.PI / 2);
    const pitchLiftFactor = Math.sin(this.pitch);
    const flatPitchFactor = Math.max(0.2, Math.cos(Math.abs(this.pitch)));

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
      this.velocity.z += (0 - this.position.z) * environment.stabilizeZ * deltaTime;
    }
    if (environment.stabilizeY) {
      this.velocity.y += (environment.targetY - this.position.y) * environment.stabilizeY * deltaTime;
    }

    this.velocity.x *= Math.exp(-1.1 * deltaTime);
    this.velocity.z *= Math.exp(-(3 - safeStats.handling * 0.05) * deltaTime);
    this.velocity.y *= Math.exp(-(2.6 - safeStats.durability * 0.04) * deltaTime);

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

    this.renderOrientation = lerpAngle(this.renderOrientation, this.orientation, clamp(deltaTime * 4.4, 0, 1));
    this.renderPitch += (this.pitch - this.renderPitch) * clamp(deltaTime * 4.1, 0, 1);
    this.lastThrusting = thrusting;
    this.syncSceneObject();

    return {
      thrusting,
      speed: Math.hypot(this.velocity.x, this.velocity.z),
      stable: Math.hypot(this.velocity.x, this.velocity.z, this.velocity.y) < 13 + safeStats.durability * 1.4,
      driftRatio: clamp(Math.abs(lateralAlongRight) / Math.max(maxLateralSpeed, 1), 0, 1)
    };
  }

  syncSceneObject() {
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.y = -this.renderOrientation;
    this.group.rotation.z = clamp(-this.velocity.z * 0.02, -0.22, 0.22);
    this.group.rotation.x = clamp(-this.renderPitch * 0.5 + this.velocity.y * 0.02, -0.28, 0.28);
    const flameScale = this.lastThrusting ? 1.32 : 0.55;
    this.leftFlame.scale.set(1, flameScale, 1);
    this.rightFlame.scale.set(1, flameScale, 1);
    this.leftFlame.material.opacity = this.lastThrusting ? 0.98 : 0.38;
    this.rightFlame.material.opacity = this.lastThrusting ? 0.98 : 0.38;
    this.thrusterGlow.intensity = this.lastThrusting ? 3 : 1.15;
  }

  getTelemetry() {
    return {
      speed: Math.hypot(this.velocity.x, this.velocity.z),
      velocity: { ...this.velocity },
      position: { ...this.position },
      orientation: this.renderOrientation,
      pitch: this.renderPitch,
      thrusting: this.lastThrusting
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
    this.cameraAnchor.position.set(enabled ? 4.15 : 2.55, enabled ? 1.86 : 1.34, 0);
  }
}

export { ShipPlayer as Player };
