import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-chevron-right',
  standalone: true,
  imports: [],
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  `,
})
export class IconChevronRightComponent {
  readonly size = input<number | string>(24);
}
