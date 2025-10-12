import { TranscriptionProvider } from './transcription.types';
import { InjectionToken } from '@angular/core';

export const TRANSCRIPTION_INJECTION_TOKEN =
  new InjectionToken<TranscriptionProvider>('TRANSCRIPTION_INJECTION_TOKEN');
