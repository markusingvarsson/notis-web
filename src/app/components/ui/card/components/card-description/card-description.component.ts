// File: src/app/card/card-description.component.ts
import {
  Component,
  signal,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [],
  templateUrl: './card-description.component.html',
  styleUrls: ['./card-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDescriptionComponent {
  className = input('');
  private base = signal('text-sm text-muted-foreground');
  readonly classes = computed(
    () => `${this.base()}${this.className() ? ' ' + this.className() : ''}`
  );
}
