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
  SupportedLanguageCode,
} from '../../../../../../core/services/language-picker.service';
import { TranscriptionLanguageSelectorService } from './transcription-language-selector.service';

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
  selectedTranscriptionSetting = model<
    SupportedLanguageCode | 'no-transcription'
  >();

  #transcriptionLanguageSelectorService = inject(
    TranscriptionLanguageSelectorService
  );

  readonly languages: Language[] = [
    { name: 'No transcription', value: 'no-transcription' },
    { name: 'English', value: 'en-US' },
    { name: 'Svenska', value: 'sv-SE' },
    { name: 'Español', value: 'es-ES' },
  ];

  onTranscriptionSettingsChange(
    $event: SupportedLanguageCode | 'no-transcription'
  ) {
    this.selectedTranscriptionSetting.set($event);
    this.#transcriptionLanguageSelectorService.storeTranscriptionSettings(
      $event
    );
  }
}
