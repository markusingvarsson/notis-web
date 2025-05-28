import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Note, NoteCreated } from '..';

// If there are no stored mime type, use the mime type of the blob.
// If no mime type of the blob, use the audio/webm as it was the default for the first version of the app.
const getDefaultMimeType = (blob: Blob | ArrayBuffer) => {
  if (blob instanceof Blob) {
    return blob.type;
  }
  return 'audio/webm';
};

@Injectable({
  providedIn: 'root',
})
export class NotesStorageService {
  private dbName = 'notisDB';
  private storeName = 'notes';
  private db: IDBDatabase | null = null;
  private notes = signal<Note[]>([]);
  private version = 1;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initDB();
    }
  }

  private initDB() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB is not available in this environment');
      return;
    }

    const request = window.indexedDB.open(this.dbName, this.version);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.loadNotes();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'id' });
      }
    };
  }

  private loadNotes() {
    if (!this.db) return;

    const transaction = this.db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      const rawNotes = request.result;

      const notes = rawNotes.map(
        (
          note: Omit<Note, 'audioBlob'> & {
            audioBlob?: Blob | ArrayBuffer;
            audioMimeType?: string;
          }
        ) => {
          // Reconstruct audioBlob with MIME type if needed
          if (note.type === 'audio' && note.audioBlob) {
            const mimeType =
              note.audioMimeType ?? getDefaultMimeType(note.audioBlob);
            note.audioBlob = new Blob([note.audioBlob], { type: mimeType });
          }
          return note as Note;
        }
      );
      notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      this.notes.set(notes);
    };
  }

  getNotes() {
    return this.notes;
  }

  async addNote(note: Note) {
    if (!this.db) return;

    const transaction = this.db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.add(note);

      request.onsuccess = () => {
        this.notes.update((notes) => [note, ...notes]);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateNote(note: Note) {
    if (!this.db) return;

    const transaction = this.db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.put(note);

      request.onsuccess = () => {
        this.notes.update((notes) =>
          notes.map((n) => (n.id === note.id ? note : n))
        );
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteNote(noteId: string) {
    if (!this.db) return;

    const transaction = this.db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(noteId);

      request.onsuccess = () => {
        this.notes.update((notes) => notes.filter((n) => n.id !== noteId));
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(audioBlob);
      audio.src = objectUrl;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        audio.onloadedmetadata = null;
        audio.onerror = null;
        audio.ontimeupdate = null;
      };

      audio.onloadedmetadata = () => {
        if (audio.duration === Infinity) {
          audio.currentTime = 1e10;
          audio.ontimeupdate = () => {
            cleanup();
            resolve(audio.duration);
          };
        } else {
          cleanup();
          resolve(audio.duration);
        }
      };

      audio.onerror = () => {
        cleanup();
        resolve(0);
      };

      setTimeout(() => {
        cleanup();
        resolve(0);
      }, 5000);
    });
  }

  async createNote(noteCreated: NoteCreated): Promise<void> {
    let note: Note;

    if (noteCreated.type === 'audio') {
      if (!noteCreated.audioBlob) {
        throw new Error('Audio blob is required for audio notes');
      }

      const duration = await this.getAudioDuration(noteCreated.audioBlob);

      note = {
        id: crypto.randomUUID(),
        title: noteCreated.title,
        type: 'audio',
        audioBlob: noteCreated.audioBlob,
        audioMimeType: noteCreated.audioMimeType,
        duration,
        updatedAt: new Date().toISOString(),
      };
    } else {
      note = {
        id: crypto.randomUUID(),
        title: noteCreated.title,
        type: 'text',
        content: noteCreated.content,
        updatedAt: new Date().toISOString(),
      };
    }

    await this.addNote(note);
  }
}
