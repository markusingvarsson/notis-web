import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { MailIconComponent } from '../../../../components/ui/icons/mail-icon/mail-icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ButtonComponent, MailIconComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {}
