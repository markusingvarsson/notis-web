import { Component, inject } from '@angular/core';
import { ToasterService } from './toaster.service';
import { Toast } from './toast.types';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
})
export class ToasterComponent {
  toasterService = inject(ToasterService);
  toasts = this.toasterService.toasts;

  getToastClass(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  }

  // Optional: Add icons based on type
  getToastIcon(toast: Toast): string {
    // This is a placeholder. You can use SVG paths or CSS classes for icons.
    switch (toast.type) {
      case 'success':
        return '✓'; // Checkmark
      case 'error':
        return '✗'; // Cross
      case 'warning':
        return '!'; // Exclamation
      case 'info':
      default:
        return 'i'; // Info
    }
  }

  removeToast(id: string): void {
    this.toasterService.remove(id);
  }
}
