import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home-page/home-page.component').then(
        (mod) => mod.HomePageComponent
      ),
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./pages/notes/notes-layout.component').then(
        (mod) => mod.NotesLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './pages/notes/notes-list-page/notes-list-page.component'
          ).then((mod) => mod.NotesListPageComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './pages/notes/notes-create-page/notes-create-page.component'
          ).then((mod) => mod.NotesCreatePageComponent),
      },
    ],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings-page/settings-page.component').then(
        (mod) => mod.SettingsPageComponent
      ),
  },
];
