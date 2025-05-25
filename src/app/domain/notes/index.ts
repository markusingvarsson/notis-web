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
  audioUrl: string;
  duration: number;
}

export interface TextAndAudioNote extends BaseNote {
  type: 'textAndAudio';
  content: string;
  audioUrl: string;
  duration: number;
}

export type Note = TextNote | AudioNote | TextAndAudioNote;
