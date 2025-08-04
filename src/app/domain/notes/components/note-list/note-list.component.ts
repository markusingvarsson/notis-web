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
import { IS_INITIAL_LOADING } from '../../services/loading-tokens';
import { PAGINATION_CONSTANTS } from '../../constants/pagination.constants';

import {
  ViewModeToggleComponent,
  type ViewMode,
} from '../../../../components/ui/view-mode-toggle/view-mode-toggle.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { MicrophoneIconComponent } from '../../../../components/ui/icons/microphone-icon/microphone-icon.component';
import { NotesHeaderComponent } from '../notes-header/notes-header.component';
import { MobileFilterSheetComponent } from '../mobile-filter-sheet/mobile-filter-sheet.component';
import { MobileFilterTriggerComponent } from '../mobile-filter-trigger/mobile-filter-trigger.component';
import { SearchInputComponent } from '../../../../components/ui/search-input/search-input.component';
import { SearchIconComponent } from '../../../../components/ui/icons/search-icon/search-icon.component';
import { XIconComponent } from '../../../../components/ui/icons/x-icon/x-icon.component';

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
    SearchInputComponent,
    SearchIconComponent,
    XIconComponent,
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

  readonly nextDeletingNoteId = signal<string | null>(null);
  readonly viewMode = signal<ViewMode>('grid');
  readonly isMobileFilterSheetOpen = signal(false);
  readonly isMobileSearchExpanded = signal(false);

  // Virtual scrolling state
  readonly isLoading = signal(false);
  readonly currentPage = signal(0);
  readonly pageSize = PAGINATION_CONSTANTS.PAGE_SIZE;
  readonly scrollThreshold = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return PAGINATION_CONSTANTS.DESKTOP_SCROLL_THRESHOLD;
    return window.innerWidth < PAGINATION_CONSTANTS.MOBILE_BREAKPOINT
      ? PAGINATION_CONSTANTS.MOBILE_SCROLL_THRESHOLD
      : PAGINATION_CONSTANTS.DESKTOP_SCROLL_THRESHOLD;
  });

  readonly scrollContainerRef =
    viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  readonly mobileSearchInputRef =
    viewChild<SearchInputComponent>('mobileSearchInput');
  readonly mobileSearchBarRef =
    viewChild<ElementRef<HTMLDivElement>>('mobileSearchBar');

  readonly filteredNotes = this.filterService.filteredNotes;
  readonly isInitialLoading = inject(IS_INITIAL_LOADING);

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

    // Auto-scroll to top when search query changes
    effect(() => {
      const searchQuery = this.filterService.searchQuery();
      if (searchQuery && isPlatformBrowser(this.platformId)) {
        this.scrollToTop();
      }
    });

    // Auto-scroll to top when tag filters change
    effect(() => {
      const selectedTags = this.filterService.selectedTags();
      if (selectedTags.length > 0 && isPlatformBrowser(this.platformId)) {
        this.scrollToTop();
      }
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
    this.filterService.clearTags();
  }

  onClearSearch() {
    this.filterService.setSearchQuery('');
  }

  onClearAllFilters() {
    this.filterService.clearFilters();
  }

  onRemoveTag(tag: string) {
    const currentTags = this.filterService.selectedTags();
    const newTags = currentTags.filter(t => t !== tag);
    this.filterService.setSelectedTags(newTags);
  }

  toggleMobileSearch() {
    this.isMobileSearchExpanded.set(!this.isMobileSearchExpanded());
    // Auto-focus the search input when opened
    if (this.isMobileSearchExpanded() && isPlatformBrowser(this.platformId)) {
      // Use setTimeout for proper timing after DOM updates
      setTimeout(() => {
        this.mobileSearchInputRef()?.focus();
      }, 0);
    }
  }

  closeMobileSearch() {
    this.isMobileSearchExpanded.set(false);
  }

  onSearchOverlayClick(event: Event) {
    const target = event.target as HTMLElement;
    const searchBarElement = this.mobileSearchBarRef()?.nativeElement;

    // If click is not on the search bar (i.e., on backdrop), close the overlay
    if (searchBarElement && !searchBarElement.contains(target)) {
      this.closeMobileSearch();
    }
  }

  onSearchOverlayKeydown(event: KeyboardEvent) {
    // Close overlay on Escape key
    if (event.key === 'Escape') {
      this.closeMobileSearch();
    }
  }

  private scrollToTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
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
    const delay = isPlatformBrowser(this.platformId) &&
      window.innerWidth < PAGINATION_CONSTANTS.MOBILE_BREAKPOINT
        ? PAGINATION_CONSTANTS.MOBILE_LOADING_DELAY
        : PAGINATION_CONSTANTS.DESKTOP_LOADING_DELAY;
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
