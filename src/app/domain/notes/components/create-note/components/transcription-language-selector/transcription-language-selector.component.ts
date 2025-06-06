import { Component, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Language } from '.';
import { TranscriptionLanguageSelectorService } from './transcription-language-selector.service';

@Component({
  selector: 'app-transcription-language-selector',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transcription-language-selector.component.html',
  styleUrl: './transcription-language-selector.component.scss',
})
export class TranscriptionLanguageSelectorComponent {
  readonly disabled = input.required<boolean>();
  selectedLanguage = model<string | null>();
  #transcriptionLanguageSelectorService = inject(
    TranscriptionLanguageSelectorService
  );

  readonly languages: Language[] = [
    { name: 'No transcription', value: null },
    { name: 'English', value: 'en-US' },
    { name: 'Swedish', value: 'sv-SE' },
  ];

  onLanguageChange($event: 'en-US' | 'sv-SE' | null) {
    this.selectedLanguage.set($event);
    this.#transcriptionLanguageSelectorService.storeSelectedLanguage($event);
  }
}
