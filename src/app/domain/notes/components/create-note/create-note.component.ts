// File: src/app/quick-note-input/quick-note-input.component.ts

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
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NoteCreated, NoteType, RECORDER_STATE } from '../..';
import { RecordButtonComponent } from '../record-button/record-button.component';
import { RecordAudioService } from '../../services/record-audio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [RecordButtonComponent],
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
    } else {
      // Potentially STARTING, or a new state from service like COMPLETED_READY_TO_SAVE
      console.log('Recording state:', this.recordingState());
    }
  }

  handleSave(): void {
    const currentSaveMode = this.saveMode();
    if (currentSaveMode === 'audio') {
      const blob = this.audioBlob();
      if (!blob) {
        console.error('Please record audio first');
        // Potentially trigger a toast or UI warning
        return;
      }
      const title = `Audio Note - ${new Date().toLocaleDateString()}`;
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
        // Potentially trigger a toast or UI warning
        return;
      }
      let title = txt.split('\n')[0].slice(0, 50);
      if (txt.length > 50) title = title.slice(0, 47) + '...';
      this.noteCreated.emit({
        type: 'text',
        title,
        content: txt,
      });
      console.info('Text note saved event emitted!');
    }
    // Reset UI and service state after saving
    this.#recordAudioService.clearRecording();
  }

  clearRecording(): void {
    this.#recordAudioService.clearRecording();
    // UI might need to react to this, e.g., clear display of audio player or text.
    // This is handled by the service signals resetting.
    // console.log('Recording cleared via service.');
  }
}
