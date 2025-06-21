import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  getSupportedLanguageCode,
  SupportedLanguageCode,
} from '../../../../../../core/services/language-picker.service';

@Injectable({
  providedIn: 'root',
})
export class TranscriptionLanguageSelectorService {
  #platformId = inject(PLATFORM_ID);

  storeTranscriptionSettings(
    selectedLanguageStr: SupportedLanguageCode | 'no-transcription'
  ): void {
    if (selectedLanguageStr === 'no-transcription') {
      localStorage.setItem('noTranscription', 'true');
      return;
    }

    const selectedLanguage = getSupportedLanguageCode(selectedLanguageStr);
    localStorage.setItem('selectedLanguage', selectedLanguage);
    localStorage.removeItem('noTranscription');
  }

  getTranscriptionSettings(): SupportedLanguageCode | 'no-transcription' {
    if (!isPlatformBrowser(this.#platformId)) {
      return 'en-US';
    }

    const noTranscription = localStorage.getItem('noTranscription');
    if (noTranscription) {
      return 'no-transcription';
    }

    const selectedLanguageStr = localStorage.getItem('selectedLanguage');
    return selectedLanguageStr
      ? getSupportedLanguageCode(selectedLanguageStr)
      : 'en-US';
  }
}
