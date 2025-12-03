/**
 * User entity with role-based access control.
 */
export interface User {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User roles with hierarchical permissions.
 * - admin: Full access to all features
 * - manager: Access to most features, cannot manage users
 * - user: Limited access, read-only for most features
 */
export type UserRole = 'admin' | 'manager' | 'user';

/**
 * Granular permissions for fine-grained access control.
 */
export type Permission =
  // Company management
  | 'companies:read'
  | 'companies:write'
  | 'companies:delete'
  // User management
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  // Product management
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  // Sales management
  | 'sales:read'
  | 'sales:write'
  | 'sales:delete'
  // Purchase management
  | 'purchases:read'
  | 'purchases:write'
  | 'purchases:delete'
  // Inventory management
  | 'inventory:read'
  | 'inventory:write'
  | 'inventory:delete'
  // Reports
  | 'reports:read'
  | 'reports:export'
  // Dashboard
  | 'dashboard:read';

/**
 * Role to permissions mapping.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'companies:read', 'companies:write', 'companies:delete',
    'users:read', 'users:write', 'users:delete',
    'products:read', 'products:write', 'products:delete',
    'sales:read', 'sales:write', 'sales:delete',
    'purchases:read', 'purchases:write', 'purchases:delete',
    'inventory:read', 'inventory:write', 'inventory:delete',
    'reports:read', 'reports:export',
    'dashboard:read'
  ],
  manager: [
    'companies:read',
    'users:read',
    'products:read', 'products:write', 'products:delete',
    'sales:read', 'sales:write', 'sales:delete',
    'purchases:read', 'purchases:write', 'purchases:delete',
    'inventory:read', 'inventory:write', 'inventory:delete',
    'reports:read', 'reports:export',
    'dashboard:read'
  ],
  user: [
    'companies:read',
    'users:read',
    'products:read',
    'sales:read',
    'purchases:read',
    'inventory:read',
    'reports:read',
    'dashboard:read'
  ]
};

/**
 * Authentication credentials.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data for new user.
 */
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyCountry: string;
  companyPostalCode: string;
  companyTaxId: string;
}

/**
 * Authentication response with token and user info.
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * DTO for creating a new user.
 */
export interface CreateUserDto {
  companyId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
}

/**
 * DTO for updating an existing user.
 */
export interface UpdateUserDto {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  companyId?: string;
  isActive?: boolean;
}
