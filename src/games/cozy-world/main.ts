import Phaser from "phaser";

const WORLD_WIDTH = 1200;
const WORLD_HEIGHT = 800;
const cottageX = WORLD_WIDTH / 2;
const cottageY = WORLD_HEIGHT / 2;
const GAME_CONTAINER_ID = "cozy-world-game";
const PLAYER_SPEED = 180;
const PLAYER_RADIUS = 18;

interface MovementKeys {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
}

class ClearingScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: MovementKeys;
  private movementIntent = new Phaser.Math.Vector2();

  constructor() {
    super("clearing");
  }

  create() {
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

    // Draw the circular autumn canopy of the tree on the left.
    this.add.circle(
      cottageX - 300,
      cottageY - 165,
      48,
      0xb85c38,
    );

    // Draw the trunk of the tree on the left.
    this.add.rectangle(
      cottageX - 300,
      cottageY - 100,
      18,
      100,
      0x68452f,
    );

    // Draw the circular autumn canopy of the tree on the right.
    this.add.circle(
      cottageX + 260,
      cottageY - 185,
      55,
      0xcf783d,
    );

    // Draw the trunk of the tree on the right.
    this.add.rectangle(
      cottageX + 260,
      cottageY - 110,
      20,
      110,
      0x68452f,
    );

    // Create the temporary player appearance.
    //
    // The primitive circle is intentionally simple. It lets us validate movement,
    // physics, and camera behavior before introducing sprite assets.
    this.player = this.add.circle(
      cottageX,
      cottageY + 250,
      PLAYER_RADIUS,
      0xf4d6a0,
    );

    // Give the visible circle an Arcade Physics body.
    this.physics.add.existing(this.player);

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Stop the physics body at the configured world boundary.
    playerBody.setCollideWorldBounds(true);

    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable");
    }

    // Arrow-key input provided by Phaser.
    this.cursors = keyboard.createCursorKeys();

    // WASD input represented with the same directional structure.
    this.movementKeys = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

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
  private readMovementIntent(): Phaser.Math.Vector2 {
    const isLeftPressed =
      this.cursors.left.isDown ||
      this.movementKeys.left.isDown;

    const isRightPressed =
      this.cursors.right.isDown ||
      this.movementKeys.right.isDown;

    const isUpPressed =
      this.cursors.up.isDown ||
      this.movementKeys.up.isDown;

    const isDownPressed =
      this.cursors.down.isDown ||
      this.movementKeys.down.isDown;

    let horizontalDirection = 0;
    let verticalDirection = 0;

    // Move horizontally only when exactly one horizontal direction is pressed.
    //
    // Pressing left and right together cancels horizontal movement.
    if (isLeftPressed && !isRightPressed) {
      horizontalDirection = -1;
    } else if (isRightPressed && !isLeftPressed) {
      horizontalDirection = 1;
    }

    // Move vertically only when exactly one vertical direction is pressed.
    //
    // In screen coordinates, negative y is upward and positive y is downward.
    // Pressing up and down together cancels vertical movement.
    if (isUpPressed && !isDownPressed) {
      verticalDirection = -1;
    } else if (isDownPressed && !isUpPressed) {
      verticalDirection = 1;
    }

    this.movementIntent.set(
      horizontalDirection,
      verticalDirection,
    );

    // Normalize diagonal directions so moving diagonally is not faster than
    // moving horizontally or vertically.
    if (this.movementIntent.lengthSq() > 0) {
      this.movementIntent.normalize();
    }

    return this.movementIntent;
  }

  update() {
    const movementIntent = this.readMovementIntent();
    const playerBody =
      this.player.body as Phaser.Physics.Arcade.Body;

    playerBody.setVelocity(
      movementIntent.x * PLAYER_SPEED,
      movementIntent.y * PLAYER_SPEED,
    );
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
  scene: ClearingScene,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: "100%",
    height: "100%",
  },
});
