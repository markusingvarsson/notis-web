import {
  Component,
  inject,
  input,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupportedLanguageCode } from '../../../../../../core/services/language-picker.service';
import {
  TranscriptionSetting,
  TranscriptionSettingsPickerService,
} from './transcription-settings-picker.service';

@Component({
  selector: 'app-transcription-settings-picker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transcription-settings-picker.component.html',
  styleUrl: './transcription-settings-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptionSettingsPickerComponent {
  readonly disabled = input.required<boolean>();
  selectedTranscriptionSetting = model<
    SupportedLanguageCode | 'no-transcription'
  >();

  #transcriptionSettingsPickerService = inject(
    TranscriptionSettingsPickerService
  );

  readonly languages: TranscriptionSetting[] = [
    { name: 'No transcription', value: 'no-transcription' },
    { name: 'English', value: 'en-US' },
    { name: 'Svenska', value: 'sv-SE' },
    { name: 'Español', value: 'es-ES' },
  ];

  onTranscriptionSettingsChange(
    $event: SupportedLanguageCode | 'no-transcription'
  ) {
    this.selectedTranscriptionSetting.set($event);
    this.#transcriptionSettingsPickerService.storeTranscriptionSettings($event);
  }
}
