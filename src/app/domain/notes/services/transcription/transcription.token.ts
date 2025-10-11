import { TranscriptionProvider } from './transcription.types';
import { InjectionToken } from '@angular/core';
import { WhisperProvider } from './providers/whisper.provider';

export const TRANSCRIPTION_INJECTION_TOKEN =
  new InjectionToken<TranscriptionProvider>('TRANSCRIPTION_INJECTION_TOKEN', {
    providedIn: 'root',
    factory: () => {
      return new WhisperProvider();
    },
  });
