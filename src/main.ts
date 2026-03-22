import Phaser from "phaser";
import "./styles.css";
import { BootScene } from "./scenes/BootScene";
import { FlightScene } from "./scenes/FlightScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { HangarScene } from "./scenes/HangarScene";
import { MenuScene } from "./scenes/MenuScene";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: 1280,
  height: 720,
  backgroundColor: "#020617",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [BootScene, MenuScene, FlightScene, HangarScene, GameOverScene]
});

export default game;
