export type NoteType = 'text' | 'audio' | 'textAndAudio';

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
  duration: number;
}

export interface TextAndAudioNote extends BaseNote {
  type: 'textAndAudio';
  content: string;
  audioBlob: Blob;
  duration: number;
}

export type Note = TextNote | AudioNote | TextAndAudioNote;

export interface TextNoteCreated {
  type: 'text';
  title: string;
  content: string;
}

export interface AudioNoteCreated {
  type: 'audio';
  title: string;
  audioBlob: Blob;
}

export interface TextAndAudioNoteCreated {
  type: 'textAndAudio';
  title: string;
  content: string;
  audioBlob: Blob;
}

export type NoteCreated =
  | TextNoteCreated
  | AudioNoteCreated
  | TextAndAudioNoteCreated;
