import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { MicrophoneIconComponent } from '../../../../components/ui/icons/microphone-icon/microphone-icon.component';

@Component({
  selector: 'app-hero',
  imports: [ButtonComponent, MicrophoneIconComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {}
