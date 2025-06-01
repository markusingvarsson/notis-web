import { Component, inject } from '@angular/core';
import { ToasterService } from './toaster.service';
import { Toast } from './toast.types';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
})
export class ToasterComponent {
  toasterService = inject(ToasterService);
  toasts = this.toasterService.toasts;

  getToastClass(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
      default:
        return 'toast-info';
    }
  }

  removeToast(id: string): void {
    this.toasterService.remove(id);
  }
}
