import { Component, input } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgClass } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-pagelayout',
  imports: [NavbarComponent, NgClass, FooterComponent],
  templateUrl: './pagelayout.component.html',
  styleUrl: './pagelayout.component.scss',
})
export class PagelayoutComponent {
  fullWidth = input(true);
  withFooter = input(false);
}
