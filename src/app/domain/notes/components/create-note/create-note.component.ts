import {
  Component,
  PLATFORM_ID,
  output,
  inject,
  effect,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { NoteCreated, RECORDER_STATE, Tag } from '../..';
import { RecordAudioService } from '../../services/record-audio.service';
import { Router } from '@angular/router';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { CreateAudioNoteComponent } from './create-audio-note/create-audio-note.component';
import { TranscriptionSettingsPickerService } from './components/transcription-settings-picker/transcription-settings-picker.service';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, CreateAudioNoteComponent],
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

  readonly noteCreated = output<NoteCreated>();
  readonly recordingState = this.#recordAudioService.recordingState;
  readonly isRecordingDone = this.#recordAudioService.isRecordingDone;

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
