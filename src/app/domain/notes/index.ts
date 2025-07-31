export type NoteType = 'audio';

export interface BaseNote {
  id: string;
  title: string;
  type: NoteType;
  updatedAt: string;
  tagIds?: string[];
}

export interface AudioNote extends BaseNote {
  type: 'audio';
  audioBlob: Blob;
  audioMimeType: string;
  duration: number;
  transcript?: string;
}

export type Note = AudioNote;

export interface AudioNoteCreated {
  type: 'audio';
  title: string;
  audioBlob: Blob;
  audioMimeType: string;
  transcript?: string;
  tags?: Record<string, Tag>;
}

export type NoteCreated = AudioNoteCreated;

export interface Tag {
  name: string;
  id: string;
  updatedAt: string;
}

export const RECORDER_STATE = {
  IDLE: 'idle',
  STARTING: 'starting',
  RECORDING: 'recording',
  SAVING: 'saving',
  BLOCKED: 'blocked',
} as const;

export type RecorderState =
  (typeof RECORDER_STATE)[keyof typeof RECORDER_STATE];

// Interfaces for SpeechRecognition
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Define WebkitSpeechRecognition interface based on its previous usage
export interface WebkitSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend?: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Global declaration for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => WebkitSpeechRecognition;
  }
}
