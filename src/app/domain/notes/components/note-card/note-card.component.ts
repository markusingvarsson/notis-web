// File: src/app/note-card/note-card.component.ts
import { CommonModule } from '@angular/common';
import { Component, input, computed, output } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { CardComponent } from '../../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { CardContentComponent } from '../../../../components/ui/card/components/card-content/card-content.component';
import { CardHeaderComponent } from '../../../../components/ui/card/components/card-header/card-header.component';
import { CardTitleComponent } from '../../../../components/ui/card/components/card-title/card-title.component';
import { Note } from '../..';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
  ],
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss'],
})
export class NoteCardComponent {
  /** Inputs as signals */
  readonly note = input.required<Note>();
  readonly delete = output<Note>();

  /** Computed values */
  readonly timeAgo = computed(() =>
    formatDistanceToNow(new Date(this.note().updatedAt), { addSuffix: true })
  );
  readonly preview = computed(() => {
    const note = this.note();
    switch (note.type) {
      case 'text':
        return truncateContent(note.content, 150);
      case 'audio':
        return `Audio recording (${note.duration}s)`;
      case 'textAndAudio':
        return `${truncateContent(note.content, 150)} + Audio (${
          note.duration
        }s)`;
      default:
        return 'Unknown note type';
    }
  });

  onDelete(e: Event) {
    e.stopPropagation();
    this.delete.emit(this.note());
  }
}
const truncateContent = (content: string, maxLength = 150) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};
