import Phaser from "phaser";
import { WEATHER_DEPTH } from "./constants";

const RAIN_TEXTURE_KEY =
  "cozy-world-rain-drop";

const RAIN_SPAWN_HEIGHT = 20;
const RAIN_HORIZONTAL_MARGIN = 50;

export class RainSystem {
  private scene: Phaser.Scene;
  private spawnArea: Phaser.Geom.Rectangle;
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.createRainTexture();

    this.spawnArea = new Phaser.Geom.Rectangle();

    this.resize();

    const emissionSource:
      Phaser.Types.GameObjects.Particles.RandomZoneSource = {
        getRandomPoint: (point) => {
          point.x = Phaser.Math.FloatBetween(
            this.spawnArea.left,
            this.spawnArea.right,
          );

          point.y = Phaser.Math.FloatBetween(
            this.spawnArea.top,
            this.spawnArea.bottom,
          );
        },
      };

    const emissionZone =
      new Phaser.GameObjects.Particles.Zones.RandomZone(
        emissionSource,
      );

    this.emitter = scene.add
      .particles(
        0,
        0,
        RAIN_TEXTURE_KEY,
        {
          emitZone: emissionZone,
          lifespan: {
            min: 900,
            max: 1200,
          },
          speedX: {
            min: -70,
            max: -40,
          },
          speedY: {
            min: 520,
            max: 720,
          },
          frequency: 45,
          quantity: 1,
          scale: {
            min: 0.65,
            max: 1,
          },
          alpha: {
            start: 0.7,
            end: 0.15,
          },
          blendMode: Phaser.BlendModes.ADD,
          reserve: 40,
        },
      )
      .setScrollFactor(0)
      .setDepth(WEATHER_DEPTH);

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

  private createRainTexture() {
    if (this.scene.textures.exists(RAIN_TEXTURE_KEY)) {
      return;
    }

    const graphics = this.scene.add.graphics();

    graphics
      .lineStyle(
        2,
        0xb9d9ee,
        0.85,
      )
      .lineBetween(
        3,
        0,
        0,
        16,
      )
      .generateTexture(
        RAIN_TEXTURE_KEY,
        4,
        18,
      );

    graphics.destroy();
  }

  private resize() {
    this.spawnArea.setTo(
      -RAIN_HORIZONTAL_MARGIN,
      -RAIN_SPAWN_HEIGHT,
      this.scene.scale.width +
        RAIN_HORIZONTAL_MARGIN * 2,
      RAIN_SPAWN_HEIGHT,
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
