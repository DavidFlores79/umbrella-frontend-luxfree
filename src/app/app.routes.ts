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

  // Fallback route - redirect to login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
