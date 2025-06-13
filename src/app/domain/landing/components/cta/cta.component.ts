// File: src/app/cta/cta.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { MicrophoneIconComponent } from '../../../../components/ui/icons/microphone-icon/microphone-icon.component';

@Component({
  selector: 'app-cta',
  imports: [CommonModule, ButtonComponent, MicrophoneIconComponent],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.scss'],
})
export class CtaComponent {}
