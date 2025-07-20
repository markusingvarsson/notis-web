import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { PagelayoutComponent } from '../../../components/layout/pagelayout/pagelayout.component';
import { NoteListComponent } from '../../../domain/notes/components/note-list/note-list.component';
import { DesktopSidebarComponent } from '../../../components/layout/desktop-sidebar/desktop-sidebar.component';
import { NotesHeaderComponent } from '../../../domain/notes/components/notes-header/notes-header.component';
import { TagFilterComponent } from '../../../domain/notes/components/tag-filter/tag-filter.component';
import { MobileFilterSheetComponent } from '../../../domain/notes/components/mobile-filter-sheet/mobile-filter-sheet.component';
import { MobileFilterTriggerComponent } from '../../../domain/notes/components/mobile-filter-trigger/mobile-filter-trigger.component';
import { NotesFilterService } from '../../../domain/notes/services/notes-filter.service';
import { DeviceDetectorService } from 'ngx-device-detector';

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
      [withNavbar]="isMobile()"
      [fixedNavbar]="!isMobile()"
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
            [selectedTagsCount]="filterService.selectedTags().length"
            (openSheet)="openMobileFilterSheet()"
          ></app-mobile-filter-trigger>
        </div>
        <app-note-list></app-note-list>
      </div>

      <!-- Mobile Filter Sheet -->
      <app-mobile-filter-sheet
        [availableTags]="filterService.availableTags()"
        [selectedTags]="filterService.selectedTags()"
        [noteCount]="filterService.filteredNotes().length"
        [isOpen]="isMobileFilterSheetOpen()"
        (tagsChange)="onTagsChange($event)"
        (clearFilters)="onClearFilters()"
        (closeSheet)="closeMobileFilterSheet()"
      ></app-mobile-filter-sheet>
    </app-pagelayout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListPageComponent {
  #deviceService = inject(DeviceDetectorService);
  readonly filterService = inject(NotesFilterService);
  readonly isMobileFilterSheetOpen = signal(false);
  readonly isMobile = computed(() => this.#deviceService.isMobile());

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
}
