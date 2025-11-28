import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PURCHASES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./purchase-list/purchase-list.component').then(m => m.PurchaseListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./purchase-create/purchase-create.component').then(m => m.PurchaseCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./purchase-create/purchase-create.component').then(m => m.PurchaseCreateComponent),
    canActivate: [authGuard]
  }
];
