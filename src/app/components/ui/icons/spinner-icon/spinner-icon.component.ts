import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-spinner-icon',
  standalone: true,
  imports: [],
  template: `
    <svg
      [style.width.px]="size()"
      [style.height.px]="size()"
      class="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        [style.stroke]="color()"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        [style.fill]="color()"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerIconComponent {
  readonly size = input<number>(32);
  readonly color = input<string>('#FFF');
}
