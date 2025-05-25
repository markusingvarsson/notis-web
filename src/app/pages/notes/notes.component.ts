import { Component, signal } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { CardFooterComponent } from '../../components/ui/card/components/card-footer/card-footer.component';
import { CardContentComponent } from '../../components/ui/card/components/card-content/card-content.component';
import { CardHeaderComponent } from '../../components/ui/card/components/card-header/card-header.component';
import { CardComponent } from '../../components/ui/card/card.component';
import {
  Note,
  NoteCardComponent,
} from '../../domain/notes/components/note-card/note-card.component';

@Component({
  selector: 'app-notes',
  imports: [
    PagelayoutComponent,
    NoteCardComponent,
    CardFooterComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardComponent,
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent {
  notes = signal<Note[]>([
    {
      id: '1',
      title: 'First Note',
      content: 'This is the content of the first note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Second Note',
      content: 'This is the content of the second note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Third Note',
      content: 'This is the content of the third note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Fourth Note',
      content: 'This is the content of the fourth note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Fifth Note',
      content: 'This is the content of the fifth note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Sixth Note',
      content: 'This is the content of the sixth note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '7',
      title: 'Seventh Note',
      content: 'This is the content of the seventh note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '8',
      title: 'Eighth Note',
      content: 'This is the content of the eighth note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '9',
      title: 'Ninth Note',
      content: 'This is the content of the ninth note.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '10',
      title: 'Tenth Note',
      content: 'This is the content of the tenth note.',
      updatedAt: new Date().toISOString(),
    },
  ]);

  onEdit($event: Note) {
    console.log('edit', $event);
  }

  onDelete($event: Note) {
    console.log('delete', $event);
  }
}
