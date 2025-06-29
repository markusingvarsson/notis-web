import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopSidebarComponent } from '../../components/layout/desktop-sidebar/desktop-sidebar.component';

@Component({
  selector: 'app-notes-layout',
  standalone: true,
  imports: [RouterOutlet, DesktopSidebarComponent],
  templateUrl: './notes-layout.component.html',
  styleUrls: ['./notes-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesLayoutComponent {}
