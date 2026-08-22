import Phaser from "phaser";

const DAY_CYCLE_DURATION_MS = 120_000;
const INITIAL_DAY_PHASE = 0.1;
const WORLD_START_TIME_KEY =
  "cozy-world-world-start-time";

const FULL_CIRCLE = Math.PI * 2;

export interface WorldTime {
  phase: number;
  darkness: number;
  label: string;
}

export class WorldClock {
  private game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;

    if (!this.game.registry.has(WORLD_START_TIME_KEY)) {
      this.game.registry.set(
        WORLD_START_TIME_KEY,
        this.game.loop.time,
      );
    }
  }

  read(): WorldTime {
    const startedAt =
      this.game.registry.get(WORLD_START_TIME_KEY) as number;

    const elapsed = Math.max(
      0,
      this.game.loop.time - startedAt,
    );

    const phase =
      (
        INITIAL_DAY_PHASE +
        elapsed / DAY_CYCLE_DURATION_MS
      ) % 1;

    const sunHeight = Math.sin(
      phase * FULL_CIRCLE,
    );

    const daylight = Phaser.Math.Clamp(
      (sunHeight + 0.15) / 1.15,
      0,
      1,
    );

    const darkness = Phaser.Math.Linear(
      0.58,
      0.05,
      daylight,
    );

    return {
      phase,
      darkness,
      label: this.getTimeLabel(phase),
    };
  }

  private getTimeLabel(phase: number): string {
    if (phase < 0.08 || phase >= 0.92) {
      return "Dawn";
    }

    if (phase < 0.42) {
      return "Day";
    }

    if (phase < 0.58) {
      return "Dusk";
    }

    return "Night";
  }
}
