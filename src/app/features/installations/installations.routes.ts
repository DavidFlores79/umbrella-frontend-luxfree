import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

/**
 * Installation routes for managing installation projects
 * (solar panels, street lighting, etc.)
 */
export const INSTALLATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./installation-list/installation-list')
      .then(m => m.InstallationList),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./installation-create/installation-create')
      .then(m => m.InstallationCreate),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./installation-detail/installation-detail')
      .then(m => m.InstallationDetail),
    canActivate: [authGuard]
  }
];
