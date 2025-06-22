import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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

      if (audioInputs.length > 0 && !this.selectedDevice()) {
        this.selectedDevice.set(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error loading devices:', err);
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
  }
}
