export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastState = 'entering' | 'visible' | 'leaving';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  state?: ToastState;
}
