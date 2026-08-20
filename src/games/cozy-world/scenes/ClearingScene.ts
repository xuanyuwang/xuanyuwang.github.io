import Phaser from "phaser";
import { PlayerController } from "../PlayerController";
import { addDebugPositionMarker } from "../debug";
import {
  CLEARING_RETURN_X,
  CLEARING_RETURN_Y,
  CLEARING_SCENE_KEY,
  COTTAGE_ENTRANCE_HEIGHT,
  COTTAGE_ENTRANCE_WIDTH,
  COTTAGE_ENTRANCE_Y,
  COTTAGE_SCENE_KEY,
  COTTAGE_X,
  COTTAGE_Y,
  DEBUG_PHYSICS,
  LEFT_TREE_TRUNK_Y,
  LEFT_TREE_X,
  RIGHT_TREE_TRUNK_Y,
  RIGHT_TREE_X,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  PLAYER_ASSET_PATH,
  PLAYER_TEXTURE_KEY,
} from "../constants";

interface ClearingSceneData {
  playerX?: number;
  playerY?: number;
}

export class ClearingScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerController!: PlayerController;

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private cottageEntrance!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(CLEARING_SCENE_KEY);
  }

  preload() {
    if (this.textures.exists(PLAYER_TEXTURE_KEY)) {
      return;
    }

    this.load.svg(
      PLAYER_TEXTURE_KEY,
      PLAYER_ASSET_PATH,
      {
        width: 48,
        height: 64,
      },
    );
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

    // Draw the rectangular body of the cottage.
    this.add.rectangle(
      COTTAGE_X,
      COTTAGE_Y,
      150,
      110,
      0x9b6038,
    );

    // Draw the triangular cottage roof above the cottage body.
    //
    // The first two arguments position the triangle in the world.
    // The following coordinate pairs describe its three local points:
    // left-bottom, top-center, and right-bottom.
    this.add.triangle(
      COTTAGE_X,
      COTTAGE_Y - 95,
      0,
      80,
      75,
      0,
      150,
      80,
      0x633a2b,
    );

    // Draw the front door near the bottom center of the cottage.
    this.add.rectangle(
      COTTAGE_X,
      COTTAGE_Y + 15,
      34,
      80,
      0x4b2d24,
    );

    // Draw the illuminated window on the left side of the cottage.
    this.add.rectangle(
      COTTAGE_X - 42,
      COTTAGE_Y - 10,
      28,
      30,
      0xf2c66d,
    );

    // Draw the illuminated window on the right side of the cottage.
    this.add.rectangle(
      COTTAGE_X + 42,
      COTTAGE_Y - 10,
      28,
      30,
      0xf2c66d,
    );

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
    // Draw the circular autumn canopy of the tree on the left.
    this.add.circle(
      LEFT_TREE_X,
      COTTAGE_Y - 165,
      48,
      0xb85c38,
    );

    // Draw the trunk of the tree on the left.
    this.add.rectangle(
      LEFT_TREE_X,
      LEFT_TREE_TRUNK_Y,
      18,
      100,
      0x68452f,
    );

    // Only the lower trunk blocks movement.
    // The player may move visually beneath the canopy.
    this.createStaticObstacle(
      LEFT_TREE_X,
      LEFT_TREE_TRUNK_Y + 28,
      28,
      44,
    );

    // Draw the circular autumn canopy of the tree on the right.
    this.add.circle(
      RIGHT_TREE_X,
      COTTAGE_Y - 185,
      55,
      0xcf783d,
    );

    // Draw the trunk of the tree on the right.
    this.add.rectangle(
      RIGHT_TREE_X,
      RIGHT_TREE_TRUNK_Y,
      20,
      110,
      0x68452f,
    );
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

    const playerBody =
      this.player.body as Phaser.Physics.Arcade.Body;

    // Use a foot-level collision circle instead of the full visible artwork.
    playerBody.setCircle(
      18,
      6,
      27,
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
      .setScrollFactor(0);

    // Draw supporting screen-level text below the title.
    this.add
      .text(25, 58, "The clearing is taking shape.", {
        color: "#f5dfbd",
        fontFamily: "Georgia, serif",
        fontSize: "16px",
      })
      .setScrollFactor(0);

    // Prevent physics-enabled objects from leaving the defined game world.
    this.physics.world.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT,
    );

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
