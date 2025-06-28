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
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/notes/notes-list/notes-list.component').then(
            (mod) => mod.NotesListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/notes/notes-create/notes-create.component').then(
            (mod) => mod.NotesCreateComponent
          ),
      },
    ],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (mod) => mod.SettingsComponent
      ),
  },
];
