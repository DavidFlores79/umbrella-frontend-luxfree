import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Permission, UserRole, ROLE_PERMISSIONS } from '../../shared/models/user.model';
import { AuthService } from './auth.service';

/**
 * Service for role-based access control (RBAC) and permission checking.
 * Provides methods to check user permissions and roles throughout the application.
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly authService = inject(AuthService);

  /**
   * Checks if the current user has a specific permission.
   *
   * @param permission - The permission to check
   * @returns True if user has the permission, false otherwise
   */
  hasPermission(permission: Permission): boolean {
    const user = this.authService.currentUser;

    if (!user || !user.isActive) {
      return false;
    }

    return user.permissions.includes(permission);
  }

  /**
   * Checks if the current user has any of the specified permissions.
   *
   * @param permissions - Array of permissions to check
   * @returns True if user has at least one permission, false otherwise
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Checks if the current user has all of the specified permissions.
   *
   * @param permissions - Array of permissions to check
   * @returns True if user has all permissions, false otherwise
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Checks if the current user has a specific role.
   *
   * @param role - The role to check
   * @returns True if user has the role, false otherwise
   */
  hasRole(role: UserRole): boolean {
    const user = this.authService.currentUser;

    if (!user || !user.isActive) {
      return false;
    }

    return user.role === role;
  }

  /**
   * Checks if the current user has any of the specified roles.
   *
   * @param roles - Array of roles to check
   * @returns True if user has at least one role, false otherwise
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Checks if the current user is an admin.
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Checks if the current user is a manager or higher (admin or manager).
   */
  isManager(): boolean {
    return this.hasAnyRole(['admin', 'manager']);
  }

  /**
   * Gets all permissions for a specific role.
   *
   * @param role - The role to get permissions for
   * @returns Array of permissions for the role
   */
  getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role];
  }

  /**
   * Gets the current user's role as an observable.
   */
  get currentRole$(): Observable<UserRole | null> {
    return this.authService.user$.pipe(
      map(user => user?.role ?? null)
    );
  }

  /**
   * Gets the current user's permissions as an observable.
   */
  get currentPermissions$(): Observable<Permission[]> {
    return this.authService.user$.pipe(
      map(user => user?.permissions ?? [])
    );
  }

  /**
   * Creates an observable that emits whether the user has a specific permission.
   *
   * @param permission - The permission to check
   * @returns Observable that emits true if user has permission, false otherwise
   */
  hasPermission$(permission: Permission): Observable<boolean> {
    return this.currentPermissions$.pipe(
      map(permissions => permissions.includes(permission))
    );
  }

  /**
   * Creates an observable that emits whether the user has a specific role.
   *
   * @param role - The role to check
   * @returns Observable that emits true if user has role, false otherwise
   */
  hasRole$(role: UserRole): Observable<boolean> {
    return this.currentRole$.pipe(
      map(currentRole => currentRole === role)
    );
  }

  /**
   * Checks if user can perform CRUD operations on a specific resource.
   */
  canRead(resource: string): boolean {
    return this.hasPermission(`${resource}:read` as Permission);
  }

  canWrite(resource: string): boolean {
    return this.hasPermission(`${resource}:write` as Permission);
  }

  canDelete(resource: string): boolean {
    return this.hasPermission(`${resource}:delete` as Permission);
  }

  /**
   * Gets a human-readable label for a role.
   */
  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      user: 'User'
    };

    return labels[role];
  }

  /**
   * Gets a color class for a role badge.
   */
  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      admin: 'badge-error',
      manager: 'badge-warning',
      user: 'badge-info'
    };

    return colors[role];
  }

  /**
   * Validates if a user can access a specific route based on required permissions.
   *
   * @param requiredPermissions - Permissions required to access the route
   * @returns True if user has access, false otherwise
   */
  canAccessRoute(requiredPermissions: Permission[]): boolean {
    if (requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    return this.hasAnyPermission(requiredPermissions);
  }
}
