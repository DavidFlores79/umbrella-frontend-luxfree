import { Routes } from '@angular/router';

export const VENDORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./vendor-list/vendor-list.component')
      .then(m => m.VendorListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./vendor-create/vendor-create.component')
      .then(m => m.VendorCreateComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./vendor-create/vendor-create.component')
      .then(m => m.VendorCreateComponent)
  }
];
