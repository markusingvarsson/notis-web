import { Component, signal } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { CardFooterComponent } from '../../components/ui/card/components/card-footer/card-footer.component';
import { CardContentComponent } from '../../components/ui/card/components/card-content/card-content.component';
import { CardHeaderComponent } from '../../components/ui/card/components/card-header/card-header.component';
import { CardComponent } from '../../components/ui/card/card.component';
import { NoteCardComponent } from '../../domain/notes/components/note-card/note-card.component';

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
  select = signal(() => undefined);
}
