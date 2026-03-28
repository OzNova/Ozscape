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
    this.cameraAnchor.position.set(0, 2.38, 0.08);
    this.group.add(this.cameraAnchor);
    this.reset({ x, y: 1.14, z });
  }

  createModel() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const darkSuit = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.86, metalness: 0.06 });
    const cyanSuit = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.62, metalness: 0.08 });
    const trim = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.38, metalness: 0.14 });
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x67e8f9, emissiveIntensity: 0.5 });

    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.38, 0.48), darkSuit);
    hips.position.y = 1.02;
    hips.castShadow = true;

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.28, 8, 12), cyanSuit);
    torso.position.y = 1.88;
    torso.castShadow = true;

    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.94, 0.34), darkSuit);
    backpack.position.set(0, 1.86, -0.3);
    backpack.castShadow = true;

    const chestRig = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.62, 0.2), trim);
    chestRig.position.set(0, 1.88, 0.3);

    const shoulderLeft = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), trim);
    shoulderLeft.position.set(-0.48, 2.18, 0);
    const shoulderRight = shoulderLeft.clone();
    shoulderRight.position.x = 0.48;

    const armGeometry = new THREE.CapsuleGeometry(0.12, 0.84, 4, 8);
    const armLeft = new THREE.Mesh(armGeometry, darkSuit);
    armLeft.position.set(-0.64, 1.62, 0);
    armLeft.rotation.z = 0.14;
    armLeft.castShadow = true;
    const armRight = armLeft.clone();
    armRight.position.x = 0.64;
    armRight.rotation.z = -0.14;

    const legGeometry = new THREE.CapsuleGeometry(0.14, 0.96, 4, 8);
    const legLeft = new THREE.Mesh(legGeometry, darkSuit);
    legLeft.position.set(-0.18, 0.34, 0);
    legLeft.castShadow = true;
    const legRight = legLeft.clone();
    legRight.position.x = 0.18;

    const bootGeometry = new THREE.BoxGeometry(0.24, 0.18, 0.48);
    const bootLeft = new THREE.Mesh(bootGeometry, trim);
    bootLeft.position.set(-0.18, -0.28, 0.08);
    const bootRight = bootLeft.clone();
    bootRight.position.x = 0.18;

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), trim);
    helmet.position.y = 2.76;
    helmet.castShadow = true;

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.12), visorMat);
    visor.position.set(0, 2.76, 0.28);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.14, 10), darkSuit);
    neck.position.y = 2.36;

    this.firstPersonHidden = [helmet, visor];

    group.add(
      hips,
      torso,
      backpack,
      chestRig,
      shoulderLeft,
      shoulderRight,
      armLeft,
      armRight,
      legLeft,
      legRight,
      bootLeft,
      bootRight,
      neck,
      helmet,
      visor
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
    this.cameraAnchor.position.y = 2.38 + this.headBob;
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
    this.firstPersonHidden.forEach((mesh) => {
      mesh.visible = !enabled;
    });
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
    this.baseMaxForwardSpeed = 60;
    this.baseMaxLateralSpeed = 18;
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
    this.cameraAnchor.position.set(2.55, 1.34, 0);

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
      this.cameraAnchor
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
    const thrusting = throttle !== 0 || strafe !== 0;

    this.orientation = lerpAngle(this.orientation, targetYaw, clamp(deltaTime * (2.3 + safeStats.handling * 0.12), 0, 1));
    this.pitch += (targetPitch - this.pitch) * clamp(deltaTime * 2.4, 0, 1);

    const forwardAcceleration = this.baseAcceleration + safeStats.engine * 3.1;
    const lateralAcceleration = this.baseLateralAcceleration + safeStats.handling * 1.6;
    const maxForwardSpeed = this.baseMaxForwardSpeed + safeStats.engine * 3.3;
    const maxLateralSpeed = this.baseMaxLateralSpeed + safeStats.handling * 1.6;
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

    this.velocity.x *= Math.exp(-0.82 * deltaTime);
    this.velocity.z *= Math.exp(-(2.6 - safeStats.handling * 0.05) * deltaTime);
    this.velocity.y *= Math.exp(-(2.15 - safeStats.durability * 0.04) * deltaTime);

    const planarSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (planarSpeed > maxForwardSpeed) {
      const scale = maxForwardSpeed / planarSpeed;
      this.velocity.x *= scale;
      this.velocity.z *= scale;
    }
    this.velocity.y = clamp(this.velocity.y, -12, 12);

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

  setFirstPersonView(_enabled) {}
}

export { ShipPlayer as Player };
