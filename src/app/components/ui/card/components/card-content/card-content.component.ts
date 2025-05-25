// File: src/app/card/card-content.component.ts
import { Component, signal, computed, input } from '@angular/core';

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [],
  templateUrl: './card-content.component.html',
  styleUrls: ['./card-content.component.scss'],
})
export class CardContentComponent {
  className = input('');
  private base = signal('p-6 pt-0');
  readonly classes = computed(
    () => `${this.base()}${this.className() ? ' ' + this.className() : ''}`
  );
}
