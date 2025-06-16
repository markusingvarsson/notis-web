import {
  Component,
  computed,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { NoteCreated, RECORDER_STATE, Tag } from '../../..';
import { RecordAudioService } from '../../../services/record-audio.service';
import { FormsModule } from '@angular/forms';
import { RecordButtonComponent } from '../components/record-button/record-button.component';
import { NoteNameInputComponent } from '../components/note-name-input/note-name-input.component';
import { ToasterService } from '../../../../../components/ui/toaster/toaster.service';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TranscriptionLanguageSelectorComponent } from '../components/transcription-language-selector/transcription-language-selector.component';
import { TranscriptionLanguageSelectorService } from '../components/transcription-language-selector/transcription-language-selector.service';
import { AddTagsComponent } from '../components/add-tags/add-tags.component';
import { ConfirmationModalService } from '../../../../../components/ui/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-create-audio-note',
  imports: [
    RecordButtonComponent,
    FormsModule,
    NoteNameInputComponent,
    TranscriptionLanguageSelectorComponent,
    AddTagsComponent,
  ],
  templateUrl: './create-audio-note.component.html',
  styleUrl: './create-audio-note.component.scss',
})
export class CreateAudioNoteComponent {
  readonly isRecording = computed(() => {
    return this.recordingState() === RECORDER_STATE.RECORDING;
  });

  #platformId = inject(PLATFORM_ID);
  #recordAudioService = inject(RecordAudioService);
  #toaster = inject(ToasterService);
  #deviceService = inject(DeviceDetectorService);
  #transcriptionLanguageSelectorService = inject(
    TranscriptionLanguageSelectorService
  );
  #confirmationModalService = inject(ConfirmationModalService);

  readonly recordingState = this.#recordAudioService.recordingState;
  readonly audioBlob = this.#recordAudioService.audioBlob;
  readonly audioSrc = this.#recordAudioService.audioSrc;
  readonly recordLabel = this.#recordAudioService.recordLabel;
  readonly transcriptText = this.#recordAudioService.transcriptText;

  readonly noteCreated = output<NoteCreated>();
  readonly noteName = signal('');
  readonly noteTags = signal<Record<string, Tag>>({});
  readonly availableTags = input<Record<string, Tag>>({});
  readonly currentTag = signal<string>('');
  readonly currentView = signal<'recording' | 'preview'>('recording');
  readonly selectedLanguage = signal<string | null>(
    this.#transcriptionLanguageSelectorService.getSelectedLanguage()
  );

  readonly hasSpeechRecognition = computed(() => {
    const isSpeechRecognitionSupported =
      isPlatformBrowser(this.#platformId) &&
      'webkitSpeechRecognition' in window;

    return isSpeechRecognitionSupported && this.#deviceService.isDesktop();
  });

  toggleRecording(): void {
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      return;
    }

    if (this.recordingState() === RECORDER_STATE.IDLE) {
      // Before starting, ensure any previous audio/text is handled or explicitly cleared by user if necessary
      // For now, service's startRecording clears previous artifacts.
      this.#recordAudioService.startRecording(this.selectedLanguage());
    } else if (this.recordingState() === RECORDER_STATE.RECORDING) {
      this.#recordAudioService.stopRecording();
      this.currentView.set('preview');
    } else {
      // Potentially STARTING, or a new state from service like COMPLETED_READY_TO_SAVE
      console.log('Recording state:', this.recordingState());
    }
  }

  async handleSave(): Promise<void> {
    const customNoteName = this.noteName()?.trim();
    const blob = this.audioBlob();
    if (!blob) {
      this.#toaster.error('Please record audio first');
      return;
    }

    await this.handleUnsavedTag();
    const title = customNoteName || `Note - ${new Date().toLocaleDateString()}`;
    this.noteCreated.emit({
      type: 'audio',
      title,
      audioBlob: blob,
      audioMimeType: blob.type,
      transcript: this.transcriptText(),
      tags: this.noteTags(),
    });

    this.clearRecording();
  }

  clearRecording(): void {
    this.#recordAudioService.clearRecording();
    this.noteName.set('');
    this.noteTags.set({});
    this.currentView.set('recording');
  }

  async handleUnsavedTag(): Promise<void> {
    if (this.currentTag() && !this.noteTags()[this.currentTag()]) {
      const shouldAddUnsavedTag = await this.#confirmationModalService.open({
        title: 'Add Unsaved Tag?',
        message: `Would you like to add "${this.currentTag()}" as a tag to this note?`,
        confirmButtonText: 'Add',
        cancelButtonText: 'Skip',
      });
      if (shouldAddUnsavedTag) {
        this.noteTags.set({
          ...this.noteTags(),
          [this.currentTag()]: {
            name: this.currentTag(),
            id: this.currentTag(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
      this.currentTag.set('');
    }
  }
}
