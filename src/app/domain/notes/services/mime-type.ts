// mime-type.token.ts
import { InjectionToken } from '@angular/core';

export const AUDIO_MIME_TYPE = new InjectionToken<string | undefined>(
  'AudioMimeType',
  {
    factory: () => {
      if (typeof window === 'undefined') return undefined;

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
