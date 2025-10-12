import {
  Component,
  inject,
  input,
  model,
  computed,
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
    TranscriptionSettingsPickerService,
  );

  // Language options (without "No transcription")
  readonly languages: TranscriptionSetting[] = [
    { name: 'English', value: 'en-US' },
    { name: 'Svenska', value: 'sv-SE' },
    { name: 'Español', value: 'es-ES' },
  ];

  // Computed: is transcription enabled?
  readonly transcriptionEnabled = computed(() => {
    return this.selectedTranscriptionSetting() !== 'no-transcription';
  });

  // Computed: selected language (defaults to en-US if no-transcription)
  readonly selectedLanguage = computed((): SupportedLanguageCode => {
    const current = this.selectedTranscriptionSetting();
    return current === 'no-transcription' || !current ? 'en-US' : current;
  });

  onToggleChange(enabled: boolean): void {
    if (enabled) {
      // Enable transcription with current/default language
      const language = this.selectedLanguage();
      this.selectedTranscriptionSetting.set(language);
      this.#transcriptionSettingsPickerService.storeTranscriptionSettings(
        language,
      );
    } else {
      // Disable transcription
      this.selectedTranscriptionSetting.set('no-transcription');
      this.#transcriptionSettingsPickerService.storeTranscriptionSettings(
        'no-transcription',
      );
    }
  }

  onLanguageChange($event: SupportedLanguageCode): void {
    this.selectedTranscriptionSetting.set($event);
    this.#transcriptionSettingsPickerService.storeTranscriptionSettings($event);
  }
}
