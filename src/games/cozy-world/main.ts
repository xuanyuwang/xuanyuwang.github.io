import Phaser from "phaser";
import { PlayerController } from "./PlayerController";

const DEBUG_PHYSICS = import.meta.env.DEV;
const COTTAGE_ROOM_WIDTH = 720;
const COTTAGE_ROOM_HEIGHT = 520;
const COTTAGE_ROOM_CENTER_X = COTTAGE_ROOM_WIDTH / 2;
const COTTAGE_ROOM_CENTER_Y = COTTAGE_ROOM_HEIGHT / 2;
const WORLD_WIDTH = 1200;
const WORLD_HEIGHT = 800;
const cottageX = WORLD_WIDTH / 2;
const cottageY = WORLD_HEIGHT / 2;
const CLEARING_SCENE_KEY = "clearing";
const COTTAGE_SCENE_KEY = "cottage";

const COTTAGE_ENTRANCE_WIDTH = 70;
const COTTAGE_ENTRANCE_HEIGHT = 48;
const COTTAGE_ENTRANCE_Y = cottageY + 115;
const LEFT_TREE_X = cottageX - 300;
const LEFT_TREE_TRUNK_Y = cottageY - 100;
const RIGHT_TREE_X = cottageX + 260;
const RIGHT_TREE_TRUNK_Y = cottageY - 100;
const GAME_CONTAINER_ID = "cozy-world-game";
const PLAYER_RADIUS = 18;
const COTTAGE_PLAYER_SPAWN_X = COTTAGE_ROOM_CENTER_X;

const COTTAGE_PLAYER_SPAWN_Y =
  COTTAGE_ROOM_CENTER_Y + 120;

const COTTAGE_EXIT_WIDTH = 90;
const COTTAGE_EXIT_HEIGHT = 36;
const COTTAGE_EXIT_Y =
  COTTAGE_ROOM_HEIGHT - COTTAGE_EXIT_HEIGHT / 2;

const CLEARING_RETURN_X = cottageX;
const CLEARING_RETURN_Y =
  COTTAGE_ENTRANCE_Y +
  COTTAGE_ENTRANCE_HEIGHT / 2 +
  PLAYER_RADIUS +
  24;
interface ClearingSceneData {
  playerX?: number;
  playerY?: number;
}
function addDebugPositionMarker(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  color: number,
) {
  if (!DEBUG_PHYSICS) {
    return;
  }

  scene.add
    .circle(
      x,
      y,
      8,
      color,
      0.85,
    )
    .setDepth(1000);

  scene.add
    .rectangle(
      x,
      y,
      28,
      2,
      color,
    )
    .setDepth(1000);

  scene.add
    .rectangle(
      x,
      y,
      2,
      28,
      color,
    )
    .setDepth(1000);

  scene.add
    .text(
      x + 14,
      y - 22,
      `${label}\n(${x}, ${y})`,
      {
        backgroundColor: "#000000aa",
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "13px",
        padding: {
          x: 5,
          y: 3,
        },
      },
    )
    .setDepth(1000);
}
class ClearingScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private playerController!: PlayerController;

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private cottageEntrance!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(CLEARING_SCENE_KEY);
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
      cottageX,
      cottageY + 190,
      220,
      280,
      0x536b45,
    );

    // Draw the rectangular body of the cottage.
    this.add.rectangle(
      cottageX,
      cottageY,
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
      cottageX,
      cottageY - 95,
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
      cottageX,
      cottageY + 15,
      34,
      80,
      0x4b2d24,
    );

    // Draw the illuminated window on the left side of the cottage.
    this.add.rectangle(
      cottageX - 42,
      cottageY - 10,
      28,
      30,
      0xf2c66d,
    );

    // Draw the illuminated window on the right side of the cottage.
    this.add.rectangle(
      cottageX + 42,
      cottageY - 10,
      28,
      30,
      0xf2c66d,
    );

    // Block the complete visible footprint of the cottage.
    //
    // The collider covers the roof and body as one simple rectangle. We will
    // replace part of it with an entrance zone when the cottage becomes enterable.
    this.createStaticObstacle(
      cottageX,
      cottageY,
      150,
      190,
    );
    // Detect when the player approaches the cottage door.
    //
    // Unlike a collider, this overlap zone does not block or move the player.
    // It exists only to trigger the transition to the interior scene.
    this.cottageEntrance = this.add.rectangle(
      cottageX,
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
      cottageY - 165,
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
      cottageY - 185,
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
      cottageX,
      cottageY + 250,
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
      cottageX,
      COTTAGE_ENTRANCE_Y,
      "Cottage entrance",
      0x00ffff,
    );
    const playerSpawnX =
      data.playerX ?? cottageX;

    const playerSpawnY =
      data.playerY ?? cottageY + 250;
    // Create the temporary player appearance.
    //
    // The primitive circle is intentionally simple. It lets us validate movement,
    // physics, and camera behavior before introducing sprite assets.
    this.player = this.add.circle(
      playerSpawnX,
      playerSpawnY,
      PLAYER_RADIUS,
      0xf4d6a0,
    );

    // Give the visible circle an Arcade Physics body.
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

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

class CottageScene extends Phaser.Scene {
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
      } satisfies ClearingSceneData,
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
