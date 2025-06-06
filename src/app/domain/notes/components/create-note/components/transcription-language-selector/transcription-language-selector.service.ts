import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getSupportedLanguageCode } from '.';

@Injectable({
  providedIn: 'root',
})
export class TranscriptionLanguageSelectorService {
  #platformId = inject(PLATFORM_ID);
  storeSelectedLanguage(selectedLanguage: 'en-US' | 'sv-SE' | null) {
    localStorage.setItem('selectedLanguage', selectedLanguage || '');
  }

  getSelectedLanguage(): 'en-US' | 'sv-SE' | null {
    if (!isPlatformBrowser(this.#platformId)) {
      return null;
    }

    const unknownSelectedLanguage = localStorage.getItem('selectedLanguage');
    const selectedLanguage = getSupportedLanguageCode(unknownSelectedLanguage);
    return selectedLanguage;
  }
}
