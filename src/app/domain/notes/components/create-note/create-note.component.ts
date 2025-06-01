// File: src/app/quick-note-input/quick-note-input.component.ts

import {
  Component,
  computed,
  signal,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  output,
  inject,
  viewChild,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
//import { toast } from 'sonner';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NoteCreated, RECORDER_STATE, RecorderState } from '../..';
import { AUDIO_MIME_TYPE } from '../../services/mime-type';
import { RecordButtonComponent } from '../record-button/record-button.component';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface WebkitSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => WebkitSpeechRecognition;
  }
}

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [RecordButtonComponent],
  templateUrl: './create-note.component.html',
  styleUrls: ['./create-note.component.scss'],
})
export class CreateNoteComponent implements OnInit, OnDestroy {
  #platformId = inject(PLATFORM_ID);
  #deviceService = inject(DeviceDetectorService);
  #audioMimeType = inject(AUDIO_MIME_TYPE);

  readonly noteCreated = output<NoteCreated>();

  readonly hasSpeechRecognition = computed(() => {
    const isSpeechRecognitionSupported =
      isPlatformBrowser(this.#platformId) &&
      'webkitSpeechRecognition' in window;

    return isSpeechRecognitionSupported && this.#deviceService.isDesktop();
  });

  /** UI state as signals */
  readonly recordingState = signal<RecorderState>(RECORDER_STATE.IDLE);
  readonly audioBlob = signal<Blob | null>(null);
  readonly transcriptText = signal('');
  readonly saveMode = signal<'audio' | 'text'>('audio');
  readonly audioElementRef =
    viewChild<ElementRef<HTMLAudioElement>>('audioElement');
  private audioUrl?: string;

  /** Refs for recorder, audio & recognition */
  private mediaRecorder: MediaRecorder | null = null;
  private recognition: WebkitSpeechRecognition | null = null;

  /** Computed label below mic button */
  readonly recordLabel = computed(() => {
    switch (this.recordingState()) {
      case RECORDER_STATE.STARTING:
        return 'Starting...';
      case RECORDER_STATE.RECORDING:
        return 'Recording...';
      case RECORDER_STATE.BLOCKED:
        return 'Please enable microphone access';
      default:
        return 'Click to start recording';
    }
  });

  /** Computed values */
  readonly audioSrc = computed(() => {
    const blob = this.audioBlob();
    if (!blob) return '';

    // Revoke the old URL if it exists
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }

    // Create a new URL for the current blob
    this.audioUrl = URL.createObjectURL(blob);
    return this.audioUrl;
  });

  private permissionStatusSubscription: PermissionStatus | null = null;

  async ngOnInit(): Promise<void> {
    await this.checkInitialMicrophonePermission();
  }

  private async checkInitialMicrophonePermission(): Promise<void> {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    // Check for Permissions API support
    const hasPermissionsApiSupport =
      navigator.permissions &&
      typeof navigator.permissions.query === 'function';

    if (hasPermissionsApiSupport) {
      try {
        // Attempt to query microphone permission
        const permissionStatus = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        this.permissionStatusSubscription = permissionStatus; // Store for ngOnDestroy cleanup

        // Set initial recording state based on permission
        if (permissionStatus.state === 'denied') {
          this.recordingState.set(RECORDER_STATE.BLOCKED);
        } else if (permissionStatus.state === 'granted') {
          if (this.recordingState() === RECORDER_STATE.BLOCKED) {
            this.recordingState.set(RECORDER_STATE.IDLE);
          }
        }

        // Handle subsequent permission changes
        permissionStatus.onchange = () => {
          this.permissionStatusChangeHandler(permissionStatus.state);
        };
      } catch {
        const fallbackStatus = await this.tryMicAccessFallback();
        this.handleMicStatus(fallbackStatus);
      }
    } else {
      // Permissions API not available, or does not support 'microphone' query name
      const fallbackStatus = await this.tryMicAccessFallback();
      this.handleMicStatus(fallbackStatus);
    }
  }

  private permissionStatusChangeHandler(
    permissionStatusState: PermissionState
  ) {
    switch (permissionStatusState) {
      case 'granted':
        if (this.recordingState() === RECORDER_STATE.BLOCKED) {
          this.recordingState.set(RECORDER_STATE.IDLE);
        }
        break;
      case 'denied':
        if (this.recordingState() === RECORDER_STATE.RECORDING) {
          this.stopRecording(); // Ensure recording stops if permission revoked
        }
        this.recordingState.set(RECORDER_STATE.BLOCKED);
        break;
      case 'prompt':
        if (this.recordingState() === RECORDER_STATE.BLOCKED) {
          this.recordingState.set(RECORDER_STATE.IDLE);
        } else if (this.recordingState() === RECORDER_STATE.RECORDING) {
          // If permission changes to 'prompt' during recording, stop and reset.
          this.stopRecording();
          this.recordingState.set(RECORDER_STATE.IDLE);
        }
        break;
    }
  }

  private async tryMicAccessFallback(): Promise<PermissionState> {
    const hasMediaDevicesApiSupport =
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function';

    if (!hasMediaDevicesApiSupport) {
      return 'denied';
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return 'granted';
    } catch (err: unknown) {
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError': // User denied permission at prompt.
          case 'PermissionDeniedError': // Legacy name for NotAllowedError (some older browsers).
            // console.warn('Microphone access explicitly denied by the user.'); // Optional: for more detailed internal logging
            return 'denied';
          case 'NotFoundError': // No microphone device found.
            // toast.error('No microphone found on this device.'); // User feedback was here
            return 'denied'; // Treat as denied for recording capability.
          case 'NotReadableError': // Hardware error, OS, or browser preventing access at a low level.
            return 'denied'; // Or a specific error state if the app can handle it differently
          case 'AbortError': // Operation aborted by something other than user denial (e.g. navigation).
          case 'SecurityError': // Document not allowed to use feature (e.g. iframe policy, or insecure context).
          case 'TypeError': // audio: true is invalid (highly unlikely for this simple constraint).
          case 'OverconstrainedError': // No device meets specified constraints (unlikely for simple audio).
            return 'prompt'; // These errors might be transient or indicate issues needing user attention.
          default:
            // Handles other DOMExceptions not explicitly listed.
            return 'prompt';
        }
      } else {
        return 'prompt';
      }
    }
  }

  private handleMicStatus(status: PermissionState) {
    if (status === 'denied') {
      this.recordingState.set(RECORDER_STATE.BLOCKED);
      // toast.error('Microphone access has been denied.'); // User feedback was here
      return;
    }

    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      this.recordingState.set(RECORDER_STATE.IDLE);
    }
  }

  ngOnDestroy() {
    if (this.recordingState() === RECORDER_STATE.RECORDING) {
      this.stopRecording();
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    if (this.permissionStatusSubscription) {
      this.permissionStatusSubscription.onchange = null;
      this.permissionStatusSubscription = null;
    }
  }

  async startRecording(): Promise<void> {
    // The initial check in ngOnInit might have already set it to BLOCKED.
    // However, keeping this check is good for robustness, e.g., if permissions change after init.
    if (!isPlatformBrowser(this.#platformId)) {
      console.warn('Media devices API is not available in this environment.');
      this.recordingState.set(RECORDER_STATE.BLOCKED);
      return;
    }

    // If already known to be blocked from init check or a previous attempt, don't try again.
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      console.warn(
        'Microphone access is blocked. Please enable it in your browser settings.'
      );
      // toast.error('Microphone access is blocked. Please check permissions.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options: MediaRecorderOptions = { mimeType: this.#audioMimeType };

      const recorder = new MediaRecorder(stream, options);
      this.mediaRecorder = recorder;

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstart = () => {
        this.recordingState.set(RECORDER_STATE.RECORDING);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        this.audioBlob.set(blob);
        stream.getTracks().forEach((t) => t.stop());
        this.recordingState.set(RECORDER_STATE.IDLE);
      };

      // speech recognition if text mode
      if (this.saveMode() === 'text' && 'webkitSpeechRecognition' in window) {
        const Recognition = window.webkitSpeechRecognition;
        this.recognition = new Recognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.onresult = (e: SpeechRecognitionEvent) => {
          const txt = Array.from(e.results)
            .map((r) => r[0].transcript)
            .join('');
          this.transcriptText.set(txt);
        };
        this.recognition.onerror = () =>
          //toast.error('Speech recognition error');
          console.error('Speech recognition error');
        this.recognition.start();
      }

      this.recordingState.set(RECORDER_STATE.STARTING);
      recorder.start();
      //toast.info('Starting recording...');
      console.info('Starting recording...');
    } catch (err) {
      this.recordingState.set(RECORDER_STATE.BLOCKED);
      console.error('Could not access microphone or recording failed:', err);
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      if (this.recognition) {
        this.recognition.stop();
      }
      //toast.success('Recording stopped');
      console.info('Recording stopped');
    }
  }

  toggleRecording(): void {
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      console.warn(
        'Microphone access is blocked. Please enable it in your browser settings.'
      );
      // toast.warning('Microphone access is blocked. Please enable it in browser settings.');
      return;
    }

    if (this.recordingState() == RECORDER_STATE.IDLE) {
      this.startRecording();
    } else if (this.recordingState() == RECORDER_STATE.RECORDING) {
      this.stopRecording();
    } else {
      console.log('Recording is already in progress');
    }
  }

  handleSave(): void {
    switch (this.saveMode()) {
      case 'audio': {
        const blob = this.audioBlob();
        if (!blob) {
          console.error('Please record audio first');
          return;
        }
        const title = `Audio Note - ${new Date().toLocaleDateString()}`;
        this.noteCreated.emit({
          type: 'audio',
          title,
          audioBlob: blob,
          audioMimeType: blob.type,
        });
        console.info('Note saved!');
        break;
      }
      case 'text': {
        const txt = this.transcriptText().trim();
        if (!txt) {
          console.error('Please record for transcription');
          return;
        }
        let title = txt.split('\n')[0].slice(0, 50);
        if (txt.length > 50) title = title.slice(0, 47) + '...';
        this.noteCreated.emit({
          type: 'text',
          title,
          content: txt,
        });
        console.info('Text note saved!');
        break;
      }
    }
    // reset
    this.audioBlob.set(null);
    this.transcriptText.set('');
    this.recordingState.set(RECORDER_STATE.IDLE);
  }

  clearRecording(): void {
    this.audioBlob.set(null);
    this.transcriptText.set('');
    this.recordingState.set(RECORDER_STATE.IDLE);
  }
}
