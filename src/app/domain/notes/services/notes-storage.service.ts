import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Note, NoteCreated } from '..';
import {
  NoteTag,
  Tag,
} from '../components/create-note/components/add-tags-input';

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
      Promise.all([this.loadNotes(), this.loadTags()]).then(() => {
        this.scheduleCleanupUnusedTags();
      });
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(this.tagsStoreName)) {
        db.createObjectStore(this.tagsStoreName, { keyPath: 'id' });
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

      note = {
        id: crypto.randomUUID(),
        title: noteCreated.title,
        type: 'audio',
        audioBlob: noteCreated.audioBlob,
        audioMimeType: noteCreated.audioMimeType,
        duration,
        transcript: noteCreated.transcript,
        updatedAt: new Date().toISOString(),
        tags: Object.entries(noteCreated.tags ?? {}).reduce(
          (acc, [tagId, tag]) => {
            acc[tagId] = {
              tagId,
              name: tag.name,
            };
            return acc;
          },
          {} as Record<string, NoteTag>
        ),
      };
      Object.values(noteCreated.tags ?? {}).forEach((tag) => {
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

  private scheduleCleanupUnusedTags(): void {
    if (isPlatformBrowser(this.platformId)) {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => this.cleanupUnusedTags());
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(() => this.cleanupUnusedTags(), 500);
      }
    }
  }

  private cleanupUnusedTags(): void {
    const notes = this.notes();
    const allTags = this.tags();

    if (Object.keys(allTags).length === 0) {
      return;
    }

    const usedTagIds = new Set<string>();
    notes.forEach((note) => {
      if (note.tags) {
        Object.keys(note.tags).forEach((tagId) => usedTagIds.add(tagId));
      }
    });

    const unusedTagIds = Object.keys(allTags).filter(
      (tagId) => !usedTagIds.has(tagId)
    );

    if (unusedTagIds.length === 0) {
      return;
    }

    if (!this.db) {
      return;
    }

    console.log(`Found ${unusedTagIds.length} unused tags. Cleaning up...`);

    const transaction = this.db.transaction(this.tagsStoreName, 'readwrite');
    const store = transaction.objectStore(this.tagsStoreName);

    unusedTagIds.forEach((tagId) => {
      store.delete(tagId);
    });

    transaction.oncomplete = () => {
      this.tags.update((currentTags) => {
        const newTags = { ...currentTags };
        unusedTagIds.forEach((tagId) => {
          delete newTags[tagId];
        });
        return newTags;
      });
      console.log('Cleanup of unused tags completed.');
    };

    transaction.onerror = () => {
      console.error('Error during tag cleanup:', transaction.error);
    };
  }
}
