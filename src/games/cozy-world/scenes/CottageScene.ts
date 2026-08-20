import Phaser from "phaser";
import { PlayerController } from "../PlayerController";
import { addDebugPositionMarker } from "../debug";
import {
  CLEARING_RETURN_X,
  CLEARING_RETURN_Y,
  CLEARING_SCENE_KEY,
  COTTAGE_EXIT_HEIGHT,
  COTTAGE_EXIT_WIDTH,
  COTTAGE_EXIT_Y,
  COTTAGE_PLAYER_SPAWN_X,
  COTTAGE_PLAYER_SPAWN_Y,
  COTTAGE_ROOM_CENTER_X,
  COTTAGE_ROOM_CENTER_Y,
  COTTAGE_ROOM_HEIGHT,
  COTTAGE_ROOM_WIDTH,
  COTTAGE_SCENE_KEY,
  DEBUG_PHYSICS,
  PLAYER_RADIUS,
} from "../constants";

interface ClearingTransitionData {
  playerX: number;
  playerY: number;
}

export class CottageScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private playerController!: PlayerController;

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private cottageExit!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(COTTAGE_SCENE_KEY);
  }

  create() {
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

    // Draw a lighter rug as a temporary interior landmark.
    this.add.rectangle(
      COTTAGE_ROOM_CENTER_X,
      COTTAGE_ROOM_CENTER_Y,
      260,
      180,
      0xa7684a,
    );

    const tableX = COTTAGE_ROOM_CENTER_X;
    const tableY = COTTAGE_ROOM_CENTER_Y - 70;
    const tableWidth = 130;
    const tableHeight = 70;

    this.add.rectangle(
      tableX,
      tableY,
      tableWidth,
      tableHeight,
      0x805536,
    );

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
    // Represent the player with the same temporary primitive shape.
    this.player = this.add.circle(
      COTTAGE_PLAYER_SPAWN_X,
      COTTAGE_PLAYER_SPAWN_Y,
      PLAYER_RADIUS,
      0xf4d6a0,
    );

    this.physics.add.existing(this.player);

    const playerBody =
      this.player.body as Phaser.Physics.Arcade.Body;

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

    this.cameras.main.startFollow(
      this.player,
      true,
      0.12,
      0.12,
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
      .setScrollFactor(0);

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
      .setScrollFactor(0);
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
  }
}
