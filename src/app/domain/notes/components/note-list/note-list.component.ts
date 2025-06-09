import { Component, inject, signal } from '@angular/core';
import { NoteCardComponent } from '../note-card/note-card.component';
import { NotesStorageService } from '../../services/notes-storage.service';
import { Note } from '../..';
import { ConfirmationModalService } from '../../../../components/ui/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [NoteCardComponent],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
})
export class NoteListComponent {
  private notesStorage = inject(NotesStorageService);
  private confirmationModalService = inject(ConfirmationModalService);
  notes = this.notesStorage.getNotes();
  nextDeletingNoteId = signal<string | null>(null);

  async onDelete(note: Note) {
    const confirmed = await this.confirmationModalService.open({
      title: 'Delete Note',
      message: `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      confirmButtonVariant: 'destructive',
    });

    if (confirmed) {
      this.nextDeletingNoteId.set(note.id);

      setTimeout(async () => {
        await this.notesStorage.deleteNote(note.id);
        this.nextDeletingNoteId.set(null);
      }, 300);
    }
  }
}
