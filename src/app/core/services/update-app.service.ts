import {
  Injectable,
  signal,
  inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UpdateAppService implements OnDestroy {
  private swUpdate = inject(SwUpdate);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  readonly showUpdatePrompt = signal(false);
  private newVersionAvailable = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.swUpdate.isEnabled) {
        console.log(
          'Service Worker is enabled. Setting up update listener in service...'
        );

        this.swUpdate.versionUpdates
          .pipe(
            filter(
              (evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'
            ),
            takeUntil(this.destroy$)
          )
          .subscribe(() => {
            console.log(
              'New app version is available and ready to install (from service).'
            );
            this.newVersionAvailable = true;
            this.promptUserForUpdate();
          });

        window.addEventListener('pageshow', this.handlePageShow);
        this.checkForUpdatesInitial();
      } else {
        console.log(
          'Service Worker is not enabled (e.g., development mode or browser not supported).'
        );
      }
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('pageshow', this.handlePageShow);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handlePageShow = (event: PageTransitionEvent): void => {
    if (event.persisted) {
      console.log(
        'Page restored from BF Cache. Checking for Service Worker updates (from service).'
      );
      this.checkForUpdatesBFCache();
    }
  };

  private checkForUpdatesInitial(): void {
    this.swUpdate
      .checkForUpdate()
      .then((updateFound) => {
        if (updateFound) {
          console.log(
            'Service Worker: Initial check found an update (from service).'
          );
        } else {
          console.log(
            'Service Worker: Initial check found no updates (from service).'
          );
        }
      })
      .catch((err) => {
        console.error(
          'Service Worker: Failed to initiate initial update check (from service):',
          err
        );
      });
  }

  private checkForUpdatesBFCache(): void {
    this.swUpdate
      .checkForUpdate()
      .then((updateFound) => {
        if (updateFound) {
          console.log(
            'Service Worker: BF Cache check found an update (from service).'
          );
          if (!this.newVersionAvailable) {
            this.newVersionAvailable = true;
            this.promptUserForUpdate();
          } else {
            if (!this.showUpdatePrompt()) {
              this.promptUserForUpdate();
            }
          }
        } else {
          console.log(
            'Service Worker: BF Cache check found no new updates (from service).'
          );
        }
      })
      .catch((err) => {
        console.error(
          'Service Worker: Failed to check for updates after BF Cache restoration (from service):',
          err
        );
      });
  }

  private promptUserForUpdate(): void {
    this.showUpdatePrompt.set(true);
    console.log('Update prompt should be visible now (from service).');
  }

  handleUpdate(): void {
    this.showUpdatePrompt.set(false);
    this.activateNewVersion();
  }

  dismissUpdate(): void {
    this.showUpdatePrompt.set(false);
    console.log('User dismissed the update prompt (from service).');
  }

  private activateNewVersion(): void {
    this.swUpdate
      .activateUpdate()
      .then(() => {
        console.log(
          'New Service Worker activated. Reloading page (from service)...'
        );
        if (isPlatformBrowser(this.platformId)) {
          document.location.reload();
        }
      })
      .catch((err) => {
        console.error(
          'Failed to activate new Service Worker (from service):',
          err
        );
        // Attempt to reload even if activation fails, as the new version might be pending.
        if (isPlatformBrowser(this.platformId)) {
          document.location.reload();
        }
      });
  }
}
