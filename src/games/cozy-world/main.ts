import Phaser from "phaser";
import { DEBUG_PHYSICS } from "./constants";
import { ClearingScene } from "./scenes/ClearingScene";
import { CottageScene } from "./scenes/CottageScene";

const GAME_CONTAINER_ID = "cozy-world-game";

const container = document.getElementById(GAME_CONTAINER_ID);

if (!container) {
  throw new Error(`Missing game container: #${GAME_CONTAINER_ID}`);
}

container.replaceChildren();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: GAME_CONTAINER_ID,
  backgroundColor: "#536b45",
  scene: [ClearingScene, CottageScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: DEBUG_PHYSICS,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: "100%",
    height: "100%",
  },
});
