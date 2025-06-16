import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmButtonText = input<string>('Confirm');
  readonly cancelButtonText = input<string>('Cancel');
  readonly confirmButtonVariant = input<'default' | 'destructive'>('default');

  readonly confirm = output<void>();
  readonly cancelModal = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancelModal.emit();
  }
}
