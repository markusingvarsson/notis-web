import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RECORDER_STATE, RecorderState } from '../../../../index';
import { MicrophoneIconComponent } from '../../../../../../components/ui/icons/microphone-icon/microphone-icon.component';
import { StopIconComponent } from '../../../../../../components/ui/icons/stop-icon/stop-icon.component';
import { SpinnerIconComponent } from '../../../../../../components/ui/icons/spinner-icon/spinner-icon.component';
import { MicrophoneSlashIconComponent } from '../../../../../../components/ui/icons/microphone-slash-icon/microphone-slash-icon.component';

@Component({
  selector: 'app-record-button',
  standalone: true,
  imports: [
    MicrophoneIconComponent,
    StopIconComponent,
    SpinnerIconComponent,
    MicrophoneSlashIconComponent,
  ],
  template: `
    <button
      (click)="buttonClick.emit()"
      [class]="
        'h-16 w-16 rounded-full flex items-center justify-center transition-colors ' +
        buttonClass()
      "
      [disabled]="state() === RECORDER_STATE.BLOCKED"
      [attr.aria-disabled]="state() === RECORDER_STATE.BLOCKED ? 'true' : null"
      [attr.aria-label]="ariaLabelInput()"
    >
      @switch (state()) { @case (RECORDER_STATE.RECORDING) {
      <app-stop-icon />
      } @case (RECORDER_STATE.STARTING) {
      <app-spinner-icon />
      } @case (RECORDER_STATE.IDLE) {
      <app-microphone-icon />
      } @case (RECORDER_STATE.BLOCKED) {
      <app-microphone-slash-icon />
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordButtonComponent {
  readonly state = input.required<RecorderState>();
  readonly buttonClick = output<void>();
  readonly RECORDER_STATE = RECORDER_STATE;
  readonly ariaLabelInput = input<string>('Record audio'); // Default value

  readonly buttonClass = computed(() => {
    const s = this.state();
    switch (s) {
      case RECORDER_STATE.RECORDING:
        return 'bg-red-500 hover:bg-red-600 animate-pulse hover:cursor-pointer';
      case RECORDER_STATE.STARTING:
        return 'bg-[var(--tw-primary)] hover:bg-[var(--tw-primary)] hover:cursor-wait';
      case RECORDER_STATE.IDLE:
        return 'bg-[var(--tw-primary)] hover:bg-[var(--tw-primary-light)] hover:cursor-pointer';
      case RECORDER_STATE.BLOCKED:
        return 'bg-gray-400 text-gray-700 cursor-not-allowed';
      // No default case needed if all union members are covered
    }
    // This part should not be reached if all union members are covered
    return ''; // Fallback, should ideally be unreachable if switch is exhaustive
  });
}
