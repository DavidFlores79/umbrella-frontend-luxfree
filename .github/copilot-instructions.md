# GitHub Copilot Instructions for Umbrella Frontend

## Project Context

**Umbrella Frontend** is a multi-company income and expense management system built with **Angular 20** using standalone component architecture. This is a multi-tenancy application that manages companies, users, products, sales, purchases, and inventory with role-based permissions.

### Technology Stack
- **Angular 20.3** - Standalone Components (no NgModules)
- **TypeScript 5.9** - Strict mode enabled
- **RxJS** - State management with BehaviorSubject-based stores
- **Tailwind CSS** - Utility-first styling
- **Jasmine/Karma** - Testing framework

## Architecture Rules

### 1. Angular 20 Standalone Architecture
- ✅ All components MUST have `standalone: true`
- ✅ NO NgModules anywhere in the project
- ✅ Components declare dependencies in their `imports` array
- ✅ Use `ApplicationConfig` in `app.config.ts` for providers
- ✅ Bootstrap with `bootstrapApplication()` in `main.ts`

### 2. State Management - RxJS Only (CRITICAL)
- ✅ Use RxJS Observables with `BehaviorSubject` for ALL state
- ✅ ALL feature stores MUST extend `StoreBase<T>` from `core/services/store-base.service.ts`
- ✅ Use `async` pipe in templates for subscription management
- ❌ DO NOT use Angular Signals for application state
- ❌ Avoid manual subscriptions - use `async` pipe or `takeUntil(destroy$)` pattern

**Store Pattern:**
```typescript
interface FeatureState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class FeatureStore extends StoreBase<FeatureState> {
  readonly items$ = this.select(state => state.items);
  readonly loading$ = this.select(state => state.loading);

  constructor() {
    super({ items: [], loading: false, error: null });
  }

  loadItems(): void {
    this.patchState({ loading: true });
    // API call logic
  }
}
```

### 3. Single-Item Loading Pattern (CRITICAL FOR PERFORMANCE)

**MANDATORY**: All stores MUST implement BOTH collection and single-item loading methods.

**Why:** Prevents loading thousands of records just to edit/view one item. Essential for production performance.

**Required Methods:**
- `loadItems()` - For list views (loads collection)
- `loadItemById(id: string)` - For edit/detail views (loads single item)

**Store Implementation:**
```typescript
@Injectable({ providedIn: 'root' })
export class SalesStore extends StoreBase<SalesState> {
  // Collection loading (for list views)
  loadSales(): void {
    this.patchState({ loading: true, error: null });
    this.mockApi.getSales().pipe(
      tap(sales => this.patchState({ sales, loading: false })),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }

  // Single item loading (for edit/detail views) - REQUIRED!
  loadSaleById(id: string): void {
    this.patchState({ loading: true, error: null });
    this.mockApi.getSale(id).pipe(
      tap(sale => {
        const sales = this.currentState.sales;
        const existingIndex = sales.findIndex(s => s.id === id);
        const updatedSales = existingIndex >= 0
          ? sales.map(s => s.id === id ? sale : s)
          : [...sales, sale];
        this.patchState({
          sales: updatedSales,
          selectedSale: sale,
          loading: false
        });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        return of(null);
      })
    ).subscribe();
  }
}
```

**Component Usage:**
```typescript
// ✅ CORRECT - Edit Form
ngOnInit(): void {
  this.route.params.subscribe(params => {
    if (params['id']) {
      this.store.loadSaleById(params['id']); // Load single item
    }
  });
}

// ❌ WRONG - Don't do this!
ngOnInit(): void {
  this.store.loadSales(); // Loads 1000s of records unnecessarily!
}
```

### 4. Dependency Injection
- ✅ Use `inject()` function (Angular 20 best practice)
- ✅ Prefer `inject()` over constructor injection for consistency

```typescript
export class MyComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
}
```

### 5. Functional Guards and Interceptors
- ✅ All guards use `CanActivateFn` functional pattern
- ✅ All interceptors use `HttpInterceptorFn` functional pattern
- ❌ NO class-based guards or interceptors

```typescript
// Guard
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuth => isAuth || router.createUrlTree(['/auth/login']))
  );
};

// Interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAuthToken();
  if (token && !req.url.includes('/auth/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

### 6. Lazy Loading
- ✅ Use `loadComponent` for individual components
- ✅ Use `loadChildren` for feature routes

```typescript
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  }
];
```

## Project Structure

```
src/app/
├── core/                           # Singleton services
│   ├── guards/                     # Functional guards (CanActivateFn)
│   │   └── auth.guard.ts
│   ├── interceptors/               # Functional interceptors
│   │   └── auth.interceptor.ts
│   └── services/
│       ├── store-base.service.ts   # Base class for RxJS stores
│       ├── auth.service.ts         # Authentication
│       ├── mock-api.service.ts     # In-memory API
│       ├── company-context.service.ts
│       └── permission.service.ts   # RBAC
│
├── shared/                         # Reusable components and models
│   ├── components/
│   │   ├── layout/                 # MainLayout, Header, Sidebar, Footer
│   │   ├── ui/                     # Card, ChartCard, etc.
│   │   └── data/                   # DataTable, Form components
│   └── models/                     # TypeScript interfaces
│
├── features/                       # Feature modules (standalone)
│   ├── auth/                       # Login, Register
│   ├── companies/                  # Company management
│   ├── users/                      # User management
│   ├── clients/                    # Client management
│   ├── vendors/                    # Vendor management
│   ├── dashboard/                  # Dashboard views
│   ├── products/                   # Product/service catalog
│   ├── sales/                      # Sales transactions
│   ├── purchases/                  # Purchase orders
│   └── inventory/                  # Inventory tracking
│
│   # Feature pattern:
│   └── feature-name/
│       ├── services/
│       │   └── feature.store.ts    # RxJS store
│       ├── feature-list/
│       ├── feature-create/
│       └── feature.routes.ts
│
├── app.ts                          # Root component (App, not AppComponent)
├── app.config.ts                   # ApplicationConfig
└── app.routes.ts                   # Main routing
```

## Component Patterns

### Cascading Dropdowns (CRITICAL)

When populating edit forms with cascading dropdowns (Company → Client/Vendor), use this pattern to avoid race conditions:

```typescript
// CORRECT: Wait for filtered options to include the value
this.clientOptions$.pipe(
  filter(options =>
    options.length > 0 &&
    (!sale.customerId || options.some(opt => opt.value === sale.customerId))
  ),
  take(1)
).subscribe(() => {
  this.form.patchValue({
    clientId: sale.customerId || ''
  }, { emitEvent: false }); // Prevent infinite loops
});
```

**FormSelect Component:**
- Placeholder option MUST use `[selected]="!value"` binding
- Never use static `selected` attribute on placeholder

### Reactive Forms
- ✅ Use `FormBuilder` for all forms
- ✅ Use reactive forms pattern (not template-driven)
- ✅ Validate with `Validators` from `@angular/forms`

## Multi-Tenancy Pattern

- **CompanyContextService** - Maintains current company context
- **AuthService** - Sets user's company on login
- **PermissionService** - Enforces RBAC (admin, manager, user roles)
- All API calls MUST include company context when applicable

## API and HTTP

- **MockApiService** - Simulates backend with localStorage persistence (300ms delay)
- **AuthInterceptor** - Automatically adds Bearer token to requests
- All API methods return Observables
- Handle errors in stores with `catchError` and update error state

## Styling Guidelines

- ✅ Use Tailwind CSS utility classes
- ✅ Mobile-first responsive design
- ✅ Use shared UI components (CardComponent, etc.) for consistency
- ❌ Avoid custom CSS unless absolutely necessary

## TypeScript Rules

- ✅ Strict mode enabled - follow strict compiler options
- ✅ Use interfaces for all data models in `shared/models/`
- ❌ Avoid `any` type - leverage TypeScript's type system
- ✅ Experimental decorators enabled (required for Angular)

## Data Models

Key interfaces in `shared/models/`:
- **Company** - Multi-tenant company entity
- **User** - User with roles and permissions
- **Client** - Customer/client entity
- **Vendor** - Supplier/vendor entity
- **Product** - Products and services
- **Sale** - Sales transactions with line items
- **Purchase** - Purchase orders
- **InventoryItem** - Stock levels
- **InventoryMovement** - Stock movements

## Testing

```bash
# Run tests
npm test

# Run specific test
ng test --include='**/auth.service.spec.ts'
```

**Test Setup for Standalone Components:**
```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ComponentName],  // Import standalone component
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting()
    ]
  }).compileComponents();
});
```

## Common Commands

```bash
# Development server
npm start

# Build for production
npm run build

# Generate standalone component
ng generate component feature-name/component-name

# Generate service
ng generate service core/services/service-name

# Generate functional guard
ng generate guard core/guards/guard-name --functional

# Generate functional interceptor
ng generate interceptor core/interceptors/interceptor-name --functional
```

## Naming Conventions

- Services: `*.service.ts`
- Stores: `*.store.ts`
- Components: `*.component.ts` (with separate `.html`)
- Models: `*.model.ts`
- Guards: `*.guard.ts`
- Interceptors: `*.interceptor.ts`
- Routes: `*.routes.ts`

## Critical Checklist for New Features

- [ ] Component is standalone with `standalone: true`
- [ ] Store extends `StoreBase<T>` and uses RxJS
- [ ] Store has both `loadItems()` AND `loadItemById(id)` methods
- [ ] Edit forms use `loadItemById()`, not `loadItems()`
- [ ] Dependencies injected with `inject()` function
- [ ] Templates use `async` pipe for Observables
- [ ] Guards/interceptors use functional patterns
- [ ] Routes use lazy loading where appropriate
- [ ] Multi-tenancy context handled correctly
- [ ] Error handling in store with `catchError`

## Reference

For complete implementation details, see:
- **CLAUDE.md** - Comprehensive project documentation
- **.claude/doc/angular20_module_instructions.md** - Complete blueprint

---

**Project Status:** MVP development phase
**Branch:** feat/umbrella-frontend-mvp
**Repository:** umbrella-frontend-luxfree (DavidFlores79)
