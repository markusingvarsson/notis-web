import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FilterOptions } from '../../types/filter-options';
import { CalendarIconComponent } from '../../../../components/ui/icons/calendar-icon/calendar-icon.component';
import { XIconComponent } from '../../../../components/ui/icons/x-icon/x-icon.component';
import { IconChevronComponent } from '../../../../components/ui/icons/icon-chevron/icon-chevron.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';

@Component({
  selector: 'app-mobile-filter-sheet',
  standalone: true,
  imports: [
    CalendarIconComponent,
    XIconComponent,
    IconChevronComponent,
    ButtonComponent,
  ],
  template: `
    @if (isOpen()) {
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/60 z-50 md:hidden"
      (click)="onBackdropClick()"
      (keydown.escape)="onClose()"
      tabindex="-1"
    ></div>

    <!-- Sheet -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-sheet-title"
      class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out"
      [class.translate-y-0]="isOpen()"
      [class.translate-y-full]="!isOpen()"
      style="height: 80vh; max-height: 80vh;"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 id="filter-sheet-title" class="text-lg font-semibold">Filter Notes</h2>
        <button
          (click)="onClose()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close filter sheet"
        >
          <app-x-icon [size]="20" [color]="'currentColor'" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-6">
          <!-- Header Controls -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Filters</h3>
            <div class="flex items-center gap-2">
              @if (activeFiltersCount() > 0) {
              <span
                class="text-xs bg-[var(--tw-primary-accent-bg)] text-[var(--tw-primary)] px-2 py-1 rounded-full"
              >
                {{ activeFiltersCount() }}
              </span>
              }
              <app-button
                variant="outline"
                size="sm"
                (buttonClick)="onClearFilters()"
                class="text-red-600 hover:text-red-700"
              >
                Clear all
              </app-button>
            </div>
          </div>

          <!-- Results count -->
          <div class="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            {{ noteCount() }} {{ noteCount() === 1 ? 'note' : 'notes' }} found
          </div>

          <!-- Tags Filter -->
          <div class="space-y-2">
            <button
              (click)="toggleSection('tags')"
              class="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
              [attr.aria-expanded]="expandedSections().tags"
            >
              <h4 class="font-medium">Tags</h4>
              <app-icon-chevron
                [size]="16"
                [color]="'currentColor'"
                [orientation]="expandedSections().tags ? 'down' : 'right'"
                class="transition-transform duration-200"
              />
            </button>
            
            @if (expandedSections().tags) {
            <div class="space-y-2 max-h-48 overflow-y-auto">
              @for (tag of availableTags(); track tag) {
              <label
                class="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  [checked]="isTagSelected(tag)"
                  (change)="onTagToggle(tag)"
                  class="w-4 h-4 text-[var(--tw-primary)] border-gray-300 rounded focus:ring-[var(--tw-primary)] focus:ring-2"
                  [attr.aria-label]="'Filter by ' + tag + ' tag'"
                />
                <span class="text-sm capitalize flex-1">#{{ tag }}</span>
              </label>
              }
            </div>
            }
          </div>

          <!-- Date Range Filter -->
          <div class="space-y-2">
            <button
              (click)="toggleSection('date')"
              class="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
              [attr.aria-expanded]="expandedSections().date"
            >
              <h4 class="font-medium flex items-center gap-2">
                <app-calendar-icon [size]="16" [color]="'currentColor'" />
                Date Range
              </h4>
              <app-icon-chevron
                [size]="16"
                [color]="'currentColor'"
                [orientation]="expandedSections().date ? 'down' : 'right'"
                class="transition-transform duration-200"
              />
            </button>
            
            @if (expandedSections().date) {
            <div class="space-y-2">
              @for (option of dateRangeOptions; track option.value) {
              <label
                class="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="dateRange"
                  [value]="option.value"
                  [checked]="isDateRangeSelected(option.value)"
                  (change)="onDateRangeChange(option.value)"
                  class="w-4 h-4 text-[var(--tw-primary)] border-gray-300 focus:ring-[var(--tw-primary)] focus:ring-2"
                />
                <span class="text-sm">{{ option.label }}</span>
              </label>
              }
            </div>
            }
          </div>

          <!-- Content Length Filter -->
          <div class="space-y-2">
            <button
              (click)="toggleSection('content')"
              class="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
              [attr.aria-expanded]="expandedSections().content"
            >
              <h4 class="font-medium">Content Length</h4>
              <app-icon-chevron
                [size]="16"
                [color]="'currentColor'"
                [orientation]="expandedSections().content ? 'down' : 'right'"
                class="transition-transform duration-200"
              />
            </button>
            
            @if (expandedSections().content) {
            <div class="space-y-4 px-2">
              <div class="space-y-2">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>{{ filters().contentLength[0] }} chars</span>
                  <span>{{ filters().contentLength[1] }} chars</span>
                </div>
                <div class="space-y-2">
                  <div class="block text-sm font-medium text-gray-700">Min Length</div>
                  <input
                    type="range"
                    name="minLength"
                    [value]="filters().contentLength[0]"
                    min="0"
                    max="1000"
                    step="50"
                    (input)="onContentLengthChange($event)"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div class="block text-sm font-medium text-gray-700">Max Length</div>
                  <input
                    type="range"
                    name="maxLength"
                    [value]="filters().contentLength[1]"
                    min="0"
                    max="1000"
                    step="50"
                    (input)="onContentLengthChange($event)"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            }
          </div>

          <!-- Sort Options -->
          <div class="space-y-2">
            <button
              (click)="toggleSection('sort')"
              class="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
              [attr.aria-expanded]="expandedSections().sort"
            >
              <h4 class="font-medium">Sort By</h4>
              <app-icon-chevron
                [size]="16"
                [color]="'currentColor'"
                [orientation]="expandedSections().sort ? 'down' : 'right'"
                class="transition-transform duration-200"
              />
            </button>
            
            @if (expandedSections().sort) {
            <div class="space-y-2">
              @for (option of sortOptions; track option.value) {
              <label
                class="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="sortBy"
                  [value]="option.value"
                  [checked]="isSortSelected(option.value)"
                  (change)="onSortChange(option.value)"
                  class="w-4 h-4 text-[var(--tw-primary)] border-gray-300 focus:ring-[var(--tw-primary)] focus:ring-2"
                />
                <span class="text-sm">{{ option.label }}</span>
              </label>
              }
            </div>
            }
          </div>
        </div>
      </div>
    </div>
    }
  `,
  styleUrls: ['./mobile-filter-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilterSheetComponent {
  readonly availableTags = input.required<string[]>();
  readonly filters = input.required<FilterOptions>();
  readonly noteCount = input.required<number>();
  readonly isOpen = input<boolean>(false);

  readonly filtersChange = output<FilterOptions>();
  readonly clearFilters = output<void>();
  readonly closeSheet = output<void>();

  readonly dateRangeOptions = [
    { value: 'all' as const, label: 'All time' },
    { value: 'today' as const, label: 'Today' },
    { value: 'week' as const, label: 'This week' },
    { value: 'month' as const, label: 'This month' },
    { value: 'year' as const, label: 'This year' }
  ];

  readonly sortOptions = [
    { value: 'newest' as const, label: 'Newest first' },
    { value: 'oldest' as const, label: 'Oldest first' },
    { value: 'title' as const, label: 'Title A-Z' },
    { value: 'relevance' as const, label: 'Most relevant' }
  ];

  readonly expandedSections = signal({
    tags: true,
    date: true,
    content: true,
    sort: true,
  });

  readonly activeFiltersCount = computed(() => {
    let count = 0;
    const currentFilters = this.filters();
    if (currentFilters.tags.length > 0) count++;
    if (currentFilters.dateRange !== 'all') count++;
    if (currentFilters.contentLength[0] > 0 || currentFilters.contentLength[1] < 1000) count++;
    if (currentFilters.sortBy !== 'newest') count++;
    return count;
  });

  toggleSection(section: 'tags' | 'date' | 'content' | 'sort') {
    this.expandedSections.update((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  onTagToggle(tag: string) {
    const currentFilters = this.filters();
    const newTags = currentFilters.tags.includes(tag)
      ? currentFilters.tags.filter((t) => t !== tag)
      : [...currentFilters.tags, tag];

    this.filtersChange.emit({ ...currentFilters, tags: newTags });
  }

  onDateRangeChange(range: FilterOptions['dateRange']) {
    this.filtersChange.emit({ ...this.filters(), dateRange: range });
  }

  onContentLengthChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    const currentFilters = this.filters();
    
    if (target.name === 'minLength') {
      this.filtersChange.emit({
        ...currentFilters,
        contentLength: [value, currentFilters.contentLength[1]],
      });
    } else if (target.name === 'maxLength') {
      this.filtersChange.emit({
        ...currentFilters,
        contentLength: [currentFilters.contentLength[0], value],
      });
    }
  }

  onSortChange(sortBy: FilterOptions['sortBy']) {
    this.filtersChange.emit({ ...this.filters(), sortBy });
  }

  onClearFilters() {
    this.clearFilters.emit();
  }

  onClose() {
    this.closeSheet.emit();
  }

  onBackdropClick() {
    this.closeSheet.emit();
  }

  isTagSelected(tag: string): boolean {
    return this.filters().tags.includes(tag);
  }

  isDateRangeSelected(range: FilterOptions['dateRange']): boolean {
    return this.filters().dateRange === range;
  }

  isSortSelected(sortBy: FilterOptions['sortBy']): boolean {
    return this.filters().sortBy === sortBy;
  }
}