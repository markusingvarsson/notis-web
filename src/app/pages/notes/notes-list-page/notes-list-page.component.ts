import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PagelayoutComponent } from '../../../components/layout/pagelayout/pagelayout.component';
import { NoteListComponent } from '../../../domain/notes/components/note-list/note-list.component';
import { DesktopSidebarComponent } from '../../../components/layout/desktop-sidebar/desktop-sidebar.component';
import { NotesHeaderComponent } from '../../../domain/notes/components/notes-header/notes-header.component';
import { TagFilterComponent } from '../../../domain/notes/components/tag-filter/tag-filter.component';

@Component({
  selector: 'app-notes-list-page',
  standalone: true,
  imports: [
    PagelayoutComponent,
    NoteListComponent,
    DesktopSidebarComponent,
    NotesHeaderComponent,
    TagFilterComponent,
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
        </div>
        <app-note-list></app-note-list>
      </div>
    </app-pagelayout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListPageComponent {}
