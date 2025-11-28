import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./user-create/user-create.component').then(m => m.UserCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./user-create/user-create.component').then(m => m.UserCreateComponent),
    canActivate: [authGuard]
  }
];
