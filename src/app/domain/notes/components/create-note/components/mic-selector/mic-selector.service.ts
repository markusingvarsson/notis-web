import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToasterService } from '../../../../../../components/ui/toaster/toaster.service';

export interface AudioDevice {
  deviceId: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class MicSelectorService {
  #platformId = inject(PLATFORM_ID);

  // Signals
  readonly audioDevices = signal<AudioDevice[]>([]);
  readonly selectedDevice = signal<string>('');
  readonly hasPermission = signal<boolean>(false);
  #toasterService = inject(ToasterService);

  constructor() {
    effect(() => {
      if (this.hasPermission() && this.audioDevices().length > 0) {
        this.initSelectedDevice();
      }
    });
  }

  async initialize(): Promise<void> {
    if (isPlatformBrowser(this.#platformId)) {
      await this.checkPermissionStatus();
      await this.loadAudioDevices();
    }
  }

  async loadAudioDevices(): Promise<void> {
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
    } catch (err) {
      console.error('Error loading devices:', err);
    }
  }

  initSelectedDevice() {
    const selectedDeviceLabel = localStorage.getItem('selectedDeviceLabel');
    const device =
      selectedDeviceLabel &&
      this.audioDevices().find((x) => x.label === selectedDeviceLabel);

    if (device) {
      this.selectedDevice.set(device.deviceId);
    } else if (this.audioDevices().length > 0 && !this.selectedDevice()) {
      this.selectedDevice.set(this.audioDevices()[0].deviceId);
    }
  }

  async checkPermissionStatus(): Promise<void> {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      this.hasPermission.set(permission.state === 'granted');
    } catch {
      // Fallback for browsers without permissions API
      this.hasPermission.set(false);
    }
  }

  async requestPermission(): Promise<void> {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.hasPermission.set(true);
      await this.loadAudioDevices();
    } catch (err) {
      console.error('Permission denied:', err);
    }
  }

  setSelectedDevice(deviceId: string): void {
    this.selectedDevice.set(deviceId);
    const device = this.audioDevices().find((x) => x.deviceId === deviceId);
    if (device) {
      localStorage.setItem('selectedDeviceLabel', device.label);
      this.#toasterService.success('Microphone selected: ' + device.label);
    }
  }
}
