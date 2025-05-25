import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Note } from '..';

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
      if (notes.length === 0) {
        // Initialize with sample data if empty
        this.initializeSampleData();
      } else {
        this.notes.set(notes);
      }
    };
  }

  private initializeSampleData() {
    const sampleNotes: Note[] = [
      {
        id: '1',
        title: 'First Note',
        type: 'text',
        content: 'This is the content of the first note.',
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Second Note',
        type: 'text',
        content: 'This is the content of the second note.',
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Third Note',
        type: 'text',
        content: 'This is the content of the third note.',
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Fourth Note',
        type: 'text',
        content: 'This is the content of the fourth note.',
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'Fifth Note',
        type: 'text',
        content: 'This is the content of the fifth note.',
        updatedAt: new Date().toISOString(),
      },
    ];

    this.saveNotes(sampleNotes);
  }

  private saveNotes(notes: Note[]) {
    if (!this.db) return;

    const transaction = this.db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    // Clear existing notes
    store.clear();

    // Add new notes
    notes.forEach((note) => {
      store.add(note);
    });

    transaction.oncomplete = () => {
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
}
