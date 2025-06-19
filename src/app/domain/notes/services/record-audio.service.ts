import {
  Injectable,
  signal,
  computed,
  PLATFORM_ID,
  inject,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  RECORDER_STATE,
  RecorderState,
  SpeechRecognitionEvent,
  WebkitSpeechRecognition,
} from '../'; // Adjust path as needed
import { AUDIO_MIME_TYPE } from './mime-type'; // Adjust path as needed
import { ToasterService } from '../../../components/ui/toaster/toaster.service';

@Injectable()
export class RecordAudioService implements OnDestroy {
  #platformId = inject(PLATFORM_ID);
  #audioMimeType = inject(AUDIO_MIME_TYPE);
  #toaster = inject(ToasterService);

  // Public signals for component consumption
  readonly recordingState = signal<RecorderState>(RECORDER_STATE.IDLE);
  readonly audioBlob = signal<Blob | null>(null);
  readonly transcriptText = signal('');

  // Audio visualization signals
  readonly voiceLevel = signal<number>(0);

  readonly isRecordingDone = computed(() => {
    return this.recordingState() === RECORDER_STATE.IDLE && this.audioBlob();
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

  // Private state
  private audioUrl?: string;
  private mediaRecorder: MediaRecorder | null = null;
  private recognition: WebkitSpeechRecognition | null = null;
  private permissionStatusSubscription: PermissionStatus | null = null;

  // Audio analysis properties
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationId: number | null = null;

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      this.checkInitialMicrophonePermission();
    }
  }

  ngOnDestroy() {
    if (this.recordingState() === RECORDER_STATE.RECORDING) {
      this.stopRecordingInternal();
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    if (this.permissionStatusSubscription) {
      this.permissionStatusSubscription.onchange = null;
      this.permissionStatusSubscription = null;
    }
    this.cleanupSpeechRecognition();
    this.stopAudioAnalysis();
  }

  // Computed value for audio source URL
  readonly audioSrc = computed(() => {
    const blob = this.audioBlob();
    if (!blob) return '';

    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.audioUrl = URL.createObjectURL(blob);
    return this.audioUrl;
  });

  private async checkInitialMicrophonePermission(): Promise<void> {
    if (!isPlatformBrowser(this.#platformId) || !navigator.permissions) {
      // If not in browser or Permissions API not supported, attempt fallback directly or set to blocked
      const fallbackStatus = await this.tryMicAccessFallback();
      this.handleMicStatus(fallbackStatus);
      return;
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      this.permissionStatusSubscription = permissionStatus;
      if (permissionStatus.state === 'denied') {
        this.recordingState.set(RECORDER_STATE.BLOCKED);
      } else if (
        permissionStatus.state === 'granted' &&
        this.recordingState() === RECORDER_STATE.BLOCKED
      ) {
        this.recordingState.set(RECORDER_STATE.IDLE);
      }
      permissionStatus.onchange = () => {
        if (this.permissionStatusSubscription) {
          this.permissionStatusChangeHandler(
            this.permissionStatusSubscription.state
          );
        }
      };
    } catch (e) {
      console.warn('Microphone permission query failed, trying fallback:', e);
      const fallbackStatus = await this.tryMicAccessFallback();
      this.handleMicStatus(fallbackStatus);
    }
  }

  private permissionStatusChangeHandler(
    permissionStatusState: PermissionState
  ): void {
    switch (permissionStatusState) {
      case 'granted':
        if (this.recordingState() === RECORDER_STATE.BLOCKED) {
          this.recordingState.set(RECORDER_STATE.IDLE);
        }
        break;
      case 'denied':
        if (this.recordingState() === RECORDER_STATE.RECORDING) {
          this.stopRecordingInternal();
        }
        this.recordingState.set(RECORDER_STATE.BLOCKED);
        this.#toaster.error('Microphone access denied');
        break;
      case 'prompt':
        if (this.recordingState() === RECORDER_STATE.RECORDING) {
          this.stopRecordingInternal();
        }
        this.recordingState.set(RECORDER_STATE.IDLE);
        break;
    }
  }

  private async tryMicAccessFallback(): Promise<PermissionState> {
    const isNotBrowser = !isPlatformBrowser(this.#platformId);
    const hasNoMediaDevices = !navigator.mediaDevices;
    const hasNoGetUserMedia =
      typeof navigator.mediaDevices?.getUserMedia !== 'function';

    if (isNotBrowser || hasNoMediaDevices || hasNoGetUserMedia) {
      this.#toaster.error('Microphone access denied');
      return 'denied';
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop tracks immediately after checking permission
      return 'granted';
    } catch (err: unknown) {
      console.error('Error accessing microphone via fallback:', err);
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError': // User denied permission
          case 'PermissionDeniedError': // Legacy name for NotAllowedError
            this.#toaster.error('Microphone access denied');
            return 'denied';
          case 'NotFoundError': // No microphone device found
            this.#toaster.error('Microphone not found');
            return 'denied'; // Treat as denied for recording capability
          case 'NotReadableError': // Hardware error, OS, or browser preventing access
            this.#toaster.error('Microphone not readable');
            return 'denied';
          // AbortError, SecurityError, TypeError, OverconstrainedError might be transient or indicate config issues
          default:
            return 'prompt'; // Default to prompt for other DOM errors
        }
      }
      return 'prompt'; // Default for non-DOMExceptions or if err is not DOMException
    }
  }

  private handleMicStatus(status: PermissionState): void {
    if (status === 'denied') {
      this.recordingState.set(RECORDER_STATE.BLOCKED);
      return;
    }
    // If granted or prompt, and currently blocked, reset to idle.
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      this.recordingState.set(RECORDER_STATE.IDLE);
    }
  }

  async startRecording(
    transcriptionLanguage: string | null = null
  ): Promise<void> {
    if (!isPlatformBrowser(this.#platformId)) {
      this.recordingState.set(RECORDER_STATE.BLOCKED);
      return;
    }
    if (this.recordingState() === RECORDER_STATE.BLOCKED) {
      console.warn('Cannot record: Microphone access is blocked.');
      return;
    }
    this.clearPreviousRecordingArtifacts(); // Clear any old data

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.#audioMimeType,
      });
      const chunks: BlobPart[] = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      this.mediaRecorder.onstart = () => {
        this.recordingState.set(RECORDER_STATE.RECORDING);
        this.startAudioAnalysis(stream);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: this.mediaRecorder?.mimeType });
        this.audioBlob.set(blob);
        stream.getTracks().forEach((t) => t.stop()); // Stop all tracks from the stream
        this.recordingState.set(RECORDER_STATE.IDLE);
        this.stopAudioAnalysis();
        // If speech recognition was active, it should already be stopped by stopRecordingInternal or handled in its own error/end events.
      };
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.recordingState.set(RECORDER_STATE.IDLE);
        stream.getTracks().forEach((track) => track.stop()); // Ensure stream is cleaned up
        this.cleanupSpeechRecognition(); // Clean up speech recognition resources
        this.stopAudioAnalysis();
      };

      if (transcriptionLanguage && window.webkitSpeechRecognition) {
        this.recognition = new window.webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = transcriptionLanguage;
        this.recognition.onresult = (e: SpeechRecognitionEvent) => {
          const transcript = Array.from(e.results) // Use Array.from for SpeechRecognitionResultList
            .map((result) => result[0]) // Get the first alternative
            .map((alternative) => alternative.transcript)
            .join('');
          this.transcriptText.set(transcript);
        };
        this.recognition.onerror = (eventRecognisionError: Event) => {
          console.error('Speech recognition error:', eventRecognisionError);
          this.cleanupSpeechRecognition(); // Clean up on error
        };
        this.recognition.onend = () => {
          // console.log('Speech recognition ended.');
          // Optionally handle natural end of speech if not continuous, or if stop() was called.
        };
        this.recognition.start();
      }

      this.recordingState.set(RECORDER_STATE.STARTING);
      this.mediaRecorder.start();
    } catch (errStarting) {
      console.error('Failed to start recording process:', errStarting);
      this.recordingState.set(RECORDER_STATE.BLOCKED);
      if (this.mediaRecorder?.stream) {
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      this.cleanupSpeechRecognition();
      this.stopAudioAnalysis();
    }
  }

  stopRecording(): void {
    this.stopRecordingInternal();
  }

  private stopRecordingInternal(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    if (this.recognition) {
      this.recognition.stop();
    }
    this.stopAudioAnalysis();
  }

  private clearPreviousRecordingArtifacts(): void {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = undefined;
    }
    this.audioBlob.set(null);
    this.transcriptText.set('');
    // Speech recognition artifacts (like the recognition object itself) are typically reset
    // when starting a new recognition or when explicitly clearing.
    this.cleanupSpeechRecognition();
  }

  // Helper to clean up speech recognition resources
  private cleanupSpeechRecognition(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition.onresult = undefined!;
      this.recognition.onerror = undefined!;
      this.recognition.onend = undefined;
      this.recognition = null;
    }
  }

  clearRecording(): void {
    this.clearPreviousRecordingArtifacts();
    this.recordingState.set(RECORDER_STATE.IDLE);
    // No need to reset noteName here as it's a concern of the component
  }

  private startAudioAnalysis(stream: MediaStream): void {
    try {
      // Setup audio context
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.3;

      source.connect(this.analyser);

      // Start updating audio levels
      this.updateAudioLevels();
    } catch (err) {
      console.error('Error starting audio analysis:', err);
    }
  }

  private stopAudioAnalysis(): void {
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Cancel animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Reset visualization
    this.voiceLevel.set(0);
  }

  private updateAudioLevels(): void {
    if (!this.analyser || this.recordingState() !== RECORDER_STATE.RECORDING)
      return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate voice-specific level focusing on speech frequencies
    const voiceLevel = this.calculateVoiceLevel(dataArray);
    this.voiceLevel.set(voiceLevel);

    this.animationId = requestAnimationFrame(() => this.updateAudioLevels());
  }

  private calculateVoiceLevel(dataArray: Uint8Array): number {
    if (!this.audioContext) return 0;

    const sampleRate = this.audioContext.sampleRate;
    const nyquist = sampleRate / 2;
    const binWidth = nyquist / dataArray.length;

    // Focus on key speech frequency ranges
    // Fundamental frequencies: 85-255 Hz (most energy for voice)
    // Formant frequencies: 2-4 kHz (clarity and intelligibility)
    const fundamentalStart = Math.floor(85 / binWidth);
    const fundamentalEnd = Math.floor(255 / binWidth);
    const formantStart = Math.floor(2000 / binWidth);
    const formantEnd = Math.floor(4000 / binWidth);

    // Calculate weighted average focusing on speech frequencies
    let fundamentalSum = 0;
    let formantSum = 0;
    let fundamentalCount = 0;
    let formantCount = 0;

    // Fundamental frequency range (weighted higher)
    for (
      let i = fundamentalStart;
      i <= Math.min(fundamentalEnd, dataArray.length - 1);
      i++
    ) {
      fundamentalSum += dataArray[i];
      fundamentalCount++;
    }

    // Formant frequency range
    for (
      let i = formantStart;
      i <= Math.min(formantEnd, dataArray.length - 1);
      i++
    ) {
      formantSum += dataArray[i];
      formantCount++;
    }

    const fundamentalAvg =
      fundamentalCount > 0 ? fundamentalSum / fundamentalCount : 0;
    const formantAvg = formantCount > 0 ? formantSum / formantCount : 0;

    // Weighted combination (fundamental frequencies are more important for voice detection)
    const voiceLevel = (fundamentalAvg * 0.7 + formantAvg * 0.3) / 255;
    return Math.min(voiceLevel, 1);
  }
}
