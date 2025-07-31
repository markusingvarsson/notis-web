import { Component, input } from '@angular/core';

@Component({
  selector: 'app-plus-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [style.color]="color()"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  `,
})
export class PlusIconComponent {
  readonly size = input(24);
  readonly color = input('currentColor');
  readonly strokeWidth = input(2);
}
