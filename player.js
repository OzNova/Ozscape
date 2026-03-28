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
    this.width = 1.4;
    this.depth = 1.4;
    this.height = 2.2;
    this.baseAcceleration = 44;
    this.baseSpeed = 11;
    this.collisionRadius = 1.1;
    this.group = this.createModel();
    this.cameraAnchor = new THREE.Object3D();
    this.cameraAnchor.position.set(0, 3.1, 0);
    this.group.add(this.cameraAnchor);
    this.reset({ x, y: 1.2, z });
  }

  createModel() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const legs = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.34, 1.05, 6, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.88 })
    );
    legs.position.y = 0.95;
    legs.castShadow = true;

    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.48, 1.15, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.58, metalness: 0.08 })
    );
    torso.position.y = 1.95;
    torso.castShadow = true;

    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.58, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0x0ea5e9, emissiveIntensity: 0.24 })
    );
    chestPlate.position.set(0, 1.9, 0.42);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0xe5eefc, roughness: 0.45 })
    );
    head.position.y = 2.9;
    head.castShadow = true;

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.24, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x67e8f9, emissiveIntensity: 0.55 })
    );
    visor.position.set(0, 2.9, 0.34);

    group.add(legs, torso, chestPlate, head, visor);
    return group;
  }

  addTo(scene) {
    scene.add(this.group);
  }

  reset(spawn) {
    this.position = {
      x: spawn.x,
      y: spawn.y ?? 1.2,
      z: spawn.z
    };
    this.velocity = { x: 0, z: 0 };
    this.facing = 0;
    this.walkCycle = 0;
    this.syncSceneObject();
  }

  update(input, deltaTime, bounds) {
    const desiredX = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const desiredZ = (input.s ? 1 : 0) - (input.w ? 1 : 0);
    const magnitude = Math.hypot(desiredX, desiredZ);
    const moving = magnitude > 0;
    const acceleration = this.baseAcceleration;
    const damping = Math.exp(-10 * deltaTime);

    if (moving) {
      const normalizedX = desiredX / magnitude;
      const normalizedZ = desiredZ / magnitude;
      this.velocity.x += normalizedX * acceleration * deltaTime;
      this.velocity.z += normalizedZ * acceleration * deltaTime;
      this.facing = Math.atan2(this.velocity.z || normalizedZ, this.velocity.x || normalizedX);
      this.walkCycle += deltaTime * 12;
    }

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
    this.syncSceneObject();

    return {
      moving,
      speed: Math.hypot(this.velocity.x, this.velocity.z)
    };
  }

  syncSceneObject() {
    this.group.position.set(this.position.x, this.position.y + Math.sin(this.walkCycle) * 0.06, this.position.z);
    this.group.rotation.y = -this.facing + Math.PI / 2;
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
}

export class ShipPlayer {
  constructor(THREE, x, z) {
    this.THREE = THREE;
    this.width = 10;
    this.depth = 7.4;
    this.height = 4;
    this.baseAcceleration = 36;
    this.baseStrafeAcceleration = 18;
    this.baseMaxForwardSpeed = 54;
    this.baseMaxLateralSpeed = 24;
    this.forwardDamping = 0.95;
    this.lateralDamping = 3.2;
    this.collisionRadius = 4.4;
    this.group = this.createModel();
    this.cameraAnchor = new THREE.Object3D();
    this.cameraAnchor.position.set(-12, 6.5, 0);
    this.group.add(this.cameraAnchor);
    this.reset({ x, y: 3.8, z }, { engine: 0, handling: 0, durability: 0 });
  }

  createModel() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      roughness: 0.38,
      metalness: 0.2,
      emissive: 0x0f172a,
      emissiveIntensity: 0.18
    });
    const cargoMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.82,
      metalness: 0.18
    });
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.1
    });

    const nose = new THREE.Mesh(new THREE.ConeGeometry(1.9, 5.2, 8), hullMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 5.4;
    nose.castShadow = true;

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 8.4, 14), hullMaterial);
    fuselage.rotation.z = -Math.PI / 2;
    fuselage.castShadow = true;

    const spine = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.5, 3.2), cargoMaterial);
    spine.position.set(-2.1, 0, 0);
    spine.castShadow = true;

    const cargoShell = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.1, 2.8), cargoMaterial);
    cargoShell.position.set(-5.8, 0.15, 0);
    cargoShell.castShadow = true;

    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.4), lightMaterial);
    cockpit.position.set(2.1, 1.15, 0);
    cockpit.castShadow = true;

    const finTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.9, 0.3), cargoMaterial);
    finTop.position.set(-0.6, 1.5, 0);
    finTop.castShadow = true;

    const wingGeometry = new THREE.BoxGeometry(4.6, 0.24, 1.8);
    const wingLeft = new THREE.Mesh(wingGeometry, cargoMaterial);
    wingLeft.position.set(-1.8, -0.42, -2.8);
    wingLeft.castShadow = true;

    const wingRight = wingLeft.clone();
    wingRight.position.z = 2.8;

    const enginePodGeometry = new THREE.CylinderGeometry(0.56, 0.56, 1.6, 16);
    const enginePodLeft = new THREE.Mesh(enginePodGeometry, cargoMaterial);
    enginePodLeft.rotation.z = -Math.PI / 2;
    enginePodLeft.position.set(-7.2, -0.25, -1.25);
    enginePodLeft.castShadow = true;

    const enginePodRight = enginePodLeft.clone();
    enginePodRight.position.z = 1.25;

    const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.95 });
    this.leftFlame = new THREE.Mesh(new THREE.ConeGeometry(0.44, 2.6, 10), flameMaterial);
    this.leftFlame.rotation.z = Math.PI / 2;
    this.leftFlame.position.set(-8.6, -0.25, -1.25);

    this.rightFlame = this.leftFlame.clone();
    this.rightFlame.position.z = 1.25;

    this.thrusterGlow = new THREE.PointLight(0xfb7185, 1.4, 22, 2.2);
    this.thrusterGlow.position.set(-9.4, 0.2, 0);

    const runningLights = [
      [-2.4, 0.55, -1.55],
      [-2.4, 0.55, 1.55],
      [3.4, 0.2, 0]
    ];
    runningLights.forEach(([x, y, z]) => {
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), lightMaterial);
      light.position.set(x, y, z);
      group.add(light);
    });

    group.add(
      nose,
      fuselage,
      spine,
      cargoShell,
      cockpit,
      finTop,
      wingLeft,
      wingRight,
      enginePodLeft,
      enginePodRight,
      this.leftFlame,
      this.rightFlame,
      this.thrusterGlow
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
    this.renderAngle = 0;
    this.lastThrusting = false;
    this.lastStats = { ...stats };
    this.syncSceneObject();
  }

  update(input, deltaTime, bounds, stats, environment = {}) {
    const safeStats = {
      engine: Number(stats.engine) || 0,
      handling: Number(stats.handling) || 0,
      durability: Number(stats.durability) || 0
    };
    this.lastStats = { ...safeStats };

    const throttle = (input.w ? 1 : 0) - (input.s ? 0.78 : 0);
    const steering = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const thrusting = throttle !== 0 || steering !== 0;

    const forwardAcceleration = this.baseAcceleration + safeStats.engine * 2.8;
    const lateralAcceleration = this.baseStrafeAcceleration + safeStats.handling * 2.1;
    const maxForwardSpeed = this.baseMaxForwardSpeed + safeStats.engine * 3.2;
    const maxLateralSpeed = this.baseMaxLateralSpeed + safeStats.handling * 1.8;
    const lateralDamping = Math.max(1.8, this.lateralDamping - safeStats.handling * 0.08);
    const gravityDamping = Math.max(1.6, 2.6 - safeStats.durability * 0.05);

    this.velocity.x += throttle * forwardAcceleration * deltaTime;
    this.velocity.z += steering * lateralAcceleration * deltaTime;

    if (environment.force) {
      this.velocity.x += (environment.force.x ?? 0) * deltaTime;
      this.velocity.y += (environment.force.y ?? 0) * deltaTime;
      this.velocity.z += (environment.force.z ?? 0) * deltaTime;
    }

    if (environment.forwardAssist) {
      this.velocity.x += environment.forwardAssist * deltaTime;
    }

    if (environment.stabilizeZ) {
      this.velocity.z += (0 - this.position.z) * environment.stabilizeZ * deltaTime;
    }

    this.velocity.x *= Math.exp(-this.forwardDamping * deltaTime);
    this.velocity.z *= Math.exp(-lateralDamping * deltaTime);
    this.velocity.y *= Math.exp(-gravityDamping * deltaTime);

    this.velocity.x = clamp(this.velocity.x, -12, maxForwardSpeed);
    this.velocity.z = clamp(this.velocity.z, -maxLateralSpeed, maxLateralSpeed);
    this.velocity.y = clamp(this.velocity.y, -10, 10);

    this.position.x = clamp(this.position.x + this.velocity.x * deltaTime, bounds.minX, bounds.maxX);
    this.position.y = clamp(this.position.y + this.velocity.y * deltaTime, bounds.minY, bounds.maxY);
    this.position.z = clamp(this.position.z + this.velocity.z * deltaTime, bounds.minZ, bounds.maxZ);

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > 0.3) {
      this.orientation = Math.atan2(this.velocity.z, Math.max(this.velocity.x, 0.01));
    }
    this.renderAngle = lerpAngle(this.renderAngle, this.orientation, clamp(deltaTime * 4.5, 0, 1));
    this.lastThrusting = thrusting;
    this.syncSceneObject();

    return {
      thrusting,
      speed,
      stable: speed < 11 + safeStats.durability * 1.6,
      driftRatio: clamp(Math.abs(this.velocity.z) / Math.max(maxLateralSpeed, 1), 0, 1)
    };
  }

  syncSceneObject() {
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.y = -this.renderAngle;
    this.group.rotation.z = clamp(-this.velocity.z * 0.018, -0.25, 0.25);
    this.group.rotation.x = clamp(this.velocity.y * 0.04, -0.18, 0.18);
    const flameScale = this.lastThrusting ? 1.25 : 0.55;
    this.leftFlame.scale.set(1, flameScale, 1);
    this.rightFlame.scale.set(1, flameScale, 1);
    this.leftFlame.material.opacity = this.lastThrusting ? 0.98 : 0.45;
    this.rightFlame.material.opacity = this.lastThrusting ? 0.98 : 0.45;
    this.thrusterGlow.intensity = this.lastThrusting ? 2.8 : 1.1;
  }

  getTelemetry() {
    return {
      speed: Math.hypot(this.velocity.x, this.velocity.z),
      velocity: { ...this.velocity },
      orientation: this.renderAngle,
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
}

export { ShipPlayer as Player };
