import Phaser from "phaser";
import { UI_DEPTH } from "./constants";

const CONTROL_MARGIN = 18;

export class ContextActionControl {
  private scene: Phaser.Scene;
  private actionKey: Phaser.Input.Keyboard.Key;
  private button: Phaser.GameObjects.Text;
  private activate: () => void;
  private isAvailable = false;

  constructor(
    scene: Phaser.Scene,
    label: string,
    activate: () => void,
  ) {
    this.scene = scene;
    this.activate = activate;

    const keyboard = scene.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable");
    }

    this.actionKey = keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );

    this.button = scene.add
      .text(0, 0, `E · ${label}`, {
        backgroundColor: "#2f261fee",
        color: "#fff2d2",
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        padding: {
          x: 12,
          y: 9,
        },
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH)
      .setInteractive({
        useHandCursor: true,
      })
      .setVisible(false);

    this.button.on(
      Phaser.Input.Events.POINTER_DOWN,
      this.handlePointerDown,
      this,
    );

    this.position();

    scene.scale.on(
      Phaser.Scale.Events.RESIZE,
      this.position,
      this,
    );

    scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.destroy,
      this,
    );
  }

  setAvailable(isAvailable: boolean) {
    this.isAvailable = isAvailable;
    this.button.setVisible(isAvailable);
  }

  update() {
    if (
      this.isAvailable &&
      Phaser.Input.Keyboard.JustDown(this.actionKey)
    ) {
      this.activate();
    }
  }

  private handlePointerDown() {
    if (!this.isAvailable) {
      return;
    }

    this.activate();
  }

  private position() {
    this.button.setPosition(
      this.scene.scale.width - CONTROL_MARGIN,
      this.scene.scale.height - CONTROL_MARGIN,
    );
  }

  private destroy() {
    this.scene.scale.off(
      Phaser.Scale.Events.RESIZE,
      this.position,
      this,
    );

    this.button.off(
      Phaser.Input.Events.POINTER_DOWN,
      this.handlePointerDown,
      this,
    );

    this.isAvailable = false;
  }
}
