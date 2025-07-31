import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tag-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
      <path
        d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.002 2.002 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828z"
      />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  `,
})
export class TagIconComponent {
  readonly size = input(24);
  readonly color = input('currentColor');
  readonly strokeWidth = input(2);
}
