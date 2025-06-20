import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dollar-coin-icon',
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
      <g id="dolar_coin" data-name="dolar coin">
        <path
          d="M22.5,12A10.5,10.5,0,1,1,12,1.5,10.5,10.5,0,0,1,22.5,12"
          [style.stroke]="color()"
          stroke-linecap="square"
          stroke-miterlimit="10"
          stroke-width="1.91px"
        ></path>
        <path
          d="M9.14,15.82H13a1.91,1.91,0,0,0,1.91-1.91h0A1.9,1.9,0,0,0,13,12h-1.9a1.9,1.9,0,0,1-1.91-1.91h0a1.91,1.91,0,0,1,1.91-1.91h3.81"
          [style.stroke]="color()"
          stroke-linecap="square"
          stroke-miterlimit="10"
          stroke-width="1.91px"
        ></path>
        <line
          x1="12"
          y1="6.27"
          x2="12"
          y2="8.18"
          [style.stroke]="color()"
          stroke-linecap="square"
          stroke-miterlimit="10"
          stroke-width="1.91px"
        ></line>
        <line
          x1="12"
          y1="15.82"
          x2="12"
          y2="17.73"
          [style.stroke]="color()"
          stroke-linecap="square"
          stroke-miterlimit="10"
          stroke-width="1.91px"
        ></line>
      </g>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DollarCoinIconComponent {
  readonly size = input<number>(48);
  readonly color = input<string>('var(--tw-primary)');
}
