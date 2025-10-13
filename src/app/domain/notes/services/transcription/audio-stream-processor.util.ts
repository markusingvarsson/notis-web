/**
 * AudioStreamProcessor
 *
 * Utility class for processing audio from a MediaStream for transcription.
 * Uses Web Audio API to extract audio samples and buffer them into chunks
 * suitable for processing by Whisper or other transcription engines.
 */

export interface AudioChunk {
  audio: Float32Array;
  sampleRate: number;
  timestamp: number;
}

export interface AudioStreamProcessorConfig {
  chunkDurationMs?: number; // Duration of each audio chunk in milliseconds (default: 5000)
  onAudioChunk: (chunk: AudioChunk) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export class AudioStreamProcessor {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isProcessing = false;

  private buffer: Float32Array[] = [];
  private bufferSampleCount = 0;
  private readonly targetSamples: number;
  private readonly config: Required<AudioStreamProcessorConfig>;

  constructor(config: AudioStreamProcessorConfig) {
    this.config = {
      chunkDurationMs: config.chunkDurationMs ?? 5000,
      onAudioChunk: config.onAudioChunk,
      onError: config.onError ?? ((error) => console.error('AudioStreamProcessor error:', error)),
    };

    // Calculate target samples based on typical sample rate (will be adjusted when stream starts)
    const estimatedSampleRate = 16000; // Whisper typically uses 16kHz
    this.targetSamples = Math.floor((estimatedSampleRate * this.config.chunkDurationMs) / 1000);
  }

  /**
   * Start processing audio from the given MediaStream
   */
  async start(stream: MediaStream): Promise<void> {
    if (this.isProcessing) {
      throw new Error('AudioStreamProcessor is already processing');
    }

    try {
      // Create audio context
      this.audioContext = new AudioContext({
        sampleRate: 16000, // Whisper prefers 16kHz audio
      });

      // Create source node from stream
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);

      // Create processor node for capturing audio data
      // Note: ScriptProcessorNode is deprecated but still widely used
      // TODO: Consider migrating to AudioWorklet for better performance
      const bufferSize = 4096;
      this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      this.processorNode.onaudioprocess = (event) => {
        if (!this.isProcessing) return;

        const inputData = event.inputBuffer.getChannelData(0);
        this.processAudioData(inputData, this.audioContext!.sampleRate);
      };

      // Connect nodes
      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.isProcessing = true;

    } catch (error) {
      this.config.onError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Process incoming audio data
   */
  private processAudioData(audioData: Float32Array, sampleRate: number): void {
    // Add to buffer
    this.buffer.push(new Float32Array(audioData));
    this.bufferSampleCount += audioData.length;

    // Check if we have enough data for a chunk
    const targetSamples = Math.floor((sampleRate * this.config.chunkDurationMs) / 1000);

    if (this.bufferSampleCount >= targetSamples) {
      this.emitChunk(sampleRate);
    }
  }

  /**
   * Emit a chunk of audio data
   */
  private emitChunk(sampleRate: number): void {
    // Combine buffered arrays into single Float32Array
    const combinedAudio = new Float32Array(this.bufferSampleCount);
    let offset = 0;

    for (const chunk of this.buffer) {
      combinedAudio.set(chunk, offset);
      offset += chunk.length;
    }

    // Create chunk
    const chunk: AudioChunk = {
      audio: combinedAudio,
      sampleRate,
      timestamp: Date.now(),
    };

    // Emit chunk (async or sync)
    try {
      const result = this.config.onAudioChunk(chunk);
      if (result instanceof Promise) {
        result.catch(this.config.onError);
      }
    } catch (error) {
      this.config.onError(error instanceof Error ? error : new Error(String(error)));
    }

    // Clear buffer
    this.buffer = [];
    this.bufferSampleCount = 0;
  }

  /**
   * Stop processing and clean up resources
   */
  stop(): void {
    this.isProcessing = false;

    // Emit any remaining buffered audio
    if (this.bufferSampleCount > 0 && this.audioContext) {
      this.emitChunk(this.audioContext.sampleRate);
    }

    // Disconnect and clean up nodes
    if (this.processorNode) {
      this.processorNode.onaudioprocess = null;
      this.processorNode.disconnect();
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch((error) => {
        console.warn('Error closing AudioContext:', error);
      });
      this.audioContext = null;
    }

    // Clear buffer
    this.buffer = [];
    this.bufferSampleCount = 0;
  }

  /**
   * Check if currently processing
   */
  isActive(): boolean {
    return this.isProcessing;
  }
}
