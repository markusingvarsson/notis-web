import {
  Component,
  computed,
  signal,
  PLATFORM_ID,
  output,
  inject,
  effect,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NoteCreated, NoteType, RECORDER_STATE } from '../..';
import { RecordAudioService } from '../../services/record-audio.service';
import { Router } from '@angular/router';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { CreateAudioNoteComponent } from './create-audio-note/create-audio-note.component';
import { CreateTextNoteComponent } from './create-text-note/create-text-note.component';
import { SaveModePickerComponent } from './components/save-mode-picker/save-mode-picker.component';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [
    FormsModule,
    PageHeaderComponent,
    CreateAudioNoteComponent,
    CreateTextNoteComponent,
    SaveModePickerComponent,
  ],
  templateUrl: './create-note.component.html',
  styleUrls: ['./create-note.component.scss'],
  providers: [RecordAudioService],
})
export class CreateNoteComponent {
  #platformId = inject(PLATFORM_ID);
  #deviceService = inject(DeviceDetectorService);
  #recordAudioService = inject(RecordAudioService);
  #router = inject(Router);
  readonly CTA = input<boolean>(false);

  readonly noteCreated = output<NoteCreated>();
  readonly recordingState = this.#recordAudioService.recordingState;
  readonly saveMode = signal<NoteType>('audio');

  readonly hasSpeechRecognition = computed(() => {
    const isSpeechRecognitionSupported =
      isPlatformBrowser(this.#platformId) &&
      'webkitSpeechRecognition' in window;

    return isSpeechRecognitionSupported && this.#deviceService.isDesktop();
  });

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.#platformId) && this.CTA()) {
        if (this.recordingState() === RECORDER_STATE.IDLE) {
          this.#recordAudioService.startRecording(this.saveMode());
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
