import { Component } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { NoteListComponent } from '../../domain/notes/components/note-list/note-list.component';
import { CreateNoteComponent } from '../../domain/notes/components/create-note/create-note.component';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [PagelayoutComponent, NoteListComponent, CreateNoteComponent],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent {
  onCreateNote = (title: string, content: string, audioBlob?: Blob) => {
    // TODO: Implement note creation logic
    console.log('Creating note:', { title, content, audioBlob });
  };
}
