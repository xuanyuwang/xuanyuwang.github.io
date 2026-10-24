import Phaser from "phaser";
import { AtmosphereOverlay } from "../AtmosphereOverlay";
import { AudioSettings } from "../AudioSettings";
import { PlayerController } from "../PlayerController";
import { RainSystem } from "../RainSystem";
import { WeatherClock } from "../WeatherClock";
import { WorldClock } from "../WorldClock";
import { addDebugPositionMarker } from "../debug";
import {
  CLEARING_RETURN_X,
  CLEARING_RETURN_Y,
  CLEARING_SCENE_KEY,
  COTTAGE_ASSET_PATH,
  COTTAGE_BASE_Y,
  COTTAGE_ENTRANCE_HEIGHT,
  COTTAGE_ENTRANCE_WIDTH,
  COTTAGE_ENTRANCE_Y,
  COTTAGE_SCENE_KEY,
  COTTAGE_TEXTURE_KEY,
  COTTAGE_X,
  COTTAGE_Y,
  DEBUG_PHYSICS,
  FOREST_AMBIENCE_AUDIO_KEY,
  FOREST_AMBIENCE_AUDIO_PATH,
  LEFT_TREE_BASE_Y,
  LEFT_TREE_TRUNK_Y,
  LEFT_TREE_X,
  PLAYER_ASSET_PATH,
  PLAYER_COLLIDER_OFFSET_X,
  PLAYER_COLLIDER_OFFSET_Y,
  PLAYER_COLLIDER_RADIUS,
  PLAYER_TEXTURE_HEIGHT,
  PLAYER_TEXTURE_KEY,
  PLAYER_TEXTURE_WIDTH,
  RIGHT_TREE_BASE_Y,
  RIGHT_TREE_TRUNK_Y,
  RIGHT_TREE_X,
  TREE_ASSET_PATH,
  TREE_TEXTURE_KEY,
  UI_DEPTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../constants";

interface ClearingSceneData {
  playerX?: number;
  playerY?: number;
}

export class ClearingScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerController!: PlayerController;
  private worldClock!: WorldClock;
  private weatherClock!: WeatherClock;
  private atmosphere!: AtmosphereOverlay;
  private rainSystem!: RainSystem;
  private audioSettings!: AudioSettings;
  private audioButton!: Phaser.GameObjects.Text;
  private forestAmbience!: Phaser.Sound.BaseSound;
  private audioStarted = false;
  private timeDebugText?: Phaser.GameObjects.Text;

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private cottageEntrance!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(CLEARING_SCENE_KEY);
  }

  preload() {
    if (!this.textures.exists(PLAYER_TEXTURE_KEY)) {
      this.load.svg(
        PLAYER_TEXTURE_KEY,
        PLAYER_ASSET_PATH,
        {
          width: PLAYER_TEXTURE_WIDTH,
          height: PLAYER_TEXTURE_HEIGHT,
        },
      );
    }

    if (!this.textures.exists(COTTAGE_TEXTURE_KEY)) {
      this.load.svg(
        COTTAGE_TEXTURE_KEY,
        COTTAGE_ASSET_PATH,
        {
          width: 180,
          height: 190,
        },
      );
    }

    if (!this.textures.exists(TREE_TEXTURE_KEY)) {
      this.load.svg(
        TREE_TEXTURE_KEY,
        TREE_ASSET_PATH,
        {
          width: 112,
          height: 170,
        },
      );
    }

    if (!this.cache.audio.exists(FOREST_AMBIENCE_AUDIO_KEY)) {
      this.load.audio(
        FOREST_AMBIENCE_AUDIO_KEY,
        FOREST_AMBIENCE_AUDIO_PATH,
      );
    }
  }

  create(data: ClearingSceneData = {}) {
    this.obstacles = this.physics.add.staticGroup();

    this.createMorningValleyBackdrop();

    // Draw the cottage as one composed texture. Its position refers to the
    // center of the bottom edge where the building meets the ground.
    this.add
      .image(
        COTTAGE_X,
        COTTAGE_BASE_Y,
        COTTAGE_TEXTURE_KEY,
      )
      .setOrigin(
        0.5,
        1,
      )
      .setDepth(COTTAGE_BASE_Y);

    // Block the complete visible footprint of the cottage.
    //
    // The collider covers the roof and body as one simple rectangle. We will
    // replace part of it with an entrance zone when the cottage becomes enterable.
    this.createStaticObstacle(
      COTTAGE_X,
      COTTAGE_Y,
      150,
      190,
    );
    // Detect when the player approaches the cottage door.
    //
    // Unlike a collider, this overlap zone does not block or move the player.
    // It exists only to trigger the transition to the interior scene.
    this.cottageEntrance = this.add.rectangle(
      COTTAGE_X,
      COTTAGE_ENTRANCE_Y,
      COTTAGE_ENTRANCE_WIDTH,
      COTTAGE_ENTRANCE_HEIGHT,
      0x00ffff,
      DEBUG_PHYSICS ? 0.35 : 0,
    );

    // The second argument makes the new Arcade Physics body static.
    this.physics.add.existing(
      this.cottageEntrance,
      true,
    );
    // Reuse one tree texture while keeping this tree's ground position fixed.
    this.add
      .image(
        LEFT_TREE_X,
        LEFT_TREE_BASE_Y,
        TREE_TEXTURE_KEY,
      )
      .setOrigin(
        0.5,
        1,
      )
      .setDepth(LEFT_TREE_BASE_Y);

    // Only the lower trunk blocks movement.
    // The player may move visually beneath the canopy.
    this.createStaticObstacle(
      LEFT_TREE_X,
      LEFT_TREE_TRUNK_Y + 28,
      28,
      44,
    );

    // Scale and mirror the same texture to create a distinct second tree.
    this.add
      .image(
        RIGHT_TREE_X,
        RIGHT_TREE_BASE_Y,
        TREE_TEXTURE_KEY,
      )
      .setOrigin(
        0.5,
        1,
      )
      .setScale(
        1.08,
        1.2,
      )
      .setFlipX(true)
      .setDepth(RIGHT_TREE_BASE_Y);
    this.createStaticObstacle(
      RIGHT_TREE_X,
      RIGHT_TREE_TRUNK_Y + 30,
      30,
      48,
    );
    addDebugPositionMarker(
      this,
      COTTAGE_X,
      COTTAGE_Y + 250,
      "Initial spawn",
      0xffff00,
    );

    addDebugPositionMarker(
      this,
      CLEARING_RETURN_X,
      CLEARING_RETURN_Y,
      "Return from cottage",
      0x00ff88,
    );

    addDebugPositionMarker(
      this,
      COTTAGE_X,
      COTTAGE_ENTRANCE_Y,
      "Cottage entrance",
      0x00ffff,
    );
    const playerSpawnX =
      data.playerX ?? COTTAGE_X;

    const playerSpawnY =
      data.playerY ?? COTTAGE_Y + 250;
    // Create a physics-enabled sprite whose world position represents its feet.
    this.player = this.physics.add.sprite(
      playerSpawnX,
      playerSpawnY,
      PLAYER_TEXTURE_KEY,
    );

    this.player.setOrigin(
      0.5,
      1,
    );

    this.player.setDepth(this.player.y);

    const playerBody =
      this.player.body as Phaser.Physics.Arcade.Body;

    // Use a foot-level collision circle instead of the full visible artwork.
    playerBody.setCircle(
      PLAYER_COLLIDER_RADIUS,
      PLAYER_COLLIDER_OFFSET_X,
      PLAYER_COLLIDER_OFFSET_Y,
    );

    // Stop the physics body at the configured world boundary.
    playerBody.setCollideWorldBounds(true);

    // Resolve collisions between the moving player and fixed scenery.
    this.physics.add.collider(
      this.player,
      this.obstacles,
    );

    this.physics.add.overlap(
      this.player,
      this.cottageEntrance,
      this.enterCottage,
      undefined,
      this,
    );
    this.playerController = new PlayerController(
      this,
      this.player,
    );

    // Draw a screen-level game label.
    //
    // setScrollFactor(0) keeps the text attached to the viewport instead of
    // allowing it to move with the world camera.
    this.add
      .text(24, 22, "Cozy World", {
        color: "#fff2d2",
        fontFamily: "Georgia, serif",
        fontSize: "28px",
      })
      .setShadow(2, 2, "#3a2c24", 2)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);

    // Draw supporting screen-level text below the title.
    this.add
      .text(25, 58, "A quiet place among the autumn trees.", {
        color: "#f5dfbd",
        fontFamily: "Georgia, serif",
        fontSize: "16px",
      })
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);

    // Prevent physics-enabled objects from leaving the defined game world.
    this.physics.world.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT,
    );

    this.worldClock = new WorldClock(this.game);
    this.weatherClock = new WeatherClock(this.game);

    this.atmosphere = new AtmosphereOverlay(
      this,
      0x263450,
    );

    this.rainSystem = new RainSystem(this);

    this.audioSettings = new AudioSettings(this.game);

    this.forestAmbience = this.sound.add(
      FOREST_AMBIENCE_AUDIO_KEY,
      {
        loop: true,
        volume: 0.92,
      },
    );

    // A Phaser scene instance is reused when the player returns from the
    // cottage, so reset this scene-run state before registering new listeners.
    this.audioStarted = false;

    this.audioButton = this.add
      .text(
        0,
        0,
        "",
        {
          backgroundColor: "#2f261fcc",
          color: "#fff2d2",
          fontFamily: "Georgia, serif",
          fontSize: "15px",
          padding: {
            x: 10,
            y: 7,
          },
        },
      )
      .setOrigin(
        1,
        0,
      )
      .setScrollFactor(0)
      .setDepth(UI_DEPTH)
      .setInteractive({
        useHandCursor: true,
      });

    this.audioButton.on(
      Phaser.Input.Events.POINTER_DOWN,
      this.toggleAmbientAudio,
      this,
    );

    this.updateAudioButton();
    this.positionAudioButton();

    this.scale.on(
      Phaser.Scale.Events.RESIZE,
      this.positionAudioButton,
      this,
    );

    // Phaser resumes the browser's AudioContext asynchronously after the first
    // user gesture. Wait for confirmation instead of racing that unlock.
    this.sound.once(
      Phaser.Sound.Events.UNLOCKED,
      this.startAmbientAudio,
      this,
    );

    if (!this.sound.locked) {
      this.startAmbientAudio();
    }

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.stopAmbientAudio,
      this,
    );

    if (DEBUG_PHYSICS) {
      this.timeDebugText = this.add
        .text(
          24,
          90,
          "",
          {
            backgroundColor: "#000000aa",
            color: "#ffffff",
            fontFamily: "monospace",
            fontSize: "14px",
            padding: {
              x: 6,
              y: 4,
            },
          },
        )
        .setScrollFactor(0)
        .setDepth(UI_DEPTH);
    }

    // Prevent the camera from showing space outside the game world.
    this.cameras.main.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT,
    );

    // Follow the player with gentle interpolation rather than snapping the camera
    // to every small movement immediately.
    this.cameras.main.startFollow(
      this.player,
      true,
      0.12,
      0.12,
    );
  }

  private enterCottage() {
    this.scene.start(COTTAGE_SCENE_KEY);
  }

  private createMorningValleyBackdrop() {
    const backdrop = this.add.graphics().setDepth(-10);

    // The fixed canvas color makes open sky visible above the distant ridges.
    backdrop.fillStyle(0xf2c9ad, 1);
    backdrop.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Broad overlapping silhouettes establish depth without competing with
    // the cottage and player for attention.
    backdrop.fillStyle(0xb7a2bd, 1);
    backdrop.fillPoints([
      new Phaser.Math.Vector2(0, 285),
      new Phaser.Math.Vector2(160, 205),
      new Phaser.Math.Vector2(330, 272),
      new Phaser.Math.Vector2(520, 188),
      new Phaser.Math.Vector2(705, 265),
      new Phaser.Math.Vector2(900, 195),
      new Phaser.Math.Vector2(1080, 250),
      new Phaser.Math.Vector2(WORLD_WIDTH, 210),
      new Phaser.Math.Vector2(WORLD_WIDTH, WORLD_HEIGHT),
      new Phaser.Math.Vector2(0, WORLD_HEIGHT),
    ], true);

    backdrop.fillStyle(0x9b829c, 1);
    backdrop.fillPoints([
      new Phaser.Math.Vector2(0, 360),
      new Phaser.Math.Vector2(175, 300),
      new Phaser.Math.Vector2(345, 342),
      new Phaser.Math.Vector2(535, 280),
      new Phaser.Math.Vector2(720, 345),
      new Phaser.Math.Vector2(930, 275),
      new Phaser.Math.Vector2(WORLD_WIDTH, 330),
      new Phaser.Math.Vector2(WORLD_WIDTH, WORLD_HEIGHT),
      new Phaser.Math.Vector2(0, WORLD_HEIGHT),
    ], true);

    // The foreground rises toward the cottage, making it feel perched above
    // the valley floor. Keep this color related to the existing clearing path.
    backdrop.fillStyle(0x667a50, 1);
    backdrop.fillPoints([
      new Phaser.Math.Vector2(0, 535),
      new Phaser.Math.Vector2(180, 480),
      new Phaser.Math.Vector2(370, 505),
      new Phaser.Math.Vector2(560, 458),
      new Phaser.Math.Vector2(760, 500),
      new Phaser.Math.Vector2(970, 455),
      new Phaser.Math.Vector2(WORLD_WIDTH, 490),
      new Phaser.Math.Vector2(WORLD_WIDTH, WORLD_HEIGHT),
      new Phaser.Math.Vector2(0, WORLD_HEIGHT),
    ], true);

    // A narrow path descends from the cottage and bends across the slope.
    // Unlike the former rectangular clearing, it follows the hill silhouette.
    backdrop.fillStyle(0x8b7350, 1);
    backdrop.fillPoints([
      new Phaser.Math.Vector2(COTTAGE_X - 30, COTTAGE_BASE_Y + 8),
      new Phaser.Math.Vector2(COTTAGE_X + 30, COTTAGE_BASE_Y + 8),
      new Phaser.Math.Vector2(COTTAGE_X + 55, 530),
      new Phaser.Math.Vector2(COTTAGE_X + 34, 575),
      new Phaser.Math.Vector2(COTTAGE_X + 90, 630),
      new Phaser.Math.Vector2(COTTAGE_X + 135, WORLD_HEIGHT),
      new Phaser.Math.Vector2(COTTAGE_X - 105, WORLD_HEIGHT),
      new Phaser.Math.Vector2(COTTAGE_X - 70, 640),
      new Phaser.Math.Vector2(COTTAGE_X - 20, 585),
      new Phaser.Math.Vector2(COTTAGE_X - 44, 535),
    ], true);

    this.addValleyTree(78, 477, 0x9c4f32, 1.05);
    this.addValleyTree(250, 472, 0xc18b3e, 0.82);
    this.addValleyTree(1012, 450, 0x9c4f32, 1.08);
    this.addValleyTree(1132, 481, 0xc18b3e, 0.88);

    // A narrow translucent ribbon softens the valley floor without obscuring
    // the colored hill layers.
    const mist = this.add.graphics().setDepth(-9);
    mist.fillStyle(0xf8e8df, 0.24);
    mist.fillPoints([
      new Phaser.Math.Vector2(0, 396),
      new Phaser.Math.Vector2(180, 382),
      new Phaser.Math.Vector2(360, 402),
      new Phaser.Math.Vector2(560, 386),
      new Phaser.Math.Vector2(760, 405),
      new Phaser.Math.Vector2(960, 385),
      new Phaser.Math.Vector2(WORLD_WIDTH, 398),
      new Phaser.Math.Vector2(WORLD_WIDTH, 420),
      new Phaser.Math.Vector2(760, 428),
      new Phaser.Math.Vector2(560, 414),
      new Phaser.Math.Vector2(360, 430),
      new Phaser.Math.Vector2(180, 410),
      new Phaser.Math.Vector2(0, 426),
    ], true);
  }

  private addValleyTree(
    x: number,
    groundY: number,
    color: number,
    scale: number,
  ) {
    const tree = this.add.graphics().setDepth(-8);
    const trunkWidth = 12 * scale;
    const trunkHeight = 34 * scale;

    tree.fillStyle(0x68402f, 1);
    tree.fillRect(
      x - trunkWidth / 2,
      groundY - trunkHeight,
      trunkWidth,
      trunkHeight,
    );
    tree.fillStyle(color, 1);
    tree.fillCircle(x, groundY - 58 * scale, 34 * scale);
    tree.fillCircle(x - 23 * scale, groundY - 43 * scale, 25 * scale);
    tree.fillCircle(x + 22 * scale, groundY - 42 * scale, 27 * scale);
  }

  private startAmbientAudio() {
    if (
      this.audioStarted ||
      this.sound.locked ||
      !this.audioSettings.isEnabled()
    ) {
      return;
    }

    this.audioStarted = this.forestAmbience.play();
  }

  private toggleAmbientAudio() {
    const isEnabled = this.audioSettings.toggle();

    if (isEnabled) {
      this.startAmbientAudio();
    } else {
      this.forestAmbience.stop();
      this.audioStarted = false;
    }

    this.updateAudioButton();
  }

  private updateAudioButton() {
    const label = this.audioSettings.isEnabled()
      ? "Sound: On"
      : "Sound: Off";

    this.audioButton.setText(label);
  }

  private positionAudioButton() {
    this.audioButton.setPosition(
      this.scale.width - 18,
      18,
    );
  }

  private stopAmbientAudio() {
    this.scale.off(
      Phaser.Scale.Events.RESIZE,
      this.positionAudioButton,
      this,
    );

    this.sound.off(
      Phaser.Sound.Events.UNLOCKED,
      this.startAmbientAudio,
      this,
    );

    this.forestAmbience.stop();
    this.forestAmbience.destroy();
    this.audioStarted = false;
  }

  private createStaticObstacle(
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    const obstacle = this.add.rectangle(
      x,
      y,
      width,
      height,
      0xff00ff,
      DEBUG_PHYSICS ? 0.35 : 0,
    );

    this.obstacles.add(obstacle);

    return obstacle;
  }

  update() {
    this.playerController.update();
    this.player.setDepth(this.player.y);

    const worldTime = this.worldClock.read();
    const weather = this.weatherClock.read();

    this.atmosphere.setAlpha(
      worldTime.darkness,
    );

    this.rainSystem.setRaining(
      weather.isRaining,
    );

    this.timeDebugText?.setText(
      [
        `${worldTime.label} · ${Math.round(worldTime.phase * 100)}%`,
        `${weather.label} · ${Math.round(weather.phase * 100)}%`,
        `Audio · ${this.getAudioDebugLabel()}`,
      ].join("\n"),
    );
  }

  private getAudioDebugLabel(): string {
    if (this.sound.locked) {
      return "Locked";
    }

    return this.audioStarted
      ? "Playing"
      : "Stopped";
  }
}
