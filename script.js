import { Game } from "./game.js";

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const statusLabel = document.getElementById("status");
const scoreLabel = document.getElementById("score");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const game = new Game(context, canvas.width, canvas.height, {
  statusLabel,
  scoreLabel,
  startButton,
  restartButton
});

game.draw();

startButton.addEventListener("click", () => game.start());
restartButton.addEventListener("click", () => game.start());
