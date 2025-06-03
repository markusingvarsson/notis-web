import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stop-icon',
  standalone: true,
  imports: [],
  template: `
    <svg
      [style.width.px]="size()"
      [style.height.px]="size()"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 30.05 30.05"
      xml:space="preserve"
      [style.fill]="color()"
    >
      <g stroke-width="0"></g>
      <g stroke-linecap="round" stroke-linejoin="round"></g>
      <g>
        <g>
          <path
            d="M18.993,10.688h-7.936c-0.19,0-0.346,0.149-0.346,0.342v8.022c0,0.189,0.155,0.344,0.346,0.344 h7.936c0.19,0,0.344-0.154,0.344-0.344V11.03C19.336,10.838,19.183,10.688,18.993,10.688z"
          ></path>
          <path
            d="M15.026,0C6.729,0,0.001,6.726,0.001,15.025S6.729,30.05,15.026,30.05 c8.298,0,15.023-6.726,15.023-15.025S23.324,0,15.026,0z M15.026,27.54c-6.912,0-12.516-5.604-12.516-12.515 c0-6.914,5.604-12.517,12.516-12.517c6.913,0,12.514,5.603,12.514,12.517C27.54,21.936,21.939,27.54,15.026,27.54z"
          ></path>
        </g>
      </g>
    </svg>
  `,
})
export class StopIconComponent {
  readonly size = input<number>(40);
  readonly color = input<string>('#FFF');
}
