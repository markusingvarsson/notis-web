import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { PagelayoutComponent } from '../../../components/layout/pagelayout/pagelayout.component';
import { NoteListComponent } from '../../../domain/notes/components/note-list/note-list.component';
import { DesktopSidebarComponent } from '../../../components/layout/desktop-sidebar/desktop-sidebar.component';
import { NotesHeaderComponent } from '../../../domain/notes/components/notes-header/notes-header.component';
import { TagFilterComponent } from '../../../domain/notes/components/tag-filter/tag-filter.component';
import { MobileFilterSheetComponent } from '../../../domain/notes/components/mobile-filter-sheet/mobile-filter-sheet.component';
import { MobileFilterTriggerComponent } from '../../../domain/notes/components/mobile-filter-trigger/mobile-filter-trigger.component';
import { NotesFilterService } from '../../../domain/notes/services/notes-filter.service';
import { FilterOptions } from '../../../domain/notes/types/filter-options';

@Component({
  selector: 'app-notes-list-page',
  standalone: true,
  imports: [
    PagelayoutComponent,
    NoteListComponent,
    DesktopSidebarComponent,
    NotesHeaderComponent,
    TagFilterComponent,
    MobileFilterSheetComponent,
    MobileFilterTriggerComponent,
  ],
  template: `
    <app-pagelayout
      [pageTitle]="'My Notes - Notis.nu'"
      [pageDescription]="
        'A minimalist voice-first note-taking experience designed for clarity and focus.'
      "
      [pageKeywords]="
        'notes, voice notes, my notes, note management, notis, local storage, privacy'
      "
      [withFooter]="true"
      [withNavbar]="false"
    >
      <app-desktop-sidebar>
        <app-tag-filter slot="tags"></app-tag-filter>
      </app-desktop-sidebar>
      <div class="space-y-8 p-4">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <app-notes-header></app-notes-header>
          <app-mobile-filter-trigger
            [activeFiltersCount]="activeFiltersCount()"
            (openSheet)="openMobileFilterSheet()"
          ></app-mobile-filter-trigger>
        </div>
        <app-note-list></app-note-list>
      </div>
      
      <!-- Mobile Filter Sheet -->
      <app-mobile-filter-sheet
        [availableTags]="filterService.availableTags()"
        [filters]="filterService.filterOptions()"
        [noteCount]="filterService.filteredNotes().length"
        [isOpen]="isMobileFilterSheetOpen()"
        (filtersChange)="onFiltersChange($event)"
        (clearFilters)="onClearFilters()"
        (closeSheet)="closeMobileFilterSheet()"
      ></app-mobile-filter-sheet>
    </app-pagelayout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListPageComponent {
  readonly filterService = inject(NotesFilterService);
  readonly isMobileFilterSheetOpen = signal(false);

  readonly activeFiltersCount = signal(0);

  openMobileFilterSheet() {
    this.isMobileFilterSheetOpen.set(true);
    this.updateActiveFiltersCount();
  }

  closeMobileFilterSheet() {
    this.isMobileFilterSheetOpen.set(false);
  }

  onFiltersChange(filters: FilterOptions) {
    this.filterService.setFilterOptions(filters);
    this.updateActiveFiltersCount();
  }

  onClearFilters() {
    this.filterService.clearFilters();
    this.updateActiveFiltersCount();
  }

  private updateActiveFiltersCount() {
    const filters = this.filterService.filterOptions();
    let count = 0;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.contentLength[0] > 0 || filters.contentLength[1] < 1000) count++;
    if (filters.sortBy !== 'newest') count++;
    this.activeFiltersCount.set(count);
  }
}
