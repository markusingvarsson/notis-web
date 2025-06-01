export type NoteType = 'text' | 'audio';

export interface BaseNote {
  id: string;
  title: string;
  type: NoteType;
  updatedAt: string;
}

export interface TextNote extends BaseNote {
  type: 'text';
  content: string;
}

export interface AudioNote extends BaseNote {
  type: 'audio';
  audioBlob: Blob;
  audioMimeType?: string;
  duration: number;
}

export type Note = TextNote | AudioNote;

export interface TextNoteCreated {
  type: 'text';
  title: string;
  content: string;
}

export interface AudioNoteCreated {
  type: 'audio';
  title: string;
  audioBlob: Blob;
  audioMimeType: string;
}

export type NoteCreated = TextNoteCreated | AudioNoteCreated;

export const RECORDER_STATE = {
  IDLE: 'idle',
  STARTING: 'starting',
  RECORDING: 'recording',
  BLOCKED: 'blocked',
} as const;

export type RecorderState =
  (typeof RECORDER_STATE)[keyof typeof RECORDER_STATE];
