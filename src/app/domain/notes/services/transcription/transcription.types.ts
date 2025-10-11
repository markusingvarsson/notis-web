import { Signal } from '@angular/core';
import { SupportedLanguageCode } from '../../../../core/services/language-picker.service';
import { SpeechRecognitionErrorEvent } from '../../index';

/**
 * Common interface for all transcription providers
 */
export interface TranscriptionProvider {
  readonly isAvailable: Signal<boolean>;
  readonly isTranscribing: Signal<boolean>;
  readonly transcriptText: Signal<string>;
  readonly lastError: Signal<TranscriptionError | null>;

  initialize(callback: (progress: number) => void): Promise<void>;
  startTranscription(options: TranscriptionOptions): Promise<void>;
  stopTranscription(): void;
  handleError(error: SpeechRecognitionErrorEvent): boolean;
  cleanup(): void;
  clearTranscript(): void;
}

export interface TranscriptionOptions {
  language: SupportedLanguageCode;
  providerConfig?: Record<string, unknown>;
}

export interface TranscriptionError {
  code: string;
  message: string;
  recoverable: boolean;
  originalError?: unknown;
}

export type ProviderId = 'webkit-speech';

export interface TranscriptionProviderConfig {
  provider: ProviderId;
  settings?: Record<string, unknown>;
  enabled: boolean;
}
