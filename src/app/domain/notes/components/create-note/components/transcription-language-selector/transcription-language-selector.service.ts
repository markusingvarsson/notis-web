import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getSupportedLanguageCode } from '.';

@Injectable({
  providedIn: 'root',
})
export class TranscriptionLanguageSelectorService {
  #platformId = inject(PLATFORM_ID);
  storeSelectedLanguage(selectedLanguageStr: string | null) {
    const selectedLanguage = getSupportedLanguageCode(selectedLanguageStr);
    localStorage.setItem('selectedLanguage', selectedLanguage || '');
  }

  getSelectedLanguage(): string | null {
    if (!isPlatformBrowser(this.#platformId)) {
      return null;
    }

    const selectedLanguageStr = localStorage.getItem('selectedLanguage');
    const selectedLanguage = getSupportedLanguageCode(selectedLanguageStr);
    return selectedLanguage;
  }
}
