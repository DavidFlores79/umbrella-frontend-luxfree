import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sale-list/sale-list.component').then(m => m.SaleListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./sale-create/sale-create.component').then(m => m.SaleCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./sale-create/sale-create.component').then(m => m.SaleCreateComponent),
    canActivate: [authGuard]
  }
];
