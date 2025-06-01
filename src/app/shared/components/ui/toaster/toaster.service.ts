import { Injectable, signal } from '@angular/core';
import { Toast, ToastType, ToastState } from './toast.types';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  readonly toasts = signal<Toast[]>([]);
  private defaultDuration = 5000; // Default duration in ms
  private animationDuration = 300; // ms, should match CSS animation time

  show(message: string, type: ToastType = 'info', duration?: number): void {
    const id = this.generateId();
    const newToast: Toast = {
      id,
      message,
      type,
      duration: duration ?? this.defaultDuration,
      state: 'entering',
    };

    this.toasts.update((currentToasts) => [...currentToasts, newToast]);

    // Transition to visible state shortly after creation to trigger animation
    setTimeout(() => {
      this.updateToastState(id, 'visible');
    }, 50); // Small delay to allow initial render in 'entering' state

    // Schedule removal if a duration is set
    if (newToast.duration) {
      setTimeout(
        () => this.remove(id),
        newToast.duration + this.animationDuration
      );
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    this.updateToastState(id, 'leaving');
    // Actual removal from the array is delayed to allow for the 'leaving' animation
    setTimeout(() => {
      this.toasts.update((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, this.animationDuration);
  }

  clearAll(): void {
    this.toasts.update((currentToasts) => {
      return currentToasts.map((toast) => ({
        ...toast,
        state: 'leaving' as ToastState,
      }));
    });
    setTimeout(() => {
      this.toasts.set([]);
    }, this.animationDuration);
  }

  private updateToastState(id: string, state: ToastState): void {
    this.toasts.update((currentToasts) =>
      currentToasts.map((toast) =>
        toast.id === id ? { ...toast, state } : toast
      )
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
