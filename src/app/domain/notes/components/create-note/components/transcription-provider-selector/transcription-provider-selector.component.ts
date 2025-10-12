import {
  Component,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ProviderId } from '../../../../services/transcription/transcription.types';
import { ToasterService } from '../../../../../../components/ui/toaster/toaster.service';
import { WhisperModelStatusService } from '../../../../services/transcription/whisper-model-status.service';
import { SpeechRecognitionService } from '../../../../services/speech-recognition.service';
import { ModelDownloadProgressComponent } from '../model-download-progress/model-download-progress.component';
import { ButtonComponent } from '../../../../../../components/ui/button/button.component';
import { ConfirmationModalService } from '../../../../../../components/ui/confirmation-modal/confirmation-modal.service';

interface ProviderOption {
  id: ProviderId;
  name: string;
  description: string;
  isAvailable: boolean;
  requiresReload?: boolean;
}

@Component({
  selector: 'app-transcription-provider-selector',
  imports: [
    CommonModule,
    ModelDownloadProgressComponent,
    ButtonComponent,
  ],
  templateUrl: './transcription-provider-selector.component.html',
  styleUrl: './transcription-provider-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptionProviderSelectorComponent {
  #platformId = inject(PLATFORM_ID);
  #deviceService = inject(DeviceDetectorService);
  #toaster = inject(ToasterService);
  #modelStatusService = inject(WhisperModelStatusService);
  #speechRecognitionService = inject(SpeechRecognitionService);
  #confirmationModalService = inject(ConfirmationModalService);

  readonly selectedProvider = signal<ProviderId>(this.getStoredProvider());
  readonly needsReload = signal(false);

  // Model status signals
  readonly modelStatus = this.#modelStatusService.modelStatus;
  readonly isDownloading = this.#modelStatusService.isDownloading;
  readonly isDownloaded = this.#modelStatusService.isDownloaded;
  readonly downloadProgress = this.#modelStatusService.downloadProgress;

  readonly showModelStatus = computed(() => {
    return this.selectedProvider() === 'whisper';
  });

  readonly modelSizeFormatted = computed(() => {
    return this.#modelStatusService.getFormattedModelSize();
  });

  readonly providers = computed<ProviderOption[]>(() => {
    const webkitAvailable = this.checkWebkitAvailability();

    return [
      {
        id: 'webkit-speech',
        name: 'WebKit Speech',
        description: 'Browser-based speech recognition (Chrome, Safari, Edge)',
        isAvailable: webkitAvailable,
      },
      {
        id: 'whisper',
        name: 'Whisper',
        description: 'AI-powered transcription (works offline)',
        isAvailable: true,
      },
    ];
  });

  readonly availableProviders = computed(() => {
    return this.providers().filter((p) => p.isAvailable);
  });

  private checkWebkitAvailability(): boolean {
    if (!isPlatformBrowser(this.#platformId)) {
      return false;
    }

    return (
      'webkitSpeechRecognition' in window && this.#deviceService.isDesktop()
    );
  }

  private getStoredProvider(): ProviderId {
    if (!isPlatformBrowser(this.#platformId)) {
      return 'webkit-speech';
    }

    const stored = localStorage.getItem('transcriptionProvider');
    return stored === 'whisper' ? 'whisper' : 'webkit-speech';
  }

  onProviderChange(providerId: ProviderId): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    const provider = this.providers().find((p) => p.id === providerId);
    if (!provider?.isAvailable) {
      this.#toaster.warning('This provider is not available on your device');
      return;
    }

    const currentStored = this.getStoredProvider();
    if (currentStored !== providerId) {
      localStorage.setItem('transcriptionProvider', providerId);
      this.selectedProvider.set(providerId);
      this.needsReload.set(true);
      this.#toaster.info('Please reload the page to apply the changes');
    }
  }

  reloadPage(): void {
    if (isPlatformBrowser(this.#platformId)) {
      window.location.reload();
    }
  }

  /**
   * Start model download
   */
  async downloadModel(): Promise<void> {
    try {
      await this.#speechRecognitionService.initialize((progress) => {
        // Progress is tracked by the service
        console.log('Download progress:', progress);
      });
    } catch (error) {
      console.error('Model download failed:', error);
      // Error is already handled by the WhisperProvider
    }
  }

  /**
   * Cancel ongoing download
   */
  cancelDownload(): void {
    // Access the Whisper provider through the service
    const provider = this.#speechRecognitionService.activeProvider as {
      cancelDownload?: () => void;
    };

    if (provider?.cancelDownload) {
      provider.cancelDownload();
    }
  }

  /**
   * Delete downloaded model
   */
  async deleteModel(): Promise<void> {
    const confirmed = await this.#confirmationModalService.open({
      title: 'Delete Whisper Model?',
      message:
        'This will delete the downloaded model from your device. You can download it again later if needed.',
      confirmButtonText: 'Delete Model',
      confirmButtonVariant: 'destructive',
    });

    if (confirmed) {
      try {
        await this.#modelStatusService.deleteModel();
        this.#toaster.success('Whisper model deleted successfully');
      } catch (error) {
        console.error('Failed to delete model:', error);
        this.#toaster.error('Failed to delete model');
      }
    }
  }

  /**
   * Re-download model (deletes and downloads again)
   */
  async redownloadModel(): Promise<void> {
    try {
      await this.#modelStatusService.deleteModel();
      await this.downloadModel();
    } catch (error) {
      console.error('Failed to re-download model:', error);
    }
  }
}
