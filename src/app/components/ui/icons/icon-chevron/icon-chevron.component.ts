import { Component, input, ChangeDetectionStrategy } from '@angular/core';

type ChevronOrientation = 'right' | 'left' | 'up' | 'down';

@Component({
  selector: 'app-icon-chevron',
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
      [style.color]="color()"
      [style.transform]="getTransform()"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconChevronComponent {
  readonly size = input<number | string>(24);
  readonly color = input<string>('currentColor');
  readonly orientation = input<ChevronOrientation>('right');

  getTransform(): string {
    switch (this.orientation()) {
      case 'left':
        return 'rotate(180deg)';
      case 'up':
        return 'rotate(-90deg)';
      case 'down':
        return 'rotate(90deg)';
      case 'right':
      default:
        return 'rotate(0deg)';
    }
  }
}
