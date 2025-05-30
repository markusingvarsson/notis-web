// mime-type.token.ts
import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const AUDIO_MIME_TYPE = new InjectionToken<string | undefined>(
  'AudioMimeType',
  {
    factory: () => {
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) return undefined;

      const candidates = ['audio/wav', 'audio/webm', 'audio/mp4'];
      for (const type of candidates) {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      }
      return undefined;
    },
    providedIn: 'root',
  }
);
