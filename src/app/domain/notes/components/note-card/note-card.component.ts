// File: src/app/note-card/note-card.component.ts
import { CommonModule } from '@angular/common';
import { Component, input, computed, output } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { CardComponent } from '../../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { CardContentComponent } from '../../../../components/ui/card/components/card-content/card-content.component';
import { CardHeaderComponent } from '../../../../components/ui/card/components/card-header/card-header.component';
import { CardTitleComponent } from '../../../../components/ui/card/components/card-title/card-title.component';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

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
  readonly edit = output<Note>();
  readonly delete = output<Note>();

  /** Computed values */
  readonly timeAgo = computed(() =>
    formatDistanceToNow(new Date(this.note().updatedAt), { addSuffix: true })
  );
  readonly preview = computed(() => truncateContent(this.note().content, 150));

  /** Event handlers */
  onEdit(e: Event) {
    e.stopPropagation();
    this.edit.emit(this.note());
  }

  onDelete(e: Event) {
    e.stopPropagation();
    this.delete.emit(this.note());
  }
}
const truncateContent = (content: string, maxLength: number = 150) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};
