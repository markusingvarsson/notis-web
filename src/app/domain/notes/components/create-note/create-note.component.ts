import {
  Component,
  computed,
  signal,
  PLATFORM_ID,
  output,
  inject,
  viewChild,
  ElementRef,
  effect,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NoteCreated, NoteType, RECORDER_STATE } from '../..';
import { RecordButtonComponent } from './components/record-button/record-button.component';
import { RecordAudioService } from '../../services/record-audio.service';
import { Router } from '@angular/router';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SaveModePickerComponent } from './components/save-mode-picker/save-mode-picker.component';
import { NoteNameInputComponent } from './components/note-name-input/note-name-input.component';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [
    RecordButtonComponent,
    FormsModule,
    PageHeaderComponent,
    SaveModePickerComponent,
    NoteNameInputComponent,
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
  readonly audioBlob = this.#recordAudioService.audioBlob;
  readonly transcriptText = this.#recordAudioService.transcriptText;
  readonly audioSrc = this.#recordAudioService.audioSrc;

  readonly saveMode = signal<NoteType>('audio');
  readonly audioElementRef =
    viewChild<ElementRef<HTMLAudioElement>>('audioElement');

  readonly noteName = signal('');
  readonly currentView = signal<'recording' | 'preview'>('recording');

  readonly hasSpeechRecognition = computed(() => {
    const isSpeechRecognitionSupported =
      isPlatformBrowser(this.#platformId) &&
      'webkitSpeechRecognition' in window;

    return isSpeechRecognitionSupported && this.#deviceService.isDesktop();
  });

  readonly recordLabel = computed(() => {
    switch (this.recordingState()) {
      case RECORDER_STATE.STARTING:
        return 'Starting...';
      case RECORDER_STATE.RECORDING:
        return 'Recording...';
      case RECORDER_STATE.BLOCKED:
        return 'Please enable microphone access';
      default:
        if (this.audioBlob()) return 'Recording complete. Save or clear.';
        return 'Click to start recording';
    }
  });

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.#platformId) && this.CTA()) {
        this.toggleRecording();
        // remove query param
        this.#router.navigate([], {
          queryParams: { CTA: undefined },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  toggleRecording(): void {
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      return;
    }

    if (this.recordingState() === RECORDER_STATE.IDLE) {
      // Before starting, ensure any previous audio/text is handled or explicitly cleared by user if necessary
      // For now, service's startRecording clears previous artifacts.
      this.#recordAudioService.startRecording(this.saveMode());
    } else if (this.recordingState() === RECORDER_STATE.RECORDING) {
      this.#recordAudioService.stopRecording();
      this.currentView.set('preview');
    } else {
      // Potentially STARTING, or a new state from service like COMPLETED_READY_TO_SAVE
      console.log('Recording state:', this.recordingState());
    }
  }

  handleSave(): void {
    const currentSaveMode = this.saveMode();
    const customNoteName = this.noteName()?.trim();

    if (currentSaveMode === 'audio') {
      const blob = this.audioBlob();
      if (!blob) {
        console.error('Please record audio first');
        return;
      }
      const title =
        customNoteName || `Audio Note - ${new Date().toLocaleDateString()}`;
      this.noteCreated.emit({
        type: 'audio',
        title,
        audioBlob: blob,
        audioMimeType: blob.type,
      });
      console.info('Audio note saved event emitted!');
    } else {
      const txt = this.transcriptText()?.trim();
      if (!txt) {
        console.error('Please record for transcription or type text');
        return;
      }
      let title = customNoteName || txt.split('\n')[0].slice(0, 50);
      if (!customNoteName && txt.length > 50 && title.length === 50)
        title = title.slice(0, 47) + '...';

      this.noteCreated.emit({
        type: 'text',
        title,
        content: txt,
      });
      console.info('Text note saved event emitted!');
    }
    // Reset UI and service state after saving
    this.clearRecording();
  }

  clearRecording(): void {
    this.#recordAudioService.clearRecording();
    // Reset component-specific state
    this.noteName.set('');
    this.currentView.set('recording');
    // UI might need to react to this, e.g., clear display of audio player or text.
    // This is handled by the service signals resetting.
    // console.log('Recording cleared via service.');
  }
}
