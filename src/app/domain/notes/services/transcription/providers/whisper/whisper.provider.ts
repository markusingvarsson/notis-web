import { inject, PLATFORM_ID, Provider, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToasterService } from '../../../../../../components/ui/toaster/toaster.service';
import {
  TranscriptionProvider,
  TranscriptionOptions,
  TranscriptionError,
} from '../../transcription.types';
import { SpeechRecognitionErrorEvent } from '../../../../index';
import { TRANSCRIPTION_INJECTION_TOKEN } from '../../transcription.token';
import { WhisperModelStatusService } from '../../whisper-model-status.service';
import {
  AudioStreamProcessor,
  AudioChunk,
} from '../../audio-stream-processor.util';

/**
 * Whisper pipeline options for transcription
 * Based on Transformers.js automatic-speech-recognition pipeline
 */
interface WhisperPipelineOptions {
  language?: string; // ISO 639-1 language code (e.g., 'en', 'es', 'fr')
  task?: 'transcribe' | 'translate'; // Task type
  return_timestamps?: boolean | 'word'; // Return word-level timestamps
  chunk_length_s?: number; // Length of audio chunks for processing
  stride_length_s?: number; // Overlap between chunks
}

/**
 * Whisper transcription result
 */
interface WhisperOutput {
  text: string; // Transcribed text
  chunks?: {
    // Word-level chunks if return_timestamps is enabled
    text: string;
    timestamp: [number, number | null];
  }[];
}

/**
 * Type definition for Whisper pipeline function
 * This matches the Transformers.js AutomaticSpeechRecognitionPipeline signature
 */
type WhisperPipeline = (
  audio: Float32Array | Float32Array[],
  options?: WhisperPipelineOptions,
) => Promise<WhisperOutput>;

/**
 * Whisper Transcription Provider
 * Uses Hugging Face Transformers.js to run Whisper locally in the browser
 */
class WhisperProvider implements TranscriptionProvider {
  #platformId = inject(PLATFORM_ID);
  #toaster = inject(ToasterService);
  #modelStatusService = inject(WhisperModelStatusService);

  // Provider state
  readonly isAvailable = signal(this.checkAvailability());
  readonly isTranscribing = signal(false);
  readonly transcriptText = signal('');
  readonly lastError = signal<TranscriptionError | null>(null);

  private pipeline: WhisperPipeline | null = null;
  private currentOptions: TranscriptionOptions | null = null;
  private downloadCancelled = false;
  private audioProcessor: AudioStreamProcessor | null = null;
  private accumulatedTranscript: string[] = [];
  private modelName = 'Xenova/whisper-tiny.en';
  private isEnglishOnlyModel = true;

  // Processing queue for handling backpressure
  private processingQueue: AudioChunk[] = [];
  private isProcessingChunk = false;
  private readonly maxQueueSize = 2; // Max chunks to keep in queue
  private hasWarnedAboutLag = false;

  private checkAvailability(): boolean {
    // Whisper can run in any browser with WASM support
    // Note: Performance may vary on mobile devices
    return isPlatformBrowser(this.#platformId);
  }

  async startTranscription(options: TranscriptionOptions): Promise<void> {
    if (!this.isAvailable()) {
      const errorMessage =
        'Whisper transcription is not available. Make sure you are running in a browser environment.';
      this.#toaster.error('Whisper transcription is not available');
      this.setError('not-available', errorMessage, false);
      throw new Error(errorMessage);
    }

    if (this.isTranscribing()) {
      console.warn('Transcription already in progress');
      return;
    }

    if (!options.audioSource) {
      throw new Error(
        'Whisper provider requires an audioSource in TranscriptionOptions',
      );
    }

    if (!this.pipeline) {
      throw new Error(
        'Whisper model not initialized. Call initialize() first.',
      );
    }

    this.currentOptions = options;
    this.lastError.set(null);
    this.accumulatedTranscript = [];
    this.transcriptText.set('');

    try {
      // Create audio processor with overlapping windows
      this.audioProcessor = new AudioStreamProcessor({
        chunkDurationMs: 8000, // 8 second chunks - good balance for Whisper
        overlapDurationMs: 2000, // 2 second overlap between chunks
        onAudioChunk: (chunk) => this.processAudioChunk(chunk),
        onError: (error) => this.handleAudioProcessingError(error),
      });

      console.log(
        'AudioStreamProcessor initialized with 8s chunks and 2s overlap',
      );

      // Start processing audio from the stream
      await this.audioProcessor.start(options.audioSource);
      this.isTranscribing.set(true);
    } catch (error) {
      this.handleStartError(error);
      throw error;
    }
  }

  /**
   * Add audio chunk to processing queue
   * This method is called by AudioStreamProcessor and handles backpressure
   */
  private async processAudioChunk(chunk: AudioChunk): Promise<void> {
    if (!this.pipeline || !this.currentOptions) {
      return;
    }

    // Add chunk to queue
    this.processingQueue.push(chunk);

    // Check for backpressure and handle overflow
    if (this.processingQueue.length > this.maxQueueSize) {
      const queueSize = this.processingQueue.length;
      console.warn(
        `Whisper processing queue overflow: ${queueSize} chunks queued. Dropping oldest chunks.`,
      );

      // Warn user once about lag
      if (!this.hasWarnedAboutLag) {
        this.#toaster.warning(
          'Transcription is processing slower than recording. Some audio may be skipped.',
        );
        this.hasWarnedAboutLag = true;
      }

      // Drop oldest chunks, keep only the most recent maxQueueSize chunks
      this.processingQueue.splice(0, queueSize - this.maxQueueSize);
    }

    // Start processing if not already processing
    if (!this.isProcessingChunk) {
      this.processQueue();
    }
  }

  /**
   * Process queued chunks sequentially
   */
  private async processQueue(): Promise<void> {
    this.isProcessingChunk = true;

    while (this.processingQueue.length > 0 && this.isTranscribing()) {
      const chunk = this.processingQueue.shift()!;
      const queueSizeBeforeProcessing = this.processingQueue.length;

      console.log(
        `Processing audio chunk (queue size: ${queueSizeBeforeProcessing}, chunk size: ${chunk.audio.length} samples, overlap: ${chunk.hasOverlap ? 'yes' : 'no'})`,
      );

      await this.transcribeChunk(chunk);

      // Reset lag warning if queue is clearing
      if (this.hasWarnedAboutLag && this.processingQueue.length === 0) {
        console.log('Processing queue cleared, caught up with recording');
        this.hasWarnedAboutLag = false;
      }
    }

    this.isProcessingChunk = false;
  }

  /**
   * Transcribe a single audio chunk using Whisper
   */
  private async transcribeChunk(chunk: AudioChunk): Promise<void> {
    if (!this.pipeline || !this.currentOptions) {
      return;
    }

    try {
      const startTime = performance.now();

      // Build options - only include language for multilingual models
      const pipelineOptions: WhisperPipelineOptions = {
        return_timestamps: false, // We don't need timestamps for continuous transcription
        chunk_length_s: 0, // Process entire chunk as-is (we're already chunking)
      };

      if (!this.isEnglishOnlyModel) {
        pipelineOptions.language = this.mapLanguageCode(
          this.currentOptions.language,
        );
      }

      // Run Whisper on the audio chunk
      const result = await this.pipeline(chunk.audio, pipelineOptions);

      const processingTime = performance.now() - startTime;
      const audioLengthSeconds = chunk.audio.length / chunk.sampleRate;
      const realtimeFactor = processingTime / 1000 / audioLengthSeconds;

      console.log(
        `Whisper processed ${audioLengthSeconds.toFixed(1)}s audio in ${processingTime.toFixed(0)}ms (${realtimeFactor.toFixed(2)}x realtime)`,
      );

      // Append to accumulated transcript
      if (result.text && result.text.trim()) {
        this.accumulatedTranscript.push(result.text.trim());

        // Update the transcript text signal
        const fullTranscript = this.accumulatedTranscript.join(' ');
        this.transcriptText.set(fullTranscript);
      }
    } catch (error) {
      console.error('Error processing audio chunk with Whisper:', error);
      this.setError(
        'processing-error',
        error instanceof Error ? error.message : 'Failed to process audio',
        true, // recoverable - we can continue with next chunk
      );
    }
  }

  private handleAudioProcessingError(error: Error): void {
    console.error('Audio processing error:', error);
    this.setError('audio-processing', error.message, false);
    this.cleanup();
  }

  stopTranscription(): void {
    if (this.audioProcessor) {
      this.audioProcessor.stop();
      this.audioProcessor = null;
    }

    // Clear processing queue
    this.processingQueue = [];
    this.isProcessingChunk = false;
    this.hasWarnedAboutLag = false;

    this.isTranscribing.set(false);
  }

  handleError(error: SpeechRecognitionErrorEvent): boolean {
    // Whisper doesn't use the Web Speech API, so this is primarily for interface compliance
    // Most errors are handled through audioProcessor callbacks
    console.warn(
      'Whisper provider received SpeechRecognitionErrorEvent:',
      error,
    );
    this.setError(error.error, error.message || 'Unknown error', false);
    return false;
  }

  cleanup(): void {
    if (this.audioProcessor) {
      this.audioProcessor.stop();
      this.audioProcessor = null;
    }

    // Clear processing queue and state
    this.processingQueue = [];
    this.isProcessingChunk = false;
    this.hasWarnedAboutLag = false;

    this.isTranscribing.set(false);
    this.currentOptions = null;
  }

  clearTranscript(): void {
    this.transcriptText.set('');
    this.accumulatedTranscript = [];
  }

  private handleStartError(error: unknown): void {
    console.error('Failed to start Whisper transcription:', error);
    this.isTranscribing.set(false);

    if (error instanceof Error) {
      this.setError('start-failed', error.message, false);
    } else {
      this.setError('start-failed', 'Failed to start transcription', false);
    }
  }

  private setError(code: string, message: string, recoverable: boolean): void {
    this.lastError.set({
      code,
      message,
      recoverable,
    });
  }

  async initialize(callback: (progress: number) => void): Promise<void> {
    this.downloadCancelled = false;

    // Check availability before attempting download
    if (!this.isAvailable()) {
      const errorMessage =
        'Cannot initialize Whisper. Make sure you are running in a browser environment.';
      this.#toaster.error('Whisper initialization failed');
      throw new Error(errorMessage);
    }

    try {
      // Check if already downloaded
      if (this.#modelStatusService.isDownloaded() && this.pipeline) {
        callback(100);
        return;
      }

      // Set status to downloading
      this.#modelStatusService.updateStatus({
        status: 'downloading',
        progress: 0,
      });

      const { pipeline } = await import('@huggingface/transformers');

      // Detect if model is English-only (ends with .en)
      this.isEnglishOnlyModel = this.modelName.endsWith('.en');
      console.log(
        `Loading Whisper model: ${this.modelName} (${this.isEnglishOnlyModel ? 'English-only' : 'Multilingual'})`,
      );

      // Load the Whisper pipeline
      const loadedPipeline = await pipeline(
        'automatic-speech-recognition',
        this.modelName,
        {
          progress_callback: (progressInfo) => {
            if (this.downloadCancelled) {
              throw new Error('Download cancelled');
            }

            if (progressInfo.status === 'progress') {
              const progress = progressInfo.progress || 0;
              callback(progress);

              this.#modelStatusService.setDownloadProgress(
                progress,
                progressInfo.loaded,
                progressInfo.total,
              );
            } else if (progressInfo.status === 'done') {
              callback(100);
            }
          },
        },
      );

      // Store the pipeline for use during transcription
      this.pipeline = loadedPipeline as WhisperPipeline;

      // Mark as downloaded when complete
      this.#modelStatusService.markAsDownloaded();
      this.#toaster.success('Whisper model downloaded successfully');
    } catch (error) {
      if (this.downloadCancelled) {
        this.#modelStatusService.resetStatus();
        this.#toaster.info('Model download cancelled');
      } else {
        const errorMessage =
          error instanceof Error ? error.message : 'Download failed';
        this.#modelStatusService.markAsError(errorMessage);
        this.#toaster.error(`Failed to download model: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Cancel ongoing download
   */
  cancelDownload(): void {
    this.downloadCancelled = true;
  }

  /**
   * Check if model is downloaded
   */
  isModelDownloaded(): boolean {
    return this.#modelStatusService.isDownloaded();
  }

  /**
   * Map SupportedLanguageCode to Whisper language codes
   */
  private mapLanguageCode(languageCode: string): string {
    // Whisper uses ISO 639-1 language codes (e.g., 'en', 'es', 'fr')
    // Extract the first two characters if the code is longer (e.g., 'en-US' -> 'en')
    return languageCode.split('-')[0].toLowerCase();
  }
}

export const WHISPER_PROVIDER: Provider[] = [
  { provide: TRANSCRIPTION_INJECTION_TOKEN, useClass: WhisperProvider },
];
