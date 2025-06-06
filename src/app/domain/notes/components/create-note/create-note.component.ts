import {
  Component,
  PLATFORM_ID,
  output,
  inject,
  effect,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { NoteCreated, RECORDER_STATE } from '../..';
import { RecordAudioService } from '../../services/record-audio.service';
import { Router } from '@angular/router';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { CreateAudioNoteComponent } from './create-audio-note/create-audio-note.component';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, CreateAudioNoteComponent],
  templateUrl: './create-note.component.html',
  styleUrls: ['./create-note.component.scss'],
  providers: [RecordAudioService],
})
export class CreateNoteComponent {
  #platformId = inject(PLATFORM_ID);
  #recordAudioService = inject(RecordAudioService);
  #router = inject(Router);
  readonly CTA = input<boolean>(false);

  readonly noteCreated = output<NoteCreated>();
  readonly recordingState = this.#recordAudioService.recordingState;

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.#platformId) && this.CTA()) {
        if (this.recordingState() === RECORDER_STATE.IDLE) {
          this.#recordAudioService.startRecording('audio');
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
