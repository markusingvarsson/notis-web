import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-save-icon',
  standalone: true,
  imports: [],
  template: `
    <svg
      [style.width.px]="size()"
      [style.height.px]="size()"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z"
        [style.stroke]="color()"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M17 21V13H7V21"
        [style.stroke]="color()"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7 3V8H15"
        [style.stroke]="color()"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveIconComponent {
  readonly size = input<number>(32);
  readonly color = input<string>('#FFF');
}