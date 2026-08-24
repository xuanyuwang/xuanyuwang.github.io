import Phaser from "phaser";

const WEATHER_CYCLE_DURATION_MS = 60_000;
const RAIN_START_PHASE = 1 / 3;
const RAIN_END_PHASE = 3 / 4;

const WEATHER_START_TIME_KEY =
  "cozy-world-weather-start-time";

export interface WeatherState {
  phase: number;
  isRaining: boolean;
  label: string;
}

export class WeatherClock {
  private game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;

    if (!this.game.registry.has(WEATHER_START_TIME_KEY)) {
      this.game.registry.set(
        WEATHER_START_TIME_KEY,
        this.game.loop.time,
      );
    }
  }

  read(): WeatherState {
    const startedAt =
      this.game.registry.get(
        WEATHER_START_TIME_KEY,
      ) as number;

    const elapsed = Math.max(
      0,
      this.game.loop.time - startedAt,
    );

    const phase =
      (elapsed / WEATHER_CYCLE_DURATION_MS) % 1;

    const isRaining =
      phase >= RAIN_START_PHASE &&
      phase < RAIN_END_PHASE;

    return {
      phase,
      isRaining,
      label: isRaining ? "Raining" : "Clear",
    };
  }
}
