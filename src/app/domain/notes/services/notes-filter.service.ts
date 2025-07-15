import { Injectable, signal, computed, inject } from '@angular/core';
import { NotesStorageService } from './notes-storage.service';
import { Note } from '../index';
import { FilterOptions } from '../types/filter-options';

@Injectable({
  providedIn: 'root',
})
export class NotesFilterService {
  private notesStorage = inject(NotesStorageService);

  readonly selectedTags = signal<string[]>([]);
  readonly filterOptions = signal<FilterOptions>({
    tags: [],
    dateRange: 'all',
    contentLength: [0, 1000],
    sortBy: 'newest',
  });
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
    const filters = this.filterOptions();
    const selected = this.selectedTags();
    let filteredNotes = this.notes();

    // Apply tag filters (backwards compatibility)
    if (selected.length > 0) {
      filteredNotes = filteredNotes.filter((note: Note) => {
        if (!note.tagIds) return false;
        return selected.some((selectedTag) => {
          const tagId = Object.keys(this.allTags()).find(
            (id) => this.allTags()[id].name === selectedTag
          );
          return tagId && note.tagIds!.includes(tagId);
        });
      });
    }

    // Apply advanced tag filters
    if (filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter((note: Note) => {
        if (!note.tagIds) return false;
        return filters.tags.some((selectedTag) => {
          const tagId = Object.keys(this.allTags()).find(
            (id) => this.allTags()[id].name === selectedTag
          );
          return tagId && note.tagIds!.includes(tagId);
        });
      });
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredNotes = filteredNotes.filter((note: Note) => {
        const noteDate = new Date(note.updatedAt);
        return noteDate >= filterDate;
      });
    }

    // Apply content length filter
    if (filters.contentLength[0] > 0 || filters.contentLength[1] < 1000) {
      filteredNotes = filteredNotes.filter((note: Note) => {
        const contentLength = note.type === 'audio' 
          ? (note.transcript?.length || 0) 
          : (note.content?.length || 0);
        return contentLength >= filters.contentLength[0] && contentLength <= filters.contentLength[1];
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        filteredNotes = [...filteredNotes].sort((a, b) => 
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      case 'title':
        filteredNotes = [...filteredNotes].sort((a, b) => 
          (a.title || '').localeCompare(b.title || '')
        );
        break;
      case 'relevance':
        // For now, relevance is same as newest - can be enhanced later
        filteredNotes = [...filteredNotes].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'newest':
      default:
        filteredNotes = [...filteredNotes].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
    }

    return filteredNotes;
  });

  setSelectedTags(tags: string[]) {
    this.selectedTags.set(tags);
  }

  setFilterOptions(options: FilterOptions) {
    this.filterOptions.set(options);
  }

  clearFilters() {
    this.selectedTags.set([]);
    this.filterOptions.set({
      tags: [],
      dateRange: 'all',
      contentLength: [0, 1000],
      sortBy: 'newest',
    });
  }
}
