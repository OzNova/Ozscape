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
    this.height = 2.2;
    this.baseSpeed = 19;
    this.group = this.createModel();
    this.collisionRadius = 1.1;
    this.reset({ x, y: 1.4, z });
  }

  createModel() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.55, 1.2, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.7 })
    );
    body.castShadow = true;
    body.position.y = 1.2;

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 })
    );
    head.castShadow = true;
    head.position.y = 2.48;

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.2, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x22d3ee, emissiveIntensity: 0.2 })
    );
    visor.position.set(0, 2.48, 0.35);

    group.add(body, head, visor);
    return group;
  }

  addTo(scene) {
    scene.add(this.group);
  }

  reset(spawn) {
    this.position = {
      x: spawn.x,
      y: spawn.y ?? 1.4,
      z: spawn.z
    };
    this.velocity = { x: 0, z: 0 };
    this.facing = 0;
    this.walkCycle = 0;
    this.syncSceneObject();
  }

  update(input, deltaTime, bounds) {
    const horizontal = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const depth = (input.s ? 1 : 0) - (input.w ? 1 : 0);
    const intensity = Math.hypot(horizontal, depth);
    const moving = intensity > 0;

    if (moving) {
      const normalizedX = horizontal / intensity;
      const normalizedZ = depth / intensity;
      this.velocity.x = normalizedX * this.baseSpeed;
      this.velocity.z = normalizedZ * this.baseSpeed;
      this.facing = Math.atan2(normalizedX, normalizedZ);
      this.walkCycle += deltaTime * 10;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    this.position.x = clamp(this.position.x, bounds.minX, bounds.maxX);
    this.position.z = clamp(this.position.z, bounds.minZ, bounds.maxZ);

    this.syncSceneObject();

    return {
      moving,
      speed: Math.hypot(this.velocity.x, this.velocity.z)
    };
  }

  syncSceneObject() {
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.y = this.facing;
    this.group.position.y = this.position.y + Math.sin(this.walkCycle) * 0.04;
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
    this.width = 4.4;
    this.depth = 3.2;
    this.height = 1.8;
    this.baseAcceleration = 31;
    this.baseMaxSpeed = 40;
    this.baseDamping = 3.2;
    this.collisionRadius = 3.2;
    this.group = this.createModel();
    this.reset({ x, y: 2.8, z }, {
      engine: 0,
      handling: 0,
      durability: 0
    });
  }

  createModel() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const hull = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 7.2, 6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.22 })
    );
    hull.rotation.z = -Math.PI / 2;
    hull.castShadow = true;

    const cargoBody = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.8, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.15 })
    );
    cargoBody.position.set(-1.2, 0, 0);
    cargoBody.castShadow = true;

    const cockpit = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.35 })
    );
    cockpit.position.set(1.8, 0.45, 0);
    cockpit.castShadow = true;

    const wingLeft = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.18, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.75 })
    );
    wingLeft.position.set(-0.5, -0.2, -1.8);

    const wingRight = wingLeft.clone();
    wingRight.position.z = 1.8;

    const thrusterMaterial = new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xfb7185, emissiveIntensity: 0.9 });
    const thrusterLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 12), thrusterMaterial);
    thrusterLeft.rotation.z = Math.PI / 2;
    thrusterLeft.position.set(-3.2, -0.2, -0.8);

    const thrusterRight = thrusterLeft.clone();
    thrusterRight.position.z = 0.8;

    this.thrusterGlow = new THREE.PointLight(0xfb7185, 0, 16, 2);
    this.thrusterGlow.position.set(-4.2, 0, 0);

    group.add(hull, cargoBody, cockpit, wingLeft, wingRight, thrusterLeft, thrusterRight, this.thrusterGlow);
    return group;
  }

  addTo(scene) {
    scene.add(this.group);
  }

  reset(spawn, stats) {
    this.position = {
      x: spawn.x,
      y: spawn.y ?? 2.8,
      z: spawn.z
    };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.orientation = 0;
    this.renderAngle = 0;
    this.lastThrusting = false;
    this.lastStats = { ...stats };
    this.syncSceneObject();
  }

  update(input, deltaTime, bounds, stats, environmentForces = []) {
    this.lastStats = { ...stats };

    const forward = (input.w ? 1 : 0) - (input.s ? 1 : 0);
    const lateral = (input.d ? 1 : 0) - (input.a ? 1 : 0);
    const thrusting = forward !== 0 || lateral !== 0;

    const acceleration = this.baseAcceleration + stats.engine * 2.2;
    const handlingFactor = 1 + stats.handling * 0.08;
    const maxSpeed = this.baseMaxSpeed + stats.engine * 2 + stats.handling * 1.2;
    const damping = Math.max(2, this.baseDamping - stats.handling * 0.08);

    this.velocity.x += forward * acceleration * handlingFactor * deltaTime;
    this.velocity.z += lateral * acceleration * 0.76 * handlingFactor * deltaTime;

    environmentForces.forEach((force) => {
      this.velocity.x += force.x * deltaTime;
      this.velocity.y += (force.y ?? 0) * deltaTime;
      this.velocity.z += (force.z ?? 0) * deltaTime;
    });

    const dampingFactor = Math.exp(-damping * deltaTime);
    this.velocity.x *= dampingFactor;
    this.velocity.z *= dampingFactor;
    this.velocity.y *= Math.exp(-2.6 * deltaTime);

    const planarSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (planarSpeed > maxSpeed) {
      const scale = maxSpeed / planarSpeed;
      this.velocity.x *= scale;
      this.velocity.z *= scale;
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;

    this.position.x = clamp(this.position.x, bounds.minX, bounds.maxX);
    this.position.y = clamp(this.position.y, bounds.minY, bounds.maxY);
    this.position.z = clamp(this.position.z, bounds.minZ, bounds.maxZ);

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > 0.2) {
      const targetAngle = Math.atan2(this.velocity.z, Math.max(this.velocity.x, 0.01));
      this.orientation = targetAngle;
    }
    this.renderAngle = lerpAngle(this.renderAngle, this.orientation, clamp(deltaTime * 5.8, 0, 1));
    this.lastThrusting = thrusting;
    this.syncSceneObject();

    return {
      thrusting,
      speed,
      stable: speed < 8.5 + stats.durability * 1.3,
      driftRatio: clamp(speed / Math.max(maxSpeed, 1), 0, 1)
    };
  }

  syncSceneObject() {
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.y = -this.renderAngle;
    this.group.rotation.z = -this.velocity.z * 0.012;
    this.group.rotation.x = this.velocity.y * 0.01;
    this.thrusterGlow.intensity = this.lastThrusting ? 2.2 : 0.4;
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
