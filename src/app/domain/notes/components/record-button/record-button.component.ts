import { Component, computed, input, output } from '@angular/core';
import { RECORDER_STATE, RecorderState } from '../../index';
import { MicrophoneIconComponent } from '../../../../components/ui/icons/microphone-icon/microphone-icon.component';
import { StopIconComponent } from '../../../../components/ui/icons/stop-icon/stop-icon.component';
import { SpinnerIconComponent } from '../../../../components/ui/icons/spinner-icon/spinner-icon.component';

@Component({
  selector: 'app-record-button',
  standalone: true,
  imports: [MicrophoneIconComponent, StopIconComponent, SpinnerIconComponent],
  template: `
    <button
      (click)="buttonClick.emit()"
      [class]="
        'h-16 w-16 rounded-full flex items-center justify-center transition-colors ' +
        buttonClass()
      "
    >
      @switch (state()) { @case (RECORDER_STATE.RECORDING) {
      <app-stop-icon />
      } @case (RECORDER_STATE.STARTING) {
      <app-spinner-icon />
      } @case (RECORDER_STATE.IDLE) {
      <app-microphone-icon />
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
