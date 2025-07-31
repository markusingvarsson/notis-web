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
  effect,
} from '@angular/core';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { truncateContent, formatDuration } from '../../utils/text.utils';
import { Note } from '../..';
import { NotesStorageService } from '../../services/notes-storage.service';
import { TEXT_CONSTANTS } from '../../constants/text.constants';

import { PlayIconComponent } from '../../../../components/ui/icons/play-icon/play-icon.component';
import { PauseIconComponent } from '../../../../components/ui/icons/pause-icon/pause-icon.component';

import { CalendarIconComponent } from '../../../../components/ui/icons/calendar-icon/calendar-icon.component';
import { TagIconComponent } from '../../../../components/ui/icons/tag-icon/tag-icon.component';
import { MicrophoneIconComponent } from '../../../../components/ui/icons/microphone-icon/microphone-icon.component';
import { TrashIconComponent } from '../../../../components/ui/icons/trash-icon/trash-icon.component';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [
    PlayIconComponent,
    PauseIconComponent,
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

  /** Audio playback state */
  readonly audioElementRef = viewChild<ElementRef<HTMLAudioElement>>('audio');
  private audioUrl?: string;
  readonly isPlaying = signal(false);

  constructor() {
    // Create audio URL when note changes and clean up previous URL
    effect(() => {
      const note = this.note();

      // Clean up previous URL
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl);
        this.audioUrl = undefined;
      }

      // Create new URL for audio notes
      if (note.type === 'audio') {
        this.audioUrl = URL.createObjectURL(note.audioBlob);
      }
    });
  }

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
    if (note.type === 'audio') {
      if (note.transcript) {
        return truncateContent(
          note.transcript,
          TEXT_CONSTANTS.PREVIEW_MAX_LENGTH,
        );
      }
    }
    return '';
  });

  readonly hasAudio = computed(() => {
    const note = this.note();
    return note.type === 'audio';
  });

  readonly audioSrc = computed(() => {
    const note = this.note();
    if (note.type !== 'audio') return '';
    return this.audioUrl || '';
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

  readonly formatAudioDuration = computed(() => {
    const note = this.note();
    if (
      note.type !== 'audio' ||
      !Number.isFinite(note.duration) ||
      note.duration < 0
    )
      return '';
    return formatDuration(note.duration);
  });

  onDelete(e: Event) {
    e.stopPropagation();
    this.delete.emit(this.note());
  }

  onCardClick() {
    // TODO: Navigate to edit page
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
        })
        .catch((error: Error) => {
          console.error('Error playing audio:', error);
        });
    } else {
      audioElement.pause();
      this.isPlaying.set(false);
    }
  }

  onAudioEnded() {
    this.isPlaying.set(false);
  }

  onAudioPlay() {
    this.isPlaying.set(true);
  }

  onAudioPause() {
    this.isPlaying.set(false);
  }

  ngOnDestroy() {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
  }
}
