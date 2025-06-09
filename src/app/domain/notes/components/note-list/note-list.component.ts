import { Component, computed, inject, signal } from '@angular/core';
import { NoteCardComponent } from '../note-card/note-card.component';
import { NotesStorageService } from '../../services/notes-storage.service';
import { Note } from '../..';
import { ConfirmationModalService } from '../../../../components/ui/confirmation-modal/confirmation-modal.service';
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
  private confirmationModalService = inject(ConfirmationModalService);
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
  readonly hasTags = computed(() => this.availableTags().length > 0);

  readonly filteredNotes = computed(() => {
    const selected = this.selectedTag();
    if (selected === null) {
      return this.notes();
    }
    return this.notes().filter((note) => {
      if (!note.tagIds) return false;
      return note.tagIds.includes(selected);
    });
  });

  async onDelete(note: Note) {
    const confirmed = await this.confirmationModalService.open({
      title: 'Delete Note',
      message: `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      confirmButtonVariant: 'destructive',
    });

    if (confirmed) {
      await this.notesStorage.deleteNote(note.id);
    }
  }

  onTagToggle(tag: string) {
    this.selectedTag.update((current) => (current === tag ? null : tag));
  }

  onClearFilters() {
    this.selectedTag.set(null);
  }
}
