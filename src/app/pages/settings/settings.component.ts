import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { CardComponent } from '../../components/ui/card/card.component';
import { CardHeaderComponent } from '../../components/ui/card/components/card-header/card-header.component';
import { CardTitleComponent } from '../../components/ui/card/components/card-title/card-title.component';
import { CardDescriptionComponent } from '../../components/ui/card/components/card-description/card-description.component';
import { CardContentComponent } from '../../components/ui/card/components/card-content/card-content.component';
import { ToasterService } from '../../components/ui/toaster/toaster.service';
import { TranscriptionLanguageSelectorComponent } from '../../domain/notes/components/create-note/components/transcription-language-selector/transcription-language-selector.component';
import { LanguagePickerService } from '../../core/services/language-picker.service';
import { IconChevronDownComponent } from '../../components/ui/icons/icon-chevron-down/icon-chevron-down.component';
import { IconChevronRightComponent } from '../../components/ui/icons/icon-chevron-right/icon-chevron-right.component';
import { NotesStorageService } from '../../domain/notes/services/notes-storage.service';
import { ConfirmationModalService } from '../../components/ui/confirmation-modal/confirmation-modal.service';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    PagelayoutComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    TranscriptionLanguageSelectorComponent,
    IconChevronDownComponent,
    IconChevronRightComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private toasterService = inject(ToasterService);
  #languagePickerService = inject(LanguagePickerService);
  #notesStorageService = inject(NotesStorageService);
  #confirmationModalService = inject(ConfirmationModalService);
  #platformId = inject(PLATFORM_ID);
  #deviceService = inject(DeviceDetectorService);

  readonly selectedLanguage = signal<string | null>(
    this.#languagePickerService.getSelectedLanguage()
  );
  readonly expandedSections = signal<Set<string>>(new Set(['account']));
  readonly hasSpeechRecognition = computed(() => {
    const isSpeechRecognitionSupported =
      isPlatformBrowser(this.#platformId) &&
      'webkitSpeechRecognition' in window;

    return isSpeechRecognitionSupported && this.#deviceService.isDesktop();
  });

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
