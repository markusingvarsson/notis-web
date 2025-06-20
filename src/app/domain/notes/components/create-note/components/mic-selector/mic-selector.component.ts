import {
  Component,
  OnInit,
  signal,
  output,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AudioDevice {
  deviceId: string;
  label: string;
}

@Component({
  selector: 'app-mic-selector',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        @if (audioDevices().length === 0) {
        <p class="text-[var(--tw-primary-dark)] text-sm">
          Loading microphones...
        </p>
        } @else {
        <div class="space-y-2 w-full">
          <div class="relative">
            <select
              id="mic-select"
              [ngModel]="selectedDevice()"
              (ngModelChange)="onDeviceChange($event)"
              class="w-full bg-[var(--tw-bg-light)] border border-[var(--tw-border-light)] text-[var(--tw-primary-dark)] rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--tw-primary)] focus:border-transparent appearance-none text-sm"
            >
              @for (device of audioDevices(); track device.deviceId) {
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
})
export class MicSelectorComponent implements OnInit {
  #platformId = inject(PLATFORM_ID);

  // Signals
  audioDevices = signal<AudioDevice[]>([]);
  selectedDevice = signal<string>('');

  // Output events
  readonly deviceSelected = output<string>();

  ngOnInit() {
    if (isPlatformBrowser(this.#platformId)) {
      this.loadAudioDevices();
    }
  }

  async loadAudioDevices() {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
        }));

      this.audioDevices.set(audioInputs);

      if (audioInputs.length > 0 && !this.selectedDevice()) {
        this.setSelectedDevice(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error loading devices:', err);
    }
  }

  onDeviceChange(deviceId: string) {
    this.setSelectedDevice(deviceId);
  }

  setSelectedDevice(deviceId: string) {
    this.selectedDevice.set(deviceId);
    this.deviceSelected.emit(deviceId);
  }
}
