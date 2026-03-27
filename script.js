import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
import { Game } from "./game.js";

const canvas = document.getElementById("gameCanvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = {
  titleEl: document.getElementById("panelTitle"),
  copyEl: document.getElementById("panelCopy"),
  statusLabel: document.getElementById("status"),
  scoreLabel: document.getElementById("score"),
  objectiveLabel: document.getElementById("objective"),
  detailsEl: document.getElementById("details"),
  upgradesEl: document.getElementById("upgrades"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton")
};

const game = new Game({
  THREE,
  renderer,
  canvas,
  controls
});

controls.startButton.addEventListener("click", () => game.handlePrimaryAction());
controls.restartButton.addEventListener("click", () => game.handleSecondaryAction());

window.addEventListener("resize", () => game.handleResize());
game.handleResize();
game.start();
