import {
  Component,
  computed,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NoteCreated, RECORDER_STATE } from '../../..';
import { RecordAudioService } from '../../../services/record-audio.service';
import { FormsModule } from '@angular/forms';
import { RecordButtonComponent } from '../components/record-button/record-button.component';
import { NoteNameInputComponent } from '../components/note-name-input/note-name-input.component';

@Component({
  selector: 'app-create-audio-note',
  imports: [RecordButtonComponent, FormsModule, NoteNameInputComponent],
  templateUrl: './create-audio-note.component.html',
  styleUrl: './create-audio-note.component.scss',
})
export class CreateAudioNoteComponent {
  #recordAudioService = inject(RecordAudioService);

  readonly noteCreated = output<NoteCreated>();

  readonly recordingState = this.#recordAudioService.recordingState;
  readonly audioBlob = this.#recordAudioService.audioBlob;
  readonly audioSrc = this.#recordAudioService.audioSrc;

  readonly audioElementRef =
    viewChild<ElementRef<HTMLAudioElement>>('audioElement');

  readonly noteName = signal('');
  readonly currentView = signal<'recording' | 'preview'>('recording');

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

  toggleRecording(): void {
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      return;
    }

    if (this.recordingState() === RECORDER_STATE.IDLE) {
      // Before starting, ensure any previous audio/text is handled or explicitly cleared by user if necessary
      // For now, service's startRecording clears previous artifacts.
      this.#recordAudioService.startRecording('audio');
    } else if (this.recordingState() === RECORDER_STATE.RECORDING) {
      this.#recordAudioService.stopRecording();
      this.currentView.set('preview');
    } else {
      // Potentially STARTING, or a new state from service like COMPLETED_READY_TO_SAVE
      console.log('Recording state:', this.recordingState());
    }
  }

  handleSave(): void {
    const customNoteName = this.noteName()?.trim();
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

    // Reset UI and service state after saving
    this.clearRecording();
  }

  clearRecording(): void {
    this.#recordAudioService.clearRecording();
    this.noteName.set('');
    this.currentView.set('recording');
  }
}
