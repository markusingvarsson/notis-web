import { InjectionToken, Signal, inject } from '@angular/core';
import { NotesStorageService } from './notes-storage.service';

export const IS_INITIAL_LOADING = new InjectionToken<Signal<boolean>>(
  'IS_INITIAL_LOADING',
  {
    factory: () => {
      const storageService = inject(NotesStorageService);
      return storageService.getIsInitialLoading();
    },
    providedIn: 'root',
  }
);