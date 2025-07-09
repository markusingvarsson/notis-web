import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  effect,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NotesFilterService } from '../../services/notes-filter.service';
import { TagIconComponent } from '../../../../components/ui/icons/tag-icon/tag-icon.component';
import { IconChevronComponent } from '../../../../components/ui/icons/icon-chevron/icon-chevron.component';
import { XIconComponent } from '../../../../components/ui/icons/x-icon/x-icon.component';

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
  private platformId = inject(PLATFORM_ID);

  readonly isTagsExpanded = signal(false);
  readonly selectedTags = this.filterService.selectedTags;
  readonly availableTags = this.filterService.availableTags;
  readonly hasTags = computed(() => this.availableTags().length > 0);

  constructor() {
    // Load saved tags on mount (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const savedTags = localStorage.getItem('notis-selected-tags');
        if (savedTags) {
          try {
            const parsedTags = JSON.parse(savedTags);
            if (Array.isArray(parsedTags)) {
              this.filterService.setSelectedTags(parsedTags);
            }
          } catch (error) {
            console.error('Error loading saved tags:', error);
          }
        }
      });
    }
  }

  onTagToggle(tag: string) {
    const currentTags = this.selectedTags();
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    this.filterService.setSelectedTags(newTags);

    // Save to localStorage (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('notis-selected-tags', JSON.stringify(newTags));
    }
  }

  onClearFilters() {
    this.filterService.clearFilters();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('notis-selected-tags');
    }
  }

  onTagsToggle() {
    this.isTagsExpanded.update((current) => !current);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }
}