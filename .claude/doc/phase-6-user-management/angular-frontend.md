# Phase 6: User Management - Angular Frontend Implementation Plan

## Overview

This document provides a detailed implementation plan for Phase 6: User Management feature following the EXACT pattern established in Phase 5 (Company Management). The implementation uses Angular 20 standalone components, RxJS-based state management (NO Signals), and follows Clean Architecture principles.

**Reference Implementation**: `src/app/features/companies/`

## Architecture Overview

```
src/app/features/users/
├── services/
│   └── users.store.ts                  # RxJS state store
├── user-list/
│   ├── user-list.component.ts          # List view component
│   └── user-list.component.html        # List view template
├── user-create/
│   ├── user-create.component.ts        # Create/Edit component
│   └── user-create.component.html      # Create/Edit template
└── users.routes.ts                     # Feature routing
```

## Files to Create

### 1. UsersStore - `src/app/features/users/services/users.store.ts`

**Purpose**: RxJS-based state management for users feature

**Pattern**: Copy from `src/app/features/companies/services/companies.store.ts`

**State Interface**:
```typescript
interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}
```

**Implementation Details**:

```typescript
import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { User, CreateUserDto, UpdateUserDto } from '../../../shared/models/user.model';
import { tap, catchError } from 'rxjs/operators';
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
  }

  loadUsers(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getUsers().pipe(
      tap(users => {
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load users',
          loading: false
        });
        return of([]);
      })
    ).subscribe();
  }

  createUser(user: CreateUserDto): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createUser(user).pipe(
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

    const updateDto: UpdateUserDto = { id, ...updates };
    this.mockApi.updateUser(updateDto).pipe(
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
```

**Key Points**:
- Extends `StoreBase<UsersState>` from `core/services/store-base.service.ts`
- Uses `inject()` for MockApiService dependency injection
- All methods return `void` - state updates happen via `patchState()`
- Error handling with `catchError` and error state updates
- Uses `MockApiService` methods: `getUsers()`, `createUser()`, `updateUser()`, `deleteUser()`

---

### 2. UserListComponent - `src/app/features/users/user-list/`

**Purpose**: Display paginated list of users with search, edit, and delete functionality

**Pattern**: Copy from `src/app/features/companies/company-list/`

#### Component TypeScript - `user-list.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsersStore } from '../services/users.store';
import { DataTable } from '../../../shared/components/data/data-table/data-table';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { User } from '../../../shared/models/user.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTable,
    SearchBar,
    Card,
    Button,
    Badge,
    Alert,
    EmptyState,
    DateFormatPipe
  ],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private readonly store = inject(UsersStore);
  private readonly router = inject(Router);

  readonly users$ = this.store.users$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  searchTerm = '';

  readonly filteredUsers$ = this.users$.pipe(
    map(users => {
      if (!this.searchTerm) {
        return users;
      }
      const term = this.searchTerm.toLowerCase();
      return users.filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term)
      );
    })
  );

  readonly columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  ngOnInit(): void {
    this.store.loadUsers();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onCreate(): void {
    this.router.navigate(['/users/create']);
  }

  onEdit(user: User): void {
    this.router.navigate(['/users/edit', user.id]);
  }

  onDelete(user: User): void {
    const fullName = `${user.firstName} ${user.lastName}`;
    if (confirm(`Are you sure you want to delete "${fullName}"?`)) {
      this.store.deleteUser(user.id);
    }
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStatusBadgeVariant(isActive: boolean): 'success' | 'warning' | 'error' | 'info' {
    return isActive ? 'success' : 'warning';
  }

  getRoleBadgeVariant(role: string): 'success' | 'warning' | 'error' | 'info' {
    switch (role) {
      case 'admin':
        return 'success';  // Green
      case 'manager':
        return 'info';     // Blue
      case 'user':
        return 'warning';  // Yellow
      default:
        return 'info';
    }
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
```

**Key Points**:
- Uses `inject()` for dependency injection
- Implements client-side search filtering with RxJS `map` operator
- No manual subscriptions - uses `async` pipe in template
- Role badge colors: admin=success (green), manager=info (blue), user=warning (yellow)
- Confirmation dialog for delete operation
- Display columns: Name, Email, Role, Company, Status, Created Date, Actions

#### Component Template - `user-list.component.html`

```html
<div class="p-6">
  <!-- Header -->
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold text-text">Users</h1>
      <p class="mt-1 text-sm text-text-light">Manage user accounts and permissions</p>
    </div>
    <app-button variant="primary" (click)="onCreate()">
      <span class="mr-2">+</span>
      Create User
    </app-button>
  </div>

  <!-- Error Alert -->
  <app-alert
    *ngIf="error$ | async as error"
    type="error"
    [dismissible]="true"
    (dismissed)="dismissError()"
    class="mb-6"
  >
    {{ error }}
  </app-alert>

  <!-- Search Bar -->
  <div class="mb-6">
    <app-search-bar
      placeholder="Search users by name, email, or phone..."
      (searchChange)="onSearch($event)"
    ></app-search-bar>
  </div>

  <!-- Users Table -->
  <app-card [loading]="(loading$ | async) || false">
    <div *ngIf="(filteredUsers$ | async) as users; else loading">
      <div *ngIf="users.length > 0; else empty">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let user of users" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-text">{{ getFullName(user) }}</div>
                      <div class="text-sm text-text-light">{{ user.phone || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-badge [variant]="getRoleBadgeVariant(user.role)">
                    {{ user.role | uppercase }}
                  </app-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-badge [variant]="getStatusBadgeVariant(user.isActive)">
                    {{ user.isActive ? 'ACTIVE' : 'INACTIVE' }}
                  </app-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ user.createdAt | appDateFormat }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    (click)="onEdit(user)"
                    class="text-primary hover:text-primary-700 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    (click)="onDelete(user)"
                    class="text-accent-red hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4">
          <div
            *ngFor="let user of users"
            class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-medium text-text">{{ getFullName(user) }}</h3>
                <p class="text-sm text-text-light mt-1">{{ user.email }}</p>
              </div>
              <div class="flex gap-2">
                <app-badge [variant]="getStatusBadgeVariant(user.isActive)">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </app-badge>
              </div>
            </div>

            <div class="space-y-2 mb-3">
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Phone:</span>
                <span class="text-text">{{ user.phone || 'N/A' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Role:</span>
                <app-badge [variant]="getRoleBadgeVariant(user.role)">
                  {{ user.role | uppercase }}
                </app-badge>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Created:</span>
                <span class="text-text">{{ user.createdAt | appDateFormat }}</span>
              </div>
            </div>

            <div class="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                (click)="onEdit(user)"
                class="flex-1 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 dark:hover:bg-gray-800 rounded-md"
              >
                Edit
              </button>
              <button
                (click)="onDelete(user)"
                class="flex-1 px-4 py-2 text-sm font-medium text-accent-red hover:bg-red-50 dark:hover:bg-gray-800 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #empty>
      <app-empty-state
        title="No users found"
        description="Get started by creating your first user"
        [actionLabel]="'Create User'"
        (action)="onCreate()"
      ></app-empty-state>
    </ng-template>

    <ng-template #loading>
      <div class="p-6">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </ng-template>
  </app-card>
</div>
```

**Key Points**:
- Responsive design: desktop table + mobile cards
- Uses Tailwind CSS utility classes
- Role badges with color coding
- Loading skeleton for better UX
- Empty state with action button
- Search bar for filtering
- Error alert with dismiss functionality

---

### 3. UserCreateComponent - `src/app/features/users/user-create/`

**Purpose**: Create new users or edit existing ones with reactive form validation

**Pattern**: Copy from `src/app/features/companies/company-create/`

#### Component TypeScript - `user-create.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersStore } from '../services/users.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { CompaniesStore } from '../../companies/services/companies.store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Card,
    Button,
    FormInput,
    FormSelect,
    Alert
  ],
  templateUrl: './user-create.component.html'
})
export class UserCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(UsersStore);
  private readonly companiesStore = inject(CompaniesStore);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;
  readonly companies$ = this.companiesStore.companies$;

  isEditMode = false;
  userId: string | null = null;
  form!: FormGroup;
  submitted = false;

  readonly roleOptions = [
    { value: 'admin', label: 'Admin - Full access to all features' },
    { value: 'manager', label: 'Manager - Access to most features' },
    { value: 'user', label: 'User - Limited access, read-only' }
  ];

  readonly statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  // Transform companies$ to dropdown format
  readonly companyOptions$ = this.companies$.pipe(
    map(companies => companies.map(c => ({
      value: c.id,
      label: c.name
    })))
  );

  ngOnInit(): void {
    // Load companies for dropdown
    this.companiesStore.loadCompanies();

    this.initializeForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = params['id'];
        this.loadUser(params['id']);
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      role: ['user', Validators.required],
      companyId: ['', Validators.required],
      isActive: [true, Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  private loadUser(id: string): void {
    this.store.users$.subscribe(users => {
      const user = users.find(u => u.id === id);
      if (user) {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          companyId: user.companyId,
          isActive: user.isActive
        });

        // Make password optional for edit mode
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    // Mark all fields as touched to show validation errors
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.value;
    const userData: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      role: formValue.role,
      companyId: formValue.companyId,
      isActive: formValue.isActive
    };

    if (this.isEditMode && this.userId) {
      // Update user
      this.store.updateUser(this.userId, userData);
    } else {
      // Create user - add password
      userData.password = formValue.password;
      this.store.createUser(userData);
    }

    // Navigate back on success
    this.loading$.subscribe(loading => {
      if (!loading && this.submitted) {
        this.router.navigate(['/users']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  dismissError(): void {
    this.store.clearError();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !(field.touched || this.submitted)) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      companyId: 'Company',
      isActive: 'Status',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }
}
```

**Key Points**:
- Uses `inject()` for dependency injection
- Reactive forms with FormBuilder and Validators
- Submit-only validation (errors show only after submit or field touch)
- Password required for create, optional for edit
- Loads companies from CompaniesStore for dropdown
- Transforms company data to dropdown options with RxJS `map`
- Navigates to `/users` after successful save
- Auto-loads user data in edit mode from route params

#### Component Template - `user-create.component.html`

```html
<div class="p-6 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-text">
      {{ isEditMode ? 'Edit User' : 'Create User' }}
    </h1>
    <p class="mt-1 text-sm text-text-light">
      {{ isEditMode ? 'Update user information and permissions' : 'Add a new user to your account' }}
    </p>
  </div>

  <!-- Error Alert -->
  @if (error$ | async; as error) {
    <app-alert
      type="error"
      [dismissible]="true"
      (dismissed)="dismissError()"
      class="mb-6"
    >
      {{ error }}
    </app-alert>
  }

  <!-- Form -->
  <app-card>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="space-y-6">
        <!-- Personal Information -->
        <div>
          <h3 class="text-lg font-medium text-text mb-4">Personal Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-form-input
              formControlName="firstName"
              label="First Name"
              placeholder="Enter first name"
              [required]="true"
              [errorMessage]="getFieldError('firstName')"
            ></app-form-input>

            <app-form-input
              formControlName="lastName"
              label="Last Name"
              placeholder="Enter last name"
              [required]="true"
              [errorMessage]="getFieldError('lastName')"
            ></app-form-input>

            <app-form-input
              formControlName="email"
              label="Email"
              type="email"
              placeholder="user@example.com"
              [required]="true"
              [errorMessage]="getFieldError('email')"
            ></app-form-input>

            <app-form-input
              formControlName="phone"
              label="Phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              [required]="true"
              [errorMessage]="getFieldError('phone')"
            ></app-form-input>
          </div>
        </div>

        <!-- Account Settings -->
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-text mb-4">Account Settings</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-form-select
              formControlName="role"
              label="Role"
              [options]="roleOptions"
              [required]="true"
              [errorMessage]="getFieldError('role')"
            ></app-form-select>

            <app-form-select
              formControlName="companyId"
              label="Company"
              [options]="companyOptions$ | async"
              [required]="true"
              [errorMessage]="getFieldError('companyId')"
            ></app-form-select>

            <app-form-select
              formControlName="isActive"
              label="Status"
              [options]="statusOptions"
              [required]="true"
              [errorMessage]="getFieldError('isActive')"
            ></app-form-select>

            <app-form-input
              *ngIf="!isEditMode"
              formControlName="password"
              label="Password"
              type="password"
              placeholder="Enter password"
              [required]="true"
              [errorMessage]="getFieldError('password')"
            ></app-form-input>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <app-button
            type="submit"
            variant="primary"
            [loading]="(loading$ | async) || false"
            [disabled]="(loading$ | async) || false"
          >
            {{ isEditMode ? 'Update User' : 'Create User' }}
          </app-button>
          <app-button
            type="button"
            variant="secondary"
            (click)="onCancel()"
            [disabled]="(loading$ | async) || false"
          >
            Cancel
          </app-button>
        </div>
      </div>
    </form>
  </app-card>
</div>
```

**Key Points**:
- Responsive grid layout with Tailwind CSS
- Form sections: Personal Information, Account Settings
- Role dropdown with descriptions
- Company dropdown loaded from CompaniesStore
- Status dropdown (Active/Inactive)
- Password field only visible in create mode
- Submit-only validation with error messages
- Loading state for buttons
- Cancel button to navigate back

---

### 4. Users Routes - `src/app/features/users/users.routes.ts`

**Purpose**: Define lazy-loaded routes for users feature

**Pattern**: Copy from `src/app/features/companies/companies.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component')
      .then(m => m.UserListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./user-create/user-create.component')
      .then(m => m.UserCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./user-create/user-create.component')
      .then(m => m.UserCreateComponent),
    canActivate: [authGuard]
  }
];
```

**Key Points**:
- Exports `USERS_ROUTES` constant
- All routes protected by `authGuard`
- Lazy loading with `loadComponent`
- Edit route uses same component as create (distinguished by route param)
- Route paths: `/users`, `/users/create`, `/users/edit/:id`

---

### 5. Update Main Routes - `src/app/app.routes.ts`

**Purpose**: Wire up users routes to main application routing

**Change Required**: Add users route to existing routes array

**Location**: Line 30 (after companies routes)

```typescript
// Add this after companies routes (around line 30)
// Users routes (protected)
{
  path: 'users',
  loadChildren: () => import('./features/users/users.routes')
    .then(m => m.USERS_ROUTES)
},
```

**Complete Updated Section**:
```typescript
export const routes: Routes = [
  // ... existing routes ...

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

  // ... rest of routes ...
];
```

---

## Data Flow Architecture

### State Management Flow (RxJS)

```
Component Action
      ↓
Store Method (patchState + loading: true)
      ↓
MockApiService Call
      ↓
RxJS Operators (tap, catchError)
      ↓
Store State Update (patchState)
      ↓
BehaviorSubject Emission
      ↓
Component Observable (async pipe)
      ↓
Template Update
```

### Create User Flow

```
UserCreateComponent.onSubmit()
      ↓
Form Validation (ReactiveFormsModule)
      ↓
UsersStore.createUser(userData)
      ↓
MockApiService.createUser(dto)
      ↓
Store Updates State (add new user to array)
      ↓
Router Navigation (/users)
      ↓
UserListComponent Displays Updated List
```

---

## Form Validation Strategy

### Validation Rules

**First Name**:
- Required
- Minimum 2 characters

**Last Name**:
- Required
- Minimum 2 characters

**Email**:
- Required
- Valid email format

**Phone**:
- Required

**Role**:
- Required
- One of: 'admin', 'manager', 'user'

**Company**:
- Required
- Valid company ID from dropdown

**Status**:
- Required
- Boolean (true/false)

**Password** (Create Only):
- Required
- Minimum 6 characters

### Validation Approach

1. **Submit-Only Validation**: Errors show only after form submission or field touch
2. **Field Marking**: All fields marked as touched on submit to reveal errors
3. **Real-time Error Display**: Once touched, errors update on every change
4. **Shared Error Component**: Uses `FormInput` and `FormSelect` components with `errorMessage` input

---

## User Interface Components Used

### Shared UI Components

All components are imported from `src/app/shared/components/`:

1. **Card** (`ui/card/card`) - Main container with loading state
2. **Button** (`ui/button/button`) - Primary/secondary buttons with loading state
3. **FormInput** (`ui/forms/form-input/form-input`) - Text input with label and error
4. **FormSelect** (`ui/forms/form-select/form-select`) - Dropdown with label and error
5. **Badge** (`ui/badge/badge`) - Status and role indicators
6. **Alert** (`ui/alert/alert`) - Error messages with dismiss
7. **EmptyState** (`ui/empty-state/empty-state`) - No data placeholder
8. **SearchBar** (`data/search-bar/search-bar`) - Search input with debounce
9. **DataTable** (`data/data-table/data-table`) - Table component (imported but not actively used)

### Shared Pipes

1. **DateFormatPipe** (`shared/pipes/date-format.pipe`) - Formats dates

---

## Styling and Responsiveness

### Tailwind CSS Classes Used

**Layout Classes**:
- `p-6` - Padding
- `mb-6`, `mt-1` - Margins
- `flex`, `flex-col`, `gap-4` - Flexbox
- `grid`, `grid-cols-1`, `md:grid-cols-2` - Grid layout
- `max-w-4xl`, `mx-auto` - Centered max-width container

**Typography Classes**:
- `text-2xl`, `text-lg`, `text-sm`, `text-xs` - Font sizes
- `font-bold`, `font-medium` - Font weights
- `text-text`, `text-text-light` - Theme colors
- `uppercase`, `tracking-wider` - Text transforms

**Table Classes**:
- `overflow-x-auto` - Horizontal scroll
- `divide-y`, `divide-gray-200` - Borders
- `px-6`, `py-3`, `py-4` - Cell padding
- `whitespace-nowrap` - Text wrapping

**Responsive Classes**:
- `hidden md:block` - Desktop table
- `md:hidden` - Mobile cards
- `sm:flex-row`, `md:grid-cols-2` - Breakpoint-based layouts

**Interactive Classes**:
- `hover:bg-gray-50`, `hover:text-primary-700` - Hover states
- `dark:bg-gray-900`, `dark:border-gray-700` - Dark mode support

### Responsive Breakpoints

- **Mobile** (< 768px): Card-based layout
- **Desktop** (>= 768px): Table layout

---

## Error Handling Strategy

### Error Sources

1. **Network Errors**: MockApiService simulates 300ms delay
2. **Validation Errors**: Form validation before submission
3. **Business Logic Errors**: User already exists, etc.

### Error Display

1. **Form Field Errors**: Shown below each input field
2. **Global Errors**: Alert component at top of page
3. **Dismissible Alerts**: User can close error messages
4. **Store Error State**: Managed via `error$` observable

### Error Recovery

1. **Retry**: User can retry failed operations
2. **Clear Error**: `clearError()` method in store
3. **Navigation**: Success navigates away, error stays on page

---

## Testing Strategy

### Unit Tests (Jasmine/Karma)

**UsersStore Tests**:
```typescript
describe('UsersStore', () => {
  it('should initialize with empty state');
  it('should load users successfully');
  it('should handle load users error');
  it('should create user successfully');
  it('should update user successfully');
  it('should delete user successfully');
  it('should select user by id');
  it('should clear error state');
});
```

**UserListComponent Tests**:
```typescript
describe('UserListComponent', () => {
  it('should create component');
  it('should load users on init');
  it('should filter users by search term');
  it('should navigate to create page');
  it('should navigate to edit page');
  it('should confirm before delete');
  it('should display correct role badge variant');
});
```

**UserCreateComponent Tests**:
```typescript
describe('UserCreateComponent', () => {
  it('should create form with validation');
  it('should load companies for dropdown');
  it('should load user in edit mode');
  it('should submit valid form');
  it('should show validation errors on invalid submit');
  it('should navigate back on cancel');
  it('should require password in create mode');
  it('should not require password in edit mode');
});
```

---

## Important Implementation Notes

### 1. NO Angular Signals for State Management

- **Use RxJS BehaviorSubjects** in stores
- **Use `async` pipe** in templates
- Signals may be used for local component UI state only

### 2. Dependency Injection Pattern

- **Always use `inject()`** function (Angular 20 best practice)
- Avoid constructor injection for consistency

### 3. Store Pattern Consistency

- Extend `StoreBase<T>` from `core/services/store-base.service.ts`
- All mutations via `patchState()`
- Selectors use `this.select()` helper
- Error handling in every async operation

### 4. Form Validation Pattern

- **Submit-only validation**: Errors show after submit or field touch
- Mark all fields as touched on submit
- Use `getFieldError()` helper method
- Return empty string if no error to avoid template issues

### 5. Routing Pattern

- Protected routes use `authGuard`
- Lazy loading with `loadComponent` and `loadChildren`
- Edit mode determined by route param presence

### 6. Component Communication

- Parent-child via `@Input()` and `@Output()`
- Sibling components via shared store
- No direct component references

### 7. TypeScript Strictness

- Strict mode enabled in `tsconfig.json`
- All types defined in `shared/models/`
- Avoid `any` type - use interfaces
- Enable experimental decorators

---

## MockApiService Integration

### Available User Methods

From `src/app/core/services/mock-api.service.ts`:

```typescript
// Get all users (optionally filter by companyId)
getUsers(companyId?: string): Observable<User[]>

// Create new user
createUser(dto: CreateUserDto): Observable<User>

// Update existing user
updateUser(dto: UpdateUserDto): Observable<User>

// Delete user by ID
deleteUser(id: string): Observable<void>
```

### Data Persistence

- MockApiService uses **localStorage** for persistence
- 300ms simulated network delay
- Generates unique IDs for new records
- Data survives page refresh

---

## Navigation Structure

### Route URLs

```
/users              → User List (UserListComponent)
/users/create       → Create User (UserCreateComponent)
/users/edit/:id     → Edit User (UserCreateComponent)
```

### Navigation Flow

```
User List
   ├─> Create Button → /users/create
   ├─> Edit Button → /users/edit/:id
   ├─> Delete Button → Confirm → Store Delete → Reload List
   └─> Search → Filter List (Client-side)

Create/Edit Form
   ├─> Submit → Store Create/Update → Navigate to /users
   └─> Cancel → Navigate to /users
```

---

## Accessibility Considerations

### ARIA Attributes

- Form labels associated with inputs
- Error messages linked with `aria-describedby`
- Buttons have descriptive text
- Table headers with proper scope

### Keyboard Navigation

- Tab order follows logical flow
- Enter submits forms
- Escape cancels operations
- Focus management on navigation

### Screen Reader Support

- Semantic HTML elements
- Alt text for images (if added)
- Status announcements for loading/errors
- Descriptive button text

---

## Performance Optimization

### Lazy Loading

- Feature routes loaded on demand
- Components loaded with `loadComponent`
- Reduces initial bundle size

### Change Detection

- OnPush strategy for list items (if performance issues arise)
- Use `async` pipe to minimize manual subscriptions
- Avoid unnecessary re-renders

### Data Optimization

- Client-side filtering for small datasets
- Consider server-side pagination for large datasets
- Debounced search input

---

## File Structure Summary

```
src/app/
├── features/
│   └── users/
│       ├── services/
│       │   └── users.store.ts                    [CREATE - 135 lines]
│       ├── user-list/
│       │   ├── user-list.component.ts            [CREATE - 107 lines]
│       │   └── user-list.component.html          [CREATE - 182 lines]
│       ├── user-create/
│       │   ├── user-create.component.ts          [CREATE - 210 lines]
│       │   └── user-create.component.html        [CREATE - 180 lines]
│       └── users.routes.ts                       [CREATE - 24 lines]
│
└── app.routes.ts                                 [UPDATE - Add 5 lines]
```

**Total New Files**: 5 TypeScript files + 2 HTML templates
**Total Updated Files**: 1 (app.routes.ts)

---

## Implementation Checklist

### Pre-Implementation

- [ ] Review Company Management implementation (Phase 5 reference)
- [ ] Verify all shared components exist and are functional
- [ ] Verify User model interface matches requirements
- [ ] Verify MockApiService user methods are available

### Implementation Steps

1. **Create Store**:
   - [ ] Create `users.store.ts` extending `StoreBase<UsersState>`
   - [ ] Implement all CRUD methods
   - [ ] Add error handling with `catchError`
   - [ ] Test store methods with MockApiService

2. **Create List Component**:
   - [ ] Create `user-list.component.ts` with store integration
   - [ ] Create `user-list.component.html` with table and cards
   - [ ] Implement search filter with RxJS `map`
   - [ ] Add role badge color logic
   - [ ] Test list display and filtering

3. **Create Form Component**:
   - [ ] Create `user-create.component.ts` with reactive forms
   - [ ] Create `user-create.component.html` with form sections
   - [ ] Add form validation rules
   - [ ] Implement edit mode vs. create mode logic
   - [ ] Load companies for dropdown
   - [ ] Test form submission and validation

4. **Create Routes**:
   - [ ] Create `users.routes.ts` with 3 routes
   - [ ] Add `authGuard` to all routes
   - [ ] Test lazy loading

5. **Update Main Routes**:
   - [ ] Add users route to `app.routes.ts`
   - [ ] Test navigation from main app

### Post-Implementation

- [ ] Manual test: Create user
- [ ] Manual test: Edit user
- [ ] Manual test: Delete user
- [ ] Manual test: Search filtering
- [ ] Manual test: Form validation
- [ ] Manual test: Mobile responsive layout
- [ ] Manual test: Dark mode support
- [ ] Verify localStorage persistence
- [ ] Verify route guards work
- [ ] Run `ng test` for unit tests
- [ ] Run `ng build` to verify no compilation errors

---

## Common Pitfalls to Avoid

### 1. Using Signals for State
❌ **Wrong**: `readonly users = signal<User[]>([]);`
✅ **Correct**: `readonly users$ = this.select(state => state.users);`

### 2. Manual Subscriptions Without Cleanup
❌ **Wrong**: `this.store.users$.subscribe(users => this.users = users);`
✅ **Correct**: `readonly users$ = this.store.users$; // Use async pipe`

### 3. Constructor Injection Instead of inject()
❌ **Wrong**: `constructor(private store: UsersStore) {}`
✅ **Correct**: `private readonly store = inject(UsersStore);`

### 4. Mutating State Directly
❌ **Wrong**: `this.state.users.push(newUser);`
✅ **Correct**: `this.patchState({ users: [...this.currentState.users, newUser] });`

### 5. Missing Route Guards
❌ **Wrong**: `{ path: '', loadComponent: ... }`
✅ **Correct**: `{ path: '', loadComponent: ..., canActivate: [authGuard] }`

### 6. Forgetting to Load Dependencies
❌ **Wrong**: Using `companyOptions$` without loading companies
✅ **Correct**: Call `companiesStore.loadCompanies()` in `ngOnInit()`

### 7. Not Handling Async Pipe Null
❌ **Wrong**: `<div>{{ (users$ | async).length }}</div>`
✅ **Correct**: `<div *ngIf="users$ | async as users">{{ users.length }}</div>`

---

## Additional Resources

### Related Documentation
- [CLAUDE.md](../../CLAUDE.md) - Project overview and architecture
- [angular20_module_instructions.md](../angular20_module_instructions.md) - Complete data models and patterns
- [Phase 5 Implementation](../../src/app/features/companies/) - Reference implementation

### Angular Resources
- Angular 20 Standalone Components: https://angular.dev/guide/components/importing
- RxJS BehaviorSubject: https://rxjs.dev/api/index/class/BehaviorSubject
- Reactive Forms: https://angular.dev/guide/forms/reactive-forms
- Tailwind CSS: https://tailwindcss.com/docs

---

## Conclusion

This implementation plan provides a complete blueprint for implementing Phase 6: User Management feature following the exact pattern from Phase 5 (Company Management). The plan includes:

- Detailed file structure and content
- Complete TypeScript and HTML code examples
- RxJS-based state management pattern
- Reactive forms with validation
- Responsive UI with Tailwind CSS
- Error handling and user feedback
- Navigation and routing setup
- Testing strategy
- Performance considerations
- Accessibility guidelines

By following this plan, developers can implement a fully-functional user management system that integrates seamlessly with the existing Umbrella Frontend application architecture.
