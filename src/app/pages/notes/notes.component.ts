import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { NoteListComponent } from '../../domain/notes/components/note-list/note-list.component';
import { CreateNoteComponent } from '../../domain/notes/components/create-note/create-note.component';
import { NotesStorageService } from '../../domain/notes/services/notes-storage.service';
import { NoteCreated } from '../../domain/notes';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [PagelayoutComponent, NoteListComponent, CreateNoteComponent],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesComponent {
  private notesStorageService = inject(NotesStorageService);

  readonly CTA = input<boolean>(false);
  readonly availableTags = this.notesStorageService.getTags();

  onCreateNote(event: NoteCreated) {
    this.notesStorageService.addNote(event);
  }
}
