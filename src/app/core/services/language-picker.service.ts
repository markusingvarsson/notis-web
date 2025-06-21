import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Language {
  name: string;
  value: SupportedLanguageCode | 'no-transcription';
}

export const supportedLanguageCodes = ['en-US', 'sv-SE', 'es-ES'] as const;
export type SupportedLanguageCode = (typeof supportedLanguageCodes)[number];

export function getSupportedLanguageCode(
  languageCode: string
): SupportedLanguageCode {
  return supportedLanguageCodes.includes(languageCode as SupportedLanguageCode)
    ? (languageCode as SupportedLanguageCode)
    : 'en-US';
}

@Injectable({
  providedIn: 'root',
})
export class LanguagePickerService {
  #platformId = inject(PLATFORM_ID);

  storeSelectedLanguage(selectedLanguageStr: string): void {
    const selectedLanguage = getSupportedLanguageCode(selectedLanguageStr);
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }

  getSelectedLanguage(): SupportedLanguageCode | 'no-transcription' {
    if (!isPlatformBrowser(this.#platformId)) {
      return 'en-US';
    }

    const selectedLanguageStr = localStorage.getItem('selectedLanguage');
    return selectedLanguageStr
      ? getSupportedLanguageCode(selectedLanguageStr)
      : 'en-US';
  }
}
