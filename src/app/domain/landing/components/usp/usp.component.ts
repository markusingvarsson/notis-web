import { Component } from '@angular/core';
import { DollarCoinIconComponent } from '../../../../components/ui/icons/dollar-coin-icon/dollar-coin-icon.component';
import { ShieldHeartIconComponent } from '../../../../components/ui/icons/shield-heart-icon/shield-heart-icon.component';
import { GithubLogoIconComponent } from '../../../../components/ui/icons/github-logo-icon/github-logo-icon.component';
import { GithubLinkIconComponent } from '../../../../components/ui/icons/github-link-icon/github-link-icon.component';

@Component({
  selector: 'app-usp',
  standalone: true,
  imports: [
    DollarCoinIconComponent,
    ShieldHeartIconComponent,
    GithubLogoIconComponent,
    GithubLinkIconComponent,
  ],
  templateUrl: './usp.component.html',
  styleUrl: './usp.component.scss',
})
export class UspComponent {}
