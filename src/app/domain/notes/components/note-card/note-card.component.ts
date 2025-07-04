// File: src/app/note-card/note-card.component.ts
import {
  Component,
  input,
  computed,
  output,
  ElementRef,
  viewChild,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { CardComponent } from '../../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { CardContentComponent } from '../../../../components/ui/card/components/card-content/card-content.component';
import { CardHeaderComponent } from '../../../../components/ui/card/components/card-header/card-header.component';
import { CardTitleComponent } from '../../../../components/ui/card/components/card-title/card-title.component';
import { Note } from '../..';
import { CardFooterComponent } from '../../../../components/ui/card/components/card-footer/card-footer.component';
import { TrashIconComponent } from '../../../../components/ui/icons/trash-icon/trash-icon.component';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    CardFooterComponent,
    TrashIconComponent,
  ],
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss'],
  host: {
    '[class.deleting]': 'isDeleting()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCardComponent implements OnDestroy {
  /** Inputs as signals */
  readonly note = input.required<Note>();
  readonly isDeleting = input(false);
  readonly delete = output<Note>();
  /** Audio playback state */
  readonly audioElementRef = viewChild<ElementRef<HTMLAudioElement>>('audio');
  private audioUrl?: string;

  /** Computed values */
  readonly timeAgo = computed(() => {
    const date = new Date(this.note().updatedAt);
    const oneDayAgo = subDays(new Date(), 1);

    if (isAfter(date, oneDayAgo)) {
      // For notes less than 24 hours old, show relative time
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      // For older notes, show localized date format
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  });

  readonly preview = computed(() => {
    const note = this.note();
    switch (note.type) {
      case 'text':
        return truncateContent(note.content, 150);
      case 'audio':
        if (note.transcript) {
          return note.transcript;
        } else {
          return note.duration > 0
            ? `Audio recording (${formatDuration(note.duration)})`
            : 'Audio recording';
        }
      default:
        return 'Unknown note type';
    }
  });

  readonly hasAudio = computed(() => {
    const note = this.note();
    return note.type === 'audio';
  });

  readonly audioSrc = computed(() => {
    const note = this.note();
    if (note.type !== 'audio') return '';

    if (!this.audioUrl) {
      this.audioUrl = URL.createObjectURL(note.audioBlob);
    }
    return this.audioUrl;
  });

  onDelete(e: Event) {
    e.stopPropagation();
    this.delete.emit(this.note());
  }

  ngOnDestroy() {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
  }
}

const truncateContent = (content: string, maxLength = 150) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
