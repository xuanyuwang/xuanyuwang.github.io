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

    // Fill the entire game world with the lighter grass color.
    // This is the base layer behind every other shape.
    this.add.rectangle(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      0x667a50,
    );

    // Draw a darker clearing or path below the cottage.
    // Its position is derived from the cottage so the composition stays together
    // if the cottage is moved later.
    this.add.rectangle(
      COTTAGE_X,
      COTTAGE_Y + 190,
      220,
      280,
      0x536b45,
    );

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
      .text(25, 58, "The clearing is taking shape.", {
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
