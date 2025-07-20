import {
  Component,
  input,
  effect,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgClass } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { MobileNavigationComponent } from '../mobile-navigation/mobile-navigation.component';
import { MetaService } from '../../../core/services/meta.service';

@Component({
  selector: 'app-pagelayout',
  imports: [
    NavbarComponent,
    NgClass,
    FooterComponent,
    MobileNavigationComponent,
  ],
  templateUrl: './pagelayout.component.html',
  styleUrl: './pagelayout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagelayoutComponent {
  fullWidth = input(true);
  withFooter = input(false);
  withNavbar = input(true);
  fixedNavbar = input(true);
  withMobileNav = input(true);

  // Meta tag inputs
  pageTitle = input.required<string>();
  pageDescription = input.required<string>();
  pageKeywords = input.required<string>();

  private metaService = inject(MetaService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.pageTitle() || this.pageDescription() || this.pageKeywords()) {
        this.metaService.updateMetaTags({
          title: this.pageTitle(),
          description: this.pageDescription(),
          keywords: this.pageKeywords(),
          ogTitle: this.pageTitle(),
          ogDescription: this.pageDescription(),
          twitterTitle: this.pageTitle(),
          twitterDescription: this.pageDescription(),
        });
      }
    });
  }

  onNewNote() {
    this.router.navigate(['/notes/create']);
  }
}
