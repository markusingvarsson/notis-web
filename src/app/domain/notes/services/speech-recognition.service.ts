import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToasterService } from '../../../components/ui/toaster/toaster.service';
import {
  TranscriptionProvider,
  TranscriptionOptions,
  ProviderId,
  TranscriptionProviderConfig,
} from './transcription/transcription.types';
import { WebkitSpeechProvider } from './transcription/providers/webkit-speech.provider';
import { SpeechRecognitionErrorEvent } from '../index';
import { SupportedLanguageCode } from '../../../core/services/language-picker.service';

/**
 * Orchestrator service for managing different transcription providers
 * Provides a unified API for transcription regardless of the underlying provider
 */
@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  #platformId = inject(PLATFORM_ID);
  #toaster = inject(ToasterService);

  // Provider registry
  private providers = new Map<ProviderId, TranscriptionProvider>();

  // User's preferred provider
  private preferredProviderId = signal<ProviderId>('webkit-speech');

  // Available providers
  readonly availableProviders = signal<TranscriptionProvider[]>([]);

  // Computed active provider based on preference and availability
  readonly activeProvider = computed(() => {
    const preferredId = this.preferredProviderId();
    const preferred = this.providers.get(preferredId);

    // If preferred provider is available, use it
    if (preferred?.isAvailable()) {
      return preferred;
    }

    // Otherwise fallback to first available provider
    const firstAvailable = this.availableProviders()[0];
    return firstAvailable || null;
  });

  // Computed signals that delegate to active provider
  readonly transcriptText = computed(() => {
    const provider = this.activeProvider();
    return provider?.transcriptText() ?? '';
  });

  readonly isTranscribing = computed(() => {
    const provider = this.activeProvider();
    return provider?.isTranscribing() ?? false;
  });

  readonly lastError = computed(() => {
    const provider = this.activeProvider();
    return provider?.lastError() ?? null;
  });

  // Whether speech recognition is available with the current provider
  readonly hasSpeechRecognition = computed(() => {
    return this.activeProvider() !== null;
  });

  constructor() {
    this.initializeProviders();
    this.loadStoredPreference();
  }

  private initializeProviders(): void {
    // Initialize WebKit Speech provider
    const webkitProvider = new WebkitSpeechProvider();
    this.registerProvider('webkit-speech', webkitProvider);

    // TODO: Add more providers as they are implemented
    // this.registerProvider('openai-whisper', new OpenAIWhisperProvider());
    // this.registerProvider('google-cloud', new GoogleCloudSpeechProvider());

    this.updateAvailableProviders();
  }

  private registerProvider(
    id: ProviderId,
    provider: TranscriptionProvider,
  ): void {
    this.providers.set(id, provider);
  }

  private updateAvailableProviders(): void {
    const available = Array.from(this.providers.values()).filter((provider) =>
      provider.isAvailable(),
    );
    this.availableProviders.set(available);
  }

  private loadStoredPreference(): void {
    const storedId = this.loadProviderPreference();
    this.preferredProviderId.set(storedId);
  }

  /**
   * Start transcription with the active provider
   */
  async startTranscription(language: SupportedLanguageCode): Promise<void> {
    const provider = this.activeProvider();
    if (!provider) {
      this.#toaster.error('No transcription provider available');
      throw new Error('No transcription provider available');
    }

    const options: TranscriptionOptions = {
      language,
    };

    try {
      await provider.startTranscription(options);
    } catch (error) {
      console.error('Failed to start transcription:', error);
      throw error;
    }
  }

  /**
   * Stop transcription
   */
  stopTranscription(): void {
    const provider = this.activeProvider();
    provider?.stopTranscription();
  }

  /**
   * Handle transcription errors
   */
  handleTranscriptionError(error: SpeechRecognitionErrorEvent): boolean {
    const provider = this.activeProvider();
    return provider?.handleError(error) ?? false;
  }

  /**
   * Clear transcript
   */
  clearTranscript(): void {
    const provider = this.activeProvider();
    provider?.clearTranscript();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    const provider = this.activeProvider();
    provider?.cleanup();
  }

  /**
   * Switch to a different provider
   */
  switchProvider(providerId: ProviderId): boolean {
    const provider = this.providers.get(providerId);

    if (!provider?.isAvailable()) {
      this.#toaster.warning(`Provider ${providerId} is not available`);
      return false;
    }

    // Stop current provider if active
    if (this.isTranscribing()) {
      this.stopTranscription();
    }

    // Update preference (this will automatically update activeProvider via computed)
    this.preferredProviderId.set(providerId);

    // Store preference
    this.storeProviderPreference(providerId);

    return true;
  }

  /**
   * Get current provider configuration
   */
  getProviderConfig(): TranscriptionProviderConfig {
    const providerId = this.preferredProviderId();
    return {
      provider: providerId,
      enabled: true,
      settings: {},
    };
  }

  /**
   * Load provider preference from storage
   */
  private loadProviderPreference(): ProviderId {
    if (!isPlatformBrowser(this.#platformId)) {
      return 'webkit-speech';
    }

    const stored = localStorage.getItem('transcriptionProvider');
    return (stored as ProviderId) || 'webkit-speech';
  }

  /**
   * Store provider preference
   */
  private storeProviderPreference(providerId: ProviderId): void {
    if (isPlatformBrowser(this.#platformId)) {
      localStorage.setItem('transcriptionProvider', providerId);
    }
  }

  /**
   * Initialize with stored preferences (if called after construction)
   */
  initialize(): void {
    this.loadStoredPreference();
  }
}
