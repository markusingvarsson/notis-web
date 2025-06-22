import {
  Component,
  OnInit,
  output,
  inject,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MicrophoneIconComponent } from '../../../../../../components/ui/icons/microphone-icon/microphone-icon.component';
import { ButtonComponent } from '../../../../../../components/ui/button/button.component';
import { MicSelectorService } from './mic-selector.service';

@Component({
  selector: 'app-mic-selector',
  standalone: true,
  imports: [FormsModule, MicrophoneIconComponent, ButtonComponent],
  template: `
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        @if (micSelectorService.audioDevices().length === 0) {
        <p class="text-[var(--tw-primary-dark)] text-sm">
          Loading microphones...
        </p>
        } @else if (!micSelectorService.hasPermission()) {
        <app-button (buttonClick)="requestPermission()">
          <app-microphone-icon [size]="16" />
          Pick Microphone
        </app-button>
        } @else {
        <div class="space-y-2 w-full">
          <div class="relative">
            <select
              id="mic-select"
              [ngModel]="micSelectorService.selectedDevice()"
              (ngModelChange)="onDeviceChange($event)"
              class="w-full bg-[var(--tw-bg-light)] border border-[var(--tw-border-light)] text-[var(--tw-primary-dark)] rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--tw-primary)] focus:border-transparent appearance-none text-sm"
            >
              @for (device of micSelectorService.audioDevices(); track
              device.deviceId) {
              <option [value]="device.deviceId" class="bg-[var(--tw-bg)]">
                {{ device.label }}
              </option>
              }
            </select>
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <svg
                class="h-4 w-4 text-[var(--tw-primary-dark)]/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 9l6 6 6-6"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MicSelectorComponent implements OnInit {
  #micSelectorService = inject(MicSelectorService);
  get micSelectorService(): MicSelectorService {
    return this.#micSelectorService;
  }

  // Output events
  readonly deviceSelected = output<string>();

  constructor() {
    effect(() => {
      this.deviceSelected.emit(this.#micSelectorService.selectedDevice());
    });
  }

  async ngOnInit() {
    await this.#micSelectorService.initialize();
  }

  async requestPermission() {
    await this.#micSelectorService.requestPermission();
  }

  onDeviceChange(deviceId: string) {
    this.#micSelectorService.setSelectedDevice(deviceId);
  }
}
