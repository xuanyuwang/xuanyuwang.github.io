import Phaser from "phaser";

const PLAYER_SPEED = 180;
const JOYSTICK_RADIUS = 52;
const JOYSTICK_THUMB_RADIUS = 22;
const JOYSTICK_MARGIN = 28;
const JOYSTICK_DEAD_ZONE = 8;
const TOUCH_LAYOUT_BREAKPOINT = 600;

interface MovementKeys {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
}

export class PlayerController {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys: MovementKeys;

  private keyboardIntent = new Phaser.Math.Vector2();
  private touchIntent = new Phaser.Math.Vector2();
  private movementIntent = new Phaser.Math.Vector2();

  private joystickBase: Phaser.GameObjects.Arc;
  private joystickThumb: Phaser.GameObjects.Arc;
  private activeJoystickPointerId: number | null = null;

  constructor(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite,
  ) {
    this.scene = scene;
    this.player = player;

    const keyboard = scene.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable");
    }

    this.cursors = keyboard.createCursorKeys();

    this.movementKeys = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.joystickBase = scene.add
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

    this.joystickThumb = scene.add
      .circle(
        0,
        0,
        JOYSTICK_THUMB_RADIUS,
        0xfff2d2,
        0.8,
      )
      .setScrollFactor(0);

    this.positionTouchControls();

    scene.scale.on(
      Phaser.Scale.Events.RESIZE,
      this.positionTouchControls,
      this,
    );

    scene.input.on(
      Phaser.Input.Events.POINTER_DOWN,
      this.handleJoystickPointerDown,
      this,
    );

    scene.input.on(
      Phaser.Input.Events.POINTER_MOVE,
      this.handleJoystickPointerMove,
      this,
    );

    scene.input.on(
      Phaser.Input.Events.POINTER_UP,
      this.handleJoystickPointerUp,
      this,
    );

    scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.destroy,
      this,
    );
  }

  private positionTouchControls() {
    const shouldShowTouchControls =
      this.scene.scale.width <= TOUCH_LAYOUT_BREAKPOINT ||
      this.scene.sys.game.device.input.touch;

    this.joystickBase.setVisible(shouldShowTouchControls);
    this.joystickThumb.setVisible(shouldShowTouchControls);

    const joystickX =
      JOYSTICK_MARGIN + JOYSTICK_RADIUS;

    const joystickY =
      this.scene.scale.height -
      JOYSTICK_MARGIN -
      JOYSTICK_RADIUS;

    this.joystickBase.setPosition(
      joystickX,
      joystickY,
    );

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

    if (pointerDistance <= JOYSTICK_DEAD_ZONE) {
      this.touchIntent.set(0, 0);

      this.joystickThumb.setPosition(
        this.joystickBase.x,
        this.joystickBase.y,
      );

      return;
    }

    this.touchIntent
      .set(
        horizontalDistance,
        verticalDistance,
      )
      .normalize();

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

    if (isLeftPressed && !isRightPressed) {
      horizontalDirection = -1;
    } else if (isRightPressed && !isLeftPressed) {
      horizontalDirection = 1;
    }

    if (isUpPressed && !isDownPressed) {
      verticalDirection = -1;
    } else if (isDownPressed && !isUpPressed) {
      verticalDirection = 1;
    }

    this.keyboardIntent.set(
      horizontalDirection,
      verticalDirection,
    );

    if (this.keyboardIntent.lengthSq() > 0) {
      this.keyboardIntent.normalize();
    }

    return this.keyboardIntent;
  }

  private readMovementIntent(): Phaser.Math.Vector2 {
    const keyboardIntent =
      this.readKeyboardIntent();

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

  private destroy() {
    this.scene.scale.off(
      Phaser.Scale.Events.RESIZE,
      this.positionTouchControls,
      this,
    );

    this.scene.input.off(
      Phaser.Input.Events.POINTER_DOWN,
      this.handleJoystickPointerDown,
      this,
    );

    this.scene.input.off(
      Phaser.Input.Events.POINTER_MOVE,
      this.handleJoystickPointerMove,
      this,
    );

    this.scene.input.off(
      Phaser.Input.Events.POINTER_UP,
      this.handleJoystickPointerUp,
      this,
    );

    this.touchIntent.set(0, 0);
    this.activeJoystickPointerId = null;
  }
}
