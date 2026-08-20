import Phaser from "phaser";
import { DEBUG_PHYSICS } from "./constants";

export function addDebugPositionMarker(
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
