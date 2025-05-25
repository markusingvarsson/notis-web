import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  // Navigation links
  navLinks = [
    { title: 'Home', href: '/' },
    { title: 'Notes', href: '/notes' },
    { title: 'About', href: '/about' },
    { title: 'FAQ', href: '/faq' },
  ];
}
