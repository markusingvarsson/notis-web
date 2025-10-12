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

interface ProviderOption {
  id: ProviderId;
  name: string;
  description: string;
  isAvailable: boolean;
  requiresReload?: boolean;
}

@Component({
  selector: 'app-transcription-provider-selector',
  imports: [CommonModule],
  templateUrl: './transcription-provider-selector.component.html',
  styleUrl: './transcription-provider-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptionProviderSelectorComponent {
  #platformId = inject(PLATFORM_ID);
  #deviceService = inject(DeviceDetectorService);
  #toaster = inject(ToasterService);

  readonly selectedProvider = signal<ProviderId>(this.getStoredProvider());
  readonly needsReload = signal(false);

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
}
