import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MicrophoneIconComponent } from '../../ui/icons/microphone-icon/microphone-icon.component';
import { FileTextIconComponent } from '../../ui/icons/file-text-icon/file-text-icon.component';
import { PlusIconComponent } from '../../ui/icons/plus-icon/plus-icon.component';
import { SettingsIconComponent } from '../../ui/icons/settings-icon/settings-icon.component';

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MicrophoneIconComponent,
    FileTextIconComponent,
    PlusIconComponent,
    SettingsIconComponent,
  ],
  templateUrl: './desktop-sidebar.component.html',
  styleUrls: ['./desktop-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopSidebarComponent {
  private router = inject(Router);

  onNewNote() {
    this.router.navigate(['/notes/create']);
  }
}
