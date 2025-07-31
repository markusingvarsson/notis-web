import { Component, input } from '@angular/core';

@Component({
  selector: 'app-x-icon',
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  `,
})
export class XIconComponent {
  readonly size = input(24);
  readonly color = input('currentColor');
  readonly strokeWidth = input(2);
}
