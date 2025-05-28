// File: src/app/note-card/note-card.component.ts
import { Component, input, computed, output, signal } from '@angular/core';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { CardComponent } from '../../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { CardContentComponent } from '../../../../components/ui/card/components/card-content/card-content.component';
import { CardHeaderComponent } from '../../../../components/ui/card/components/card-header/card-header.component';
import { CardTitleComponent } from '../../../../components/ui/card/components/card-title/card-title.component';
import { Note, AudioNote } from '../..';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [
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

  /** Audio playback state */
  readonly isPlaying = signal(false);
  private audioElement: HTMLAudioElement | null = null;

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
        return `Audio recording (${formatDuration(note.duration)})`;
      default:
        return 'Unknown note type';
    }
  });

  readonly hasAudio = computed(() => {
    const note = this.note();
    return note.type === 'audio';
  });

  onDelete(e: Event) {
    e.stopPropagation();
    this.delete.emit(this.note());
  }

  togglePlay(e: Event) {
    e.stopPropagation();

    const note = this.note();
    if (!this.hasAudio()) return;

    const audioNote = note as AudioNote;

    if (!this.isPlaying()) {
      // Start playing
      if (!this.audioElement) {
        const objectUrl = URL.createObjectURL(audioNote.audioBlob);
        this.audioElement = new Audio(objectUrl);

        this.audioElement.onended = () => {
          this.isPlaying.set(false);
          URL.revokeObjectURL(this.audioElement!.src);
          this.audioElement = null;
        };
      }

      this.audioElement.play();
      this.isPlaying.set(true);
    } else {
      // Pause or stop
      if (this.audioElement) {
        this.audioElement.pause();
        URL.revokeObjectURL(this.audioElement.src);
        this.audioElement = null;
      }

      this.isPlaying.set(false);
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
