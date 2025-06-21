export interface AudioAnalyzerConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
  onVoiceLevelChange: (level: number) => void;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationId: number | null = null;
  private readonly config: AudioAnalyzerConfig;

  constructor(config: AudioAnalyzerConfig) {
    this.config = {
      fftSize: 512,
      smoothingTimeConstant: 0.3,
      ...config,
    };
  }

  start(stream: MediaStream): void {
    try {
      // Setup audio context
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize!;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant!;

      source.connect(this.analyser);

      // Start updating audio levels
      this.updateAudioLevels();
    } catch (err) {
      console.error('Error starting audio analysis:', err);
    }
  }

  stop(): void {
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Cancel animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Reset analyser
    this.analyser = null;
  }

  private updateAudioLevels(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate voice-specific level focusing on speech frequencies
    const voiceLevel = this.calculateVoiceLevel(dataArray);
    this.config.onVoiceLevelChange(voiceLevel);

    this.animationId = requestAnimationFrame(() => this.updateAudioLevels());
  }

  private calculateVoiceLevel(dataArray: Uint8Array): number {
    if (!this.audioContext) return 0;

    const sampleRate = this.audioContext.sampleRate;
    const nyquist = sampleRate / 2;
    const binWidth = nyquist / dataArray.length;

    // Focus on key speech frequency ranges
    // Fundamental frequencies: 85-255 Hz (most energy for voice)
    // Formant frequencies: 2-4 kHz (clarity and intelligibility)
    const fundamentalStart = Math.floor(85 / binWidth);
    const fundamentalEnd = Math.floor(255 / binWidth);
    const formantStart = Math.floor(2000 / binWidth);
    const formantEnd = Math.floor(4000 / binWidth);

    // Calculate weighted average focusing on speech frequencies
    let fundamentalSum = 0;
    let formantSum = 0;
    let fundamentalCount = 0;
    let formantCount = 0;

    // Fundamental frequency range (weighted higher)
    for (
      let i = fundamentalStart;
      i <= Math.min(fundamentalEnd, dataArray.length - 1);
      i++
    ) {
      fundamentalSum += dataArray[i];
      fundamentalCount++;
    }

    // Formant frequency range
    for (
      let i = formantStart;
      i <= Math.min(formantEnd, dataArray.length - 1);
      i++
    ) {
      formantSum += dataArray[i];
      formantCount++;
    }

    const fundamentalAvg =
      fundamentalCount > 0 ? fundamentalSum / fundamentalCount : 0;
    const formantAvg = formantCount > 0 ? formantSum / formantCount : 0;

    // Weighted combination (fundamental frequencies are more important for voice detection)
    const voiceLevel = (fundamentalAvg * 0.7 + formantAvg * 0.3) / 255;
    return Math.min(voiceLevel, 1);
  }
}
