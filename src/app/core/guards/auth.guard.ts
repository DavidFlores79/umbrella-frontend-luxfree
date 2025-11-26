import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Functional route guard that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page with a returnUrl parameter.
 *
 * @example
 * ```typescript
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 * ```
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      // Redirect to login with return URL
      const returnUrl = state.url;
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl }
      });
    })
  );
};

/**
 * Functional route guard that protects routes for guests only (not authenticated).
 * Redirects authenticated users to the dashboard.
 *
 * @example
 * ```typescript
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [guestGuard]
 * }
 * ```
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }

      // Redirect authenticated users to dashboard
      return router.createUrlTree(['/dashboard']);
    })
  );
};

/**
 * Functional route guard that checks for specific permissions.
 * Factory function that creates a guard for specific permissions.
 *
 * @param requiredPermissions - Array of permission strings required to access the route
 * @returns A CanActivateFn guard function
 *
 * @example
 * ```typescript
 * {
 *   path: 'users',
 *   component: UsersComponent,
 *   canActivate: [authGuard, permissionGuard(['users:read'])]
 * }
 * ```
 */
export const permissionGuard = (requiredPermissions: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser;

    if (!user) {
      return router.createUrlTree(['/auth/login']);
    }

    const hasPermission = requiredPermissions.some(permission =>
      user.permissions.includes(permission as any)
    );

    if (hasPermission) {
      return true;
    }

    // User doesn't have permission - redirect to dashboard with error
    return router.createUrlTree(['/dashboard'], {
      queryParams: { error: 'insufficient_permissions' }
    });
  };
};

/**
 * Functional route guard that checks for specific roles.
 * Factory function that creates a guard for specific roles.
 *
 * @param allowedRoles - Array of role strings allowed to access the route
 * @returns A CanActivateFn guard function
 *
 * @example
 * ```typescript
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, roleGuard(['admin'])]
 * }
 * ```
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser;

    if (!user) {
      return router.createUrlTree(['/auth/login']);
    }

    const hasRole = allowedRoles.includes(user.role);

    if (hasRole) {
      return true;
    }

    // User doesn't have required role - redirect to dashboard
    return router.createUrlTree(['/dashboard'], {
      queryParams: { error: 'insufficient_role' }
    });
  };
};
