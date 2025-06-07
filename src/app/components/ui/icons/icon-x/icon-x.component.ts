import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-x',
  standalone: true,
  imports: [],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [style.width.px]="size()"
      [style.height.px]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [style.stroke]="color()"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  `,
})
export class IconXComponent {
  readonly size = input<number>(20);
  readonly color = input<string>('currentColor');
}
