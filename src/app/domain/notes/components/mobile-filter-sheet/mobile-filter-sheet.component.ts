import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { XIconComponent } from '../../../../components/ui/icons/x-icon/x-icon.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';

@Component({
  selector: 'app-mobile-filter-sheet',
  standalone: true,
  imports: [XIconComponent, ButtonComponent],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-200 ease-out"
      [class.opacity-100]="isOpen()"
      [class.opacity-0]="!isOpen()"
      [class.pointer-events-auto]="isOpen()"
      [class.pointer-events-none]="!isOpen()"
      (click)="onBackdropClick()"
      (keydown.escape)="onClose()"
      tabindex="-1"
    ></div>

    <!-- Sheet -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-sheet-title"
      class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-out flex flex-col"
      [class.translate-y-0]="isOpen()"
      [class.translate-y-full]="!isOpen()"
      [class.pointer-events-auto]="isOpen()"
      [class.pointer-events-none]="!isOpen()"
      style="height: 70vh; max-height: 70vh;"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0"
      >
        <h2 id="filter-sheet-title" class="text-lg font-semibold">
          Filter by Tags
        </h2>
        <button
          (click)="onClose()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close filter sheet"
        >
          <app-x-icon [size]="20" [color]="'currentColor'" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 pb-20 min-h-0">
        <div class="space-y-4">
          <!-- Header Controls -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              @if (selectedTags().length > 0) {
                <span
                  class="text-xs bg-[var(--tw-primary-accent-bg)] text-[var(--tw-primary)] px-2 py-1 rounded-full"
                >
                  {{ selectedTags().length }} selected
                </span>
              }
            </div>
            @if (selectedTags().length > 0) {
              <app-button
                variant="outline"
                size="sm"
                (buttonClick)="onClearFilters()"
                class="text-red-600 hover:text-red-700"
              >
                Clear tags
              </app-button>
            }
          </div>

          <!-- Results count -->
          <div class="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            {{ noteCount() }} {{ noteCount() === 1 ? 'note' : 'notes' }} found
          </div>

          <!-- Tags List -->
          @if (availableTags().length === 0) {
            <div class="text-center py-8 text-gray-500">
              <p>No tags available</p>
              <p class="text-sm mt-1">
                Create notes with tags to filter them here
              </p>
            </div>
          } @else {
            <div class="space-y-2">
              @for (tag of availableTags(); track tag) {
                <label
                  class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-150 border border-gray-100"
                >
                  <input
                    type="checkbox"
                    [checked]="isTagSelected(tag)"
                    (change)="onTagToggle(tag)"
                    class="w-4 h-4 border-gray-300 rounded focus:ring-2"
                    style="accent-color: var(--tw-highlight-dark); --tw-ring-color: var(--tw-highlight);"
                    [attr.aria-label]="'Filter by ' + tag + ' tag'"
                  />
                  <span
                    class="flex-1 px-3 py-1 rounded-full text-sm transition-all duration-200"
                    [class]="
                      isTagSelected(tag)
                        ? 'bg-slate-200 text-slate-800 font-medium'
                        : 'bg-gray-100 text-gray-700'
                    "
                  >
                    #{{ tag }}
                  </span>
                </label>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./mobile-filter-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilterSheetComponent {
  readonly availableTags = input.required<string[]>();
  readonly selectedTags = input.required<string[]>();
  readonly noteCount = input.required<number>();
  readonly isOpen = input<boolean>(false);

  readonly tagsChange = output<string[]>();
  readonly clearFilters = output<void>();
  readonly closeSheet = output<void>();

  onTagToggle(tag: string) {
    const currentTags = this.selectedTags();
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    this.tagsChange.emit(newTags);
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
    return this.selectedTags().includes(tag);
  }
}
