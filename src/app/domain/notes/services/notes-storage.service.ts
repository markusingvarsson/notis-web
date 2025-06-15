import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Note, NoteCreated } from '..';
import { Tag } from '../components/create-note/components/add-tags-input';
import { ToasterService } from '../../../components/ui/toaster/toaster.service';
import { openDB, DBSchema, IDBPDatabase, deleteDB } from 'idb';

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
  private version = 2;
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

  async addNote(note: Note): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.add('notes', note);
      this.notes.update((notes) => [note, ...notes]);
    } catch (error) {
      this.#toastService.error('Error adding note. Please contact support.');
      throw error;
    }
  }

  async updateNote(note: Note): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.put('notes', note);
      this.notes.update((notes) =>
        notes.map((n) => (n.id === note.id ? note : n))
      );
    } catch (error) {
      this.#toastService.error('Error updating note. Please contact support.');
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    if (!this.db) return;

    const noteToDelete = this.notes().find((n) => n.id === noteId);
    const tagsToCheck = noteToDelete?.tagIds ?? [];

    try {
      await this.db.delete('notes', noteId);
      this.notes.update((notes) => notes.filter((n) => n.id !== noteId));
      await this.cleanupTags(tagsToCheck);
    } catch (error) {
      this.#toastService.error('Error deleting note. Please contact support.');
      throw error;
    }
  }

  private async cleanupTags(tagIds: string[]): Promise<void> {
    if (!this.db || tagIds.length === 0) return;

    for (const tagId of tagIds) {
      const count = await this.db.countFromIndex(
        'notes',
        'tagIds',
        IDBKeyRange.only(tagId)
      );
      if (count === 0) {
        await this.deleteTagNote(tagId);
      }
    }
  }

  async addTagNote(tag: Tag): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.add('tags', tag);
      this.tags.update((tags) => ({ ...tags, [tag.id]: tag }));
    } catch (error) {
      this.#toastService.error('Error adding tag. Please contact support.');
      throw error;
    }
  }

  async updateTagNote(tag: Tag): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.put('tags', tag);
      this.tags.update((tags) => ({ ...tags, [tag.id]: tag }));
    } catch (error) {
      this.#toastService.error('Error updating tag. Please contact support.');
      throw error;
    }
  }

  async deleteTagNote(tagId: string): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.delete('tags', tagId);
      this.tags.update((tags) => {
        const newTags = { ...tags };
        delete newTags[tagId];
        return newTags;
      });
    } catch (error) {
      this.#toastService.error('Error deleting tag. Please contact support.');
      throw error;
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
      await Promise.all(
        Object.values(noteTags).map((tag) => this.createTag(tag))
      );
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
