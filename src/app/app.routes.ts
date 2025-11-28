import { Routes } from '@angular/router';

export const routes: Routes = [
  // Root redirect to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Authentication routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },

  // Dashboard routes (protected)
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes')
      .then(m => m.DASHBOARD_ROUTES)
  },

  // Companies routes (protected)
  {
    path: 'companies',
    loadChildren: () => import('./features/companies/companies.routes')
      .then(m => m.COMPANIES_ROUTES)
  },

  // Users routes (protected)
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes')
      .then(m => m.USERS_ROUTES)
  },

  // Products routes (protected)
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes')
      .then(m => m.PRODUCTS_ROUTES)
  },

  // Sales routes (protected)
  {
    path: 'sales',
    loadChildren: () => import('./features/sales/sales.routes')
      .then(m => m.SALES_ROUTES)
  },

  // Purchases routes (protected)
  {
    path: 'purchases',
    loadChildren: () => import('./features/purchases/purchases.routes')
      .then(m => m.PURCHASES_ROUTES)
  },

  // Inventory routes (protected)
  {
    path: 'inventory',
    loadChildren: () => import('./features/inventory/inventory.routes')
      .then(m => m.INVENTORY_ROUTES)
  },

  // Fallback route - redirect to login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
