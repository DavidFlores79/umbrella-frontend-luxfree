import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventory-list/inventory-list.component').then(m => m.InventoryListComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./inventory-detail/inventory-detail.component').then(m => m.InventoryDetailComponent),
    canActivate: [authGuard]
  }
];
