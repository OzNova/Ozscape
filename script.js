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
  panelCard: document.getElementById("panelCard"),
  hud: document.getElementById("hud"),
  reticle: document.getElementById("reticle"),
  titleEl: document.getElementById("panelTitle"),
  copyEl: document.getElementById("panelCopy"),
  statusLabel: document.getElementById("status"),
  scoreLabel: document.getElementById("score"),
  objectiveLabel: document.getElementById("objective"),
  promptLabel: document.getElementById("prompt"),
  helpPanel: document.getElementById("helpPanel"),
  helpTitle: document.getElementById("helpTitle"),
  helpBody: document.getElementById("helpBody"),
  helpButton: document.getElementById("helpButton"),
  closeHelpButton: document.getElementById("closeHelpButton"),
  detailsEl: document.getElementById("details"),
  upgradesEl: document.getElementById("upgrades"),
  fuelFillEl: document.getElementById("fuelFill"),
  fuelValueEl: document.getElementById("fuelValue"),
  progressFillEl: document.getElementById("progressFill"),
  progressValueEl: document.getElementById("progressValue"),
  cameraModeEl: document.getElementById("cameraMode"),
  targetLabelEl: document.getElementById("targetLabel"),
  minimapModeEl: document.getElementById("minimapMode"),
  minimapCanvas: document.getElementById("minimapCanvas"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton")
};

const game = new Game({
  THREE,
  renderer,
  canvas,
  controls
});

async function requestFullscreen() {
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) {
    return;
  }

  try {
    await document.documentElement.requestFullscreen();
  } catch {
    // Ignore fullscreen failures; the app still fills the viewport.
  }
}

controls.startButton.addEventListener("click", async () => {
  await requestFullscreen();
  game.handlePrimaryAction();
});

controls.restartButton.addEventListener("click", async () => {
  await requestFullscreen();
  game.handleSecondaryAction();
});

controls.helpButton.addEventListener("click", () => game.toggleHelp());
controls.closeHelpButton.addEventListener("click", () => game.toggleHelp(false));

window.addEventListener("resize", () => game.handleResize());
game.handleResize();
game.start();
