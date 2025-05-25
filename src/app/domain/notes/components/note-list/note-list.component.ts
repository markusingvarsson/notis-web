import { Component, inject } from '@angular/core';
import { NoteCardComponent } from '../note-card/note-card.component';
import { NotesStorageService } from '../../services/notes-storage.service';
import { Note } from '../..';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [NoteCardComponent],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
})
export class NoteListComponent {
  private notesStorage = inject(NotesStorageService);
  notes = this.notesStorage.getNotes();

  async onDelete(note: Note) {
    await this.notesStorage.deleteNote(note.id);
  }
}
