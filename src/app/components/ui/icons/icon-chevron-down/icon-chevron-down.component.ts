import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-icon-chevron-down',
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconChevronDownComponent {
  readonly size = input<number | string>(24);
}
