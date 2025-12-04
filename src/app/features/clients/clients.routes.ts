import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./client-list/client-list.component')
      .then(m => m.ClientListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./client-create/client-create.component')
      .then(m => m.ClientCreateComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./client-create/client-create.component')
      .then(m => m.ClientCreateComponent)
  }
];
