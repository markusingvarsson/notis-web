import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  inject,
  ViewRef,
} from '@angular/core';
import { WhisperDownloadModalComponent } from './whisper-download-modal.component';

export type WhisperDownloadModalAction =
  | 'download-and-record'
  | 'record-without-transcription'
  | 'switch-provider'
  | 'cancel';

@Injectable({
  providedIn: 'root',
})
export class WhisperDownloadModalService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  open(): Promise<WhisperDownloadModalAction> {
    return new Promise<WhisperDownloadModalAction>((resolve) => {
      const componentRef = createComponent(WhisperDownloadModalComponent, {
        environmentInjector: this.injector,
      });

      // Attach to view so it's part of change detection
      this.appRef.attachView(componentRef.hostView);

      // Get DOM element and attach to body
      const domElem = (componentRef.hostView as ViewRef & { rootNodes: Node[] })
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);

      const cleanup = () => {
        actionSub.unsubscribe();
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      };

      const actionSub = componentRef.instance.action.subscribe((action) => {
        resolve(action);
        cleanup();
      });
    });
  }
}
