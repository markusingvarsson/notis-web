import { Component, inject, signal } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { CardComponent } from '../../components/ui/card/card.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { CardHeaderComponent } from '../../components/ui/card/components/card-header/card-header.component';
import { CardTitleComponent } from '../../components/ui/card/components/card-title/card-title.component';
import { CardDescriptionComponent } from '../../components/ui/card/components/card-description/card-description.component';
import { CardContentComponent } from '../../components/ui/card/components/card-content/card-content.component';
import { CardFooterComponent } from '../../components/ui/card/components/card-footer/card-footer.component';
import { ToasterService } from '../../components/ui/toaster/toaster.service';
import { TranscriptionLanguageSelectorComponent } from '../../domain/notes/components/create-note/components/transcription-language-selector/transcription-language-selector.component';
import { TranscriptionLanguageSelectorService } from '../../domain/notes/components/create-note/components/transcription-language-selector/transcription-language-selector.service';
import { IconChevronDownComponent } from '../../components/ui/icons/icon-chevron-down/icon-chevron-down.component';
import { IconChevronRightComponent } from '../../components/ui/icons/icon-chevron-right/icon-chevron-right.component';
import { NotesStorageService } from '../../domain/notes/services/notes-storage.service';
import { ConfirmationModalComponent } from '../../components/ui/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    PagelayoutComponent,
    CardComponent,
    ButtonComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    TranscriptionLanguageSelectorComponent,
    IconChevronDownComponent,
    IconChevronRightComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private toasterService = inject(ToasterService);
  #transcriptionLanguageSelectorService = inject(
    TranscriptionLanguageSelectorService
  );
  #notesStorageService = inject(NotesStorageService);

  readonly selectedLanguage = signal<string | null>(
    this.#transcriptionLanguageSelectorService.getSelectedLanguage()
  );
  readonly expandedSections = signal<Set<string>>(new Set(['account']));
  readonly showDeleteConfirmation = signal(false);

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

  requestClearData(): void {
    this.showDeleteConfirmation.set(true);
  }

  async onClearDataConfirm(): Promise<void> {
    this.showDeleteConfirmation.set(false);
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

  onClearDataCancel(): void {
    this.showDeleteConfirmation.set(false);
  }
}
