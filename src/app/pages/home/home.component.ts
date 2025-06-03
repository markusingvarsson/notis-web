import { Component } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { HeroComponent } from '../../domain/landing/components/hero/hero.component';
import { UspComponent } from '../../domain/landing/components/usp/usp.component';

@Component({
  selector: 'app-home',
  imports: [PagelayoutComponent, HeroComponent, UspComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
