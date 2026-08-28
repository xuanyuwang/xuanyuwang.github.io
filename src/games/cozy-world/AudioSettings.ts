import Phaser from "phaser";

const AUDIO_ENABLED_REGISTRY_KEY =
  "cozy-world-audio-enabled";

export class AudioSettings {
  private game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;

    if (!this.game.registry.has(AUDIO_ENABLED_REGISTRY_KEY)) {
      this.game.registry.set(
        AUDIO_ENABLED_REGISTRY_KEY,
        true,
      );
    }
  }

  isEnabled(): boolean {
    return this.game.registry.get(
      AUDIO_ENABLED_REGISTRY_KEY,
    ) as boolean;
  }

  toggle(): boolean {
    const isEnabled = !this.isEnabled();

    this.game.registry.set(
      AUDIO_ENABLED_REGISTRY_KEY,
      isEnabled,
    );

    return isEnabled;
  }
}
