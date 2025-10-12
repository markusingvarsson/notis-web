import {
  Component,
  output,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../../components/ui/button/button.component';
import { ModelDownloadProgressComponent } from '../model-download-progress/model-download-progress.component';
import { WhisperDownloadModalAction } from './whisper-download-modal.service';
import { SpeechRecognitionService } from '../../../../services/speech-recognition.service';
import { WhisperModelStatusService } from '../../../../services/transcription/whisper-model-status.service';

@Component({
  selector: 'app-whisper-download-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModelDownloadProgressComponent],
  templateUrl: './whisper-download-modal.component.html',
  styleUrl: './whisper-download-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhisperDownloadModalComponent {
  readonly action = output<WhisperDownloadModalAction>();

  #speechRecognitionService = inject(SpeechRecognitionService);
  #modelStatusService = inject(WhisperModelStatusService);

  readonly isDownloading = signal(false);
  readonly downloadProgress = this.#modelStatusService.downloadProgress;
  readonly modelStatus = this.#modelStatusService.modelStatus;
  readonly modelSize = this.#modelStatusService.getFormattedModelSize();

  readonly showDownloadProgress = computed(() => {
    return this.isDownloading() || this.modelStatus().status === 'downloading';
  });

  async onDownloadAndRecord(): Promise<void> {
    this.isDownloading.set(true);

    try {
      await this.#speechRecognitionService.initialize(() => {
        // Progress is tracked by the service
      });

      // Download complete, emit action
      this.action.emit('download-and-record');
    } catch (error) {
      console.error('Download failed:', error);
      // Keep modal open on error so user can try again or choose another option
      this.isDownloading.set(false);
    }
  }

  onRecordWithoutTranscription(): void {
    this.action.emit('record-without-transcription');
  }

  onSwitchProvider(): void {
    this.action.emit('switch-provider');
  }

  onCancel(): void {
    this.action.emit('cancel');
  }

  cancelDownload(): void {
    const provider = this.#speechRecognitionService.activeProvider as {
      cancelDownload?: () => void;
    };

    if (provider?.cancelDownload) {
      provider.cancelDownload();
    }

    this.isDownloading.set(false);
  }
}
