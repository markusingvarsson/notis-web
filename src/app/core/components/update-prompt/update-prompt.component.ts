import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateAppService } from '../../services/update-app.service';

@Component({
  selector: 'app-update-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update-prompt.component.html',
  styleUrls: ['./update-prompt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePromptComponent {
  protected updateService = inject(UpdateAppService);
}
