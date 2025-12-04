import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { User } from '../../../shared/models/user.model';
import { tap, catchError, distinctUntilChanged, skip, filter, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsersStore extends StoreBase<UsersState> {
  private readonly mockApi = inject(MockApiService);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  // Selectors
  readonly users$ = this.select(state => state.users);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedUser$ = this.select(state => state.selectedUser);

  constructor() {
    super({
      users: [],
      loading: false,
      error: null,
      selectedUser: null
    });

    // Auto-reload users when company changes
    this.setupCompanyChangeReload();
  }

  /**
   * Gets the company ID for filtering users based on user role.
   */
  private getCompanyIdForFiltering(): string | undefined {
    const isAdmin = this.permissions.isAdmin();
    const companyId = isAdmin ? undefined : (this.companyContext.currentCompanyId ?? undefined);

    console.log('🎯 [UsersStore] getCompanyIdForFiltering:', {
      isAdmin,
      currentCompanyId: this.companyContext.currentCompanyId,
      returnValue: companyId
    });

    return companyId;
  }

  /**
   * Sets up automatic reload when company context changes.
   * Only reloads for non-admin users, as admins always see all companies' data.
   */
  private setupCompanyChangeReload(): void {
    // Admins see all companies' data, so don't reload on company context changes
    if (this.permissions.isAdmin()) {
      return;
    }

    this.companyContext.currentCompany$.pipe(
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
      skip(1) // Skip initial value to avoid double-loading
    ).subscribe(() => {
      this.loadUsers();
    });
  }

  loadUsers(): void {
    console.log('🔍 [UsersStore] Loading users...');
    console.log('  - Is Admin:', this.permissions.isAdmin());
    console.log('  - Current Company ID from context (initial):', this.companyContext.currentCompanyId);

    this.patchState({ loading: true, error: null });

    // Wait for company context to be ready before loading users
    // This prevents loading all users when company context is still initializing
    if (this.permissions.isAdmin()) {
      // Admins can load immediately without waiting for company context
      this.loadUsersData();
    } else {
      // Non-admins must wait for company context to be set
      this.companyContext.currentCompany$.pipe(
        filter(company => company !== null), // Wait until company is set
        take(1) // Take the first non-null value and complete
      ).subscribe(() => {
        this.loadUsersData();
      });
    }
  }

  private loadUsersData(): void {
    const companyId = this.getCompanyIdForFiltering();
    console.log('  - Company ID filter (after context ready):', companyId);

    this.mockApi.getUsers(companyId).pipe(
      tap(users => {
        console.log('  - Users loaded:', users.length);
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        console.error('  - Error loading users:', err);
        this.patchState({
          error: err.message || 'Failed to load users',
          loading: false
        });
        return of([]);
      })
    ).subscribe();
  }

  createUser(user: Partial<User>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createUser(user as any).pipe(
      tap(newUser => {
        const users = [...this.currentState.users, newUser];
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create user',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updateUser(id: string, updates: Partial<User>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updateUser(updateDto as any).pipe(
      tap(updatedUser => {
        const users = this.currentState.users.map((u: User) =>
          u.id === id ? updatedUser : u
        );
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update user',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deleteUser(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deleteUser(id).pipe(
      tap(() => {
        const users = this.currentState.users.filter((u: User) => u.id !== id);
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete user',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectUser(id: string): void {
    const user = this.currentState.users.find((u: User) => u.id === id);
    this.patchState({ selectedUser: user || null });
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
