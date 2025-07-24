import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FileTextIconComponent } from '../../ui/icons/file-text-icon/file-text-icon.component';
import { PlusIconComponent } from '../../ui/icons/plus-icon/plus-icon.component';
import { SettingsIconComponent } from '../../ui/icons/settings-icon/settings-icon.component';

interface NavItem {
  icon: 'home' | 'file-text' | 'plus' | 'settings';
  label: string;
  path?: string;
  action?: boolean;
  id: string;
}

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    FileTextIconComponent,
    PlusIconComponent,
    SettingsIconComponent,
  ],
  templateUrl: './mobile-navigation.component.html',
  styleUrls: ['./mobile-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavigationComponent {
  private router = inject(Router);

  navItems: NavItem[] = [
    { icon: 'file-text', label: 'Notes', path: '/notes', id: 'notes' },
    { icon: 'plus', label: 'Add', action: true, id: 'add' },
    { icon: 'settings', label: 'Settings', path: '/settings', id: 'settings' },
  ];

  handleItemClick(item: NavItem) {
    if (item.action) {
      this.router.navigate(['/notes/create'], { queryParams: { CTA: 'true' } });
    } else if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}
