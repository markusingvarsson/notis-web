import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FilterIconComponent } from '../../../../components/ui/icons/filter-icon/filter-icon.component';

@Component({
  selector: 'app-mobile-filter-trigger',
  standalone: true,
  imports: [FilterIconComponent],
  template: `
    <div class="relative md:hidden">
      <button
        (click)="openSheet.emit()"
        class="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-[var(--tw-primary)] rounded-lg transition-all duration-200 text-sm font-medium"
      >
        <app-filter-icon [size]="16" [color]="'currentColor'" />
        Filters
      </button>
      @if (selectedTagsCount() > 0) {
      <span
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{ selectedTagsCount() }}
      </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilterTriggerComponent {
  readonly selectedTagsCount = input<number>(0);
  readonly openSheet = output<void>();
}
