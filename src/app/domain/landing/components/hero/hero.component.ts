import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaButtonComponent } from '../../../../components/ui/cta-button/cta-button.component';

@Component({
  selector: 'app-hero',
  imports: [CtaButtonComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {}
