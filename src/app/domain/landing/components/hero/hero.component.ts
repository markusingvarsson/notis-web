import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../components/ui/button/button.component';

@Component({
  selector: 'app-hero',
  imports: [ButtonComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {}
