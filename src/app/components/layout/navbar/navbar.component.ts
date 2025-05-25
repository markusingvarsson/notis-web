import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {}
