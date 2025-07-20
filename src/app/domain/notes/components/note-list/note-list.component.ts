import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { NoteCardComponent } from '../note-card/note-card.component';
import { NotesStorageService } from '../../services/notes-storage.service';
import { NotesFilterService } from '../../services/notes-filter.service';
import { Note } from '../..';
import { ConfirmationModalService } from '../../../../components/ui/confirmation-modal/confirmation-modal.service';
import { truncateContent } from '../../utils/text.utils';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [NoteCardComponent],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteListComponent {
  private notesStorage = inject(NotesStorageService);
  private filterService = inject(NotesFilterService);
  private confirmationModalService = inject(ConfirmationModalService);

  readonly nextDeletingNoteId = signal<string | null>(null);
  readonly viewMode = signal<'grid' | 'single'>('grid');

  readonly filteredNotes = this.filterService.filteredNotes;

  readonly notesCount = computed(() => this.filteredNotes().length);

  async onDelete(note: Note) {
    const confirmed = await this.confirmationModalService.open({
      title: 'Delete Note',
      message: `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      confirmButtonVariant: 'destructive',
    });

    if (confirmed) {
      this.nextDeletingNoteId.set(note.id);

      setTimeout(async () => {
        await this.notesStorage.deleteNote(note.id);
        this.nextDeletingNoteId.set(null);
      }, 300);
    }
  }

  async onShare(note: Note) {
    const noteContent = this.getNoteContent(note);
    const shareData = {
      title: note.title,
      text: truncateContent(noteContent, 200),
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${note.title}\n\n${noteContent}`
        );
      }
    } catch (error) {
      console.error('Failed to share note:', error);
    }
  }

  toggleViewMode() {
    this.viewMode.update((mode) => (mode === 'grid' ? 'single' : 'grid'));
  }

  private getNoteContent(note: Note): string {
    switch (note.type) {
      case 'text':
        return note.content;
      case 'audio':
        return note.transcript || 'Audio recording';
      default:
        return '';
    }
  }
}
