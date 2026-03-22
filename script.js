import { Game } from "./game.js";

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

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

const game = new Game(context, canvas.width, canvas.height, controls);
game.draw();

controls.startButton.addEventListener("click", () => game.handlePrimaryAction());
controls.restartButton.addEventListener("click", () => game.handleSecondaryAction());
