import { computed, inject, Injectable } from '@angular/core';
import { ToasterService } from '../../../components/ui/toaster/toaster.service';
import { TranscriptionOptions } from './transcription/transcription.types';
import { SpeechRecognitionErrorEvent } from '../index';
import { SupportedLanguageCode } from '../../../core/services/language-picker.service';
import { TRANSCRIPTION_INJECTION_TOKEN } from './transcription/transcription.token';

/**
 * Orchestrator service for managing different transcription providers
 * Provides a unified API for transcription regardless of the underlying provider
 */
@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  #toaster = inject(ToasterService);
  activeProvider = inject(TRANSCRIPTION_INJECTION_TOKEN);

  // Computed signals that delegate to active provider
  readonly transcriptText = computed(() => {
    return this.activeProvider.transcriptText() ?? '';
  });

  readonly isTranscribing = computed(() => {
    return this.activeProvider.isTranscribing() ?? false;
  });

  readonly lastError = computed(() => {
    return this.activeProvider.lastError() ?? null;
  });

  // Whether speech recognition is available with the current provider
  readonly hasSpeechRecognition = computed(() => {
    return this.activeProvider.isAvailable();
  });

  /**
   * Start transcription with the active provider
   */
  async startTranscription(language: SupportedLanguageCode): Promise<void> {
    if (!this.activeProvider) {
      this.#toaster.error('No transcription provider available');
      throw new Error('No transcription provider available');
    }

    const options: TranscriptionOptions = {
      language,
    };

    try {
      await this.activeProvider.startTranscription(options);
    } catch (error) {
      console.error('Failed to start transcription:', error);
      throw error;
    }
  }

  /**
   * Stop transcription
   */
  stopTranscription(): void {
    this.activeProvider.stopTranscription();
  }

  /**
   * Handle transcription errors
   */
  handleTranscriptionError(error: SpeechRecognitionErrorEvent): boolean {
    return this.activeProvider.handleError(error) ?? false;
  }

  /**
   * Clear transcript
   */
  clearTranscript(): void {
    this.activeProvider.clearTranscript();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.activeProvider.cleanup();
  }

  initialize(callback: (progress: number) => void): Promise<void> {
    return this.activeProvider.initialize(callback);
  }
}
