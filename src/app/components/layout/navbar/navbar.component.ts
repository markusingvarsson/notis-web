import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaButtonComponent } from '../../ui/cta-button/cta-button.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CtaButtonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {}
