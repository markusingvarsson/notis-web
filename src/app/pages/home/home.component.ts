import { Component } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { HeroComponent } from '../../domain/landing/components/hero/hero.component';

@Component({
  selector: 'app-home',
  imports: [PagelayoutComponent, HeroComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
