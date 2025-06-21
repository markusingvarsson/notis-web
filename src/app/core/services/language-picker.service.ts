import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Language {
  name: string;
  value: SupportedLanguageCode | null;
}

export const supportedLanguageCodes = ['en-US', 'sv-SE', 'es-ES'] as const;
export type SupportedLanguageCode = (typeof supportedLanguageCodes)[number];

export function getSupportedLanguageCode(
  languageCode: string | null
): SupportedLanguageCode | null {
  return supportedLanguageCodes.includes(languageCode as SupportedLanguageCode)
    ? (languageCode as SupportedLanguageCode)
    : null;
}

@Injectable({
  providedIn: 'root',
})
export class LanguagePickerService {
  #platformId = inject(PLATFORM_ID);

  storeSelectedLanguage(selectedLanguageStr: string | null): void {
    const selectedLanguage = getSupportedLanguageCode(selectedLanguageStr);
    if (selectedLanguage) {
      localStorage.setItem('selectedLanguage', selectedLanguage);
    }
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
