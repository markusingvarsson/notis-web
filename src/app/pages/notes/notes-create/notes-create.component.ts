import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { CreateNoteComponent } from '../../../domain/notes/components/create-note/create-note.component';
import { NotesStorageService } from '../../../domain/notes/services/notes-storage.service';
import { NoteCreated } from '../../../domain/notes';

@Component({
  selector: 'app-notes-create',
  standalone: true,
  imports: [CreateNoteComponent],
  template: `
    <div class="space-y-8">
      <div class="space-y-4">
        <button 
          type="button" 
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          (click)="navigateBack()"
        >
          ← Back to Notes
        </button>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Create New Note</h1>
      </div>
      <app-create-note
        [CTA]="CTA()"
        (noteCreated)="onCreateNote($event)"
        [availableTags]="availableTags()"
      ></app-create-note>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesCreateComponent {
  private router = inject(Router);
  private notesStorageService = inject(NotesStorageService);

  readonly CTA = input<boolean>(false);
  readonly availableTags = this.notesStorageService.getTags();

  onCreateNote(event: NoteCreated) {
    this.notesStorageService.addNote(event);
    this.navigateBack();
  }

  navigateBack() {
    this.router.navigate(['/notes/list']);
  }
}