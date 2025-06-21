export interface NoSoundDetectorConfig {
  threshold: number;
  delayMs: number;
  onNoSoundDetected: () => void;
  onSoundDetected?: () => void; // Optional callback when sound comes back after warning
}

export class NoSoundDetector {
  private noSoundStartTime: number | null = null;
  private hasShownWarning = false;
  private isTerminated = false;
  private readonly config: NoSoundDetectorConfig;

  constructor(config: NoSoundDetectorConfig) {
    this.config = config;
  }

  update(voiceLevel: number): void {
    if (this.isTerminated) return;

    if (voiceLevel <= this.config.threshold) {
      // No sound detected
      const currentTime = Date.now();
      if (this.noSoundStartTime === null) {
        // Start tracking no-sound period
        this.noSoundStartTime = currentTime;
      } else if (currentTime - this.noSoundStartTime >= this.config.delayMs) {
        // No sound for the threshold duration - trigger callback
        if (!this.hasShownWarning) {
          this.hasShownWarning = true;
          this.config.onNoSoundDetected();
        }
      }
    } else {
      if (this.noSoundStartTime !== null || this.hasShownWarning) {
        // Sound detected - reset tracking
        const wasWarningShown = this.hasShownWarning;
        this.noSoundStartTime = null;
        this.hasShownWarning = false;

        // If a warning was shown and we have a callback, trigger it
        if (wasWarningShown && this.config.onSoundDetected) {
          this.config.onSoundDetected();
        }
      }
      this.isTerminated = true;
    }
  }

  reset(): void {
    this.noSoundStartTime = null;
    this.hasShownWarning = false;
    this.isTerminated = false;
  }
}
