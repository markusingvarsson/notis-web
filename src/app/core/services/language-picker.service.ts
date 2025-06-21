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
  if (languageCode.startsWith('en-') || languageCode == 'en') {
    return 'en-US';
  }

  if (languageCode.startsWith('sv-') || languageCode == 'sv') {
    return 'sv-SE';
  }

  if (languageCode.startsWith('es-') || languageCode == 'es') {
    return 'es-ES';
  }

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
    if (selectedLanguageStr) {
      return getSupportedLanguageCode(selectedLanguageStr);
    }

    const language = getSupportedLanguageCode(navigator.language);
    return language;
  }
}
