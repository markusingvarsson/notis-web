import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NoteCreated, RECORDER_STATE, Tag } from '../../..';
import { RecordAudioService } from '../../../services/record-audio.service';
import { FormsModule } from '@angular/forms';
import { RecordButtonComponent } from '../components/record-button/record-button.component';
import { AudioLevelBarComponent } from '../components/audio-level-bar/audio-level-bar.component';
import { NoteNameInputComponent } from '../components/note-name-input/note-name-input.component';
import { ToasterService } from '../../../../../components/ui/toaster/toaster.service';
import { TranscriptionSettingsPickerComponent } from '../components/transcription-settings-picker/transcription-settings-picker.component';
import { SupportedLanguageCode } from '../../../../../core/services/language-picker.service';
import { AddTagsComponent } from '../components/add-tags/add-tags.component';
import { ConfirmationModalService } from '../../../../../components/ui/confirmation-modal/confirmation-modal.service';
import { MicSelectorComponent } from '../components/mic-selector/mic-selector.component';
import { TranscriptionSettingsPickerService } from '../components/transcription-settings-picker/transcription-settings-picker.service';
import { SpeechRecognitionService } from '../../../services/speech-recognition.service';
import { WhisperModelStatusService } from '../../../services/transcription/whisper-model-status.service';
import { WhisperDownloadModalService } from '../components/whisper-download-modal/whisper-download-modal.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-create-audio-note',
  imports: [
    RecordButtonComponent,
    AudioLevelBarComponent,
    FormsModule,
    NoteNameInputComponent,
    TranscriptionSettingsPickerComponent,
    AddTagsComponent,
    MicSelectorComponent,
  ],
  templateUrl: './create-audio-note.component.html',
  styleUrl: './create-audio-note.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAudioNoteComponent {
  readonly isRecording = computed(() => {
    return this.recordingState() === RECORDER_STATE.RECORDING;
  });

  #platformId = inject(PLATFORM_ID);
  #recordAudioService = inject(RecordAudioService);
  #toaster = inject(ToasterService);
  #transcriptionSettingsPickerService = inject(
    TranscriptionSettingsPickerService,
  );
  #confirmationModalService = inject(ConfirmationModalService);
  #speechRecognitionService = inject(SpeechRecognitionService);
  #modelStatusService = inject(WhisperModelStatusService);
  #whisperDownloadModalService = inject(WhisperDownloadModalService);
  #deviceService = inject(DeviceDetectorService);

  readonly recordingState = this.#recordAudioService.recordingState;
  readonly audioBlob = this.#recordAudioService.audioBlob;
  readonly audioSrc = this.#recordAudioService.audioSrc;
  readonly voiceLevel = this.#recordAudioService.voiceLevel;
  readonly recordLabel = this.#recordAudioService.recordLabel;
  readonly transcriptText = this.#recordAudioService.transcriptText;

  readonly noteCreated = output<NoteCreated>();
  readonly noteName = signal('');
  readonly noteTags = signal<Record<string, Tag>>({});
  readonly availableTags = input<Record<string, Tag>>({});
  readonly currentTag = signal<string>('');
  readonly currentView = signal<'recording' | 'preview'>('recording');
  readonly selectedTranscriptionSetting = signal<
    SupportedLanguageCode | 'no-transcription'
  >(this.#transcriptionSettingsPickerService.getTranscriptionSettings());

  readonly hasSpeechRecognition =
    this.#speechRecognitionService.hasSpeechRecognition;
  readonly hasMicrophonePermission = computed(() => {
    return this.recordingState() !== RECORDER_STATE.BLOCKED;
  });

  readonly showModelRequiredBadge = computed(() => {
    if (!isPlatformBrowser(this.#platformId)) {
      return false;
    }

    const transcriptionSetting = this.selectedTranscriptionSetting();
    const storedProvider = localStorage.getItem('transcriptionProvider');

    return (
      transcriptionSetting !== 'no-transcription' &&
      storedProvider === 'whisper' &&
      !this.#modelStatusService.isDownloaded()
    );
  });

  readonly modelStatusBadgeText = computed(() => {
    if (this.#modelStatusService.isDownloading()) {
      return 'Downloading...';
    }
    return 'Model Required';
  });

  onDeviceSelected(deviceId: string): void {
    this.#recordAudioService.setSelectedDevice(deviceId);
  }

  async toggleRecording(): Promise<void> {
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      return;
    }

    if (this.recordingState() === RECORDER_STATE.IDLE) {
      const transcriptionLanguage = this.selectedTranscriptionSetting();
      const languageSetting =
        transcriptionLanguage === 'no-transcription'
          ? null
          : transcriptionLanguage;

      // Check if we need Whisper model and it's not downloaded
      if (languageSetting && !this.#modelStatusService.isDownloaded()) {
        // Check if user selected Whisper provider
        if (await this.needsWhisperDownload()) {
          const action = await this.#whisperDownloadModalService.open({
            hasWebkitAvailable: this.checkWebkitAvailability(),
          });

          switch (action) {
            case 'download-and-record':
              // Model was downloaded in modal, proceed with recording
              this.#recordAudioService.startRecording(languageSetting);
              break;

            case 'record-without-transcription':
              // Start recording without transcription and persist this choice
              this.selectedTranscriptionSetting.set('no-transcription');
              this.#transcriptionSettingsPickerService.storeTranscriptionSettings(
                'no-transcription',
              );
              this.#recordAudioService.startRecording(null);
              break;

            case 'switch-provider':
              // Switch to WebKit provider
              if (isPlatformBrowser(this.#platformId)) {
                localStorage.setItem('transcriptionProvider', 'webkit-speech');
                this.#toaster.info('Switched to WebKit Speech. Please reload the page.');
              }
              return;

            case 'cancel':
              // User cancelled, do nothing
              return;
          }
        } else {
          // WebKit or no transcription
          this.#recordAudioService.startRecording(languageSetting);
        }
      } else {
        // Model already downloaded or no transcription needed
        this.#recordAudioService.startRecording(languageSetting);
      }
    } else if (this.recordingState() === RECORDER_STATE.RECORDING) {
      this.#recordAudioService.stopRecording();
      this.currentView.set('preview');
    }
  }

  /**
   * Check if we need to download Whisper model
   */
  private async needsWhisperDownload(): Promise<boolean> {
    if (!isPlatformBrowser(this.#platformId)) {
      return false;
    }

    const storedProvider = localStorage.getItem('transcriptionProvider');
    return storedProvider === 'whisper';
  }

  /**
   * Check if WebKit Speech Recognition is available
   */
  private checkWebkitAvailability(): boolean {
    return (
      isPlatformBrowser(this.#platformId) &&
      'webkitSpeechRecognition' in window &&
      this.#deviceService.isDesktop()
    );
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
