import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FilterIconComponent } from '../../../../components/ui/icons/filter-icon/filter-icon.component';
import { ButtonComponent } from '../../../../components/ui/button/button.component';

@Component({
  selector: 'app-mobile-filter-trigger',
  standalone: true,
  imports: [FilterIconComponent, ButtonComponent],
  template: `
    <div class="relative md:hidden">
      <app-button
        variant="outline"
        size="sm"
        (buttonClick)="openSheet.emit()"
      >
        <app-filter-icon [size]="16" [color]="'currentColor'" class="mr-2" />
        Filters
      </app-button>
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
