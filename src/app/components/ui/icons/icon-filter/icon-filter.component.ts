import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-filter',
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
      <path d="M3 2v4l7 7v6l4-4v-2l7-7V2H3Z" />
    </svg>
  `,
})
export class IconFilterComponent {
  readonly size = input<number>(20);
  readonly color = input<string>('currentColor');
}
