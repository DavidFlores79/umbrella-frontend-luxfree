import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./company-list/company-list.component')
      .then(m => m.CompanyListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./company-create/company-create.component')
      .then(m => m.CompanyCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./company-create/company-create.component')
      .then(m => m.CompanyCreateComponent),
    canActivate: [authGuard]
  }
];
