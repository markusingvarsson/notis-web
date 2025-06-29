import { Injectable, signal, computed, inject } from '@angular/core';
import { NotesStorageService } from './notes-storage.service';
import { Note } from '../index';

@Injectable({
  providedIn: 'root',
})
export class NotesFilterService {
  private notesStorage = inject(NotesStorageService);

  readonly selectedTags = signal<string[]>([]);
  readonly notes = this.notesStorage.getNotes();
  readonly allTags = this.notesStorage.getTags();

  readonly availableTags = computed(() => {
    const tags = new Set<string>();
    this.notes().forEach((note: Note) => {
      if (note.tagIds) {
        note.tagIds.forEach((tagId: string) => {
          const tag = this.allTags()[tagId];
          if (tag) {
            tags.add(tag.name);
          }
        });
      }
    });
    return Array.from(tags).sort();
  });

  readonly filteredNotes = computed(() => {
    const selected = this.selectedTags();
    if (selected.length === 0) {
      return this.notes();
    }
    return this.notes().filter((note: Note) => {
      if (!note.tagIds) return false;
      return selected.some((selectedTag) => {
        const tagId = Object.keys(this.allTags()).find(
          (id) => this.allTags()[id].name === selectedTag
        );
        return tagId && note.tagIds!.includes(tagId);
      });
    });
  });

  setSelectedTags(tags: string[]) {
    this.selectedTags.set(tags);
  }

  clearFilters() {
    this.selectedTags.set([]);
  }
}
