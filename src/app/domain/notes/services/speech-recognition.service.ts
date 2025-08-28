import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  #platformId = inject(PLATFORM_ID);
  #deviceService = inject(DeviceDetectorService);

  readonly hasSpeechRecognition = computed(() => {
    const isSpeechRecognitionSupported =
      isPlatformBrowser(this.#platformId) &&
      'webkitSpeechRecognition' in window;

    return isSpeechRecognitionSupported && this.#deviceService.isDesktop();
  });
}
