// File: src/app/card/card-description.component.ts
import { CommonModule } from '@angular/common';
import { Component, signal, computed, input } from '@angular/core';

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-description.component.html',
  styleUrls: ['./card-description.component.scss'],
})
export class CardDescriptionComponent {
  className = input('');
  private base = signal('text-sm text-muted-foreground');
  readonly classes = computed(
    () => `${this.base()}${this.className() ? ' ' + this.className() : ''}`
  );
}
