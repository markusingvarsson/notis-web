import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { NoteListComponent } from '../../../domain/notes/components/note-list/note-list.component';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [NoteListComponent],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">All Notes</h1>
        <button 
          type="button" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          (click)="navigateToCreate()"
        >
          Create Note
        </button>
      </div>
      <app-note-list></app-note-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListComponent {
  private router = inject(Router);

  navigateToCreate() {
    this.router.navigate(['/notes/create']);
  }
}