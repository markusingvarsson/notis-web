import {
  Component,
  input,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SearchIconComponent } from '../icons/search-icon/search-icon.component';
import { XIconComponent } from '../icons/x-icon/x-icon.component';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [SearchIconComponent, XIconComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  readonly placeholder = input<string>('Search...');
  readonly disabled = input<boolean>(false);
  
  readonly value = model<string>('');

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.value.set('');
    }
  }

  clearSearch() {
    this.value.set('');
  }
}