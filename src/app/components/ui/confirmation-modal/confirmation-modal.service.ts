import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  inject,
  ViewRef,
} from '@angular/core';
import { ConfirmationModalComponent } from './confirmation-modal.component';

export interface ConfirmationModalOptions {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'default' | 'destructive';
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  open(options: ConfirmationModalOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const componentRef = createComponent(ConfirmationModalComponent, {
        environmentInjector: this.injector,
      });

      // Set inputs
      componentRef.setInput('title', options.title);
      componentRef.setInput('message', options.message);
      componentRef.setInput(
        'confirmButtonText',
        options.confirmButtonText ?? 'Confirm'
      );
      componentRef.setInput(
        'cancelButtonText',
        options.cancelButtonText ?? 'Cancel'
      );
      componentRef.setInput(
        'confirmButtonVariant',
        options.confirmButtonVariant ?? 'default'
      );

      // Attach to view so it's part of change detection
      this.appRef.attachView(componentRef.hostView);

      // Get DOM element and attach to body
      const domElem = (componentRef.hostView as ViewRef & { rootNodes: Node[] })
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);

      const cleanup = () => {
        confirmSub.unsubscribe();
        cancelSub.unsubscribe();
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      };

      const confirmSub = componentRef.instance.confirm.subscribe(() => {
        resolve(true);
        cleanup();
      });

      const cancelSub = componentRef.instance.cancelModal.subscribe(() => {
        resolve(false);
        cleanup();
      });
    });
  }
}
