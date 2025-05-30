import { Component, computed, input, output } from '@angular/core';
import { RECORDER_STATE, RecorderState } from '../../index';

@Component({
  selector: 'app-record-button',
  standalone: true,
  imports: [],
  template: `
    <button
      (click)="buttonClick.emit()"
      [class]="
        'h-16 w-16 rounded-full flex items-center justify-center transition-colors ' +
        buttonClass()
      "
    >
      @switch (state()) { @case (RECORDER_STATE.RECORDING) {
      <svg
        class="h-10 w-10"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 30.05 30.05"
        xml:space="preserve"
        fill="#FFF"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <g>
            <path
              style="fill: #fff"
              d="M18.993,10.688h-7.936c-0.19,0-0.346,0.149-0.346,0.342v8.022c0,0.189,0.155,0.344,0.346,0.344 h7.936c0.19,0,0.344-0.154,0.344-0.344V11.03C19.336,10.838,19.183,10.688,18.993,10.688z"
            ></path>
            <path
              style="fill: #fff"
              d="M15.026,0C6.729,0,0.001,6.726,0.001,15.025S6.729,30.05,15.026,30.05 c8.298,0,15.023-6.726,15.023-15.025S23.324,0,15.026,0z M15.026,27.54c-6.912,0-12.516-5.604-12.516-12.515 c0-6.914,5.604-12.517,12.516-12.517c6.913,0,12.514,5.603,12.514,12.517C27.54,21.936,21.939,27.54,15.026,27.54z"
            ></path>
          </g>
        </g>
      </svg>
      } @case (RECORDER_STATE.STARTING) {
      <svg
        class="h-8 w-8 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      } @case (RECORDER_STATE.IDLE) {
      <svg
        class="h-8 w-8"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z"
            stroke="#FFF"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </g>
      </svg>
      } }
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class RecordButtonComponent {
  readonly state = input.required<RecorderState>();
  readonly buttonClick = output<void>();
  readonly RECORDER_STATE = RECORDER_STATE;

  readonly buttonClass = computed(() => {
    const state = this.state();
    switch (state) {
      case RECORDER_STATE.RECORDING:
        return 'bg-red-500 hover:bg-red-600 animate-pulse';
      case RECORDER_STATE.STARTING:
        return 'bg-[var(--tw-primary)] hover:bg-[var(--tw-primary)] cursor-wait';
      case RECORDER_STATE.IDLE:
        return 'bg-[var(--tw-primary)] hover:bg-[var(--tw-primary-light)]';
    }
    const _exhaustiveCheck: never = state;
    return _exhaustiveCheck;
  });
}
