import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-notes-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './notes-layout.component.html',
  styleUrls: ['./notes-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesLayoutComponent {}
