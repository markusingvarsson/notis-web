// File: src/app/card/card-title.component.ts
import { CommonModule } from '@angular/common';
import { Component, signal, computed, input } from '@angular/core';

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-title.component.html',
  styleUrls: ['./card-title.component.scss'],
})
export class CardTitleComponent {
  className = input('');
  private base = signal('text-2xl font-semibold leading-none tracking-tight');
  readonly classes = computed(
    () => `${this.base()}${this.className() ? ' ' + this.className() : ''}`
  );
}
