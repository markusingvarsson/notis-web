import { Component, computed, inject, output, signal } from '@angular/core';
import { NoteCreated, RECORDER_STATE } from '../../..';
import { RecordAudioService } from '../../../services/record-audio.service';
import { RecordButtonComponent } from '../components/record-button/record-button.component';
import { FormsModule } from '@angular/forms';
import { NoteNameInputComponent } from '../components/note-name-input/note-name-input.component';

@Component({
  selector: 'app-create-text-note',
  imports: [RecordButtonComponent, FormsModule, NoteNameInputComponent],
  templateUrl: './create-text-note.component.html',
  styleUrl: './create-text-note.component.scss',
})
export class CreateTextNoteComponent {
  #recordAudioService = inject(RecordAudioService);

  readonly noteCreated = output<NoteCreated>();

  readonly recordingState = this.#recordAudioService.recordingState;
  readonly transcriptText = this.#recordAudioService.transcriptText;

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
        if (this.transcriptText()) return 'Recording complete. Save or clear.';
        return 'Click to start recording';
    }
  });
  toggleRecording(): void {
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      return;
    }

    if (this.recordingState() === RECORDER_STATE.IDLE) {
      this.#recordAudioService.startRecording('text');
    } else if (this.recordingState() === RECORDER_STATE.RECORDING) {
      this.#recordAudioService.stopRecording();
      this.currentView.set('preview');
    } else {
      console.log('Recording state:', this.recordingState());
    }
  }

  handleSave(): void {
    const customNoteName = this.noteName()?.trim();

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

    // Reset UI and service state after saving
    this.clearRecording();
  }

  clearRecording(): void {
    this.#recordAudioService.clearRecording();
    this.noteName.set('');
    this.currentView.set('recording');
  }
}
