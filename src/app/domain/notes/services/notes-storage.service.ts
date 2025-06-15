import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Note, NoteCreated, Tag } from '..';
import { ToasterService } from '../../../components/ui/toaster/toaster.service';
import {
  openDB,
  DBSchema,
  IDBPDatabase,
  deleteDB,
  IDBPTransaction,
  IDBPObjectStore,
} from 'idb';

interface NotisDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      tagIds: string[];
    };
  };
  tags: {
    key: string;
    value: Tag;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotesStorageService {
  private dbName = 'notisDB';
  private version = 4;
  private platformId = inject(PLATFORM_ID);
  #toastService = inject(ToasterService);
  private db: IDBPDatabase<NotisDB> | null = null;
  private notes = signal<Note[]>([]);
  private tags = signal<Record<string, Tag>>({});

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initDB();
    }
  }

  private async initDB() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB is not available in this environment');
      return;
    }

    try {
      this.db = await openDB<NotisDB>(this.dbName, this.version, {
        upgrade(db, oldVersion, newVersion, transaction) {
          if (oldVersion < 1) {
            // Version 1: Create the initial notes store
            db.createObjectStore('notes', { keyPath: 'id' });
          }

          if (oldVersion < 2) {
            // Version 2: Add the tags store and index the notes store
            if (!db.objectStoreNames.contains('tags')) {
              db.createObjectStore('tags', { keyPath: 'id' });
            }
            const noteStore = transaction.objectStore('notes');
            if (!noteStore.indexNames.contains('tagIds')) {
              noteStore.createIndex('tagIds', 'tagIds', { multiEntry: true });
            }
          }
        },
      });

      await this.loadNotes();
      await this.loadTags();
    } catch (error) {
      console.error('Error opening IndexedDB:', error);
      this.#toastService.error(
        'Error opening IndexedDB. Please contact support.'
      );
    }
  }

  private async loadNotes(): Promise<void> {
    if (!this.db) return;

    try {
      const notes = await this.db.getAll('notes');
      notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      this.notes.set(notes);
    } catch (error) {
      console.error('Error loading notes:', error);
      this.#toastService.error('Error loading notes. Please contact support.');
    }
  }

  private async loadTags(): Promise<void> {
    if (!this.db) return;

    try {
      const tagsResult = await this.db.getAll('tags');
      const tagsRecord = tagsResult.reduce((acc, tag) => {
        acc[tag.id] = tag;
        return acc;
      }, {} as Record<string, Tag>);
      this.tags.set(tagsRecord);
    } catch (error) {
      console.error('Error loading tags:', error);
      this.#toastService.error('Error loading tags. Please contact support.');
    }
  }

  getNotes() {
    return this.notes;
  }

  getTags() {
    return this.tags;
  }

  private async updateTag(
    tx: IDBPTransaction<NotisDB, ('notes' | 'tags')[], 'readwrite'>,
    tagId: string
  ): Promise<void> {
    if (!this.db) return;

    const tag = this.tags()[tagId];
    if (tag) {
      const updatedTag = {
        ...tag,
        updatedAt: new Date().toISOString(),
      };
      await tx.objectStore('tags').put(updatedTag);
      this.tags.update((tags) => ({ ...tags, [tagId]: updatedTag }));
    }
  }

  private async addTag(
    tx: IDBPTransaction<NotisDB, ('notes' | 'tags')[], 'readwrite'>,
    tag: Tag
  ): Promise<void> {
    if (!this.db) return;
    await tx.objectStore('tags').add(tag);
    this.tags.update((tags) => ({ ...tags, [tag.id]: tag }));
  }

  async deleteNote(noteId: string): Promise<void> {
    if (!this.db) return;

    const noteToDelete = this.notes().find((n) => n.id === noteId);
    const tagsToCheck = noteToDelete?.tagIds ?? [];

    try {
      const tx = this.db.transaction(['notes', 'tags'], 'readwrite');
      const notesStore = tx.objectStore('notes');
      const tagsStore = tx.objectStore('tags');

      // Delete the note
      await notesStore.delete(noteId);

      // Clean up any orphaned tags
      await this.cleanupUnusedTags(tagsToCheck, notesStore, tagsStore);

      await tx.done;

      // Update the notes signal after transaction is complete
      this.notes.update((notes) => notes.filter((n) => n.id !== noteId));
    } catch (error) {
      this.#toastService.error('Error deleting note. Please contact support.');
      this.#toastService.error(
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  private async cleanupUnusedTags(
    tagsToCheck: string[],
    notesStore: IDBPObjectStore<
      NotisDB,
      ('notes' | 'tags')[],
      'notes',
      'readwrite'
    >,
    tagsStore: IDBPObjectStore<
      NotisDB,
      ('notes' | 'tags')[],
      'tags',
      'readwrite'
    >
  ) {
    for (const tagId of tagsToCheck) {
      const count = await notesStore
        .index('tagIds')
        .count(IDBKeyRange.only(tagId));
      if (count === 0) {
        await tagsStore.delete(tagId);
        this.tags.update((tags) => {
          const newTags = { ...tags };
          delete newTags[tagId];
          return newTags;
        });
      }
    }
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

  async addNote(noteCreated: NoteCreated): Promise<void> {
    if (!this.db) return;

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
    } else {
      note = {
        id: crypto.randomUUID(),
        title: noteCreated.title,
        type: 'text',
        content: noteCreated.content,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const tx = this.db.transaction(['notes', 'tags'], 'readwrite');
      await tx.objectStore('notes').add(note);

      if (note.tagIds?.length) {
        for (const tagId of note.tagIds) {
          const doesTagExist = Boolean(this.tags()[tagId]);
          if (doesTagExist) {
            await this.updateTag(tx, tagId);
          } else {
            await this.addTag(tx, {
              id: tagId,
              name: tagId,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      await tx.done;
      this.notes.update((notes) => [note, ...notes]);
    } catch (error) {
      this.#toastService.error('Error creating note. Please contact support.');
      throw error;
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
      this.db = null;
    }

    try {
      // 2. Delete the IndexedDB database
      await deleteDB(this.dbName);

      // 3. Clear localStorage
      localStorage.clear();

      // 4. Reset the notes and tags signals
      this.notes.set([]);
      this.tags.set({});

      // 5. Re-initialize the DB for future use
      await this.initDB();
    } catch (error) {
      console.error('Error clearing data:', error);
      // Attempt to re-initialize the DB anyway
      await this.initDB();
      throw error;
    }
  }
}
