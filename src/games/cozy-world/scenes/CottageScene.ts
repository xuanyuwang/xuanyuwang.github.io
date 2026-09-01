import Phaser from "phaser";
import { AtmosphereOverlay } from "../AtmosphereOverlay";
import { PlayerController } from "../PlayerController";
import { WorldClock } from "../WorldClock";
import { addDebugPositionMarker } from "../debug";
import {
  ATMOSPHERE_DEPTH,
  CLEARING_RETURN_X,
  CLEARING_RETURN_Y,
  CLEARING_SCENE_KEY,
  COTTAGE_EXIT_HEIGHT,
  COTTAGE_EXIT_WIDTH,
  COTTAGE_EXIT_Y,
  COTTAGE_PLAYER_SPAWN_X,
  COTTAGE_PLAYER_SPAWN_Y,
  COTTAGE_RUG_ASSET_PATH,
  COTTAGE_RUG_TEXTURE_KEY,
  COTTAGE_ROOM_CENTER_X,
  COTTAGE_ROOM_CENTER_Y,
  COTTAGE_ROOM_HEIGHT,
  COTTAGE_ROOM_WIDTH,
  COTTAGE_SCENE_KEY,
  COTTAGE_TABLE_ASSET_PATH,
  COTTAGE_TABLE_TEXTURE_KEY,
  DEBUG_PHYSICS,
  PLAYER_ASSET_PATH,
  PLAYER_COLLIDER_OFFSET_X,
  PLAYER_COLLIDER_OFFSET_Y,
  PLAYER_COLLIDER_RADIUS,
  PLAYER_TEXTURE_HEIGHT,
  PLAYER_TEXTURE_KEY,
  PLAYER_TEXTURE_WIDTH,
  UI_DEPTH,
} from "../constants";

const LAMP_X =
  COTTAGE_ROOM_CENTER_X + 36;

const LAMP_Y =
  COTTAGE_ROOM_CENTER_Y - 96;

const LAMP_INTERACTION_X = LAMP_X;
const LAMP_INTERACTION_Y =
  COTTAGE_ROOM_CENTER_Y + 4;

const LAMP_INTERACTION_RANGE = 105;

const LAMP_ENABLED_REGISTRY_KEY =
  "cozy-world-cottage-lamp-enabled";

interface ClearingTransitionData {
  playerX: number;
  playerY: number;
}

export class CottageScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerController!: PlayerController;
  private worldClock!: WorldClock;
  private atmosphere!: AtmosphereOverlay;
  private lampBulb!: Phaser.GameObjects.Arc;
  private lampGlowInner!: Phaser.GameObjects.Arc;
  private lampGlowOuter!: Phaser.GameObjects.Arc;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactionButton!: Phaser.GameObjects.Text;
  private canInteractWithLamp = false;

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private cottageExit!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(COTTAGE_SCENE_KEY);
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

    if (!this.textures.exists(COTTAGE_RUG_TEXTURE_KEY)) {
      this.load.svg(
        COTTAGE_RUG_TEXTURE_KEY,
        COTTAGE_RUG_ASSET_PATH,
        {
          width: 320,
          height: 190,
        },
      );
    }

    if (!this.textures.exists(COTTAGE_TABLE_TEXTURE_KEY)) {
      this.load.svg(
        COTTAGE_TABLE_TEXTURE_KEY,
        COTTAGE_TABLE_ASSET_PATH,
        {
          width: 160,
          height: 110,
        },
      );
    }
  }
  create() {
    if (!this.game.registry.has(LAMP_ENABLED_REGISTRY_KEY)) {
      this.game.registry.set(
        LAMP_ENABLED_REGISTRY_KEY,
        false,
      );
    }

    this.obstacles = this.physics.add.staticGroup();

    this.physics.world.setBounds(
      0,
      0,
      COTTAGE_ROOM_WIDTH,
      COTTAGE_ROOM_HEIGHT,
    );

    this.cameras.main.setBounds(
      0,
      0,
      COTTAGE_ROOM_WIDTH,
      COTTAGE_ROOM_HEIGHT,
    );

    // Fill the room with a dark wooden floor.
    this.add.rectangle(
      COTTAGE_ROOM_CENTER_X,
      COTTAGE_ROOM_CENTER_Y,
      COTTAGE_ROOM_WIDTH,
      COTTAGE_ROOM_HEIGHT,
      0x6f4935,
    );

    const wallThickness = 28;
    const wallColor = 0x4b2d24;

    // Draw the top and side walls. Physics world bounds provide their collision.
    this.add.rectangle(
      COTTAGE_ROOM_CENTER_X,
      wallThickness / 2,
      COTTAGE_ROOM_WIDTH,
      wallThickness,
      wallColor,
    );

    this.add.rectangle(
      wallThickness / 2,
      COTTAGE_ROOM_CENTER_Y,
      wallThickness,
      COTTAGE_ROOM_HEIGHT,
      wallColor,
    );

    this.add.rectangle(
      COTTAGE_ROOM_WIDTH - wallThickness / 2,
      COTTAGE_ROOM_CENTER_Y,
      wallThickness,
      COTTAGE_ROOM_HEIGHT,
      wallColor,
    );

    // Split the bottom wall so its visual doorway matches the exit zone.
    const sideWallWidth =
      (COTTAGE_ROOM_WIDTH - COTTAGE_EXIT_WIDTH) / 2;

    this.add.rectangle(
      sideWallWidth / 2,
      COTTAGE_ROOM_HEIGHT - wallThickness / 2,
      sideWallWidth,
      wallThickness,
      wallColor,
    );

    this.add.rectangle(
      COTTAGE_ROOM_WIDTH - sideWallWidth / 2,
      COTTAGE_ROOM_HEIGHT - wallThickness / 2,
      sideWallWidth,
      wallThickness,
      wallColor,
    );

    const tableX = COTTAGE_ROOM_CENTER_X;
    const tableY = COTTAGE_ROOM_CENTER_Y - 70;
    const tableWidth = 130;
    const tableHeight = 70;
    const tableBaseY = tableY + 50;

    // The rug is floor decoration, so it always remains behind the player.
    this.add
      .image(
        COTTAGE_ROOM_CENTER_X,
        COTTAGE_ROOM_CENTER_Y + 90,
        COTTAGE_RUG_TEXTURE_KEY,
      )
      .setOrigin(
        0.5,
        1,
      )
      .setDepth(1);

    // The table participates in Y sorting because the player can pass around it.
    this.add
      .image(
        tableX,
        tableBaseY,
        COTTAGE_TABLE_TEXTURE_KEY,
      )
      .setOrigin(
        0.5,
        1,
      )
      .setDepth(tableBaseY);

    const lampFixture = this.add.container(
      LAMP_X,
      LAMP_Y,
    );

    const lampStem = this.add.rectangle(
      0,
      12,
      5,
      25,
      0x5a3929,
    );

    const lampBase = this.add.ellipse(
      0,
      26,
      24,
      9,
      0x493126,
    );

    const lampShade = this.add.triangle(
      0,
      0,
      -16,
      14,
      16,
      14,
      9,
      -9,
      0xc77a3c,
    );

    this.lampBulb = this.add.circle(
      0,
      5,
      6,
      0x6d4a32,
    );

    lampFixture.add([
      lampStem,
      lampBase,
      lampShade,
      this.lampBulb,
    ]);

    lampFixture.setDepth(tableBaseY);

    this.lampGlowOuter = this.add
      .circle(
        LAMP_X,
        LAMP_Y,
        100,
        0xffb85c,
        0.1,
      )
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(ATMOSPHERE_DEPTH + 1);

    this.lampGlowInner = this.add
      .circle(
        LAMP_X,
        LAMP_Y,
        48,
        0xffd584,
        0.18,
      )
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(ATMOSPHERE_DEPTH + 1);

    this.updateLampAppearance();

    // Keep the physical table footprint independent from its artwork.
    this.createStaticObstacle(
      tableX,
      tableY,
      tableWidth,
      tableHeight,
    );
    addDebugPositionMarker(
      this,
      COTTAGE_PLAYER_SPAWN_X,
      COTTAGE_PLAYER_SPAWN_Y,
      "Interior spawn",
      0xffff00,
    );

    addDebugPositionMarker(
      this,
      COTTAGE_ROOM_CENTER_X,
      COTTAGE_EXIT_Y,
      "Return to clearing",
      0x00ffff,
    );

    addDebugPositionMarker(
      this,
      LAMP_INTERACTION_X,
      LAMP_INTERACTION_Y,
      "Lamp interaction",
      0xffc85c,
    );

    if (DEBUG_PHYSICS) {
      this.add
        .circle(
          LAMP_INTERACTION_X,
          LAMP_INTERACTION_Y,
          LAMP_INTERACTION_RANGE,
          0xffc85c,
          0.08,
        )
        .setStrokeStyle(
          2,
          0xffc85c,
          0.8,
        )
        .setDepth(1000);
    }

    // Use the same player texture and foot-level physics body as the clearing.
    this.player = this.physics.add.sprite(
      COTTAGE_PLAYER_SPAWN_X,
      COTTAGE_PLAYER_SPAWN_Y,
      PLAYER_TEXTURE_KEY,
    );

    this.player.setOrigin(
      0.5,
      1,
    );

    this.player.setDepth(this.player.y);

    const playerBody =
      this.player.body as Phaser.Physics.Arcade.Body;

    playerBody.setCircle(
      PLAYER_COLLIDER_RADIUS,
      PLAYER_COLLIDER_OFFSET_X,
      PLAYER_COLLIDER_OFFSET_Y,
    );

    playerBody.setCollideWorldBounds(true);

    this.physics.add.collider(
      this.player,
      this.obstacles,
    );

    // Detect when the player walks through the bottom doorway.
    this.cottageExit = this.add.rectangle(
      COTTAGE_ROOM_CENTER_X,
      COTTAGE_EXIT_Y,
      COTTAGE_EXIT_WIDTH,
      COTTAGE_EXIT_HEIGHT,
      0x00ffff,
      DEBUG_PHYSICS ? 0.35 : 0,
    );

    this.physics.add.existing(
      this.cottageExit,
      true,
    );

    this.physics.add.overlap(
      this.player,
      this.cottageExit,
      this.leaveCottage,
      undefined,
      this,
    );

    this.playerController = new PlayerController(
      this,
      this.player,
    );

    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable");
    }

    this.interactKey = keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );

    this.interactionButton = this.add
      .text(
        0,
        0,
        "E · Toggle lamp",
        {
          backgroundColor: "#2f261fee",
          color: "#fff2d2",
          fontFamily: "Georgia, serif",
          fontSize: "16px",
          padding: {
            x: 12,
            y: 9,
          },
        },
      )
      .setOrigin(
        1,
        1,
      )
      .setScrollFactor(0)
      .setDepth(UI_DEPTH)
      .setInteractive({
        useHandCursor: true,
      })
      .setVisible(false);

    this.interactionButton.on(
      Phaser.Input.Events.POINTER_DOWN,
      this.handleLampButtonPressed,
      this,
    );

    this.positionInteractionButton();

    this.scale.on(
      Phaser.Scale.Events.RESIZE,
      this.positionInteractionButton,
      this,
    );

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.handleSceneShutdown,
      this,
    );

    this.cameras.main.startFollow(
      this.player,
      true,
      0.12,
      0.12,
    );

    this.worldClock = new WorldClock(this.game);

    this.atmosphere = new AtmosphereOverlay(
      this,
      0x3a3048,
    );

    this.add
      .text(
        24,
        22,
        "Inside the cottage",
        {
          color: "#fff2d2",
          fontFamily: "Georgia, serif",
          fontSize: "28px",
        },
      )
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);

    this.add
      .text(
        24,
        66,
        "Walk through the bottom doorway to leave.",
        {
          color: "#f5dfbd",
          fontFamily: "Georgia, serif",
          fontSize: "16px",
        },
      )
      .setScrollFactor(0)
      .setDepth(UI_DEPTH);
  }

  private leaveCottage() {
    this.scene.start(
      CLEARING_SCENE_KEY,
      {
        playerX: CLEARING_RETURN_X,
        playerY: CLEARING_RETURN_Y,
      } satisfies ClearingTransitionData,
    );
  }

  private isLampEnabled(): boolean {
    return this.game.registry.get(
      LAMP_ENABLED_REGISTRY_KEY,
    ) as boolean;
  }

  private updateLampAppearance() {
    const isEnabled = this.isLampEnabled();

    this.lampBulb.setFillStyle(
      isEnabled
        ? 0xffedaa
        : 0x6d4a32,
    );

    this.lampGlowInner.setVisible(isEnabled);
    this.lampGlowOuter.setVisible(isEnabled);
  }

  private updateLampInteraction() {
    const distanceToLamp =
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        LAMP_INTERACTION_X,
        LAMP_INTERACTION_Y,
      );

    this.canInteractWithLamp =
      distanceToLamp <= LAMP_INTERACTION_RANGE;

    this.interactionButton.setVisible(
      this.canInteractWithLamp,
    );

    if (
      this.canInteractWithLamp &&
      Phaser.Input.Keyboard.JustDown(this.interactKey)
    ) {
      this.toggleLamp();
    }
  }

  private toggleLamp() {
    const nextEnabledState =
      !this.isLampEnabled();

    this.game.registry.set(
      LAMP_ENABLED_REGISTRY_KEY,
      nextEnabledState,
    );

    this.updateLampAppearance();
  }

  private handleLampButtonPressed() {
    if (!this.canInteractWithLamp) {
      return;
    }

    this.toggleLamp();
  }

  private positionInteractionButton() {
    this.interactionButton.setPosition(
      this.scale.width - 18,
      this.scale.height - 18,
    );
  }

  private handleSceneShutdown() {
    this.scale.off(
      Phaser.Scale.Events.RESIZE,
      this.positionInteractionButton,
      this,
    );
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

    this.updateLampInteraction();

    const worldTime = this.worldClock.read();

    const interiorDarkness = Phaser.Math.Clamp(
      worldTime.darkness * 0.42,
      0.02,
      0.24,
    );

    this.atmosphere.setAlpha(
      interiorDarkness,
    );
  }
}
