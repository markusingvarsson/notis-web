import {
  Component,
  inject,
  input,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Language,
  LanguagePickerService,
} from '../../../../../../core/services/language-picker.service';

@Component({
  selector: 'app-transcription-language-selector',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transcription-language-selector.component.html',
  styleUrl: './transcription-language-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptionLanguageSelectorComponent {
  readonly disabled = input.required<boolean>();
  selectedLanguage = model<string | null>();
  #languagePickerService = inject(LanguagePickerService);

  readonly languages: Language[] = [
    { name: 'No transcription', value: null },
    { name: 'English', value: 'en-US' },
    { name: 'Svenska', value: 'sv-SE' },
    { name: 'Español', value: 'es-ES' },
  ];

  onLanguageChange($event: string | null) {
    this.selectedLanguage.set($event);
    this.#languagePickerService.storeSelectedLanguage($event);
  }
}
