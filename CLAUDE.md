# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Umbrella Frontend** is a multi-company income and expense management system built with Angular 20 using standalone component architecture. The application manages companies, users, products, sales, purchases, and inventory with role-based permissions and multi-tenancy support.

### Core Technologies
- **Angular 20.3** with Standalone Components (no NgModules)
- **RxJS** for state management (BehaviorSubject-based stores, no Angular Signals for state)
- **TypeScript 5.9** with strict mode enabled
- **Tailwind CSS** for styling (to be configured)
- **Jasmine/Karma** for testing

## Essential Commands

### Development
```bash
# Start dev server (http://localhost:4200)
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build

# Build in watch mode for development
npm run watch

# Run unit tests
npm test
# or
ng test
```

### Code Generation
```bash
# Generate standalone component
ng generate component feature-name/component-name

# Generate service
ng generate service core/services/service-name

# Generate guard (functional)
ng generate guard core/guards/guard-name --functional

# Generate interceptor (functional)
ng generate interceptor core/interceptors/interceptor-name --functional
```

## Architecture

### Angular 20 Standalone Architecture

This project uses **Angular 20's standalone component architecture** exclusively:
- **No NgModules** - all components have `standalone: true`
- **No imports array in modules** - components declare their own dependencies
- **ApplicationConfig** (`app.config.ts`) - centralized provider configuration
- **bootstrapApplication()** (`main.ts`) - direct component bootstrapping

### Project Structure

```
src/app/
├── core/                           # Singleton services and infrastructure
│   ├── guards/                     # Functional route guards (CanActivateFn)
│   │   └── auth.guard.ts
│   ├── interceptors/               # Functional HTTP interceptors
│   │   └── auth.interceptor.ts
│   └── services/
│       ├── store-base.service.ts   # Base class for RxJS stores
│       ├── auth.service.ts         # Authentication & session management
│       ├── mock-api.service.ts     # In-memory API simulation
│       ├── company-context.service.ts  # Multi-tenancy context
│       └── permission.service.ts   # Role-based access control
│
├── shared/                         # Reusable components and models
│   ├── components/
│   │   ├── layout/                 # MainLayout, Header, Sidebar, Footer
│   │   └── ui/                     # Card, ChartCard, etc.
│   └── models/                     # TypeScript interfaces
│       ├── company.model.ts
│       ├── user.model.ts
│       ├── product.model.ts
│       ├── sale.model.ts
│       ├── purchase.model.ts
│       └── inventory.model.ts
│
├── features/                       # Feature modules (standalone)
│   ├── auth/                       # Login, Register
│   ├── companies/                  # Company management
│   ├── users/                      # User management
│   ├── dashboard/                  # Dashboard views
│   ├── products/                   # Product/service catalog
│   ├── sales/                      # Sales transactions
│   ├── purchases/                  # Purchase orders
│   └── inventory/                  # Inventory tracking
│
│   # Each feature follows this pattern:
│   └── feature-name/
│       ├── services/
│       │   └── feature.store.ts    # RxJS-based state store
│       ├── feature-list/
│       │   ├── feature-list.component.ts
│       │   └── feature-list.component.html
│       ├── feature-create/
│       │   ├── feature-create.component.ts
│       │   └── feature-create.component.html
│       └── feature.routes.ts       # Feature routing config
│
├── app.ts                          # Root component (App, not AppComponent)
├── app.config.ts                   # ApplicationConfig with providers
└── app.routes.ts                   # Main routing configuration
```

### Key Architectural Patterns

#### 1. RxJS-Based State Management

All feature state is managed using **custom RxJS stores** extending `StoreBase<T>`:

```typescript
// Feature store pattern
@Injectable({ providedIn: 'root' })
export class FeatureStore extends StoreBase<FeatureState> {
  private readonly mockApi = inject(MockApiService);

  // Selectors
  readonly items$ = this.select(state => state.items);
  readonly loading$ = this.select(state => state.loading);

  constructor() {
    super({ items: [], loading: false, error: null });
  }

  loadItems(): void {
    this.patchState({ loading: true });
    this.mockApi.getItems().pipe(
      tap(items => this.patchState({ items, loading: false })),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }
}
```

**Important**: Do NOT use Angular Signals for state management. Use RxJS Observables with the `async` pipe in templates.

#### 2. Efficient Single-Item Loading Pattern (CRITICAL FOR API)

**ALWAYS implement `loadItemById()` methods in stores for edit forms.** This pattern is MANDATORY and must be used for all edit/detail views.

**Why this matters:**
- Prevents loading thousands of records just to edit one item
- Essential for production performance with real APIs
- Reduces bandwidth, server load, and client memory usage

**Store Implementation Pattern:**
```typescript
@Injectable({ providedIn: 'root' })
export class SalesStore extends StoreBase<SalesState> {
  private readonly mockApi = inject(MockApiService);

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
        // Update or add to existing collection
        const sales = this.currentState.sales;
        const existingIndex = sales.findIndex(s => s.id === id);

        const updatedSales = existingIndex >= 0
          ? sales.map(s => s.id === id ? sale : s)
          : [...sales, sale];

        this.patchState({
          sales: updatedSales,
          selectedSale: sale,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load sale',
          loading: false
        });
        return of(null);
      })
    ).subscribe();
  }
}
```

**Component Implementation Pattern:**
```typescript
export class SaleEditComponent implements OnInit {
  private readonly store = inject(SalesStore);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Load reference data (companies, clients, etc.)
    this.companiesStore.loadCompanies();
    this.clientsStore.loadClients();

    this.route.params.subscribe(params => {
      if (params['id']) {
        // CORRECT: Load only the specific item needed
        this.store.loadSaleById(params['id']);
        this.loadSale(params['id']);
      }
    });
  }

  private loadSale(id: string): void {
    // Wait for the specific sale to be loaded
    this.store.sales$.pipe(
      filter(sales => sales.length > 0),
      take(1)
    ).subscribe(sales => {
      const sale = sales.find(s => s.id === id);
      if (sale) {
        // Populate form with sale data
        this.form.patchValue({ ...sale });
      }
    });
  }
}
```

**WRONG Pattern (Never Do This):**
```typescript
// ❌ BAD: Loading ALL sales just to edit one
ngOnInit(): void {
  this.store.loadSales(); // Loads 1000s of records!
  this.route.params.subscribe(params => {
    if (params['id']) {
      this.loadSale(params['id']); // Then finds one item
    }
  });
}
```

**Implementation Checklist:**
- ✅ All stores MUST have both `loadItems()` AND `loadItemById(id)` methods
- ✅ Edit forms MUST use `loadItemById()`, never `loadItems()`
- ✅ List views use `loadItems()` to show collections
- ✅ Detail/preview views use `loadItemById()`
- ✅ MockApiService already has `getItem(id)` methods - use them!

**Examples in Codebase:**
- Sales: `sales.store.ts:185-213` and `sale-create.component.ts:102`
- Purchases: `purchases.store.ts:185-213` and `purchase-create.component.ts:102`

#### 3. Dependency Injection with `inject()`

Use the **`inject()` function** for dependency injection (Angular 20 best practice):

```typescript
@Component({ ... })
export class MyComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
}
```

Constructor injection is still valid but `inject()` is preferred for consistency with functional guards/interceptors.

#### 4. Functional Guards and Interceptors

All guards and interceptors use **functional patterns**:

```typescript
// Guard example
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuth => isAuth || router.createUrlTree(['/auth/login']))
  );
};

// Interceptor example
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

#### 5. Lazy Loading with Standalone Components

Routes use `loadComponent` for components and `loadChildren` for feature routes:

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

#### 6. Multi-Tenancy Pattern

The application supports multiple companies with context switching:
- **CompanyContextService** maintains current company state
- **AuthService** sets user's company on login
- **PermissionService** enforces role-based access control (RBAC)

Roles: `admin`, `manager`, `user` with hierarchical permissions.

## Critical Implementation Rules

### 1. State Management
- **Use RxJS Observables** with `BehaviorSubject` for state
- **Use `async` pipe** in templates for automatic subscription management
- **Extend StoreBase<T>** for all feature stores
- **Avoid manual subscriptions** - use `async` pipe or `takeUntil(destroy$)` pattern
- **Do NOT use Angular Signals** for application state (they may be used for local UI state if needed)
- **CRITICAL**: All stores MUST implement both `loadItems()` AND `loadItemById(id)` methods
- **CRITICAL**: Edit/detail components MUST use `loadItemById()`, never `loadItems()` (see pattern #2 above)

### 2. Component Architecture
- **All components are standalone** - declare `imports` array with dependencies
- **Use `inject()` function** for dependency injection
- **Keep templates simple** - move complex logic to component class
- **Use reactive forms** with `FormBuilder` for user input

#### Cascading Dropdown Pattern (CRITICAL)

When populating edit forms with cascading dropdowns (e.g., Company → Client/Vendor), follow this EXACT pattern to avoid race conditions:

```typescript
// CORRECT: Wait for the specific option to be in the filtered list
this.clientOptions$.pipe(
  filter(options =>
    options.length > 0 &&
    (!sale.customerId || options.some(opt => opt.value === sale.customerId))
  ),
  take(1)
).subscribe(() => {
  this.form.patchValue({
    clientId: sale.customerId || ''
  }, { emitEvent: false }); // Prevent triggering valueChanges
});
```

**Why this matters:**
- Ensures cascading filter has processed before setting dependent dropdown
- Verifies the specific option exists in filtered list
- Uses `emitEvent: false` to prevent infinite loops

**FormSelect Component Requirements:**
- Placeholder option MUST use `[selected]="!value"` binding
- Never use static `selected` attribute on placeholder
- See `form-select.html:35` for reference

### 3. Routing and Guards
- **Protect routes** with `authGuard` for authenticated areas
- **Use functional guards** - no class-based guards
- **Lazy load features** with `loadChildren` for route modules
- **Redirect unauthenticated** users to `/auth/login` with returnUrl

### 4. HTTP and API
- **MockApiService simulates backend** - uses localStorage persistence with 300ms delay
- **AuthInterceptor adds tokens** - automatically injects Bearer token
- **All API methods return Observables** - use RxJS operators for transformation
- **Handle errors in stores** - use `catchError` and update error state

### 5. Styling with Tailwind CSS
- **Use utility classes** for styling (Tailwind CSS needs configuration)
- **Avoid custom CSS** unless necessary
- **Mobile-first responsive** design with Tailwind breakpoints
- **Use shared UI components** (CardComponent, etc.) for consistency

### 6. TypeScript Configuration
- **Strict mode enabled** - all strict compiler options are on
- **Use interfaces** for all data models in `shared/models/`
- **Avoid `any` type** - leverage TypeScript's type system
- **Enable experimental decorators** - required for Angular

## Data Models

Key interfaces are defined in `shared/models/`:

- **Company** - Multi-tenant company entity with settings
- **User** - User with roles, permissions, and company association
- **Product** - Products and services with category, pricing, tax
- **Sale** - Sales transactions with line items and payment tracking
- **Purchase** - Purchase orders with vendor info and items
- **InventoryItem** - Stock levels with min/max thresholds
- **InventoryMovement** - Stock movements (in/out/adjustment)

See `.claude/doc/angular20_module_instructions.md` for complete model definitions.

## Testing

### Unit Tests
```bash
# Run all tests
ng test

# Run tests for specific file
ng test --include='**/auth.service.spec.ts'
```

### Test Setup for Standalone Components
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

## Common Patterns and Examples

### Creating a New Feature

1. **Create feature directory** under `features/`
2. **Create store** extending `StoreBase<T>`
3. **Create components** with standalone configuration
4. **Create routes file** exporting feature routes
5. **Add route** to main `app.routes.ts`

### Adding a New Store

```typescript
interface MyState {
  items: MyItem[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class MyStore extends StoreBase<MyState> {
  readonly items$ = this.select(state => state.items);
  readonly loading$ = this.select(state => state.loading);

  constructor() {
    super({ items: [], loading: false, error: null });
  }
}
```

### Component with Store Integration

```typescript
@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './my-list.component.html'
})
export class MyListComponent implements OnInit {
  private readonly store = inject(MyStore);

  readonly items$ = this.store.items$;
  readonly loading$ = this.store.loading$;

  ngOnInit(): void {
    this.store.loadItems();
  }
}
```

### Template with async Pipe

```html
<app-card [loading]="loading$ | async">
  <div *ngFor="let item of items$ | async">
    {{ item.name }}
  </div>
</app-card>
```

## Reference Documentation

For comprehensive implementation details, data models, and complete code examples, refer to:
- **[.claude/doc/angular20_module_instructions.md](.claude/doc/angular20_module_instructions.md)** - Complete project blueprint with all patterns, models, and examples

## Naming Conventions

- Services: `*.service.ts`
- Stores: `*.store.ts`
- Components: `*.component.ts` (with separate `.html` template)
- Models: `*.model.ts`
- Guards: `*.guard.ts`
- Interceptors: `*.interceptor.ts`
- Routes: `*.routes.ts`

## Project Status

This project is in **initial setup phase**. The base Angular 20 application structure exists but most features from the blueprint need implementation.

**Note**: Current `app.ts` uses signals, which contradicts the RxJS-based state management pattern. Components should avoid signals for state management unless absolutely necessary for local UI state only.
