import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Note, NoteCreated } from '..';
import { Tag } from '../components/create-note/components/add-tags-input';
import { ToasterService } from '../../../components/ui/toaster/toaster.service';

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
  private tagsStoreName = 'tags';
  private db: IDBDatabase | null = null;
  private notes = signal<Note[]>([]);
  private tags = signal<Record<string, Tag>>({});
  private version = 2;
  private platformId = inject(PLATFORM_ID);
  #toastService = inject(ToasterService);

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
      this.#toastService.error(
        'Error opening IndexedDB. Please contact support.'
      );
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.loadNotes();
      this.loadTags();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;
      const transaction = (event.target as IDBOpenDBRequest).transaction;

      if (oldVersion < 1) {
        // Version 1: Create the initial notes store
        db.createObjectStore(this.storeName, { keyPath: 'id' });
      }

      if (oldVersion < 2) {
        // Version 2: Add the tags store and index the notes store
        if (!db.objectStoreNames.contains(this.tagsStoreName)) {
          db.createObjectStore(this.tagsStoreName, { keyPath: 'id' });
        }
        if (transaction) {
          const noteStore = transaction.objectStore(this.storeName);
          if (!noteStore.indexNames.contains('tagIds')) {
            noteStore.createIndex('tagIds', 'tagIds', { multiEntry: true });
          }
        }
      }
    };
  }

  private loadNotes(): Promise<void> {
    if (!this.db) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = (event) => {
        console.error('Error loading notes:', event);
        this.#toastService.error(
          'Error loading notes. Please contact support.'
        );
        reject(request.error);
      };

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
        resolve();
      };
    });
  }

  private loadTags(): Promise<void> {
    if (!this.db) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.tagsStoreName, 'readonly');
      const store = transaction.objectStore(this.tagsStoreName);
      const request = store.getAll();

      request.onerror = (event) => {
        console.error('Error loading tags:', event);
        this.#toastService.error('Error loading tags. Please contact support.');
        reject(request.error);
      };

      request.onsuccess = () => {
        const tagsResult: Tag[] = request.result;
        const tagsRecord = tagsResult.reduce((acc, tag) => {
          acc[tag.id] = tag;
          return acc;
        }, {} as Record<string, Tag>);
        this.tags.set(tagsRecord);
        resolve();
      };
    });
  }

  getNotes() {
    return this.notes;
  }

  getTags() {
    return this.tags;
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
        this.#toastService.error('Error adding note. Please contact support.');
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
        this.#toastService.error(
          'Error updating note. Please contact support.'
        );
        reject(request.error);
      };
    });
  }

  async deleteNote(noteId: string) {
    if (!this.db) return;

    const noteToDelete = this.notes().find((n) => n.id === noteId);
    const tagsToCheck = noteToDelete?.tagIds ?? [];

    const transaction = this.db.transaction(
      [this.storeName, this.tagsStoreName],
      'readwrite'
    );
    const noteStore = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = noteStore.delete(noteId);

      request.onsuccess = () => {
        this.notes.update((notes) => notes.filter((n) => n.id !== noteId));
        this.cleanupTags(tagsToCheck);
        resolve();
      };

      request.onerror = () => {
        this.#toastService.error(
          'Error deleting note. Please contact support.'
        );
        reject(request.error);
      };
    });
  }

  private async cleanupTags(tagIds: string[]) {
    if (!this.db || tagIds.length === 0) return;

    for (const tagId of tagIds) {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('tagIds');
      const request = index.count(tagId);

      request.onsuccess = () => {
        if (request.result === 0) {
          this.deleteTagNote(tagId);
        }
      };
    }
  }

  async addTagNote(tag: Tag) {
    if (!this.db) return;

    const transaction = this.db.transaction(this.tagsStoreName, 'readwrite');
    const store = transaction.objectStore(this.tagsStoreName);

    return new Promise<void>((resolve, reject) => {
      const request = store.add(tag);

      request.onsuccess = () => {
        this.tags.update((tags) => ({ ...tags, [tag.id]: tag }));
        resolve();
      };

      request.onerror = () => {
        this.#toastService.error('Error adding tag. Please contact support.');
        reject(request.error);
      };
    });
  }

  async updateTagNote(tag: Tag) {
    if (!this.db) return;

    const transaction = this.db.transaction(this.tagsStoreName, 'readwrite');
    const store = transaction.objectStore(this.tagsStoreName);

    return new Promise<void>((resolve, reject) => {
      const request = store.put(tag);

      request.onsuccess = () => {
        this.tags.update((tags) => ({ ...tags, [tag.id]: tag }));
        resolve();
      };

      request.onerror = () => {
        this.#toastService.error('Error updating tag. Please contact support.');
        reject(request.error);
      };
    });
  }

  async deleteTagNote(tagId: string) {
    if (!this.db) return;

    const transaction = this.db.transaction(this.tagsStoreName, 'readwrite');
    const store = transaction.objectStore(this.tagsStoreName);

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(tagId);

      request.onsuccess = () => {
        this.tags.update((tags) => {
          const newTags = { ...tags };
          delete newTags[tagId];
          return newTags;
        });
        resolve();
      };

      request.onerror = () => {
        this.#toastService.error('Error deleting tag. Please contact support.');
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
      }, 500);
    });
  }

  async createNote(noteCreated: NoteCreated): Promise<void> {
    let note: Note;

    if (noteCreated.type === 'audio') {
      if (!noteCreated.audioBlob) {
        throw new Error('Audio blob is required for audio notes');
      }

      const duration = await this.getAudioDuration(noteCreated.audioBlob);

      const noteTags = noteCreated.tags ?? {};
      const tagIds = Object.keys(noteTags);

      note = {
        id: crypto.randomUUID(),
        title: noteCreated.title,
        type: 'audio',
        audioBlob: noteCreated.audioBlob,
        audioMimeType: noteCreated.audioMimeType,
        duration,
        transcript: noteCreated.transcript,
        updatedAt: new Date().toISOString(),
        tagIds: tagIds,
      };
      Object.values(noteTags).forEach((tag) => {
        this.createTag(tag);
      });
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

  async deleteTag(tagId: string): Promise<void> {
    await this.deleteTagNote(tagId);
  }

  async createTag(tag: Tag): Promise<void> {
    const doesTagExist = Boolean(this.tags()[tag.id]);
    if (doesTagExist) {
      await this.updateTagNote(tag);
    } else {
      await this.addTagNote(tag);
    }
  }

  async clearAllData(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Cannot clear data in a non-browser environment.');
      return;
    }

    // 1. Close the database connection if it's open
    if (this.db) {
      this.db.close();
      this.db = null; // Important to nullify after closing
    }

    // 2. Delete the IndexedDB database
    return new Promise((resolve, reject) => {
      const deleteRequest = window.indexedDB.deleteDatabase(this.dbName);

      deleteRequest.onsuccess = () => {
        // 3. Clear localStorage
        localStorage.clear();

        // 4. Reset the notes signal
        this.notes.set([]);

        // 5. Re-initialize the DB for future use
        this.initDB();

        resolve();
      };

      deleteRequest.onerror = (event) => {
        console.error('Error deleting database:', event);
        // Attempt to re-initialize the DB anyway
        this.initDB();
        reject(deleteRequest.error);
      };

      deleteRequest.onblocked = (event) => {
        console.warn('Database deletion is blocked:', event);
        // This can happen if another tab has the DB open.
        // We'll reject and let the user know.
        reject(
          new Error(
            'Could not delete database. Please close other tabs with this app open and try again.'
          )
        );
      };
    });
  }
}
