import { Component } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { NoteListComponent } from '../../domain/notes/components/note-list/note-list.component';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [PagelayoutComponent, NoteListComponent],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent {}
