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
  audioSource?: MediaStream;
  providerConfig?: Record<string, unknown>;
}

export interface TranscriptionError {
  code: string;
  message: string;
  recoverable: boolean;
  originalError?: unknown;
}

export type ProviderId = 'webkit-speech' | 'whisper';

export interface TranscriptionProviderConfig {
  provider: ProviderId;
  settings?: Record<string, unknown>;
  enabled: boolean;
}

export type ModelDownloadStatus =
  | 'not-downloaded'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface ModelStatusInfo {
  status: ModelDownloadStatus;
  progress: number; // 0-100
  downloadedSize?: number; // bytes
  totalSize?: number; // bytes
  error?: string;
  lastDownloaded?: string; // ISO date string
}

export interface ModelDownloadProgress {
  status: 'progress' | 'done' | 'error';
  progress: number; // 0-100
  file?: string;
  loaded?: number;
  total?: number;
}
