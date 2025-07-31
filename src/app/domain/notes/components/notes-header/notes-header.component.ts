import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { NotesFilterService } from '../../services/notes-filter.service';
import { IS_INITIAL_LOADING } from '../../services/loading-tokens';

@Component({
  selector: 'app-notes-header',
  standalone: true,
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        My Notes
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        @if (isInitialLoading()) {
        <span class="inline-block w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
        } @else if (isFiltered()) { Showing {{ filteredCount() }} of
        {{ totalCount() }} {{ totalCount() === 1 ? 'note' : 'notes' }}
        } @else {
        {{ totalCount() }} {{ totalCount() === 1 ? 'note' : 'notes' }}
        }
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesHeaderComponent {
  private filterService = inject(NotesFilterService);

  readonly filteredCount = computed(
    () => this.filterService.filteredNotes().length
  );
  readonly totalCount = computed(() => this.filterService.notes().length);
  readonly isFiltered = computed(
    () => this.filterService.selectedTags().length > 0
  );
  readonly isInitialLoading = inject(IS_INITIAL_LOADING);
}
