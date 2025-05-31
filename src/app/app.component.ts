import { RouterOutlet } from '@angular/router';
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private swUpdate = inject(SwUpdate);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  readonly showUpdatePrompt = signal(false);
  private newVersionAvailable = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.swUpdate.isEnabled) {
        console.log('Service Worker is enabled. Setting up update listener...');

        this.swUpdate.versionUpdates
          .pipe(
            filter(
              (evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'
            ),
            takeUntil(this.destroy$)
          )
          .subscribe(() => {
            console.log('New app version is available and ready to install.');
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

  private handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      console.log(
        'Page restored from BF Cache. Checking for Service Worker updates.'
      );
      this.checkForUpdatesBFCache();
    }
  };

  private checkForUpdatesInitial(): void {
    this.swUpdate
      .checkForUpdate()
      .then((updateFound) => {
        if (updateFound) {
          console.log('Service Worker: Initial check found an update.');
        } else {
          console.log('Service Worker: Initial check found no updates.');
        }
      })
      .catch((err) => {
        console.error(
          'Service Worker: Failed to initiate initial update check:',
          err
        );
      });
  }

  private checkForUpdatesBFCache(): void {
    this.swUpdate
      .checkForUpdate()
      .then((updateFound) => {
        if (updateFound) {
          console.log('Service Worker: BF Cache check found an update.');
          if (!this.newVersionAvailable) {
            this.newVersionAvailable = true;
            this.promptUserForUpdate();
          } else {
            if (!this.showUpdatePrompt()) {
              this.promptUserForUpdate();
            }
          }
        } else {
          console.log('Service Worker: BF Cache check found no new updates.');
        }
      })
      .catch((err) => {
        console.error(
          'Service Worker: Failed to check for updates after BF Cache restoration:',
          err
        );
      });
  }

  private promptUserForUpdate(): void {
    this.showUpdatePrompt.set(true);
    console.log('Update prompt should be visible now.');
  }

  handleUpdate(): void {
    this.showUpdatePrompt.set(false);
    this.activateNewVersion();
  }

  dismissUpdate(): void {
    this.showUpdatePrompt.set(false);
    console.log('User dismissed the update prompt.');
  }

  private activateNewVersion(): void {
    this.swUpdate
      .activateUpdate()
      .then(() => {
        console.log('New Service Worker activated. Reloading page...');
        if (isPlatformBrowser(this.platformId)) {
          document.location.reload();
        }
      })
      .catch((err) => {
        console.error('Failed to activate new Service Worker:', err);
        if (isPlatformBrowser(this.platformId)) {
          document.location.reload();
        }
      });
  }
}
