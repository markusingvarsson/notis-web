import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
  effect,
  ElementRef,
  viewChild,
  HostListener,
} from '@angular/core';
import { NoteCardComponent } from '../note-card/note-card.component';
import { NotesStorageService } from '../../services/notes-storage.service';
import { NotesFilterService } from '../../services/notes-filter.service';
import { Note } from '../..';
import { ConfirmationModalService } from '../../../../components/ui/confirmation-modal/confirmation-modal.service';

import {
  ViewModeToggleComponent,
  type ViewMode,
} from '../../../../components/ui/view-mode-toggle/view-mode-toggle.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { MicrophoneIconComponent } from '../../../../components/ui/icons/microphone-icon/microphone-icon.component';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [
    NoteCardComponent,
    ViewModeToggleComponent,
    ButtonComponent,
    MicrophoneIconComponent,
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteListComponent {
  private notesStorage = inject(NotesStorageService);
  private filterService = inject(NotesFilterService);
  private confirmationModalService = inject(ConfirmationModalService);

  readonly nextDeletingNoteId = signal<string | null>(null);
  readonly viewMode = signal<ViewMode>('grid');

  // Virtual scrolling state
  readonly isLoading = signal(false);
  readonly currentPage = signal(0);
  readonly pageSize = 10; // Number of notes to load per "page"
  readonly scrollThreshold = 200; // Pixels from bottom to trigger load

  readonly scrollContainerRef =
    viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly filteredNotes = this.filterService.filteredNotes;
  readonly notesCount = computed(() => this.filteredNotes().length);

  // Virtual scrolling: only show current page of notes
  readonly visibleNotes = computed(() => {
    const allNotes = this.filteredNotes();
    const page = this.currentPage();
    const startIndex = 0;
    const endIndex = (page + 1) * this.pageSize;
    return allNotes.slice(startIndex, endIndex);
  });

  readonly hasMoreNotes = computed(() => {
    const allNotes = this.filteredNotes();
    const page = this.currentPage();
    return (page + 1) * this.pageSize < allNotes.length;
  });

  constructor() {
    // Reset page when filtered notes change
    effect(() => {
      this.filteredNotes();
      this.currentPage.set(0);
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.isLoading() || !this.hasMoreNotes()) return;

    const scrollContainer = this.scrollContainerRef()?.nativeElement;
    if (!scrollContainer) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if we're near the bottom
    if (scrollTop + windowHeight >= documentHeight - this.scrollThreshold) {
      this.loadMoreNotes();
    }
  }

  private loadMoreNotes() {
    if (this.isLoading() || !this.hasMoreNotes()) return;

    this.isLoading.set(true);

    // Simulate loading delay (remove in production)
    setTimeout(() => {
      this.currentPage.update((page) => page + 1);
      this.isLoading.set(false);
    }, 300);
  }

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
}
