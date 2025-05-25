import { Component, input, effect, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgClass } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { MetaService } from '../../../core/services/meta.service';

@Component({
  selector: 'app-pagelayout',
  imports: [NavbarComponent, NgClass, FooterComponent],
  templateUrl: './pagelayout.component.html',
  styleUrl: './pagelayout.component.scss',
})
export class PagelayoutComponent {
  fullWidth = input(true);
  withFooter = input(false);

  // Meta tag inputs
  pageTitle = input.required<string>();
  pageDescription = input.required<string>();
  pageKeywords = input.required<string>();

  private metaService = inject(MetaService);

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
}
