import Phaser from "phaser";
import { ATMOSPHERE_DEPTH } from "./constants";

export class AtmosphereOverlay {
  private scene: Phaser.Scene;
  private rectangle: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    color: number,
  ) {
    this.scene = scene;

    this.rectangle = scene.add
      .rectangle(
        0,
        0,
        1,
        1,
        color,
      )
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(ATMOSPHERE_DEPTH)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.resize();

    scene.scale.on(
      Phaser.Scale.Events.RESIZE,
      this.resize,
      this,
    );

    scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.handleSceneShutdown,
      this,
    );
  }

  setAlpha(alpha: number) {
    this.rectangle.setAlpha(alpha);
  }

  private resize() {
    this.rectangle.setDisplaySize(
      this.scene.scale.width,
      this.scene.scale.height,
    );
  }

  private handleSceneShutdown() {
    this.scene.scale.off(
      Phaser.Scale.Events.RESIZE,
      this.resize,
      this,
    );
  }
}
