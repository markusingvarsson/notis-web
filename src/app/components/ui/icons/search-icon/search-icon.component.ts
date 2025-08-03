import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';

@Component({
  selector: 'app-search-icon',
  standalone: true,
  imports: [],
  templateUrl: './search-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchIconComponent {
  readonly size = input<number>(20);
  readonly className = input<string>('');

  readonly sizeClasses = computed(() => {
    const size = this.size();
    return `w-${Math.floor(size / 4)} h-${Math.floor(size / 4)}`;
  });

  readonly combinedClasses = computed(() => {
    const baseClasses = this.sizeClasses();
    const customClasses = this.className();
    return customClasses ? `${baseClasses} ${customClasses}` : baseClasses;
  });
}