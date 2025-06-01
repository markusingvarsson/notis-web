import { Component } from '@angular/core';

@Component({
  selector: 'app-microphone-slash-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-mic-off"
    >
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5" />
      <path d="M15 9.88V5a3 3 0 0 0-6 0v2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        width: 24px; /* Default size, can be overridden by parent */
        height: 24px; /* Default size, can be overridden by parent */
      }
      svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class MicrophoneSlashIconComponent {}
