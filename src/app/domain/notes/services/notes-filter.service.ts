import { Injectable, signal, computed, inject, effect } from '@angular/core';
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
    // Get all tags and sort by updatedAt timestamp (most recent first)
    return Object.values(this.allTags())
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .map((tag) => tag.name);
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

  constructor() {
    // Clean up selectedTags when availableTags change
    effect(() => {
      const available = this.availableTags();
      const selected = this.selectedTags();
      
      // Filter out any selected tags that no longer exist in available tags
      const validSelectedTags = selected.filter(tag => available.includes(tag));
      
      // Only update if there's a difference to avoid infinite loops
      if (validSelectedTags.length !== selected.length) {
        this.selectedTags.set(validSelectedTags);
      }
    });
  }

  clearFilters() {
    this.selectedTags.set([]);
  }
}
