import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PagelayoutComponent } from '../../components/layout/pagelayout/pagelayout.component';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [PagelayoutComponent, RouterOutlet],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesComponent {}
