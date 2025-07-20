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
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ViewportScroller } from '@angular/common';
import { NoteCardComponent } from '../note-card/note-card.component';
import { NotesStorageService } from '../../services/notes-storage.service';
import { NotesFilterService } from '../../services/notes-filter.service';
import { Note } from '../..';
import { ConfirmationModalService } from '../../../../components/ui/confirmation-modal/confirmation-modal.service';
import { DeviceDetectorService } from 'ngx-device-detector';

import {
  ViewModeToggleComponent,
  type ViewMode,
} from '../../../../components/ui/view-mode-toggle/view-mode-toggle.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { MicrophoneIconComponent } from '../../../../components/ui/icons/microphone-icon/microphone-icon.component';
import { NotesHeaderComponent } from '../notes-header/notes-header.component';
import { MobileFilterSheetComponent } from '../mobile-filter-sheet/mobile-filter-sheet.component';
import { MobileFilterTriggerComponent } from '../mobile-filter-trigger/mobile-filter-trigger.component';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [
    NoteCardComponent,
    ViewModeToggleComponent,
    ButtonComponent,
    MicrophoneIconComponent,
    NotesHeaderComponent,
    MobileFilterSheetComponent,
    MobileFilterTriggerComponent,
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteListComponent {
  private notesStorage = inject(NotesStorageService);
  readonly filterService = inject(NotesFilterService);
  private confirmationModalService = inject(ConfirmationModalService);
  private platformId = inject(PLATFORM_ID);
  private viewportScroller = inject(ViewportScroller);
  #deviceService = inject(DeviceDetectorService);

  readonly nextDeletingNoteId = signal<string | null>(null);
  readonly viewMode = signal<ViewMode>('grid');
  readonly isMobileFilterSheetOpen = signal(false);
  readonly isMobile = computed(() => this.#deviceService.isMobile());

  // Virtual scrolling state
  readonly isLoading = signal(false);
  readonly currentPage = signal(0);
  readonly pageSize = 10; // Number of notes to load per "page"
  readonly scrollThreshold = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return 200;
    return window.innerWidth < 768 ? 400 : 200;
  });

  readonly scrollContainerRef =
    viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly filteredNotes = this.filterService.filteredNotes;
  readonly notesCount = computed(() => this.filteredNotes().length);
  readonly isInitialLoading = this.notesStorage.getIsInitialLoading();

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

  openMobileFilterSheet() {
    this.isMobileFilterSheetOpen.set(true);
  }

  closeMobileFilterSheet() {
    this.isMobileFilterSheetOpen.set(false);
  }

  onTagsChange(tags: string[]) {
    this.filterService.setSelectedTags(tags);
  }

  onClearFilters() {
    this.filterService.clearFilters();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.isLoading() || !this.hasMoreNotes()) return;

    const scrollContainer = this.scrollContainerRef()?.nativeElement;
    if (!scrollContainer) return;

    const scrollPosition = this.viewportScroller.getScrollPosition();
    const scrollY = scrollPosition[1];
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = this.scrollThreshold();

    // Check if we're near the bottom
    if (scrollY + viewportHeight >= documentHeight - threshold) {
      this.loadMoreNotes();
    }
  }

  private loadMoreNotes() {
    if (this.isLoading() || !this.hasMoreNotes()) return;

    this.isLoading.set(true);

    // Responsive loading delay
    const delay =
      isPlatformBrowser(this.platformId) && window.innerWidth < 768 ? 150 : 300;
    setTimeout(() => {
      this.currentPage.update((page) => page + 1);
      this.isLoading.set(false);
    }, delay);
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
