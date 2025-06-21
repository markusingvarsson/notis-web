import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  LanguagePickerService,
  SupportedLanguageCode,
} from '../../../../../../core/services/language-picker.service';

@Injectable({
  providedIn: 'root',
})
export class TranscriptionSettingsPickerService {
  #platformId = inject(PLATFORM_ID);
  #languagePickerService = inject(LanguagePickerService);

  storeTranscriptionSettings(
    selectedLanguageStr: SupportedLanguageCode | 'no-transcription'
  ): void {
    if (selectedLanguageStr === 'no-transcription') {
      localStorage.setItem('noTranscription', 'true');
      return;
    }

    this.#languagePickerService.storeSelectedLanguage(selectedLanguageStr);
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

    return this.#languagePickerService.getSelectedLanguage();
  }
}
