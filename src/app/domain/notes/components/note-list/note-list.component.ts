import { Component, computed, inject, signal } from '@angular/core';
import { NoteCardComponent } from '../note-card/note-card.component';
import { NotesStorageService } from '../../services/notes-storage.service';
import { Note } from '../..';
import { NotesFilterComponent } from '../notes-filter/notes-filter.component';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [NoteCardComponent, NotesFilterComponent],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
})
export class NoteListComponent {
  private notesStorage = inject(NotesStorageService);
  private notes = this.notesStorage.getNotes();
  private allTags = this.notesStorage.getTags();

  readonly selectedTag = signal<string | null>(null);

  readonly availableTags = computed(() => {
    return Object.values(this.allTags())
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .map((tag) => tag.name);
  });

  readonly filteredNotes = computed(() => {
    const selected = this.selectedTag();
    if (selected === null) {
      return this.notes();
    }
    return this.notes().filter((note) => {
      if (!note.tags) return false;
      const noteTags = Object.values(note.tags).map((tag) => tag.name);
      return noteTags.includes(selected);
    });
  });

  async onDelete(note: Note) {
    await this.notesStorage.deleteNote(note.id);
  }

  onTagToggle(tag: string) {
    this.selectedTag.update((current) => (current === tag ? null : tag));
  }

  onClearFilters() {
    this.selectedTag.set(null);
  }
}
