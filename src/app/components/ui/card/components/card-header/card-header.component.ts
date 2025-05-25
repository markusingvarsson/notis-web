// File: src/app/card/card-header.component.ts
import { CommonModule } from '@angular/common';
import { Component, signal, computed, input } from '@angular/core';

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss'],
})
export class CardHeaderComponent {
  className = input('');
  private base = signal('flex flex-col space-y-1.5 p-6');
  readonly classes = computed(
    () => `${this.base()}${this.className() ? ' ' + this.className() : ''}`
  );
}
