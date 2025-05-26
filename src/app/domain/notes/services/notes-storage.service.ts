import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Note, NoteCreated } from '..';

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
      const notes = request.result;
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
        this.notes.update((notes) => [...notes, note]);
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
          // Force seek to end to trigger correct duration
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

      // Optional: safety timeout
      setTimeout(() => {
        cleanup();
        resolve(0);
      }, 5000);
    });
  }

  async createNote(noteCreated: NoteCreated): Promise<void> {
    let note: Note;
    if (noteCreated.type === 'audio' || noteCreated.type === 'textAndAudio') {
      if (!noteCreated.audioBlob) {
        throw new Error('Audio blob is required for audio notes');
      }
      // Convert blob to URL
      const audioUrl = URL.createObjectURL(noteCreated.audioBlob);
      // Calculate duration
      const duration = await this.getAudioDuration(noteCreated.audioBlob);

      if (noteCreated.type === 'textAndAudio') {
        // Create a text and audio note
        note = {
          id: crypto.randomUUID(),
          title: noteCreated.title,
          type: 'textAndAudio',
          content: noteCreated.content,
          audioUrl,
          duration,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Create an audio-only note
        note = {
          id: crypto.randomUUID(),
          title: noteCreated.title,
          type: 'audio',
          audioUrl,
          duration,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      // Create a text-only note
      note = {
        id: crypto.randomUUID(),
        title: noteCreated.title,
        type: 'text',
        content: noteCreated.content,
        updatedAt: new Date().toISOString(),
      };
    }

    console.log('note', note);
    await this.addNote(note);
  }
}
