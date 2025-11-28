import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./product-create/product-create.component').then(m => m.ProductCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./product-create/product-create.component').then(m => m.ProductCreateComponent),
    canActivate: [authGuard]
  }
];
