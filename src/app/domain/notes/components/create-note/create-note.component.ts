// File: src/app/quick-note-input/quick-note-input.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  signal,
  OnDestroy,
  PLATFORM_ID,
  output,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
//import { toast } from 'sonner';

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
  imports: [CommonModule],
  templateUrl: './create-note.component.html',
  styleUrls: ['./create-note.component.scss'],
})
export class CreateNoteComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  readonly noteCreated = output<{
    title: string;
    content: string;
    audioBlob?: Blob;
  }>();

  #isSpeechRecognitionSupported(): boolean {
    return (
      isPlatformBrowser(this.platformId) && 'webkitSpeechRecognition' in window
    );
  }

  readonly hasSpeechRecognition = computed(() =>
    this.#isSpeechRecognitionSupported()
  );

  /** UI state as signals */
  readonly isRecording = signal(false);
  readonly audioBlob = signal<Blob | null>(null);
  readonly transcriptText = signal('');
  readonly saveMode = signal<'audio' | 'text'>(
    this.#isSpeechRecognitionSupported() ? 'text' : 'audio'
  );
  readonly isPlaying = signal(false);

  /** Refs for recorder, audio & recognition */
  private mediaRecorder: MediaRecorder | null = null;
  private recognition: WebkitSpeechRecognition | null = null;
  private audioElement: HTMLAudioElement | null = null;

  /** Computed label below mic button */
  readonly recordLabel = computed(() =>
    this.isRecording() ? 'Recording...' : 'Click to start recording'
  );

  ngOnDestroy() {
    // stop any ongoing recognition/recording
    this.stopRecording();
    this.audioElement?.pause();
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      this.mediaRecorder = recorder;

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e: BlobEvent) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        this.audioBlob.set(blob);
        stream.getTracks().forEach((t) => t.stop());
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
          console.log(txt);
        };
        this.recognition.onerror = () =>
          //toast.error('Speech recognition error');
          console.error('Speech recognition error');
        this.recognition.start();
      }

      recorder.start();
      this.isRecording.set(true);
      //toast.info('Recording started...');
      console.info('Recording started...');
    } catch {
      //toast.error('Could not access microphone');
      console.error('Could not access microphone');
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording()) {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
      if (this.recognition) {
        this.recognition.stop();
      }
      //toast.success('Recording stopped');
      console.info('Recording stopped');
    }
  }
  toggleRecording(): void {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  playAudio(): void {
    const blob = this.audioBlob();
    if (!blob) return;
    if (!this.isPlaying()) {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      this.audioElement = audio;
      audio.onended = () => {
        this.isPlaying.set(false);
        URL.revokeObjectURL(url);
      };
      audio.play();
      this.isPlaying.set(true);
    } else {
      this.audioElement?.pause();
      this.isPlaying.set(false);
    }
  }

  handleSave(): void {
    if (this.saveMode() === 'audio') {
      const blob = this.audioBlob();
      if (!blob) {
        //toast.error('Please record audio first');
        console.error('Please record audio first');
        return;
      }
      const title = `Audio Note - ${new Date().toLocaleDateString()}`;
      this.noteCreated.emit({ title, content: '', audioBlob: blob });
      //toast.success('Audio note saved!');
      console.info('Audio note saved!');
    } else {
      const txt = this.transcriptText().trim();
      if (!txt) {
        //toast.error('Please record for transcription');
        console.error('Please record for transcription');
        return;
      }
      let title = txt.split('\n')[0].slice(0, 50);
      if (txt.length > 50) title = title.slice(0, 47) + '...';
      this.noteCreated.emit({ title, content: txt });
      //toast.success('Text note saved!');
      console.info('Text note saved!');
    }
    // reset
    this.audioBlob.set(null);
    this.transcriptText.set('');
    this.isPlaying.set(false);
  }

  clearRecording(): void {
    this.audioBlob.set(null);
    this.transcriptText.set('');
    this.isPlaying.set(false);
    this.audioElement?.pause();
  }
}
