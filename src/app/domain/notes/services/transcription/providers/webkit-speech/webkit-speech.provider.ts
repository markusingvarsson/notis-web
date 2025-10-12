import { inject, PLATFORM_ID, Provider, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToasterService } from '../../../../../../components/ui/toaster/toaster.service';
import {
  TranscriptionProvider,
  TranscriptionOptions,
  TranscriptionError,
} from '../../transcription.types';
import {
  WebkitSpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from '../../../../index';
import { TRANSCRIPTION_INJECTION_TOKEN } from '../../transcription.token';

/**
 * WebKit Speech Recognition provider
 * Uses the Web Speech API available in WebKit-based browsers (Chrome, Safari, Edge)
 */
class WebkitSpeechProvider implements TranscriptionProvider {
  #platformId = inject(PLATFORM_ID);
  #deviceService = inject(DeviceDetectorService);
  #toaster = inject(ToasterService);

  // Provider state
  readonly isAvailable = signal(this.checkAvailability());
  readonly isTranscribing = signal(false);
  readonly transcriptText = signal('');
  readonly lastError = signal<TranscriptionError | null>(null);

  private recognition: WebkitSpeechRecognition | null = null;
  private currentOptions: TranscriptionOptions | null = null;

  private checkAvailability(): boolean {
    return (
      isPlatformBrowser(this.#platformId) &&
      'webkitSpeechRecognition' in window &&
      this.#deviceService.isDesktop()
    );
  }

  async startTranscription(options: TranscriptionOptions): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('WebKit Speech Recognition is not available');
    }

    if (this.isTranscribing()) {
      console.warn('Transcription already in progress');
      return;
    }

    this.currentOptions = options;
    this.lastError.set(null);

    try {
      this.recognition = new window.webkitSpeechRecognition!();
      this.setupRecognition(options);
      this.recognition.start();
      this.isTranscribing.set(true);
    } catch (error) {
      this.handleStartError(error);
      throw error;
    }
  }

  private setupRecognition(options: TranscriptionOptions): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = options.language;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((alternative) => alternative.transcript)
        .join('');
      this.transcriptText.set(transcript);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event);
      const wasHandled = this.handleError(event);

      if (!wasHandled) {
        console.warn(`Unhandled speech recognition error: ${event.error}`);
        this.cleanup();
      }
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isTranscribing.set(false);
    };
  }

  stopTranscription(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isTranscribing.set(false);
    }
  }

  handleError(error: SpeechRecognitionErrorEvent): boolean {
    switch (error.error) {
      case 'no-speech':
        console.log('No speech detected, restarting recognition...');
        this.restartRecognition();
        return true;

      case 'audio-capture':
        console.warn('Audio capture error, stopping transcription');
        this.#toaster.warning(
          'Audio capture issue detected. Transcription stopped.',
        );
        this.setError('audio-capture', 'Audio capture failed', false);
        this.cleanup();
        return true;

      case 'not-allowed':
        console.warn('Speech recognition not allowed');
        this.#toaster.error('Speech recognition permission denied');
        this.setError('not-allowed', 'Permission denied', false);
        this.cleanup();
        return true;

      case 'network':
        console.warn('Network error during speech recognition');
        this.#toaster.warning('Network error. Transcription may be affected.');
        this.setError('network', 'Network error occurred', true);
        this.restartRecognition();
        return true;

      case 'aborted':
        console.log('Speech recognition was aborted');
        return true;

      default:
        this.setError(error.error, error.message || 'Unknown error', false);
        return false;
    }
  }

  private restartRecognition(): void {
    setTimeout(() => {
      if (this.recognition && this.isTranscribing() && this.currentOptions) {
        try {
          this.recognition.start();
        } catch (e) {
          console.warn('Failed to restart speech recognition:', e);
          // Could implement exponential backoff here if needed
        }
      }
    }, 100);
  }

  cleanup(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition.onresult = undefined!;
      this.recognition.onerror = undefined!;
      this.recognition.onend = undefined;
      this.recognition = null;
    }
    this.isTranscribing.set(false);
    this.currentOptions = null;
  }

  clearTranscript(): void {
    this.transcriptText.set('');
  }

  private handleStartError(error: unknown): void {
    console.error('Failed to start speech recognition:', error);
    this.isTranscribing.set(false);

    if (error instanceof Error) {
      this.setError('start-failed', error.message, false);
    } else {
      this.setError('start-failed', 'Failed to start recognition', false);
    }
  }

  private setError(code: string, message: string, recoverable: boolean): void {
    this.lastError.set({
      code,
      message,
      recoverable,
    });
  }

  initialize(callback: (progress: number) => void): Promise<void> {
    callback(100);
    return Promise.resolve();
  }
}

export const WEBKIT_SPEECH_PROVIDER: Provider[] = [
  { provide: TRANSCRIPTION_INJECTION_TOKEN, useClass: WebkitSpeechProvider },
];
