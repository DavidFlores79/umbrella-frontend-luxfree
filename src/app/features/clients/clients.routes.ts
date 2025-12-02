import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./client-list/client-list.component')
      .then(m => m.ClientListComponent)
  }
];
