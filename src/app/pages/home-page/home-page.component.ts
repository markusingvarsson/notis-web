import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';
import { HeroComponent } from '../../domain/landing/components/hero/hero.component';
import { UspComponent } from '../../domain/landing/components/usp/usp.component';
import { ContactComponent } from '../../domain/landing/components/contact/contact.component';
import { CtaComponent } from '../../domain/landing/components/cta/cta.component';

@Component({
  selector: 'app-home-page',
  imports: [
    PagelayoutComponent,
    HeroComponent,
    UspComponent,
    ContactComponent,
    CtaComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
