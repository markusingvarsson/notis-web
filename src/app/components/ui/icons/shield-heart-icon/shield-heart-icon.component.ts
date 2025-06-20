import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-shield-heart-icon',
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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.9976 10.2119C11.2978 9.43279 10.1309 9.22321 9.25414 9.93666C8.37738 10.6501 8.25394 11.843 8.94247 12.6868C9.33119 13.1632 10.2548 13.9983 10.9854 14.6353C11.3319 14.9374 11.5051 15.0884 11.7147 15.1503C11.8934 15.203 12.1018 15.203 12.2805 15.1503C12.4901 15.0884 12.6633 14.9374 13.0098 14.6353C13.7404 13.9983 14.664 13.1632 15.0527 12.6868C15.7413 11.843 15.6329 10.6426 14.7411 9.93666C13.8492 9.23071 12.6974 9.43279 11.9976 10.2119Z"
        [style.stroke]="color()"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
      <path
        d="M11.3586 20.683C11.5639 20.79 11.6666 20.8435 11.809 20.8712C11.92 20.8928 12.08 20.8928 12.191 20.8712C12.3334 20.8435 12.4361 20.79 12.6414 20.683C14.54 19.6937 20 16.4611 20 12V8.21759C20 7.41808 20 7.01833 19.8692 6.6747C19.7537 6.37113 19.566 6.10027 19.3223 5.88552C19.0465 5.64243 18.6722 5.50207 17.9236 5.22134L12.5618 3.21067C12.3539 3.13271 12.25 3.09373 12.143 3.07827C12.0482 3.06457 11.9518 3.06457 11.857 3.07827C11.75 3.09373 11.6461 3.13271 11.4382 3.21067L6.0764 5.22134C5.3278 5.50207 4.9535 5.64243 4.67766 5.88552C4.43398 6.10027 4.24627 6.37113 4.13076 6.6747C4 7.01833 4 7.41808 4 8.21759V12C4 16.4611 9.45996 19.6937 11.3586 20.683Z"
        [style.stroke]="color()"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShieldHeartIconComponent {
  readonly size = input<number>(48);
  readonly color = input<string>('var(--tw-primary)');
}
