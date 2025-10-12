import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { DesktopSidebarComponent } from '../../components/layout/desktop-sidebar/desktop-sidebar.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { CardComponent } from '../../components/ui/card/card.component';
import { CardHeaderComponent } from '../../components/ui/card/components/card-header/card-header.component';
import { CardTitleComponent } from '../../components/ui/card/components/card-title/card-title.component';
import { CardDescriptionComponent } from '../../components/ui/card/components/card-description/card-description.component';
import { CardContentComponent } from '../../components/ui/card/components/card-content/card-content.component';
import { ToasterService } from '../../components/ui/toaster/toaster.service';
import { TranscriptionSettingsPickerComponent } from '../../domain/notes/components/create-note/components/transcription-settings-picker/transcription-settings-picker.component';
import { SupportedLanguageCode } from '../../core/services/language-picker.service';
import { IconChevronComponent } from '../../components/ui/icons/icon-chevron/icon-chevron.component';
import { NotesStorageService } from '../../domain/notes/services/notes-storage.service';
import { ConfirmationModalService } from '../../components/ui/confirmation-modal/confirmation-modal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TranscriptionSettingsPickerService } from '../../domain/notes/components/create-note/components/transcription-settings-picker/transcription-settings-picker.service';
import { MicSelectorComponent } from '../../domain/notes/components/create-note/components/mic-selector/mic-selector.component';
import { SpeechRecognitionService } from '../../domain/notes/services/speech-recognition.service';
import { TranscriptionProviderSelectorComponent } from '../../domain/notes/components/create-note/components/transcription-provider-selector/transcription-provider-selector.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    PagelayoutComponent,
    DesktopSidebarComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    TranscriptionSettingsPickerComponent,
    IconChevronComponent,
    MicSelectorComponent,
    TranscriptionProviderSelectorComponent,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private toasterService = inject(ToasterService);
  #transcriptionSettingsPickerService = inject(
    TranscriptionSettingsPickerService,
  );
  #notesStorageService = inject(NotesStorageService);
  #confirmationModalService = inject(ConfirmationModalService);
  #deviceService = inject(DeviceDetectorService);
  #speechRecognitionService = inject(SpeechRecognitionService);

  readonly selectedTranscriptionSetting = signal<
    SupportedLanguageCode | 'no-transcription'
  >(this.#transcriptionSettingsPickerService.getTranscriptionSettings());
  readonly expandedSections = signal<Set<string>>(new Set(['account']));
  readonly isMobile = computed(() => this.#deviceService.isMobile());
  readonly hasSpeechRecognition =
    this.#speechRecognitionService.hasSpeechRecognition;
  readonly transcriptionEnabled = computed(
    () => this.selectedTranscriptionSetting() !== 'no-transcription',
  );

  toggleSection(section: string): void {
    this.expandedSections.update((sections) => {
      const newSections = new Set(sections);
      if (newSections.has(section)) {
        newSections.delete(section);
      } else {
        newSections.add(section);
      }
      return newSections;
    });
  }

  async requestClearData(): Promise<void> {
    const confirmed = await this.#confirmationModalService.open({
      title: 'Are you absolutely sure?',
      message:
        'This action cannot be undone. This will permanently delete all your notes and settings from this device.',
      confirmButtonText: 'Yes, delete everything',
      confirmButtonVariant: 'destructive',
    });

    if (confirmed) {
      try {
        await this.#notesStorageService.clearAllData();
        this.toasterService.success('All data has been cleared.');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to clear data.';
        this.toasterService.error(errorMessage);
        console.error('Error clearing data:', error);
      }
    }
  }
}
