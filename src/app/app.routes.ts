import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((mod) => mod.HomeComponent),
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./pages/notes/notes.component').then((mod) => mod.NotesComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (mod) => mod.SettingsComponent
      ),
  },
];
