// File: src/app/card/card.component.ts
import {
  Component,
  signal,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  className = input('');
  private base = signal(
    'rounded-lg border bg-card text-card-foreground shadow-sm'
  );
  readonly classes = computed(
    () => `${this.base()}${this.className() ? ' ' + this.className() : ''}`
  );
}
