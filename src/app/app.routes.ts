import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/home/home.component').then((mod) => mod.HomeComponent),
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./feature/notes/notes.component').then(
        (mod) => mod.NotesComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./feature/about/about.component').then(
        (mod) => mod.AboutComponent
      ),
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./feature/faq/faq.component').then((mod) => mod.FaqComponent),
  },
];
