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
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NotesFilterService } from '../../../domain/notes/services/notes-filter.service';
import { MicrophoneIconComponent } from '../../ui/icons/microphone-icon/microphone-icon.component';
import { HomeIconComponent } from '../../ui/icons/home-icon/home-icon.component';
import { FileTextIconComponent } from '../../ui/icons/file-text-icon/file-text-icon.component';
import { PlusIconComponent } from '../../ui/icons/plus-icon/plus-icon.component';
import { SettingsIconComponent } from '../../ui/icons/settings-icon/settings-icon.component';
import { TagIconComponent } from '../../ui/icons/tag-icon/tag-icon.component';
import { IconChevronComponent } from '../../ui/icons/icon-chevron/icon-chevron.component';
import { XIconComponent } from '../../ui/icons/x-icon/x-icon.component';

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MicrophoneIconComponent,
    HomeIconComponent,
    FileTextIconComponent,
    PlusIconComponent,
    SettingsIconComponent,
    TagIconComponent,
    IconChevronComponent,
    XIconComponent,
  ],
  templateUrl: './desktop-sidebar.component.html',
  styleUrls: ['./desktop-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopSidebarComponent {
  private router = inject(Router);
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

  onNewNote() {
    this.router.navigate(['/notes/create']);
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
