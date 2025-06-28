import {
  Component,
  PLATFORM_ID,
  output,
  inject,
  effect,
  input,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { NoteCreated, RECORDER_STATE, Tag } from '../..';
import { RecordAudioService } from '../../services/record-audio.service';
import { Router } from '@angular/router';
import { CreateAudioNoteComponent } from './create-audio-note/create-audio-note.component';
import { TranscriptionSettingsPickerService } from './components/transcription-settings-picker/transcription-settings-picker.service';
import { IconChevronComponent } from '../../../../components/ui/icons/icon-chevron/icon-chevron.component';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [FormsModule, CreateAudioNoteComponent, IconChevronComponent],
  templateUrl: './create-note.component.html',
  styleUrls: ['./create-note.component.scss'],
  providers: [RecordAudioService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateNoteComponent {
  #platformId = inject(PLATFORM_ID);
  #recordAudioService = inject(RecordAudioService);
  #router = inject(Router);
  #transcriptionSettingsPickerService = inject(
    TranscriptionSettingsPickerService
  );
  readonly CTA = input<boolean>(false);
  readonly tags = input<Record<string, Tag>>({});
  readonly availableTags = input<Record<string, Tag>>({});
  readonly showBackButton = input<boolean>(false);

  readonly noteCreated = output<NoteCreated>();
  readonly backClick = output<void>();
  readonly recordingState = this.#recordAudioService.recordingState;
  readonly isRecordingDone = this.#recordAudioService.isRecordingDone;

  readonly headerTitle = computed(() => {
    if (this.recordingState() === RECORDER_STATE.SAVING) {
      return 'Saving Your Note';
    }
    return 'Create Your Note';
  });

  readonly isSaving = computed(
    () => this.recordingState() === RECORDER_STATE.SAVING
  );

  readonly headerClasses = computed(() => {
    if (this.isSaving()) {
      return 'bg-gradient-to-r from-[var(--tw-primary-accent-bg)] to-[var(--tw-success-accent-bg)]';
    }
    return 'bg-[var(--tw-primary-accent-bg)]';
  });

  readonly titleClasses = computed(() => {
    if (this.isSaving()) {
      return 'text-[var(--tw-success-dark)]';
    }
    return 'text-[var(--tw-primary-dark)]';
  });

  readonly subtitleClasses = computed(() => {
    if (this.isSaving()) {
      return 'text-[var(--tw-success-dark)]';
    }
    return 'text-[var(--tw-text-muted)]';
  });

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.#platformId) && this.CTA()) {
        if (this.recordingState() === RECORDER_STATE.IDLE) {
          const transcriptionLanguage =
            this.#transcriptionSettingsPickerService.getTranscriptionSettings();
          const languageSetting =
            transcriptionLanguage === 'no-transcription'
              ? null
              : transcriptionLanguage;
          this.#recordAudioService.startRecording(languageSetting);
        }
        // remove query param
        this.#router.navigate([], {
          queryParams: { CTA: undefined },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }
}
