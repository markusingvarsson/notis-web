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
  signal,
  inject,
} from '@angular/core';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { Note } from '../..';
import { NotesStorageService } from '../../services/notes-storage.service';
import { MoreVerticalIconComponent } from '../../../../components/ui/icons/more-vertical-icon/more-vertical-icon.component';
import { PlayIconComponent } from '../../../../components/ui/icons/play-icon/play-icon.component';
import { PauseIconComponent } from '../../../../components/ui/icons/pause-icon/pause-icon.component';
import { ShareIconComponent } from '../../../../components/ui/icons/share-icon/share-icon.component';
import { CalendarIconComponent } from '../../../../components/ui/icons/calendar-icon/calendar-icon.component';
import { TagIconComponent } from '../../../../components/ui/icons/tag-icon/tag-icon.component';
import { MicrophoneIconComponent } from '../../../../components/ui/icons/microphone-icon/microphone-icon.component';
import { TrashIconComponent } from '../../../../components/ui/icons/trash-icon/trash-icon.component';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [
    MoreVerticalIconComponent,
    PlayIconComponent,
    PauseIconComponent,
    ShareIconComponent,
    CalendarIconComponent,
    TagIconComponent,
    MicrophoneIconComponent,
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
  private notesStorage = inject(NotesStorageService);

  /** Inputs as signals */
  readonly note = input.required<Note>();
  readonly isDeleting = input(false);
  readonly delete = output<Note>();
  readonly share = output<Note>();

  /** Audio playback state */
  readonly audioElementRef = viewChild<ElementRef<HTMLAudioElement>>('audio');
  private audioUrl?: string;
  readonly isPlaying = signal(false);
  readonly isPaused = signal(true);

  /** UI state */
  readonly showMenu = signal(false);

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
          return truncateContent(note.transcript, 150);
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

  readonly tags = computed(() => {
    const note = this.note();
    const allTags = this.notesStorage.getTags();

    if (!note.tagIds || note.tagIds.length === 0) {
      return [];
    }

    return note.tagIds
      .map((tagId) => allTags()[tagId])
      .filter((tag) => tag) // Filter out undefined tags
      .map((tag) => tag.name)
      .sort();
  });

  onDelete(e: Event) {
    e.stopPropagation();
    this.delete.emit(this.note());
  }

  onShare(e: Event) {
    e.stopPropagation();
    this.share.emit(this.note());
  }

  onCardClick() {
    // TODO: Navigate to edit page
    console.log('Navigate to edit note:', this.note().id);
  }

  toggleMenu(e: Event) {
    e.stopPropagation();
    this.showMenu.update((show) => !show);
  }

  onPlayAudio(e: Event) {
    e.stopPropagation();
    const audioElement = this.audioElementRef()?.nativeElement;

    if (!audioElement) return;

    if (audioElement.paused) {
      audioElement
        .play()
        .then(() => {
          this.isPlaying.set(true);
          this.isPaused.set(false);
        })
        .catch((error: Error) => {
          console.error('Error playing audio:', error);
        });
    } else {
      audioElement.pause();
      this.isPlaying.set(false);
      this.isPaused.set(true);
    }
  }

  onAudioEnded() {
    this.isPlaying.set(false);
    this.isPaused.set(true);
  }

  onAudioPlay() {
    this.isPlaying.set(true);
    this.isPaused.set(false);
  }

  onAudioPause() {
    this.isPlaying.set(false);
    this.isPaused.set(true);
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
