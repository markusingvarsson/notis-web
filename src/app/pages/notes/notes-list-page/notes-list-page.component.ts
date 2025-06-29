import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PagelayoutComponent } from '../../../components/layout/pagelayout/pagelayout.component';
import { NoteListComponent } from '../../../domain/notes/components/note-list/note-list.component';

@Component({
  selector: 'app-notes-list-page',
  standalone: true,
  imports: [PagelayoutComponent, NoteListComponent],
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
    >
      <div class="space-y-8">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            All Notes
          </h1>
        </div>
        <app-note-list></app-note-list>
      </div>
    </app-pagelayout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListPageComponent {
  private router = inject(Router);
}
