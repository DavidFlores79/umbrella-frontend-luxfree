# Angular 20 Multi-Company POC — Standalone Architecture Instructions

## Project Overview

This document provides detailed instructions for building a multi-company income and expense management system using **Angular 20 with Standalone Components**. The project follows Clean Architecture principles, uses RxJS for state management (no Angular Signals), functional guards and interceptors, and implements Tailwind CSS for styling.

**Key Angular 20 Features Used:**
- ✅ Standalone Components (no NgModules)
- ✅ `bootstrapApplication()` with ApplicationConfig
- ✅ Functional Route Guards (`CanActivateFn`)
- ✅ Functional HTTP Interceptors
- ✅ RxJS for State Management
- ✅ `inject()` function for Dependency Injection
- ✅ Reactive Forms with FormBuilder

---

## Main Project Structure

```
multi-company-poc/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── mock-api.service.ts
│   │   │       ├── company-context.service.ts
│   │   │       ├── permission.service.ts
│   │   │       └── store-base.service.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── main-layout.component.ts
│   │   │   │   │   ├── main-layout.component.html
│   │   │   │   │   ├── header.component.ts
│   │   │   │   │   ├── header.component.html
│   │   │   │   │   ├── sidebar.component.ts
│   │   │   │   │   ├── sidebar.component.html
│   │   │   │   │   ├── footer.component.ts
│   │   │   │   │   └── footer.component.html
│   │   │   │   └── ui/
│   │   │   │       ├── card.component.ts
│   │   │   │       ├── card.component.html
│   │   │   │       ├── chart-card.component.ts
│   │   │   │       └── chart-card.component.html
│   │   │   └── models/
│   │   │       ├── company.model.ts
│   │   │       ├── user.model.ts
│   │   │       ├── product.model.ts
│   │   │       ├── service.model.ts
│   │   │       ├── sale.model.ts
│   │   │       ├── purchase.model.ts
│   │   │       └── inventory.model.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   └── login.component.html
│   │   │   │   ├── register/
│   │   │   │   │   ├── register.component.ts
│   │   │   │   │   └── register.component.html
│   │   │   │   └── auth.routes.ts
│   │   │   ├── companies/
│   │   │   │   ├── services/
│   │   │   │   │   └── companies.store.ts
│   │   │   │   ├── company-list/
│   │   │   │   │   ├── company-list.component.ts
│   │   │   │   │   └── company-list.component.html
│   │   │   │   ├── company-create/
│   │   │   │   │   ├── company-create.component.ts
│   │   │   │   │   └── company-create.component.html
│   │   │   │   └── companies.routes.ts
│   │   │   ├── users/
│   │   │   │   ├── services/
│   │   │   │   │   └── users.store.ts
│   │   │   │   ├── user-list/
│   │   │   │   │   ├── user-list.component.ts
│   │   │   │   │   └── user-list.component.html
│   │   │   │   ├── user-create/
│   │   │   │   │   ├── user-create.component.ts
│   │   │   │   │   └── user-create.component.html
│   │   │   │   └── users.routes.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── services/
│   │   │   │   │   └── dashboard.store.ts
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.routes.ts
│   │   │   ├── products/
│   │   │   │   ├── services/
│   │   │   │   │   └── products.store.ts
│   │   │   │   ├── product-list/
│   │   │   │   │   ├── product-list.component.ts
│   │   │   │   │   └── product-list.component.html
│   │   │   │   ├── product-create/
│   │   │   │   │   ├── product-create.component.ts
│   │   │   │   │   └── product-create.component.html
│   │   │   │   └── products.routes.ts
│   │   │   ├── sales/
│   │   │   │   ├── services/
│   │   │   │   │   └── sales.store.ts
│   │   │   │   ├── sale-list/
│   │   │   │   │   ├── sale-list.component.ts
│   │   │   │   │   └── sale-list.component.html
│   │   │   │   ├── sale-create/
│   │   │   │   │   ├── sale-create.component.ts
│   │   │   │   │   └── sale-create.component.html
│   │   │   │   └── sales.routes.ts
│   │   │   ├── purchases/
│   │   │   │   ├── services/
│   │   │   │   │   └── purchases.store.ts
│   │   │   │   ├── purchase-list/
│   │   │   │   │   ├── purchase-list.component.ts
│   │   │   │   │   └── purchase-list.component.html
│   │   │   │   ├── purchase-create/
│   │   │   │   │   ├── purchase-create.component.ts
│   │   │   │   │   └── purchase-create.component.html
│   │   │   │   └── purchases.routes.ts
│   │   │   └── inventory/
│   │   │       ├── services/
│   │   │       │   └── inventory.store.ts
│   │   │       ├── inventory-list/
│   │   │       │   ├── inventory-list.component.ts
│   │   │       │   └── inventory-list.component.html
│   │   │       ├── inventory-detail/
│   │   │       │   ├── inventory-detail.component.ts
│   │   │       │   └── inventory-detail.component.html
│   │   │       └── inventory.routes.ts
│   │   ├── app.component.ts (standalone)
│   │   ├── app.config.ts (ApplicationConfig)
│   │   └── app.routes.ts
│   ├── assets/
│   ├── styles/
│   │   └── tailwind.css
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── tsconfig.json
├── tailwind.config.js
├── package.json
└── README.md
```

---

## Bootstrap Configuration

### 1. Main Entry Point (`main.ts`)

**Purpose:** Bootstrap the Angular 20 standalone application.

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

---

### 2. Application Configuration (`app.config.ts`)

**Purpose:** Configure application-wide providers, routing, HTTP client, and interceptors.

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations()
  ]
};
```

**Key Points:**
- No NgModules needed
- All providers configured in one place
- HTTP interceptors registered via `withInterceptors()`
- Router configured via `provideRouter()`
- All core services use `providedIn: 'root'` in their `@Injectable` decorator

---

### 3. Core Services

**Purpose:** Application-wide singleton services for infrastructure logic.

**Key Responsibilities:**
- Authentication and authorization
- Company context management
- State management base class (RxJS Store Pattern)
- Permission checking
- Mock API simulation

**Files to Create:**

#### 3.1 `core/guards/auth.guard.ts`
Functional route guard to protect authenticated routes.

**Implementation:**
```typescript
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      
      // Redirect to login page
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};
```

**Key Points:**
- Uses `inject()` function to get dependencies
- Returns `Observable<boolean | UrlTree>`
- Redirects to login with return URL on failure
- Modern functional guard pattern (no class-based guards)

---

#### 3.2 `core/interceptors/auth.interceptor.ts`
Functional HTTP interceptor to add authentication token to requests.

**Implementation:**
```typescript
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getAuthToken();

  // Skip interceptor for login/register requests
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Clone request and add authorization header if token exists
  if (authToken) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
```

**Key Points:**
- Functional interceptor pattern (Angular 20 standard)
- Uses `inject()` to get AuthService
- Clones request to add Authorization header
- Skips auth endpoints

---

#### 3.3 `core/services/store-base.service.ts`
#### 3.3 `core/services/store-base.service.ts`
Implements the RxJS-based Store Pattern. This is the foundation for all feature stores.

**Implementation:**
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export abstract class StoreBase<T> {
  private readonly _state$: BehaviorSubject<T>;

  constructor(initialState: T) {
    this._state$ = new BehaviorSubject<T>(initialState);
  }

  /**
   * Exposes the current state as an Observable
   */
  get state$(): Observable<T> {
    return this._state$.asObservable();
  }

  /**
   * Gets the current state value (synchronous)
   */
  protected get state(): T {
    return this._state$.value;
  }

  /**
   * Replaces the entire state
   */
  protected setState(newState: T): void {
    this._state$.next(newState);
  }

  /**
   * Merges partial state updates
   */
  protected patchState(partial: Partial<T>): void {
    this._state$.next({
      ...this.state,
      ...partial
    });
  }

  /**
   * Selects a slice of state
   */
  select<K>(selector: (state: T) => K): Observable<K> {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}
```

**Key Points:**
- Base class for all feature stores
- Encapsulates `BehaviorSubject<T>`
- Provides `patchState()` for partial updates
- `select()` method for derived state
- Uses RxJS operators for optimization

---

#### 3.4 `core/services/auth.service.ts`
Manages user authentication, session state, and token handling.

**Implementation:**
```typescript
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { MockApiService } from './mock-api.service';
import { CompanyContextService } from './company-context.service';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly mockApi = inject(MockApiService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly router = inject(Router);
  
  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(
    map(user => !!user)
  );

  /**
   * Authenticates user and stores session
   */
  login(email: string, password: string): Observable<User> {
    return this.mockApi.login(email, password).pipe(
      tap(user => {
        this.setUserSession(user);
        // Set user's company as active company
        if (user.companyId) {
          this.companyContext.setCompanyById(user.companyId);
        }
      }),
      catchError(err => {
        console.error('Login failed:', err);
        return throwError(() => new Error('Invalid credentials'));
      })
    );
  }

  /**
   * Creates new user account
   */
  register(email: string, password: string, name: string): Observable<User> {
    return this.mockApi.register(email, password, name).pipe(
      tap(user => {
        console.log('User registered successfully:', user);
      })
    );
  }

  /**
   * Clears session and user data
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.companyContext.clearCompany();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Gets authentication token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Gets current user synchronously
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setUserSession(user: User): void {
    const token = btoa(`${user.email}:${Date.now()}`); // Simple token generation
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }
}
```

**Key Points:**
- Uses `inject()` for dependency injection
- `providedIn: 'root'` makes it a singleton
- Stores session in localStorage
- Exposes `currentUser$` and `isAuthenticated$` Observables
- Integrates with CompanyContextService

---

#### 3.5 `core/services/mock-api.service.ts`
#### 3.5 `core/services/mock-api.service.ts`
Simulates a REST API backend with in-memory data and localStorage persistence.

**Implementation Excerpt:**
```typescript
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Company } from '../../shared/models/company.model';
import { User } from '../../shared/models/user.model';
// ... other model imports

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private readonly STORAGE_KEY = 'mockApiData';
  private readonly DELAY_MS = 300;

  constructor() {
    this.initializeMockData();
  }

  // Company CRUD Operations
  getCompanies(): Observable<Company[]> {
    return of(this.getData().companies).pipe(delay(this.DELAY_MS));
  }

  createCompany(data: Partial<Company>): Observable<Company> {
    const newCompany: Company = {
      id: this.generateId(),
      name: data.name || '',
      taxId: data.taxId || '',
      address: data.address || '',
      settings: data.settings || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const currentData = this.getData();
    currentData.companies.push(newCompany);
    this.saveData(currentData);
    
    return of(newCompany).pipe(delay(this.DELAY_MS));
  }

  // Similar methods for Users, Products, Sales, Purchases, Inventory...

  // Authentication
  login(email: string, password: string): Observable<User> {
    const users = this.getData().users;
    const user = users.find(u => u.email === email);
    
    if (user && password === 'password123') { // Mock password check
      return of(user).pipe(delay(this.DELAY_MS));
    }
    
    return throwError(() => new Error('Invalid credentials')).pipe(delay(this.DELAY_MS));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getData(): MockData {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : this.getDefaultData();
  }

  private saveData(data: MockData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private initializeMockData(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.saveData(this.getDefaultData());
    }
  }

  private getDefaultData(): MockData {
    return {
      companies: [],
      users: [],
      products: [],
      sales: [],
      purchases: [],
      inventory: []
    };
  }
}

interface MockData {
  companies: Company[];
  users: User[];
  products: any[];
  sales: any[];
  purchases: any[];
  inventory: any[];
}
```

**Key Points:**
- `providedIn: 'root'` for singleton
- Simulates network delay with RxJS `delay()`
- Persists data to localStorage
- All methods return `Observable<T>`

---

#### 3.6 `core/services/company-context.service.ts`
Manages the current company context across the application.

**Implementation:**
```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Company } from '../../shared/models/company.model';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyContextService {
  private readonly mockApi = inject(MockApiService);
  private readonly currentCompanySubject = new BehaviorSubject<Company | null>(
    this.getCompanyFromStorage()
  );

  readonly currentCompany$ = this.currentCompanySubject.asObservable();

  setCompanyById(companyId: string): void {
    this.mockApi.getCompanies().subscribe(companies => {
      const company = companies.find(c => c.id === companyId);
      if (company) {
        this.setCompany(company);
      }
    });
  }

  setCompany(company: Company): void {
    localStorage.setItem('currentCompany', JSON.stringify(company));
    this.currentCompanySubject.next(company);
  }

  getCompany(): Company | null {
    return this.currentCompanySubject.value;
  }

  clearCompany(): void {
    localStorage.removeItem('currentCompany');
    this.currentCompanySubject.next(null);
  }

  private getCompanyFromStorage(): Company | null {
    const companyJson = localStorage.getItem('currentCompany');
    return companyJson ? JSON.parse(companyJson) : null;
  }
}
```

---

#### 3.7 `core/services/permission.service.ts`
Checks user permissions and roles.

**Implementation:**
```typescript
import { Injectable } from '@angular/core';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly rolePermissions: Record<string, string[]> = {
    'admin': [
      'companies.*',
      'users.*',
      'products.*',
      'sales.*',
      'purchases.*',
      'inventory.*',
      'dashboard.*'
    ],
    'manager': [
      'companies.read',
      'users.read', 'users.create',
      'products.*',
      'sales.*',
      'purchases.*',
      'inventory.*',
      'dashboard.*'
    ],
    'user': [
      'companies.read',
      'products.read',
      'sales.read', 'sales.create',
      'purchases.read',
      'inventory.read',
      'dashboard.read'
    ]
  };

  can(user: User | null, permission: string): boolean {
    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }

    return user.roles.some(role => {
      const permissions = this.rolePermissions[role] || [];
      return permissions.some(p => {
        if (p.endsWith('.*')) {
          const prefix = p.slice(0, -2);
          return permission.startsWith(prefix);
        }
        return p === permission;
      });
    });
  }

  hasRole(user: User | null, role: string): boolean {
    return user?.roles?.includes(role) || false;
  }

  getPermissionsByRole(role: string): string[] {
    return this.rolePermissions[role] || [];
  }
}
```

---

## 4. Shared Components

**Purpose:** Reusable standalone components shared across features.

All shared components are **standalone** and declare their own dependencies.

### 4.1 Layout Components

#### 4.1.1 `shared/components/layout/main-layout.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {}
```

**Template (`main-layout.component.html`):**
```html
<div class="flex h-screen bg-gray-100">
  <app-sidebar class="w-64 bg-gray-900"></app-sidebar>
  
  <div class="flex-1 flex flex-col overflow-hidden">
    <app-header class="bg-white shadow-sm"></app-header>
    
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
      <router-outlet></router-outlet>
    </main>
    
    <app-footer class="bg-white border-t border-gray-200"></app-footer>
  </div>
</div>
```

---

#### 4.1.2 `shared/components/layout/header.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyContextService } from '../../../core/services/company-context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly router = inject(Router);

  readonly currentUser$ = this.authService.currentUser$;
  readonly currentCompany$ = this.companyContext.currentCompany$;

  logout(): void {
    this.authService.logout();
  }
}
```

---

#### 4.1.3 `shared/components/layout/sidebar.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  permission: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly permissionService = inject(PermissionService);

  readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', permission: 'dashboard.read' },
    { label: 'Companies', route: '/companies', icon: 'business', permission: 'companies.read' },
    { label: 'Users', route: '/users', icon: 'people', permission: 'users.read' },
    { label: 'Products', route: '/products', icon: 'inventory', permission: 'products.read' },
    { label: 'Sales', route: '/sales', icon: 'point_of_sale', permission: 'sales.read' },
    { label: 'Purchases', route: '/purchases', icon: 'shopping_cart', permission: 'purchases.read' },
    { label: 'Inventory', route: '/inventory', icon: 'warehouse', permission: 'inventory.read' }
  ];

  canAccess(permission: string): boolean {
    const user = this.authService.getCurrentUser();
    return this.permissionService.can(user, permission);
  }
}
```

---

### 4.2 UI Components

#### 4.2.1 `shared/components/ui/card.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <div *ngIf="title" class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <span *ngIf="icon" class="material-icons text-gray-400">{{ icon }}</span>
      </div>
      
      <p *ngIf="subtitle" class="text-sm text-gray-600 mb-4">{{ subtitle }}</p>
      
      <div *ngIf="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <div *ngIf="error" class="bg-red-50 text-red-700 p-3 rounded-md mb-4">
        {{ error }}
      </div>
      
      <div *ngIf="!loading">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() loading = false;
  @Input() error?: string;
}
```

---

## 5. Feature Components (Standalone)

All feature components are **standalone** with their own routing configuration.

### 5.1 Auth Feature

#### 5.1.1 `features/auth/login/login.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
```

---

#### 5.1.2 `features/auth/auth.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
```

---

### 5.2 Companies Feature

#### 5.2.1 `features/companies/services/companies.store.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Company } from '../../../shared/models/company.model';

interface CompaniesState {
  items: Company[];
  loading: boolean;
  error: string | null;
  selectedCompany: Company | null;
}

@Injectable({
  providedIn: 'root'
})
export class CompaniesStore extends StoreBase<CompaniesState> {
  private readonly mockApi = inject(MockApiService);

  // Selectors
  readonly companies$ = this.select(state => state.items);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedCompany$ = this.select(state => state.selectedCompany);

  constructor() {
    super({
      items: [],
      loading: false,
      error: null,
      selectedCompany: null
    });
  }

  loadCompanies(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getCompanies().pipe(
      tap(items => {
        this.patchState({ items, loading: false });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }

  createCompany(data: Partial<Company>): Observable<Company> {
    this.patchState({ loading: true, error: null });

    return this.mockApi.createCompany(data).pipe(
      tap(company => {
        const items = [...this.state.items, company];
        this.patchState({ items, loading: false });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      }),
      finalize(() => this.patchState({ loading: false }))
    );
  }

  selectCompany(id: string): void {
    const company = this.state.items.find(c => c.id === id);
    this.patchState({ selectedCompany: company || null });
  }

  clearSelection(): void {
    this.patchState({ selectedCompany: null });
  }
}
```

---

#### 5.2.2 `features/companies/company-list/company-list.component.ts`

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompaniesStore } from '../services/companies.store';
import { PermissionService } from '../../../core/services/permission.service';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent } from '../../../shared/components/ui/card.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './company-list.component.html'
})
export class CompanyListComponent implements OnInit {
  private readonly store = inject(CompaniesStore);
  private readonly authService = inject(AuthService);
  private readonly permissionService = inject(PermissionService);

  readonly companies$ = this.store.companies$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  ngOnInit(): void {
    this.store.loadCompanies();
  }

  canCreate(): boolean {
    const user = this.authService.getCurrentUser();
    return this.permissionService.can(user, 'companies.create');
  }

  canEdit(): boolean {
    const user = this.authService.getCurrentUser();
    return this.permissionService.can(user, 'companies.update');
  }

  canDelete(): boolean {
    const user = this.authService.getCurrentUser();
    return this.permissionService.can(user, 'companies.delete');
  }

  deleteCompany(id: string): void {
    if (confirm('Are you sure you want to delete this company?')) {
      // Implement delete logic
    }
  }
}
```

---

#### 5.2.3 `features/companies/companies.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./company-list/company-list.component')
          .then(m => m.CompanyListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./company-create/company-create.component')
          .then(m => m.CompanyCreateComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./company-create/company-create.component')
          .then(m => m.CompanyCreateComponent)
      }
    ]
  }
];
```

---

## 6. Main Application Files

### 6.1 `app.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'Multi-Company POC';
}
```

---

### 6.2 `app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/components/layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'companies',
        loadChildren: () => import('./features/companies/companies.routes')
          .then(m => m.COMPANIES_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes')
          .then(m => m.USERS_ROUTES)
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes')
          .then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'sales',
        loadChildren: () => import('./features/sales/sales.routes')
          .then(m => m.SALES_ROUTES)
      },
      {
        path: 'purchases',
        loadChildren: () => import('./features/purchases/purchases.routes')
          .then(m => m.PURCHASES_ROUTES)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventory.routes')
          .then(m => m.INVENTORY_ROUTES)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
```

---

## 7. Implementation Guidelines

### Angular 20 Standalone Best Practices

1. **All Components Are Standalone:**
   - Every component has `standalone: true` (or omits it, as true is the default)
   - Components declare their own dependencies in `imports` array
   - No `@NgModule` decorators anywhere in the application

2. **Use `inject()` Function:** Always use the `inject()` function for dependency injection instead of constructor injection when possible.
   ```typescript
   // ✅ Preferred in Angular 20
   private readonly authService = inject(AuthService);
   
   // ⚠️ Still valid but less modern
   constructor(private authService: AuthService) {}
   ```

3. **Lazy Loading with `loadComponent` and `loadChildren`:**
   ```typescript
   // For individual components
   {
     path: 'login',
     loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
   }
   
   // For feature routes
   {
     path: 'companies',
     loadChildren: () => import('./companies/companies.routes').then(m => m.COMPANIES_ROUTES)
   }
   ```

4. **Functional Guards and Interceptors:**
   - Use `CanActivateFn` instead of class-based guards
   - Use `HttpInterceptorFn` instead of class-based interceptors
   - Register interceptors with `withInterceptors()` in `provideHttpClient()`

### RxJS Best Practices

1. **Use the `async` Pipe:** Always use the `async` pipe in templates to subscribe to Observables. This automatically unsubscribes when the component is destroyed.
   ```html
   <div *ngIf="(loading$ | async) as loading">
     <p *ngIf="loading">Loading...</p>
   </div>
   
   <div *ngFor="let company of (companies$ | async)">
     {{ company.name }}
   </div>
   ```

2. **Avoid Manual Subscriptions:** Minimize manual `.subscribe()` calls in components. Use the `async` pipe instead.
   ```typescript
   // ❌ Avoid this
   ngOnInit() {
     this.store.companies$.subscribe(companies => {
       this.companies = companies;
     });
   }
   
   // ✅ Do this instead
   readonly companies$ = this.store.companies$;
   // Then use {{ companies$ | async }} in template
   ```

3. **Use `shareReplay` in Stores:** When exposing Observables from stores, use `shareReplay(1)` to cache the latest value and prevent multiple API calls.
   ```typescript
   readonly companies$ = this.state$.pipe(
     map(state => state.items),
     shareReplay(1)
   );
   ```

4. **Handle Errors Gracefully:** Always include error handling in store methods using `catchError`.
   ```typescript
   return this.api.getCompanies().pipe(
     tap(items => this.patchState({ items, loading: false })),
     catchError(err => {
       this.patchState({ error: err.message, loading: false });
       return throwError(() => err);
     })
   );
   ```

5. **Clean Up Subscriptions:** When you must use manual subscriptions, store them and unsubscribe in `ngOnDestroy`.
   ```typescript
   private destroy$ = new Subject<void>();
   
   ngOnInit() {
     this.store.companies$
       .pipe(takeUntil(this.destroy$))
       .subscribe(companies => {
         // Do something
       });
   }
   
   ngOnDestroy() {
     this.destroy$.next();
     this.destroy$.complete();
   }
   ```

### Clean Code Principles

1. **Single Responsibility Principle:** Each service, component, and store should have a single, well-defined responsibility.

2. **Dependency Injection:** Always use Angular's dependency injection for services and guards.

3. **Type Safety:** Use TypeScript interfaces and types to ensure type safety throughout the application.

4. **Naming Conventions:**
   - Services: `*.service.ts`
   - Stores: `*.store.ts`
   - Components: `*.component.ts` (with `.html` and `.css` files)
   - Models: `*.model.ts`
   - Guards: `*.guard.ts`
   - Interceptors: `*.interceptor.ts`
   - Routes: `*.routes.ts`

5. **Component Templates:** Keep templates simple and move complex logic to the component class.

6. **Service Organization:**
   - All core services use `providedIn: 'root'`
   - Feature-specific services can also use `providedIn: 'root'` if they're singleton
   - No need for module-level providers

### Tailwind CSS Integration

1. **Setup:** Configure `tailwind.config.js` with the project's color palette.
   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       "./src/**/*.{html,ts}",
     ],
     theme: {
       extend: {
         colors: {
           primary: '#3b82f6',
           secondary: '#64748b',
         }
       },
     },
     plugins: [],
   }
   ```

2. **Utility Classes:** Use Tailwind utility classes for styling instead of custom CSS.
   ```html
   <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-md">
     <h2 class="text-lg font-semibold text-gray-900">Title</h2>
     <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
       Action
     </button>
   </div>
   ```

3. **Responsive Design:** Use Tailwind's responsive prefixes for mobile-first design.
   ```html
   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
     <!-- Cards -->
   </div>
   ```

4. **Component Styling:** Use `@apply` directive for reusable component styles when needed.
   ```css
   .btn-primary {
     @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
   }
   ```

---

## 8. Data Models

All models are TypeScript interfaces located in `shared/models/`.

### 8.1 `company.model.ts`

```typescript
export interface Company {
  id: string;
  name: string;
  taxId: string;
  address: string;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettings {
  currency?: string;
  timezone?: string;
  fiscalYearStart?: string;
}
```

### 8.2 `user.model.ts`

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  roles: string[];
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 8.3 `product.model.ts`

```typescript
export interface Product {
  id: string;
  companyId: string;
  name: string;
  description: string;
  sku: string;
  category: ProductCategory;
  price: number;
  cost: number;
  unit: string;
  taxRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductCategory {
  PRODUCT = 'product',
  SERVICE = 'service',
  LABOR = 'labor'
}
```

### 8.4 `sale.model.ts`

```typescript
export interface Sale {
  id: string;
  companyId: string;
  customerId: string;
  saleDate: Date;
  dueDate: Date;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: SaleStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export enum SaleStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled'
}
```

### 8.5 `purchase.model.ts`

```typescript
export interface Purchase {
  id: string;
  companyId: string;
  vendorId: string;
  purchaseDate: Date;
  dueDate: Date;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: PurchaseStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export enum PurchaseStatus {
  DRAFT = 'draft',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  PAID = 'paid',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled'
}
```

### 8.6 `inventory.model.ts`

```typescript
export interface InventoryItem {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  location: string;
  lastUpdated: Date;
}

export interface InventoryMovement {
  id: string;
  companyId: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  referenceType: string; // 'sale', 'purchase', 'adjustment'
  referenceId: string;
  date: Date;
  notes?: string;
}

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment'
}
```

---

## 9. Testing Strategy

### Component Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent], // Import standalone component
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });
});
```

### Service Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user successfully', (done) => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' };
    
    service.login('test@test.com', 'password').subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });
  });
});
```

---

## 10. Project Checklist

### Initial Setup
- [ ] Create Angular 20 project with `ng new multi-company-poc --standalone`
- [ ] Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Configure `tailwind.config.js` and `styles.css`
- [ ] Install Chart.js (if needed): `npm install chart.js ng2-charts`

### Core Infrastructure
- [ ] Create `core/services/store-base.service.ts`
- [ ] Create `core/services/auth.service.ts`
- [ ] Create `core/services/mock-api.service.ts`
- [ ] Create `core/services/company-context.service.ts`
- [ ] Create `core/services/permission.service.ts`
- [ ] Create `core/guards/auth.guard.ts` (functional)
- [ ] Create `core/interceptors/auth.interceptor.ts` (functional)
- [ ] Configure `app.config.ts` with providers

### Shared Components
- [ ] Create `shared/components/layout/main-layout.component.ts`
- [ ] Create `shared/components/layout/header.component.ts`
- [ ] Create `shared/components/layout/sidebar.component.ts`
- [ ] Create `shared/components/layout/footer.component.ts`
- [ ] Create `shared/components/ui/card.component.ts`
- [ ] Create `shared/components/ui/chart-card.component.ts`

### Data Models
- [ ] Create all interfaces in `shared/models/`

### Feature: Auth
- [ ] Create `features/auth/login/login.component.ts`
- [ ] Create `features/auth/register/register.component.ts`
- [ ] Create `features/auth/auth.routes.ts`

### Feature: Companies
- [ ] Create `features/companies/services/companies.store.ts`
- [ ] Create `features/companies/company-list/company-list.component.ts`
- [ ] Create `features/companies/company-create/company-create.component.ts`
- [ ] Create `features/companies/companies.routes.ts`

### Feature: Users
- [ ] Create `features/users/services/users.store.ts`
- [ ] Create `features/users/user-list/user-list.component.ts`
- [ ] Create `features/users/user-create/user-create.component.ts`
- [ ] Create `features/users/users.routes.ts`

### Feature: Dashboard
- [ ] Create `features/dashboard/services/dashboard.store.ts`
- [ ] Create `features/dashboard/dashboard.component.ts`
- [ ] Create `features/dashboard/dashboard.routes.ts`

### Feature: Products
- [ ] Create `features/products/services/products.store.ts`
- [ ] Create product list and create components
- [ ] Create `features/products/products.routes.ts`

### Feature: Sales
- [ ] Create `features/sales/services/sales.store.ts`
- [ ] Create sale list and create components
- [ ] Create `features/sales/sales.routes.ts`

### Feature: Purchases
- [ ] Create `features/purchases/services/purchases.store.ts`
- [ ] Create purchase list and create components
- [ ] Create `features/purchases/purchases.routes.ts`

### Feature: Inventory
- [ ] Create `features/inventory/services/inventory.store.ts`
- [ ] Create inventory list and detail components
- [ ] Create `features/inventory/inventory.routes.ts`

### Application Files
- [ ] Create `app.component.ts` (standalone)
- [ ] Create `app.config.ts` (ApplicationConfig)
- [ ] Create `app.routes.ts`
- [ ] Update `main.ts` to use `bootstrapApplication()`

### Testing
- [ ] Write unit tests for core services
- [ ] Write unit tests for stores
- [ ] Write component tests
- [ ] Set up e2e tests (optional)

---

## 11. Key Differences from Module-Based Angular

| Aspect | Old (NgModule) | New (Standalone - Angular 20) |
|--------|---------------|-------------------------------|
| **Components** | Declared in `@NgModule` | `standalone: true` in `@Component` |
| **Bootstrapping** | `platformBrowser().bootstrapModule(AppModule)` | `bootstrapApplication(AppComponent, appConfig)` |
| **Configuration** | `@NgModule` providers | `ApplicationConfig` with `providers` |
| **Routing** | `RouterModule.forRoot(routes)` | `provideRouter(routes)` |
| **HTTP Client** | `HttpClientModule` | `provideHttpClient()` |
| **Animations** | `BrowserAnimationsModule` | `provideAnimations()` |
| **Guards** | Class implementing `CanActivate` | `CanActivateFn` function |
| **Interceptors** | Class implementing `HttpInterceptor` | `HttpInterceptorFn` function |
| **Lazy Loading** | `loadChildren: () => import()` | `loadComponent` or `loadChildren` with routes |
| **Service Injection** | Constructor or `providedIn` | Primarily `inject()` function |
| **Imports** | Imported via `@NgModule.imports` | Imported directly in component `imports` array |

---

## Summary

This document provides a complete guide for building an Angular 20 application using **modern standalone component architecture**. The key principles are:

✅ **No NgModules** - All components are standalone
✅ **Functional Guards & Interceptors** - Modern patterns
✅ **RxJS for State Management** - No signals, classic reactive approach
✅ **Clean Architecture** - Clear separation of concerns
✅ **Type Safety** - Full TypeScript interfaces
✅ **`inject()` Function** - Modern dependency injection
✅ **ApplicationConfig** - Centralized provider configuration

This approach represents **current Angular 20 best practices** while honoring your preference for classic Angular patterns (no signals) and using proven RxJS patterns for state management.
