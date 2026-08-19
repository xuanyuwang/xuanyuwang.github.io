import Phaser from "phaser";

const DEBUG_PHYSICS = import.meta.env.DEV;
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
const PLAYER_SPEED = 180;
const PLAYER_RADIUS = 18;
const JOYSTICK_RADIUS = 52; // maximum thumb travel
const JOYSTICK_THUMB_RADIUS = 22; // visible thumb size
const JOYSTICK_MARGIN = 28; // distance from canvas edge
const JOYSTICK_DEAD_ZONE = 8; // ignores tiny accidental movements
const TOUCH_LAYOUT_BREAKPOINT = 600; // show controls in narrow test windows

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

  private keyboardIntent = new Phaser.Math.Vector2();
  private touchIntent = new Phaser.Math.Vector2();
  private movementIntent = new Phaser.Math.Vector2();

  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickThumb!: Phaser.GameObjects.Arc;
  private activeJoystickPointerId: number | null = null;

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private cottageEntrance!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(CLEARING_SCENE_KEY);
  }

  create() {
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

    this.createTouchControls();

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

  private createTouchControls() {
    // The base marks the joystick's available movement area.
    this.joystickBase = this.add
      .circle(
        0,
        0,
        JOYSTICK_RADIUS,
        0x1f2a1f,
        0.48,
      )
      .setStrokeStyle(
        3,
        0xfff2d2,
        0.7,
      )
      .setScrollFactor(0);

    // The thumb shows the direction currently selected by the player.
    this.joystickThumb = this.add
      .circle(
        0,
        0,
        JOYSTICK_THUMB_RADIUS,
        0xfff2d2,
        0.8,
      )
      .setScrollFactor(0);

    this.positionTouchControls();

    // Reposition the joystick whenever Phaser resizes its canvas.
    this.scale.on(
      Phaser.Scale.Events.RESIZE,
      this.positionTouchControls,
      this,
    );

    // Prevent a Scale Manager listener from surviving if this scene shuts down.
    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.scale.off(
          Phaser.Scale.Events.RESIZE,
          this.positionTouchControls,
          this,
        );
      },
    );

    this.input.on(
      Phaser.Input.Events.POINTER_DOWN,
      this.handleJoystickPointerDown,
      this,
    );

    this.input.on(
      Phaser.Input.Events.POINTER_MOVE,
      this.handleJoystickPointerMove,
      this,
    );

    this.input.on(
      Phaser.Input.Events.POINTER_UP,
      this.handleJoystickPointerUp,
      this,
    );
  }

  private positionTouchControls() {
    const shouldShowTouchControls =
      this.scale.width <= TOUCH_LAYOUT_BREAKPOINT ||
      this.sys.game.device.input.touch;

    this.joystickBase.setVisible(shouldShowTouchControls);
    this.joystickThumb.setVisible(shouldShowTouchControls);

    const joystickX =
      JOYSTICK_MARGIN + JOYSTICK_RADIUS;

    const joystickY =
      this.scale.height -
      JOYSTICK_MARGIN -
      JOYSTICK_RADIUS;

    this.joystickBase.setPosition(
      joystickX,
      joystickY,
    );

    // Keep the thumb centered unless a pointer is actively controlling it.
    if (this.activeJoystickPointerId === null) {
      this.joystickThumb.setPosition(
        joystickX,
        joystickY,
      );
    }
  }

  private handleJoystickPointerDown(
    pointer: Phaser.Input.Pointer,
  ) {
    if (!this.joystickBase.visible) {
      return;
    }

    if (this.activeJoystickPointerId !== null) {
      return;
    }

    const distanceFromBase =
      Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.joystickBase.x,
        this.joystickBase.y,
      );

    const activationRadius =
      JOYSTICK_RADIUS + JOYSTICK_THUMB_RADIUS;

    // Touches elsewhere in the game should remain available for future
    // interactions such as planting or toggling a lamp.
    if (distanceFromBase > activationRadius) {
      return;
    }

    this.activeJoystickPointerId = pointer.id;
    this.updateTouchIntent(pointer);
  }

  private handleJoystickPointerUp(
    pointer: Phaser.Input.Pointer,
  ) {
    if (pointer.id !== this.activeJoystickPointerId) {
      return;
    }

    this.activeJoystickPointerId = null;
    this.touchIntent.set(0, 0);

    this.joystickThumb.setPosition(
      this.joystickBase.x,
      this.joystickBase.y,
    );
  }
  private handleJoystickPointerMove(
    pointer: Phaser.Input.Pointer,
  ) {
    if (pointer.id !== this.activeJoystickPointerId) {
      return;
    }

    this.updateTouchIntent(pointer);
  }

  private updateTouchIntent(
    pointer: Phaser.Input.Pointer,
  ) {
    const horizontalDistance =
      pointer.x - this.joystickBase.x;

    const verticalDistance =
      pointer.y - this.joystickBase.y;

    const pointerDistance = Math.hypot(
      horizontalDistance,
      verticalDistance,
    );

    // Ignore tiny movements near the center so an imperfect stationary touch
    // does not make the player drift.
    if (pointerDistance <= JOYSTICK_DEAD_ZONE) {
      this.touchIntent.set(0, 0);

      this.joystickThumb.setPosition(
        this.joystickBase.x,
        this.joystickBase.y,
      );

      return;
    }

    // Convert the pointer displacement into a unit direction.
    this.touchIntent
      .set(
        horizontalDistance,
        verticalDistance,
      )
      .normalize();

    // Restrict the visible thumb to the circular joystick boundary.
    const thumbDistance = Math.min(
      pointerDistance,
      JOYSTICK_RADIUS,
    );

    this.joystickThumb.setPosition(
      this.joystickBase.x +
      this.touchIntent.x * thumbDistance,
      this.joystickBase.y +
      this.touchIntent.y * thumbDistance,
    );
  }

  // Convert keyboard state into a normalized direction
  private readKeyboardIntent(): Phaser.Math.Vector2 {
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

    this.keyboardIntent.set(
      horizontalDirection,
      verticalDirection,
    );

    // Normalize diagonal directions so moving diagonally is not faster than
    // moving horizontally or vertically.
    if (this.keyboardIntent.lengthSq() > 0) {
      this.keyboardIntent.normalize();
    }

    return this.keyboardIntent;
  }

  private readMovementIntent(): Phaser.Math.Vector2 {
    const keyboardIntent =
      this.readKeyboardIntent();

    // Keyboard takes priority when it is actively producing a direction.
    if (keyboardIntent.lengthSq() > 0) {
      return this.movementIntent.copy(
        keyboardIntent,
      );
    }

    return this.movementIntent.copy(
      this.touchIntent,
    );
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

class CottageScene extends Phaser.Scene {
  constructor() {
    super(COTTAGE_SCENE_KEY);
  }

  create() {
    const roomWidth = 720;
    const roomHeight = 520;
    const roomCenterX = roomWidth / 2;
    const roomCenterY = roomHeight / 2;

    this.physics.world.setBounds(
      0,
      0,
      roomWidth,
      roomHeight,
    );

    this.cameras.main.setBounds(
      0,
      0,
      roomWidth,
      roomHeight,
    );

    this.cameras.main.centerOn(
      roomCenterX,
      roomCenterY,
    );

    // Fill the room with a dark wooden floor.
    this.add.rectangle(
      roomCenterX,
      roomCenterY,
      roomWidth,
      roomHeight,
      0x6f4935,
    );

    // Draw a lighter rug as a temporary interior landmark.
    this.add.rectangle(
      roomCenterX,
      roomCenterY,
      260,
      180,
      0xa7684a,
    );

    // Represent the player with the same temporary primitive shape.
    this.add.circle(
      roomCenterX,
      roomCenterY + 120,
      PLAYER_RADIUS,
      0xf4d6a0,
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

    const leaveButton = this.add
      .text(
        24,
        66,
        "Leave cottage",
        {
          backgroundColor: "#4b2d24",
          color: "#fff2d2",
          fontFamily: "Georgia, serif",
          fontSize: "18px",
          padding: {
            x: 14,
            y: 10,
          },
        },
      )
      .setInteractive({
        useHandCursor: true,
      })
      .setScrollFactor(0);

    leaveButton.on(
      Phaser.Input.Events.POINTER_DOWN,
      () => {
        this.scene.start(CLEARING_SCENE_KEY);
      },
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
