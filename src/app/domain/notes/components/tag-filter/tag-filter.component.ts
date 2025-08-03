import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NotesFilterService } from '../../services/notes-filter.service';
import { TagIconComponent } from '../../../../components/ui/icons/tag-icon/tag-icon.component';
import { IconChevronComponent } from '../../../../components/ui/icons/icon-chevron/icon-chevron.component';
import { XIconComponent } from '../../../../components/ui/icons/x-icon/x-icon.component';
import { IS_INITIAL_LOADING } from '../../services/loading-tokens';

@Component({
  selector: 'app-tag-filter',
  standalone: true,
  imports: [
    TagIconComponent,
    IconChevronComponent,
    XIconComponent,
  ],
  templateUrl: './tag-filter.component.html',
  styleUrls: ['./tag-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFilterComponent {
  private filterService = inject(NotesFilterService);

  readonly isTagsExpanded = signal(true);
  readonly selectedTags = this.filterService.selectedTags;
  readonly availableTags = this.filterService.availableTags;
  readonly hasTags = computed(() => this.availableTags().length > 0);
  readonly isInitialLoading = inject(IS_INITIAL_LOADING);

  onTagToggle(tag: string) {
    const currentTags = this.selectedTags();
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    this.filterService.setSelectedTags(newTags);
  }

  onClearFilters() {
    this.filterService.clearTags();
  }

  onTagsToggle() {
    this.isTagsExpanded.update((current) => !current);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }
}