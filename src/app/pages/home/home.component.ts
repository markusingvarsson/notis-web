import { Component } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { HeroComponent } from '../../domain/landing/components/hero/hero.component';
import { UspComponent } from '../../domain/landing/components/usp/usp.component';
import { ContactComponent } from '../../domain/landing/components/contact/contact.component';

@Component({
  selector: 'app-home',
  imports: [PagelayoutComponent, HeroComponent, UspComponent, ContactComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
